---
id: cmd-add-helper
title: Add helper subcommand
sidebar_label: deux add helper
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add helper [options]
```

## Options
`--db <path>` *Optional*  
Custom database path.

`--input <json>` *Optional*  
Set config in api mode without prompts.

`--api` *Optional*  
Run in API Mode.

## JSON Input
```javascript 
// JSON Example
{
}
```

## CLI Example
```bash
# Default
deux add helper

# API Mode
deux add helper --api --input ''
```