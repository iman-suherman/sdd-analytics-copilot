# Source wiped — regenerate with one prompt

Application source was deleted on purpose (`src/`, `scripts/`, `data/*.ts`, `tests/`).

## Single prompt

```
@specs/regeneration/prompts/REGENERATE.md
```

Or paste everything below the `---` in that file into one Agent chat.

## CLI

```bash
agent login   # once
bash specs/regeneration/run-parallel.sh
```

## Preserved

`specs/`, `semantic/`, `data/samples/`, `docs/`, `public/`, configs, `package.json`, `.cursor/`
