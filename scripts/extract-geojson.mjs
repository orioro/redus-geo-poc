import { join } from 'path'
import { promises } from 'fs'
import { __dirname } from './util.mjs'
// import BA from '../public/data/29-BA.json' assert { type: 'json' }
import {
  MUNICIPIOS_BA,
  MUNICIPIOS_PA,
  MUNICIPIOS_GO,
  MUNICIPIOS_MG,
} from '../lib/constants.mjs'

async function extract() {
  const { default: BA } = await import('../public/data/29-BA.json', {
    assert: { type: 'json' },
  })
  const { default: PA } = await import('../public/data/15-PA.json', {
    assert: { type: 'json' },
  })
  const { default: GO } = await import('../public/data/52-GO.json', {
    assert: { type: 'json' },
  })
  const { default: MG_Regiao_Leste } = await import(
    '../public/data/31-MG_Regiao_Leste.json',
    {
      assert: { type: 'json' },
    }
  )
  const { default: MG_Regiao_Norte_e_Noroeste } = await import(
    '../public/data/31-MG_Regiao_Norte_e_Noroeste.json',
    {
      assert: { type: 'json' },
    }
  )

  const DATA = {
    type: 'FeatureCollection',
    features: [
      ...BA.features.filter((feature) =>
        MUNICIPIOS_BA.some((cod) => feature.properties.name.startsWith(cod)),
      ),
      ...PA.features.filter((feature) =>
        MUNICIPIOS_PA.some((cod) => feature.properties.name.startsWith(cod)),
      ),
      ...GO.features.filter((feature) =>
        MUNICIPIOS_GO.some((cod) => feature.properties.name.startsWith(cod)),
      ),
      ...[
        ...MG_Regiao_Leste.features,
        ...MG_Regiao_Norte_e_Noroeste.features,
      ].filter((feature) =>
        MUNICIPIOS_MG.some((cod) => feature.properties.name.startsWith(cod)),
      ),
    ],
  }

  await promises.writeFile(
    join(__dirname, '../public/data/geo-data.json'),
    JSON.stringify(DATA, null, '  '),
    'utf8',
  )
}

await extract()
