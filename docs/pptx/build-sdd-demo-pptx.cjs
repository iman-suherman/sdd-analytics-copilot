/**
 * Build SDD Analitik Kopilot demo deck (Bahasa Indonesia).
 * Theme aligned with https://suherman.net/ (cream + navy + accent).
 *
 * Usage: node docs/pptx/build-sdd-demo-pptx.cjs
 */
const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(__dirname, "SDD-Analitik-Kopilot-Demo.pptx");
const LOGO = path.join(ROOT, "public/logo.png");

/** suherman.net-inspired palette */
const C = {
  cream: "F4EFE6",
  creamDeep: "EBE3D6",
  navy: "132033",
  accent: "1E4D8C",
  muted: "5B6B7C",
  white: "FFFFFF",
  line: "D4CBBC",
  soft: "E8F0FA",
  success: "0F766E",
  warn: "B45309",
};

function addFooter(slide, pptx, page, total) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 5.25,
    w: 10,
    h: 0.375,
    fill: { color: C.navy },
    line: { color: C.navy },
  });
  slide.addText("suherman.net  ·  Spec-Driven Development  ·  SDD Analitik Kopilot", {
    x: 0.35,
    y: 5.3,
    w: 7.5,
    h: 0.28,
    fontSize: 10,
    fontFace: "Calibri",
    color: C.cream,
  });
  slide.addText(`${page} / ${total}`, {
    x: 8.4,
    y: 5.3,
    w: 1.3,
    h: 0.28,
    fontSize: 10,
    fontFace: "Calibri",
    color: C.cream,
    align: "right",
  });
}

function titleBar(slide, pptx, title, subtitle) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.95,
    fill: { color: C.navy },
  });
  slide.addText(title, {
    x: 0.4,
    y: 0.18,
    w: 8.2,
    h: 0.4,
    fontSize: 22,
    fontFace: "Georgia",
    bold: true,
    color: C.cream,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.4,
      y: 0.55,
      w: 8.2,
      h: 0.28,
      fontSize: 12,
      fontFace: "Calibri",
      color: "A8C0DE",
    });
  }
  if (fs.existsSync(LOGO)) {
    slide.addImage({
      path: LOGO,
      x: 9.15,
      y: 0.15,
      w: 0.65,
      h: 0.65,
    });
  }
}

function bodySlide(pptx, opts) {
  const slide = pptx.addSlide();
  slide.background = { color: C.cream };
  titleBar(slide, pptx, opts.title, opts.subtitle);
  if (opts.notes) slide.addNotes(opts.notes);
  return slide;
}

/** Speaker notes: narasi + apa yang disalin di VS Code/Cursor saat demo. */
function notes(blocks) {
  return Array.isArray(blocks) ? blocks.filter(Boolean).join("\n\n") : String(blocks);
}

function screenshotCard(slide, pptx, { x, y, w, h, label, expect }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: C.white },
    line: { color: C.line, width: 1 },
    rectRadius: 0.08,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w,
    h: 0.32,
    fill: { color: C.accent },
  });
  slide.addText(label, {
    x: x + 0.1,
    y: y + 0.04,
    w: w - 0.2,
    h: 0.26,
    fontSize: 11,
    fontFace: "Calibri",
    bold: true,
    color: C.white,
  });
  slide.addText(expect, {
    x: x + 0.12,
    y: y + 0.42,
    w: w - 0.24,
    h: h - 0.52,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.navy,
    valign: "top",
  });
}

async function main() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 10, height: 5.625 });
  pptx.layout = "WIDE";
  pptx.author = "Iman Suherman";
  pptx.title = "SDD Analitik Kopilot — Demo Spec-Driven Development";
  pptx.subject = "Sharing session suherman.net — Bahasa Indonesia";

  const TOTAL = 18;
  let page = 0;
  const foot = (slide) => addFooter(slide, pptx, ++page, TOTAL);


  // 1 — Title
  {
    const s = pptx.addSlide();
    s.background = { color: C.navy };
    if (fs.existsSync(LOGO)) {
      s.addImage({ path: LOGO, x: 4.35, y: 0.35, w: 1.3, h: 1.3 });
    }
    s.addText("SDD Analitik Kopilot", {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 0.55,
      fontSize: 32,
      fontFace: "Georgia",
      bold: true,
      color: C.cream,
      align: "center",
    });
    s.addText(
      "Demo Spec-Driven Development — dari SPEC sampai aplikasi berjalan",
      {
        x: 0.8,
        y: 2.4,
        w: 8.4,
        h: 0.4,
        fontSize: 16,
        fontFace: "Calibri",
        color: "A8C0DE",
        align: "center",
      },
    );
    s.addText(
      "Sejalan dengan sesi suherman.net:\n“Build an App with AI, Live: From Idea to Running Application”\nSabtu, 5 September 2026 · 11:00–12:00 WIB",
      {
        x: 1,
        y: 3.0,
        w: 8,
        h: 1.0,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.cream,
        align: "center",
      },
    );
    s.addText("Iman Suherman  ·  suherman.net", {
      x: 0.5,
      y: 4.7,
      w: 9,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: "7A93B0",
      align: "center",
    });
    s.addNotes(
      notes([
        "KATAKAN: Selamat datang. Ini sesi live build — bukan teori AI. Kita pakai SDD Analitik Kopilot sebagai bukti: SPEC → agent → aplikasi jalan.",
        "SETUP SEBELUM SHARE SCREEN:\n1) Buka folder repo di Cursor/VS Code\n2) Terminal 1 sudah running: npm run demo\n3) Browser localhost:3000 siap\n4) Opsional Terminal 2: biarkan kosong untuk perintah live",
        "VS CODE — jangan jalankan dulu, hanya pastikan terbuka:\n- Explorer: specs/requirements/\n- Tab siap: specs/regeneration/prompts/regenerate-full-app.md\n- Tab siap: AGENTS.md",
        "LINK: https://suherman.net/ · Meet di chat",
      ]),
    );
    page++;
  }

  // 2 — Agenda
  {
    const s = bodySlide(pptx, {
      title: "Agenda sesi (suherman.net)",
      subtitle: "Bangun aplikasi dengan AI secara live — bukan webinar teori",
      notes: notes([
        "KATAKAN: Lima blok. Inti di blok 03 — agent jalan sementara kita narasikan ownership & batas. Blok 04 = bukti runnable di browser.",
        "VS CODE SAAT SLIDE INI:\nBuka split: kiri specs/README.md | kanan package.json (scripts).\nTidak perlu jalankan perintah dulu.",
        "SIAPKAN DI CLIPBOARD (nanti):\nnpm run demo",
      ]),
    });
    const agenda = [
      ["01 · 10 mnt", "Konteks & konsep", "Masalah → riset → kenapa tidak langsung “buatkan app”."],
      ["02 · 5 mnt", "Ubah ide jadi SPEC", "SPEC = kontrak: rute, perilaku, copy, hard rules, acceptance."],
      ["03 · 25–35 mnt", "Jalankan AI agents + narasi", "Fondasi → paralel → i18n → typecheck; manusia putuskan batas."],
      ["04 · 10 mnt", "Demo & bukti", "URL lokal, test, smoke walk — bukti runnable, bukan sekadar prompt."],
      ["05 · 15 mnt", "Product factory + Q&A", "Yang menskala adalah sistem pengembangan, bukan satu prompt."],
    ];
    agenda.forEach((row, i) => {
      const y = 1.15 + i * 0.72;
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.4,
        y,
        w: 9.2,
        h: 0.64,
        fill: { color: i % 2 === 0 ? C.white : C.creamDeep },
        line: { color: C.line, width: 0.5 },
        rectRadius: 0.06,
      });
      s.addText(row[0], {
        x: 0.55,
        y: y + 0.08,
        w: 1.6,
        h: 0.48,
        fontSize: 12,
        bold: true,
        fontFace: "Calibri",
        color: C.accent,
        valign: "middle",
      });
      s.addText(row[1], {
        x: 2.2,
        y: y + 0.05,
        w: 3.2,
        h: 0.25,
        fontSize: 14,
        bold: true,
        fontFace: "Calibri",
        color: C.navy,
      });
      s.addText(row[2], {
        x: 2.2,
        y: y + 0.3,
        w: 7.1,
        h: 0.28,
        fontSize: 12,
        fontFace: "Calibri",
        color: C.muted,
      });
    });
    foot(s);
  }

  // 3 — Quote
  {
    const s = bodySlide(pptx, {
      title: "Pesan inti",
      subtitle: "Dari suherman.net",
      notes: notes([
        "KATAKAN: Baca kutipan pelan. Tekankan: spesifikasi, batas, ownership, tools, verifikasi — lima kata kunci.",
        "VS CODE: Buka AGENTS.md bagian Boundaries. Highlight baris “Never let the LLM execute arbitrary SQL”.",
        "JANGAN: mulai generate kode di slide ini — biarkan pesan mengendap 10 detik.",
      ]),
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.6,
      w: 8.8,
      h: 2.4,
      fill: { color: C.white },
      line: { color: C.accent, width: 2 },
      rectRadius: 0.1,
    });
    s.addText(
      "AI tidak menggantikan software engineering.\nAI membuat software engineering jauh lebih cepat\nketika kita memberi spesifikasi, batas, ownership,\ntools, dan verifikasi yang tepat.",
      {
        x: 0.9,
        y: 1.9,
        w: 8.2,
        h: 1.8,
        fontSize: 18,
        fontFace: "Georgia",
        color: C.navy,
        align: "center",
        italic: true,
      },
    );
    foot(s);
  }

  // 4 — SDD vs vibe
  {
    const s = bodySlide(pptx, {
      title: "Kenapa SPEC, bukan “vibes”?",
      subtitle: "Prompt bukan sumber kebenaran",
      notes: notes([
        "KATAKAN: Kiri = chat “buatkan app analytics”. Kanan = kontrak SDD. Prompt itu input sementara; SPEC yang di-commit.",
        "VS CODE — SALIN KE CHAT AGENT (contoh anti-pola, JANGAN dijalankan sebagai build serius):\nBuatkan app analytics SaaS lengkap dengan AI yang bisa query database apa saja.",
        "Lalu bandingkan dengan membuka file:\nspecs/regeneration/prompts/regenerate-full-app.md\nTunjukkan bagian Hard constraints.",
        "TERMINAL (opsional, cepat):\ngit status\n# tunjukkan specs/ sudah di-track sebagai sumber kebenaran",
      ]),
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.4,
      y: 1.25,
      w: 4.4,
      h: 3.5,
      fill: { color: C.white },
      line: { color: C.line },
      rectRadius: 0.08,
    });
    s.addText("Tanpa SPEC", {
      x: 0.6,
      y: 1.4,
      w: 4,
      h: 0.35,
      fontSize: 16,
      bold: true,
      color: C.warn,
      fontFace: "Calibri",
    });
    s.addText(
      [
        { text: "Hasil tidak deterministik", options: { bullet: true, breakLine: true } },
        { text: "SQL liar / halusinasi skema", options: { bullet: true, breakLine: true } },
        { text: "Sulit diuji ulang", options: { bullet: true, breakLine: true } },
        { text: "Sulit diwariskan ke agent lain", options: { bullet: true, breakLine: true } },
      ],
      { x: 0.6, y: 1.9, w: 4, h: 2.5, fontSize: 14, color: C.navy, fontFace: "Calibri" },
    );

    s.addShape(pptx.ShapeType.roundRect, {
      x: 5.2,
      y: 1.25,
      w: 4.4,
      h: 3.5,
      fill: { color: C.soft },
      line: { color: C.accent },
      rectRadius: 0.08,
    });
    s.addText("Dengan SDD", {
      x: 5.4,
      y: 1.4,
      w: 4,
      h: 0.35,
      fontSize: 16,
      bold: true,
      color: C.accent,
      fontFace: "Calibri",
    });
    s.addText(
      [
        { text: "Requirement → domain → kode → tes → jejak", options: { bullet: true, breakLine: true } },
        { text: "Batas keras (no arbitrary SQL)", options: { bullet: true, breakLine: true } },
        { text: "Acceptance + regenerasi dari spesifikasi", options: { bullet: true, breakLine: true } },
        { text: "Demo tetap valid (jam demo tetap)", options: { bullet: true, breakLine: true } },
      ],
      { x: 5.4, y: 1.9, w: 4, h: 2.5, fontSize: 14, color: C.navy, fontFace: "Calibri" },
    );
    foot(s);
  }

  // 5 — Product
  {
    const s = bodySlide(pptx, {
      title: "Produk demo: SDD Analitik Kopilot",
      subtitle: "Referensi Spec-Driven Development untuk analytics agentic",
      notes: notes([
        "KATAKAN: Ini app yang sudah jalan — kita pakai sebagai bukti SDD, dan juga sebagai target regenerasi dari SPEC.",
        "VS CODE — BUKA TAB:\n1) semantic/commerce.yaml\n2) specs/requirements/SDD-004-analytics-copilot.md\n3) public/logo.png (preview)",
        "TERMINAL — jika demo belum jalan, SALIN & ENTER:\ncd ~/src/personal/sdd-analytics-copilot\nnpm run demo\n# tunggu Ready — lalu buka http://localhost:3000",
        "OPSIONAL Vertex:\nnpm run login\n# pilih personal-suherman, Enter",
      ]),
    });
    if (fs.existsSync(LOGO)) {
      s.addImage({ path: LOGO, x: 0.5, y: 1.3, w: 1.1, h: 1.1 });
    }
    s.addText(
      [
        { text: "Next.js monolith + SQLite multi-tenant (6 perusahaan fiktif Indonesia)", options: { bullet: true, breakLine: true } },
        { text: "Kopilot mengambang (bubble) → panel besar / layar penuh", options: { bullet: true, breakLine: true } },
        { text: "QueryPlan terkendali → validate → compile → execute (bukan SQL dari LLM)", options: { bullet: true, breakLine: true } },
        { text: "Vertex AI (Gemini) via npm run login + fallback mock", options: { bullet: true, breakLine: true } },
        { text: "UI & jawaban Bahasa Indonesia · IDR · wilayah Sumatera (bukan APAC)", options: { bullet: true, breakLine: true } },
        { text: "CSV per sektor (marketplace / on-demand / travel / logistik)", options: { bullet: true, breakLine: true } },
        { text: "Jam demo tetap: 2026-09-05 → “bulan lalu” = Agustus 2026", options: { bullet: true, breakLine: true } },
      ],
      { x: 1.9, y: 1.25, w: 7.5, h: 3.5, fontSize: 14, color: C.navy, fontFace: "Calibri", paraSpacingAfter: 6 },
    );
    foot(s);
  }

  // 6 — Hero flow
  {
    const s = bodySlide(pptx, {
      title: "Alur hero (bukti runnable)",
      subtitle: "Yang harus terlihat di sesi live",
      notes: notes([
        "KATAKAN: Lima langkah ini yang akan kita smoke-test di browser. Spec menuntut semuanya tetap hidup.",
        "SIAPKAN 4 PROMPT DI NOTEPAD/CLIPBOARD (salin satu per satu ke Kopilot UI, BUKAN ke agent coding):\n1) Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?\n2) Kenapa Sumatera turun?\n3) Tambahkan investigasi ini ke dasbor eksekutif.\n4) Ganti wilayah dengan segmen pelanggan.",
        "VS CODE: Buka specs/product/demo-journey.md — tunjukkan prompt yang sama ada di SPEC.",
      ]),
    });
    const steps = [
      ["Tanya", "Bahasa alami"],
      ["Rencana", "QueryPlan"],
      ["Eksekusi", "SQLite + company_id"],
      ["Jelaskan", "Jawaban + grafik"],
      ["Simpan", "DashboardSpec"],
    ];
    steps.forEach((st, i) => {
      const x = 0.4 + i * 1.9;
      s.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 1.8,
        w: 1.75,
        h: 1.6,
        fill: { color: C.white },
        line: { color: C.accent, width: 1.5 },
        rectRadius: 0.1,
      });
      s.addText(String(i + 1).padStart(2, "0"), {
        x,
        y: 1.95,
        w: 1.75,
        h: 0.3,
        align: "center",
        fontSize: 12,
        color: C.muted,
        fontFace: "Calibri",
      });
      s.addText(st[0], {
        x,
        y: 2.3,
        w: 1.75,
        h: 0.4,
        align: "center",
        fontSize: 16,
        bold: true,
        color: C.navy,
        fontFace: "Georgia",
      });
      s.addText(st[1], {
        x: x + 0.08,
        y: 2.8,
        w: 1.6,
        h: 0.4,
        align: "center",
        fontSize: 11,
        color: C.muted,
        fontFace: "Calibri",
      });
      if (i < steps.length - 1) {
        s.addText("→", {
          x: x + 1.65,
          y: 2.35,
          w: 0.3,
          h: 0.4,
          fontSize: 18,
          color: C.accent,
          bold: true,
        });
      }
    });
    s.addText(
      "Prompt demo: bandingkan pendapatan → kenapa Sumatera turun → simpan ke dasbor → ganti widget wilayah→segmen",
      {
        x: 0.5,
        y: 3.8,
        w: 9,
        h: 0.7,
        fontSize: 13,
        color: C.navy,
        fontFace: "Calibri",
      },
    );
    foot(s);
  }

  // 7 — Spec index
  {
    const s = bodySlide(pptx, {
      title: "Spesifikasi sebagai kontrak",
      subtitle: "SDD-001 … SDD-013 — sumber kebenaran regenerasi",
      notes: notes([
        "KATAKAN: Kalau src/ dihapus, agent harus bisa bangun ulang dari specs/ + regeneration prompts.",
        "VS CODE — SALIN KE CHAT AGENT (saat blok live build / regenerasi):\nBuka @specs/regeneration/prompts/regenerate-full-app.md dan ikuti instruksi di sana. Kerjakan fase A→H. Jangan langgar Hard constraints (no arbitrary SQL, jam demo 2026-09-05, Bahasa Indonesia, multi-tenant x-company-id).",
        "ATAU prompt pendek:\nRegenerate this app from specs/regeneration/README.md and SDD-001 through SDD-013. Keep QueryPlan boundary. Prefer data/samples CSV seed.",
        "FILE YANG DITUNJUKKAN:\nspecs/regeneration/prompts/regenerate-full-app.md\nspecs/requirements/ (folder)",
      ]),
    });
    const rows = [
      "001 Workspace · 002 Dataset · 003 Semantic · 004 Copilot · 005 Governance",
      "006 Visualisasi · 007 Dasbor DSL · 008 Jejak · 009 Multi-tenant",
      "010 Locale + jam demo · 011 Pipeline CSV · 012 Dock UX · 013 Vertex + login",
    ];
    rows.forEach((t, i) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.4,
        y: 1.25 + i * 0.85,
        w: 9.2,
        h: 0.72,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.06,
      });
      s.addText(t, {
        x: 0.6,
        y: 1.4 + i * 0.85,
        w: 8.8,
        h: 0.45,
        fontSize: 14,
        color: C.navy,
        fontFace: "Calibri",
        valign: "middle",
      });
    });
    s.addText(
      "Regenerasi: specs/regeneration/prompts/regenerate-full-app.md",
      {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.3,
        fontSize: 12,
        color: C.accent,
        fontFace: "Calibri",
      },
    );
    foot(s);
  }

  // 8 — Hard boundaries
  {
    const s = bodySlide(pptx, {
      title: "Batas keras (jangan dilanggar)",
      subtitle: "Ini yang mencegah “AI vibes” merusak sistem",
      notes: notes([
        "KATAKAN: Ini “guardrail”. Agent coding yang melanggar = gagal acceptance.",
        "VS CODE — saat agent sedang generate (blok 03), SALIN FOLLOW-UP INI JIKA PERLU:\nStop. Do not write raw SQL in the LLM. Only emit QueryPlan JSON. Compile must inject company_id. Demo clock must stay DEMO_AS_OF=2026-09-05. UI and answers in Bahasa Indonesia.",
        "BUKA UNTUK BUKTI DI KODE:\nsrc/server/analytics/time-range.ts  (cari DEMO_AS_OF)\nsrc/server/analytics/compiler.ts    (company_id)\nAGENTS.md Boundaries",
        "TERMINAL (verifikasi cepat):\nrg -n \"DEMO_AS_OF\" src/server/analytics/time-range.ts",
      ]),
    });
    s.addText(
      [
        { text: "LLM tidak menulis/menjalankan SQL — hanya QueryPlan → validate → compile → execute", options: { bullet: true, breakLine: true } },
        { text: "Dasbor = JSON DashboardSpec, bukan React yang digenerate", options: { bullet: true, breakLine: true } },
        { text: "Monolith Next.js + SQLite", options: { bullet: true, breakLine: true } },
        { text: "company_id diinjeksikan dari header x-company-id", options: { bullet: true, breakLine: true } },
        { text: "Jam demo tetap 2026-09-05 (Sumatera Agustus tetap valid)", options: { bullet: true, breakLine: true } },
      ],
      { x: 0.5, y: 1.3, w: 9, h: 3.4, fontSize: 16, color: C.navy, fontFace: "Calibri", paraSpacingAfter: 10 },
    );
    foot(s);
  }

  // 9–15 Screenshot expected results
  const shots = [
    {
      title: "Layar: Beranda",
      subtitle: "http://localhost:3000/",
      notes: notes([
        "KATAKAN: Ini permukaan pertama. Kartu alur = SPEC yang bisa diklik.",
        "BROWSER: Pastikan localhost:3000. Klik “Buka Kopilot” atau kartu Tanya.",
        "VS CODE: Tidak perlu prompt coding di sini. Tunjukkan src/components/home/HomeHero.tsx jika ditanya “dari mana copy-nya”.",
        "TERMINAL (jika blank):\nnpm run demo",
      ]),
      cards: [
        {
          label: "Yang terlihat",
          expect:
            "Judul “SDD Analitik Kopilot”, CTA Buka Kopilot, 6 kartu alur SDD (Tanya→Simpan) dalam Bahasa Indonesia, nama perusahaan aktif di narasi.",
        },
        {
          label: "Hasil yang diharapkan",
          expect:
            "Klik kartu → gelembung kopilot kanan-bawah terbuka + prompt terkirim otomatis. Tidak perlu navigasi ke halaman chat penuh.",
        },
      ],
    },
    {
      title: "Layar: Pemilih perusahaan",
      subtitle: "Header kanan-atas",
      notes: notes([
        "KATAKAN: Soft multi-tenancy. Header x-company-id. Ganti tenant = data berbeda.",
        "BROWSER: Buka modal perusahaan → pilih GoCepat, lalu kembali TokoRaya untuk demo Sumatera.",
        "VS CODE — SALIN KE AGENT HANYA JIKA MENJELASKAN TENANCY:\nShow how x-company-id scopes analytics SQL. Open src/server/company/service.ts and compiler company_id injection.",
        "FILE: specs/requirements/SDD-009-multi-tenant-companies.md",
      ]),
      cards: [
        {
          label: "Yang terlihat",
          expect:
            "Kontrol menampilkan nama/sektor/tagline + logo SVG. Modal terpusat: TokoRaya, GoCepat, BukaDagang, BeliNusa, JelajahID, AngkutPrima.",
        },
        {
          label: "Hasil yang diharapkan",
          expect:
            "Ganti tenant → obrolan reset; query berikutnya memfilter company_id berbeda; angka pendapatan bisa berubah.",
        },
      ],
    },
    {
      title: "Layar: Kopilot — bandingkan pendapatan",
      subtitle: "Prompt: “Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?”",
      notes: notes([
        "KATAKAN: Prompt ke KOPILOT UI (bukan chat coding). Typewriter + grafik langsung.",
        "SALIN KE KOPILOT (bubble chat di browser):\nBagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        "SAAT MENUNGGU JAWABAN — VS CODE:\nBuka tab Network opsional, atau src/server/agent/analytics-agent.ts\nJelaskan: Vertex plan JSON → execute QueryPlan → narrate.",
        "JANGAN paste prompt ini ke Cursor Agent (itu akan mengedit kode).",
      ]),
      cards: [
        {
          label: "Yang terlihat",
          expect:
            "Bubble → panel; indikator mengetik; jawaban typewriter Bahasa Indonesia; grafik KPI/tren muncul segera; chip demo di atas.",
        },
        {
          label: "Hasil yang diharapkan",
          expect:
            "QueryPlan metric=revenue, time=last_month, comparison=previous_period. Bukti SQL mengandung company_id. Delta % vs Juli 2026.",
        },
      ],
    },
    {
      title: "Layar: Kopilot — kenapa Sumatera turun",
      subtitle: "Prompt: “Kenapa Sumatera turun?”",
      notes: notes([
        "KATAKAN: Pola seed disengaja. Jam demo 2026-09-05 → Agustus = Sumatera drop. Bukan APAC.",
        "SALIN KE KOPILOT:\nKenapa Sumatera turun?",
        "VS CODE — TUNJUKKAN SEED:\ndata/seed.ts (cari augustSumateraDrop)\natau data/samples/tokoraya/\nspecs/requirements/SDD-002-demo-dataset.md",
        "TERMINAL:\nrg -n \"augustSumateraDrop|Sumatera\" data/seed.ts",
      ]),
      cards: [
        {
          label: "Yang terlihat",
          expect:
            "Narasi diagnostik fokus Sumatera; breakdown wilayah/segmen; pola demo penurunan Agustus terlihat di angka/grafik.",
        },
        {
          label: "Hasil yang diharapkan",
          expect:
            "Filter/rincian region=Sumatera; jejak berisi execute_sqlite + breakdown. Bukan “APAC”.",
        },
      ],
    },
    {
      title: "Layar: Bukti & QueryPlan",
      subtitle: "Di dalam pesan asisten (details)",
      notes: notes([
        "KATAKAN: Perluas “Rencana Kueri” dan “Bukti”. Ini bukti governance — LLM tidak kirim SQL.",
        "BROWSER: Expand details di bubble. Scroll SQL — tunjukkan company_id = ?",
        "VS CODE:\nsrc/server/analytics/query-plan.ts\nsrc/server/analytics/validate.ts\nsrc/server/analytics/compiler.ts",
        "FOLLOW-UP AGENT (jika audience tanya regenerasi compiler):\nImplement QueryPlan validate+compile per specs/domain/query-plan.md and SDD-005. Always inject company_id.",
      ]),
      cards: [
        {
          label: "Yang terlihat",
          expect:
            "Blok JSON QueryPlan; definisi metrik; jendela waktu Agustus 2026; SQL parameterised; tautan jejak run_…",
        },
        {
          label: "Hasil yang diharapkan",
          expect:
            "Penonton memahami: agent merencanakan, mesin yang mengeksekusi. Tidak ada SQL mentah dari model.",
        },
      ],
    },
    {
      title: "Layar: Dasbor eksekutif",
      subtitle: "Setelah “Tambahkan investigasi… ke dasbor”",
      notes: notes([
        "KATAKAN: DashboardSpec JSON — bukan React yang digenerate agent.",
        "SALIN KE KOPILOT (berurutan):\nTambahkan investigasi ini ke dasbor eksekutif.\nGanti wilayah dengan segmen pelanggan.",
        "BROWSER: Buka /dashboards setelah masing-masing prompt.",
        "VS CODE:\nspecs/requirements/SDD-007-dashboard.md\nsrc/server/dashboard/schema.ts\nsrc/components/dashboard/DashboardView.tsx",
      ]),
      cards: [
        {
          label: "Yang terlihat",
          expect:
            "Ikhtisar Eksekutif: KPI Pendapatan, tren bulanan, bar per wilayah. Setelah patch: widget wilayah → segmen.",
        },
        {
          label: "Hasil yang diharapkan",
          expect:
            "DashboardSpec JSON tersimpan per company_id. Widget dieksekusi lewat QueryPlan yang sama (governance tetap).",
        },
      ],
    },
    {
      title: "Layar: Jejak & Model Semantik",
      subtitle: "/traces · /semantic-model",
      notes: notes([
        "KATAKAN: Jejak = runtime evidence. Model Semantik = vocabulary yang boleh dipakai agent.",
        "BROWSER: /traces (klik run_…) lalu /semantic-model",
        "VS CODE:\nsemantic/commerce.yaml\nspecs/domain/semantic-model.md\ntests/acceptance/SDD-004.test.ts",
        "TERMINAL — bukti tes:\nnpm test",
      ]),
      cards: [
        {
          label: "Jejak",
          expect:
            "Langkah: understand_intent → vertex_plan/mock → validate → execute_sqlite → generate_answer. SQL + durasi terlihat.",
        },
        {
          label: "Model Semantik",
          expect:
            "Metrik Pendapatan/Pesanan/… dan dimensi Wilayah/Segmen dari commerce.yaml + jejak spesifikasi SDD.",
        },
      ],
    },
  ];

  for (const shot of shots) {
    const s = bodySlide(pptx, {
      title: shot.title,
      subtitle: shot.subtitle,
      notes: shot.notes,
    });
    screenshotCard(s, pptx, {
      x: 0.4,
      y: 1.2,
      w: 4.5,
      h: 3.5,
      label: shot.cards[0].label,
      expect: shot.cards[0].expect,
    });
    screenshotCard(s, pptx, {
      x: 5.1,
      y: 1.2,
      w: 4.5,
      h: 3.5,
      label: shot.cards[1].label,
      expect: shot.cards[1].expect,
    });
    foot(s);
  }

  // 16 — Scripts
  {
    const s = bodySlide(pptx, {
      title: "Skrip & regenerasi",
      subtitle: "Yang harus ada agar agent bisa membangun ulang aplikasi",
      notes: notes([
        "KATAKAN: Scripts = bagian dari kontrak ops (SDD-011/013). Tanpa ini regenerasi tidak lengkap.",
        "TERMINAL — SALIN SATU PER SATU SAAT NARASI:\nnpm run db:seed\nnpm run data:export-csv\nnpm run login\nnpm test",
        "VS CODE — CHAT AGENT (regenerasi data/ops saja):\nBuka @specs/regeneration/prompts/regenerate-data-and-ops.md dan implementasikan semua file di daftar Required files.",
        "VS CODE — CHAT AGENT (copilot+vertex saja):\n@specs/regeneration/prompts/regenerate-copilot-vertex.md",
      ]),
    });
    s.addText(
      [
        { text: "npm run demo — seed CSV + next dev", options: { bullet: true, breakLine: true } },
        { text: "npm run db:seed / data:export-csv — pipeline sampel per perusahaan", options: { bullet: true, breakLine: true } },
        { text: "npm run login / generate-env — ADC Vertex → .gcloud/ + .env", options: { bullet: true, breakLine: true } },
        { text: "npm test — AGENT_BACKEND=mock (deterministik)", options: { bullet: true, breakLine: true } },
        { text: "Prompt regenerasi: specs/regeneration/prompts/regenerate-full-app.md", options: { bullet: true, breakLine: true } },
      ],
      { x: 0.5, y: 1.3, w: 9, h: 3.2, fontSize: 15, color: C.navy, fontFace: "Calibri", paraSpacingAfter: 8 },
    );
    foot(s);
  }

  // 17 — Live checklist
  {
    const s = bodySlide(pptx, {
      title: "Checklist demo live (10 menit)",
      subtitle: "Bagian #04 agenda — bukti, bukan slide saja",
      notes: notes([
        "KATAKAN: Ini urutan smoke walk. Centang mental sambil share browser.",
        "URUTAN SALIN — KOPILOT UI:\n1) Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?\n2) Kenapa Sumatera turun?\n3) Tambahkan investigasi ini ke dasbor eksekutif.\n4) Ganti wilayah dengan segmen pelanggan.",
        "TERMINAL (paralel, jangan ganggu demo kecuali error):\nnpm test\n# atau biarkan npm run demo tetap jalan",
        "JIKA DEMO RUSAK — VS CODE AGENT:\nFix the demo journey per AGENTS.md north star. Keep DEMO_AS_OF and QueryPlan boundary. Run npm test.",
        "MAXIMIZE dock di UI untuk grafik lebih jelas; Esc untuk keluar fullscreen.",
      ]),
    });
    const checks = [
      "npm run demo → http://localhost:3000",
      "Buka bubble Kopilot / kartu beranda",
      "Bandingkan pendapatan bulan lalu",
      "Kenapa Sumatera turun? (bukan APAC)",
      "Perluas QueryPlan + Bukti (SQL + company_id)",
      "Simpan ke dasbor → buka Dasbor",
      "Ganti wilayah → segmen",
      "Buka Jejak · opsional Maximize dock",
      "Opsional: npm run login → jejak backend vertex",
    ];
    checks.forEach((c, i) => {
      const col = i < 5 ? 0 : 1;
      const row = i % 5;
      const x = 0.45 + col * 4.8;
      const y = 1.2 + row * 0.65;
      s.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 4.5,
        h: 0.55,
        fill: { color: C.white },
        line: { color: C.line },
        rectRadius: 0.05,
      });
      s.addText(`☐  ${c}`, {
        x: x + 0.15,
        y: y + 0.1,
        w: 4.2,
        h: 0.35,
        fontSize: 12,
        color: C.navy,
        fontFace: "Calibri",
        valign: "middle",
      });
    });
    foot(s);
  }

  // 18 — Close
  {
    const s = pptx.addSlide();
    s.background = { color: C.navy };
    if (fs.existsSync(LOGO)) {
      s.addImage({ path: LOGO, x: 4.45, y: 0.55, w: 1.1, h: 1.1 });
    }
    s.addText("Terima kasih", {
      x: 0.5,
      y: 1.9,
      w: 9,
      h: 0.5,
      fontSize: 34,
      fontFace: "Georgia",
      bold: true,
      color: C.cream,
      align: "center",
    });
    s.addText(
      "Yang menskala: sistem spesifikasi + agent + verifikasi.\nBukan satu prompt yang “beruntung”.",
      {
        x: 1,
        y: 2.6,
        w: 8,
        h: 0.8,
        fontSize: 15,
        fontFace: "Calibri",
        color: "A8C0DE",
        align: "center",
      },
    );
    s.addText(
      "suherman.net  ·  github.com/iman-suherman/sdd-analytics-copilot\nMeet: meet.google.com/mcc-iopz-cnm",
      {
        x: 0.5,
        y: 3.7,
        w: 9,
        h: 0.7,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.cream,
        align: "center",
      },
    );
    s.addText("Iman Suherman — Building solutions. Delivering impact.", {
      x: 0.5,
      y: 4.7,
      w: 9,
      h: 0.3,
      fontSize: 11,
      fontFace: "Calibri",
      color: "7A93B0",
      align: "center",
    });
    s.addNotes(
      notes([
        "KATAKAN: Terima kasih. Q&A. Arahkan ke poll/register di suherman.net.",
        "VS CODE — JANGAN generate kode di closing kecuali ada pertanyaan teknis spesifik.",
        "JIKA ADA YANG MAU COBA SENDIRI — berikan perintah:\ngit clone https://github.com/iman-suherman/sdd-analytics-copilot\ncd sdd-analytics-copilot && npm install && npm run demo",
        "PROMPT REGENERASI UNTUK AUDIENCE:\nSalin isi specs/regeneration/prompts/regenerate-full-app.md ke Cursor Agent di repo kosong yang sudah berisi folder specs/ + semantic/ + data/samples/.",
      ]),
    );
    page++;
  }

  // Fix TOTAL mismatch if any - regenerate footer numbers already sequential
  await pptx.writeFile({ fileName: OUT });
  console.log("Wrote", OUT, `(${page} slides)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
