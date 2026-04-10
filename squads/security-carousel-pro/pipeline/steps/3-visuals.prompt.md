# Task: Generate Article Cover

Você recebeu o rascunho de um artigo técnico sobre cibersegurança. Seu objetivo é gerar uma **imagem de capa única** que represente o tema principal.

## Input
Os dados do artigo estão em: `{{pipeline.steps['2-article-draft'].output_file}}`

## Output Format
Uma única imagem salva no diretório de saída definido no pipeline.

## Guidelines
1. Leia o `cover_prompt` no arquivo de entrada.
2. Use a skill `image-creator` para gerar a imagem.
3. **Estética:** Modern Dark Tech (Azul profundo, Preto, Ciano neon).
4. **Sem texto:** A imagem não deve conter palavras, apenas arte visual que represente o tema (ex: cadeados digitais, servidores, vetores de ataque abstratos).
5. **Formato:** Proporção horizontal (Landscape).

Execute a geração agora.
