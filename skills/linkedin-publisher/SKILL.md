---
name: linkedin-publisher
description: Automates posting to LinkedIn (text and images/PDF) using Playwright.
description_pt-BR: Automatiza postagens no LinkedIn (texto e imagens/PDF) usando Playwright.
type: script
version: "1.0.0"
---

# LinkedIn Publisher

## How it works

This skill uses Playwright to automate the LinkedIn web interface. 
It requires a saved session in `_opensquad/_browser_profile/linkedin.json`. 
On the first run, it will pause and ask the user to log in manually if the session is invalid.

## Usage

```bash
node skills/linkedin-publisher/scripts/publish.js --images "slide1.jpg,slide2.jpg" --caption "My post caption"
```

## Configuration

- **Session Path**: `_opensquad/_browser_profile/linkedin.json`
- **Headless Mode**: Default is true, but can be set to false for debugging.
