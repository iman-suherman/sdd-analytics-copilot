# Source wiped — regenerate with one prompt

Application source was deleted on purpose (`src/`, `scripts/`, `data/*.ts`, `tests/`).

## Single prompt (copy this)

Open **[`specs/regeneration/prompts/REGENERATE.md`](./specs/regeneration/prompts/REGENERATE.md)** and paste **everything below the `---`** into one Cursor Agent chat.

Or @-mention:

```
@specs/regeneration/prompts/REGENERATE.md
```

## Automated parallel CLI

```bash
agent login   # once
bash specs/regeneration/run-parallel.sh
```

## Preserved

`specs/`, `semantic/`, `data/samples/`, `docs/`, `public/`, configs, `package.json`, `.cursor/`
