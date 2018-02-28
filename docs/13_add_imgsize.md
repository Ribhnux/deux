---
id: cmd-add-imgsize
title: Add imgsize subcommand
sidebar_label: deux add imgsize
---

> This sub-command is part of [`deux add`](cmd-add.html) command.

## Usage
```bash
deux add imgsize [options]
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
deux add imgsize

# API Mode
deux add imgsize --api --input ''
```