# Integração Qwen Code no Opensquad

## Resumo

O suporte ao **Qwen Code** foi adicionado ao projeto Opensquad em duas frentes principais:

### 1. Qwen como Modelo de IA

Os modelos Qwen foram integrados ao sistema de **model tiers**:

| Tier      | Modelos Qwen     | Uso                                    |
|-----------|------------------|----------------------------------------|
| `fast`    | Qwen-Plus        | Agentes investigadores, extração de dados |
| `fast`    | Qwen-Turbo       | Tarefas rápidas e econômicas           |
| `powerful`| Qwen-Max         | Criadores, revisores, estratégia       |

**Arquivos modificados:**
- `_opensquad/core/runner.pipeline.md` — Adicionado mapeamento de modelos Qwen

### 2. Qwen Code como IDE Suportado

Qwen Code foi adicionado como uma IDE suportada no framework:

**Arquivos criados:**
- `_opensquad/core/templates/ide-templates/qwen-code/README.md` — Documentação específica
- `_opensquad/core/templates/ide-templates/qwen-code/config.yaml` — Configuração do IDE
- `.claude/skills/opensquad-qwen/SKILL.md` — Skill de desenvolvimento

**Arquivos modificados:**
- `README.md` — Adicionado Qwen Code na tabela de IDEs suportadas
- `CLAUDE.md` — Adicionada seção de IDEs suportados
- `CHANGELOG.md` — Registrada nova integração

## Como Usar

### Executando no Qwen Code

```bash
# Inicializar o opensquad
npx opensquad init

# Acessar o menu principal
/opensquad
```

### Configurando Model Tiers

Nos arquivos de pipeline dos squads:

```yaml
# Para tarefas leves
model_tier: fast  # Usará Qwen-Plus ou Qwen-Turbo

# Para tarefas complexas
model_tier: powerful  # Usará Qwen-Max
```

## Estrutura de Arquivos

```
_opensquad/
└── core/
    ├── templates/
    │   └── ide-templates/
    │       └── qwen-code/
    │           ├── README.md       # Documentação específica
    │           └── config.yaml     # Configuração do IDE
    └── runner.pipeline.md          # Atualizado com models Qwen

.claude/
└── skills/
    └── opensquad-qwen/
        └── SKILL.md                # Skill de desenvolvimento

README.md                           # Atualizado
CLAUDE.md                           # Atualizado
CHANGELOG.md                        # Atualizado
```

## Próximos Passos

1. Testar execução de pipelines com modelos Qwen
2. Validar integração com MCP server
3. Documentar casos de uso específicos para Qwen
4. Adicionar exemplos de uso no README

## Referências

- Documentação Qwen: https://qwen.ai
- Opensquad: https://github.com/renatoasse/opensquad
- Model Tiers: `_opensquad/core/runner.pipeline.md`
