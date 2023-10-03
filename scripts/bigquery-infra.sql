# https://console.cloud.google.com/bigquery?p=basedosdados&d=br_ibge_censo_demografico&t=setor_censitario_entorno_2010&page=table&project=crypto-eon-310620&ws=!1m5!1m4!4m3!1sbasedosdados!2sbr_ibge_censo_demografico!3ssetor_censitario_entorno_2010!1m0

SELECT
  id_setor_censitario as id,
  sigla_uf,
  SAFE_DIVIDE(v050 + v052 + v054, v001) as porcentagem_domicilios_esgoto_a_ceu_aberto,
  SAFE_DIVIDE(v008, v001) as porcentagem_domicilios_iluminacao_publica,
  SAFE_DIVIDE(v044 + v046 + v048, v001) as porcentagem_domicilios_arborizacao,
  SAFE_DIVIDE(v062 + v063, v001) as porcentagem_domicilios_rede_geral_distribuicao_agua,
  SAFE_DIVIDE(v106 + v107, v001) as porcentagem_domicilios_sem_banheiro_ou_sanitario
FROM `basedosdados.br_ibge_censo_demografico.setor_censitario_entorno_2010`
WHERE


LIMIT 10000