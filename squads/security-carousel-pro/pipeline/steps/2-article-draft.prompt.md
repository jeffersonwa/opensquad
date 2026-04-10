# Task: Create Article Draft

Você recebeu um conjunto de notícias sobre cibersegurança. Seu objetivo é selecionar a notícia mais impactante e transformá-la em um **Artigo do LinkedIn** profundo e educativo.

## Input
As notícias estão no arquivo: `{{pipeline.steps['1-research'].output_file}}`

## Output Format (JSON)
O arquivo de saída deve ser um JSON com a seguinte estrutura:
```json
{
  "title": "O Título do Artigo",
  "content": "O corpo do artigo em Markdown. Use ## para subtítulos, parágrafos curtos e negrito.",
  "cover_prompt": "Descrição detalhada para a geração da imagem de capa (estética Modern Dark Tech)."
}
```

## Rules
- **Idioma:** Escreva OBRIGATORIAMENTE em Português (Brasil).
- **Estrutura:** 
  1. Headline matadora.
  2. Introdução contextualizada.
  3. Desenvolvimento com 2 ou 3 subtítulos claros.
  4. Lições aprendidas ou recomendações para o leitor.
  5. CTA convidando ao engajamento.
- **Autoridade:** O texto deve soar como escrito pelo Jefferson Almeida, um especialista sênior em TI e Segurança.
- **Referência:** Não esqueça de mencionar a fonte (Computer Weekly).

Envie o JSON final abaixo:
