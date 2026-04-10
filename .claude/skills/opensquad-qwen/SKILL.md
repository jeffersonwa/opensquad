# Opensquad Qwen Code Integration

## Description

Configuration and development guide for running Opensquad in Qwen Code IDE.

## When to Use

- User wants to run Opensquad in Qwen Code
- User asks about Qwen model configuration
- User needs to set up Qwen-specific settings
- User wants to use Qwen-Max, Qwen-Plus, or Qwen-Turbo models

## Setup

### 1. Model Configuration

Qwen Code integrates with Opensquad's model tier system:

```yaml
# In pipeline step frontmatter
model_tier: fast      # Uses Qwen-Plus or Qwen-Turbo
model_tier: powerful  # Uses Qwen-Max
```

### 2. MCP Server Setup

The Playwright MCP server is already configured in `.mcp.json`. Qwen Code will use this automatically.

### 3. Running in Qwen Code

```bash
# Initialize opensquad
npx opensquad init

# Use the /opensquad command to access the main menu
/opensquad
```

## Model Reference

| Tier      | Model           | Best For                          |
|-----------|-----------------|-----------------------------------|
| `fast`    | Qwen-Plus       | Investigation, data extraction    |
| `fast`    | Qwen-Turbo      | Quick, cost-effective tasks       |
| `powerful`| Qwen-Max        | Complex reasoning, content creation|

## Development Checklist

When developing Opensquad for Qwen Code:

1. ✅ Verify Qwen Code is listed in supported IDEs (README.md)
2. ✅ Ensure model tier mapping includes Qwen models (runner.pipeline.md)
3. ✅ Check Qwen Code template exists (`_opensquad/core/templates/ide-templates/qwen-code/`)
4. ✅ Verify MCP server configuration in `.mcp.json`
5. ✅ Test subagent execution with Qwen models
6. ✅ Confirm all shared files apply correctly to Qwen Code

## Important Notes

- **Shared files first**: All logic in `_opensquad/core/` applies to Qwen Code
- **IDE-specific files**: Only put Qwen-specific code in `ide-templates/qwen-code/`
- **No conditional logic**: Never add `if ide == qwen-code` checks in shared files
- **Model resolution**: Qwen Code resolves models based on the tier system, not hardcoded names

## Troubleshooting

### Subagents not working
- Verify Qwen Code supports the Task tool with model override
- Check `config.yaml` in qwen-code template for correct model names

### MCP server not connecting
- Verify `.mcp.json` has Playwright configuration
- Check that `@playwright/mcp` is installed

### Model tier not respected
- Review step frontmatter for `model_tier` field
- Check `runner.pipeline.md` for correct Qwen model mapping
