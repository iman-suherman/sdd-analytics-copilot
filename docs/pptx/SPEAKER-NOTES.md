# Speaker notes & prompt cheat sheet

Gunakan bersama [`SDD-Analitik-Kopilot-Demo.pptx`](./SDD-Analitik-Kopilot-Demo.pptx).  
Notes lengkap juga tersimpan **di dalam setiap slide** (PowerPoint → Notes / Presenter View).

## Dua jenis “prompt” — jangan tertukar

| Tujuan | Ke mana disalin | Contoh |
|--------|-----------------|--------|
| Demo produk | **Kopilot UI** di browser (`localhost:3000`) | “Kenapa Sumatera turun?” |
| Build / regenerasi / perbaikan | **Cursor / VS Code Agent chat** | Isi `regenerate-full-app.md` |
| Ops | **Terminal** di VS Code | `npm run demo` |

---

## Setup sebelum share screen

```bash
cd ~/src/personal/sdd-analytics-copilot
npm run demo
# opsional: npm run login
```

Buka tab VS Code: `specs/regeneration/prompts/regenerate-full-app.md`, `AGENTS.md`, `semantic/commerce.yaml`.

---

## Prompt Kopilot UI (urutan demo)

Salin ke bubble chat aplikasi (bukan ke Agent):

```
Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?
```

```
Kenapa Sumatera turun?
```

```
Tambahkan investigasi ini ke dasbor eksekutif.
```

```
Ganti wilayah dengan segmen pelanggan.
```

---

## Prompt Cursor / VS Code Agent (saat “agent bekerja”)

### Regenerasi penuh

Buka file lalu @-mention, atau tempel isinya:

`@specs/regeneration/prompts/regenerate-full-app.md`

Ringkas:

```
Regenerate this app from specs/regeneration/README.md and SDD-001 through SDD-013.
Keep QueryPlan boundary (no LLM SQL). DEMO_AS_OF=2026-09-05. Bahasa Indonesia. x-company-id tenancy.
Prefer data/samples CSV seed. Work phases A→H.
```

### Hanya data + login scripts

```
@specs/regeneration/prompts/regenerate-data-and-ops.md
```

### Hanya dock + Vertex

```
@specs/regeneration/prompts/regenerate-copilot-vertex.md
```

### Guardrail follow-up (jika agent mulai “liar”)

```
Stop. Do not write raw SQL in the LLM. Only emit QueryPlan JSON.
Compile must inject company_id. Demo clock must stay DEMO_AS_OF=2026-09-05.
UI and answers in Bahasa Indonesia.
```

### Perbaiki demo yang rusak

```
Fix the demo journey per AGENTS.md north star.
Keep DEMO_AS_OF and QueryPlan boundary. Run npm test.
```

---

## Terminal cepat

```bash
npm run demo
npm run db:seed
npm run data:export-csv
npm run login
npm test
rg -n "DEMO_AS_OF" src/server/analytics/time-range.ts
```

---

## Regenerasi deck

```bash
npm run pptx:sdd-demo
```
