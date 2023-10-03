'use client'
import { styled } from 'styled-components'

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  AttributionControl,
  useMap,
} from 'react-leaflet'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import {
  interpolatePuBu,
  interpolateRdYlBu,
  interpolateYlOrRd,
} from 'd3-scale-chromatic'
import { groupBy } from 'lodash-es'
import 'leaflet/dist/leaflet.css'

import GEO_DATA_RAW from '@/public/data/geo-data.json'
import CENSO_DATA_RENDA_RAW from '@/public/data/censo-data-renda.json'
import CENSO_DATA_INFRA_RAW from '@/public/data/censo-data-infra.json'
import { useMemo, useState } from 'react'

import { MUNICIPIOS } from '@/lib/constants.mjs'

const COLOR_INTERPOLATE = interpolateYlOrRd

const Container = styled.main`
  position: relative;
  width: 100vw;
  height: 100vh;
`

const ControlsContainer = styled.div`
  position: absolute;
  z-index: 9999;
  top: 0;
  right: 0;
  padding: 10px;
  background-color: white;
  border: 1px solid #efefef;
`

const DIMENSIONS = [
  [
    'porcentagem_domicilios_esgoto_a_ceu_aberto',
    (v) => (v === null ? 0 : parseFloat(v)),
  ],
  [
    'porcentagem_domicilios_iluminacao_publica',
    (v) => (v === null ? 0 : parseFloat(v)),
  ],
  [
    'porcentagem_domicilios_arborizacao',
    (v) => (v === null ? 0 : parseFloat(v)),
  ],
  [
    'porcentagem_domicilios_rede_geral_distribuicao_agua',
    (v) => (v === null ? 0 : parseFloat(v)),
  ],
  [
    'porcentagem_domicilios_sem_banheiro_ou_sanitario',
    (v) => (v === null ? 0 : parseFloat(v)),
  ],
  ['rendimento_nominal_medio_mensal_responsavel', parseFloat],
  ['domicilios', parseInt],
  ['moradores', parseInt],
  ['media_moradores_por_domicilio', parseFloat],
  // [
  //   'rendimento_nominal_medio_mensal_responsavel_variancia',
  //   (v) => Math.sqrt(parseFloat(v)),
  // ],
]

// const CENSO_DATA_RENDA_BY_ID = CENSO_DATA_RENDA_RAW.reduce((acc, entry) => ({
//   ...acc,
//   [entry.id]: entry
// }), {})
const CENSO_DATA_INFRA_BY_ID = CENSO_DATA_INFRA_RAW.reduce(
  (acc, entry) => ({
    ...acc,
    [entry.id]: entry,
  }),
  {},
)

const CENSO_DATA_RAW = CENSO_DATA_RENDA_RAW.map((rendaEntry) => ({
  ...rendaEntry,
  ...CENSO_DATA_INFRA_BY_ID[rendaEntry.id],
}))

const CENSO_DATA = CENSO_DATA_RAW.map((entry) => ({
  ...entry,
  ...DIMENSIONS.reduce(
    (acc, [key, transformer]) => ({
      ...acc,
      [key]: transformer(entry[key]),
    }),
    {},
  ),
}))

const GEO_DATA = {
  ...GEO_DATA_RAW,
  features: GEO_DATA_RAW.features.map((feat) => {
    const censoData = CENSO_DATA.find(
      (entry) => entry.id === feat.properties.name,
    )

    return {
      ...feat,
      properties: {
        ...feat.properties,
        id_municipio: MUNICIPIOS.find((id_municipio) =>
          feat.properties.name.startsWith(id_municipio),
        ),
        censoData,
      },
    }
  }),
}

const CENSO_BY_ID_MUNICIPIO = groupBy(CENSO_DATA, (entry) => {
  const cityId = MUNICIPIOS.find((id) => entry.id.startsWith(id))

  return cityId
})

const SCALES_BY_ID_MUNICIPIO = MUNICIPIOS.reduce((acc, id_municipio) => {
  const censoEntries = CENSO_BY_ID_MUNICIPIO[id_municipio]

  return {
    ...acc,
    [id_municipio]: DIMENSIONS.reduce(
      (acc, [dimensionKey]) => ({
        ...acc,
        [dimensionKey]: scaleLinear(
          extent(censoEntries.map((entry) => entry[dimensionKey])),
          [0, 1],
        ),
      }),
      {},
    ),
  }
}, {})

function Controls({ dimension, setDimension }) {
  const map = useMap()

  return (
    <ControlsContainer>
      <select
        value={dimension}
        onChange={(e) => {
          setDimension(e.target.value)
          map.invalidateSize()
        }}
      >
        {DIMENSIONS.map(([key]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      {/*      <input
        type="text"
        placeholder="local"
        onChange={async (e) => {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${e.target.value}`,
          )
          const movies = await response.json()
          console.log(movies)
        }}
      />*/}
    </ControlsContainer>
  )
}

export function Demo1() {
  const [dimension, setDimension] = useState(DIMENSIONS[0][0])
  return (
    <Container>
      <MapContainer
        style={{ height: '100vh', width: '100vw' }}
        center={[-12.974722, -38.476665]}
        zoom={11}
        attributionControl={false}
      >
        <Controls dimension={dimension} setDimension={setDimension} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          data={GEO_DATA}
          style={(feature) => {
            const censoData = feature.properties.censoData
            const scale =
              SCALES_BY_ID_MUNICIPIO[feature.properties.id_municipio][dimension]

            const dimensionValue = censoData ? censoData[dimension] : null

            const color =
              dimensionValue === null || isNaN(dimensionValue)
                ? '#aaaaaa'
                : COLOR_INTERPOLATE(scale(dimensionValue))

            return {
              fillColor: color,
              // fillOpacity: 0.5,
              fillOpacity: 0.5,

              color: color,
              // opacity: 0,
              weight: 0.5,
            }
          }}
          onEachFeature={(feature, leafletLayer) => {
            const censoData = feature.properties.censoData

            const display = `<div>${DIMENSIONS.map(([key]) => {
              const dimensionValue =
                censoData &&
                typeof censoData[key] === 'number' &&
                !isNaN(censoData[key])
                  ? censoData[key]
                  : 'Sem informações'

              return `<div><span>${key}: </span><strong>${dimensionValue}</strong></div>`
            }).join('')}</div>`

            leafletLayer.bindTooltip(() => display, {
              sticky: true,
            })
          }}
        />
        <AttributionControl prefix={false} />
      </MapContainer>
    </Container>
  )
}
