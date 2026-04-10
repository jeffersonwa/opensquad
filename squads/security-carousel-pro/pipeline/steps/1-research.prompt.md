---
id: research-security
agent: security-scout
execution: inline
outputFile: "pipeline/data/news.json"
---

# Pesquisa de Notícias de Segurança

## Task description

Acesse o portal Computer Weekly Brasil (https://www.computerweekly.com/br/) e identifique as 3 notícias mais quentes e impactantes sobre segurança da informação, ciberataques ou vulnerabilidades críticas do dia.

Para cada notícia, extraia:
1. Título original.
2. Link da notícia.
3. Resumo executivo (2-3 parágrafos).
4. Impacto esperado (quem é afetado).

## Process

1. Use a skill `web_search` ou navegue diretamente no site via `web_fetch`.
2. Filtre por notícias publicadas nas últimas 48 horas.
3. Escolha a que tem maior potencial de engajamento para um carrossel educativo.

## Output Format (JSON)

```json
{
  "top_news": [
    {
      "title": "",
      "url": "",
      "summary": "",
      "impact": ""
    }
  ]
}
```
