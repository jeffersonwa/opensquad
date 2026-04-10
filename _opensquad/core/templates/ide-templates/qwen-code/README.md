# Qwen Code IDE Template

> **IDE-SPECIFIC FILE** — only applies when running in Qwen Code.
> This file contains Qwen Code specific configuration for the Opensquad framework.

## Model Resolution

When executing pipeline steps, Qwen Code resolves model tiers as follows:

| Tier      | Model           | Use Case                              |
|-----------|-----------------|---------------------------------------|
| `fast`    | Qwen-Plus       | Investigator agents, data extraction  |
| `fast`    | Qwen-Turbo      | Alternative for faster, cheaper runs  |
| `powerful`| Qwen-Max        | Writers, creators, reviewers, strategy|

## Configuration

### MCP Server Setup

Qwen Code uses the same MCP server configuration as other IDEs. The Playwright MCP server is configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--config", "_opensquad/config/playwright.config.json"]
    }
  }
}
```

### Environment Variables

Qwen Code respects the same `.env` variables as other IDEs:

```
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
INSTAGRAM_USER_ID=your_instagram_business_user_id_here
IMGBB_API_KEY=your_imgbb_api_key_here
```

## Subagent Execution

In Qwen Code, subagents are executed using the Task tool with model override:

```yaml
# For fast tier
model: qwen-plus
# or
model: qwen-turbo

# For powerful tier
model: qwen-max
```

## Notes

- Qwen Code supports the full Opensquad feature set
- All shared files in `_opensquad/core/` apply to Qwen Code
- IDE-specific logic should ONLY be placed in this directory
- Never add Qwen-specific conditional logic to shared files
