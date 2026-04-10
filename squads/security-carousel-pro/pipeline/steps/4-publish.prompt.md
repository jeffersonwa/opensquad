# Task: Publish Article to LinkedIn

O artigo e a imagem de capa foram gerados com sucesso. Agora sua missão é publicar como um **Artigo** (Pulse) no perfil do LinkedIn.

## Input
- **Conteúdo:** `{{pipeline.steps['2-article-draft'].output_file}}`
- **Imagem de Capa:** No diretório `{{pipeline.steps['3-visuals'].output_dir}}`

## Execution
Use a skill `linkedin-publisher` com os seguintes parâmetros:
- `--type article`
- `--title` (vindo do input JSON)
- `--content` (o corpo em Markdown do input JSON)
- `--cover` (o caminho da imagem gerada)

O agente deve invocar o script de publicação via CLI.

## Regra de Idioma
Verifique se o título e o conteúdo estão em **Português (Brasil)** antes de enviar.

Inicie a publicação.
