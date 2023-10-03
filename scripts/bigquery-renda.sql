# https://console.cloud.google.com/bigquery?p=basedosdados&d=br_ibge_censo_demografico&t=setor_censitario_basico_2010&page=table&project=repositoriodedadosgpsp&ws=!1m5!1m4!4m3!1sbasedosdados!2sbr_ibge_censo_demografico!3ssetor_censitario_basico_2010!1m0

SELECT
  id_setor_censitario as id,
  sigla_uf,
  v001 as domicilios,
  v002 as moradores,
  v003 as media_moradores_por_domicilio,
  v005 as rendimento_nominal_medio_mensal_responsavel,
  v006 as rendimento_nominal_medio_mensal_responsavel_variancia
FROM `basedosdados.br_ibge_censo_demografico.setor_censitario_basico_2010`
WHERE



LIMIT 10000
