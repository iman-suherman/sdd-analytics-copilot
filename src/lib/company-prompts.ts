import type { Company } from "@/components/company/CompanyProvider";

export type DemoPromptCard = {
  id: string;
  title: string;
  prompt: string;
  hint: string;
};

const SHARED_TAIL = {
  save: {
    id: "save",
    title: "Simpan ke dasbor",
    prompt: "Tambahkan investigasi ini ke dasbor eksekutif.",
    hint: "Persist hasil analisis",
  },
} as const;

/** Pertanyaan demo per profil perusahaan (nama fiktif). */
export function getCompanyDemoCards(company: Company | null): DemoPromptCard[] {
  const name = company?.name ?? "perusahaan ini";
  const sector = company?.sector ?? "";
  const id = company?.id ?? "tokoraya";

  const byId: Record<string, DemoPromptCard[]> = {
    tokoraya: [
      {
        id: "compare",
        title: "Bandingkan GMV",
        prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        hint: `${name} · marketplace`,
      },
      {
        id: "sumatera",
        title: "Diagnosa Sumatera",
        prompt: "Kenapa Sumatera turun?",
        hint: "Pola demo penurunan Agustus",
      },
      {
        id: "region",
        title: "Peta wilayah",
        prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
        hint: "Tren GMV antar pulau",
      },
      {
        id: "segment",
        title: "Segmen penjual",
        prompt: "Tampilkan pendapatan per segmen.",
        hint: "Korporasi · Menengah · UMKM",
      },
      SHARED_TAIL.save,
    ],
    gocepat: [
      {
        id: "compare",
        title: "Omzet layanan",
        prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        hint: `${name} · on-demand`,
      },
      {
        id: "region",
        title: "Kota layanan",
        prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
        hint: "Performa antar wilayah",
      },
      {
        id: "segment",
        title: "Tipe mitra",
        prompt: "Tampilkan pendapatan per segmen.",
        hint: "Mitra Korporasi vs UMKM",
      },
      {
        id: "aov",
        title: "Nilai pesanan",
        prompt: "Berapa nilai rata-rata pesanan bulan lalu?",
        hint: "AOV layanan antar",
      },
      SHARED_TAIL.save,
    ],
    bukadagang: [
      {
        id: "compare",
        title: "Omzet UMKM",
        prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        hint: `${name} · marketplace UMKM`,
      },
      {
        id: "sumatera",
        title: "Sumatera lesu?",
        prompt: "Kenapa Sumatera turun?",
        hint: "Cek penurunan regional",
      },
      {
        id: "segment",
        title: "Segmen mitra",
        prompt: "Tampilkan pendapatan per segmen.",
        hint: "Fokus UMKM",
      },
      {
        id: "region",
        title: "Sebaran dagang",
        prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
        hint: "Enam bulan terakhir",
      },
      SHARED_TAIL.save,
    ],
    belinusa: [
      {
        id: "compare",
        title: "Penjualan bulanan",
        prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        hint: `${name} · e-commerce keluarga`,
      },
      {
        id: "category",
        title: "Kategori produk",
        prompt: "Tampilkan pendapatan per kategori produk.",
        hint: "Elektronik, Fashion, F&B…",
      },
      {
        id: "region",
        title: "Wilayah pembeli",
        prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
        hint: "Tren nasional",
      },
      {
        id: "aov",
        title: "Keranjang rata-rata",
        prompt: "Berapa nilai rata-rata pesanan bulan lalu?",
        hint: "AOV belanja",
      },
      SHARED_TAIL.save,
    ],
    jelajahid: [
      {
        id: "compare",
        title: "Booking bulan lalu",
        prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        hint: `${name} · travel`,
      },
      {
        id: "region",
        title: "Destinasi / wilayah",
        prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
        hint: "Permintaan liburan domestik",
      },
      {
        id: "segment",
        title: "Segmen wisatawan",
        prompt: "Tampilkan pendapatan per segmen.",
        hint: "Korporasi vs individu",
      },
      {
        id: "trend",
        title: "Tren musim",
        prompt: "Tampilkan tren pendapatan bulanan selama enam bulan terakhir.",
        hint: "Musim liburan",
      },
      SHARED_TAIL.save,
    ],
    angkutprima: [
      {
        id: "compare",
        title: "Volume kiriman",
        prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
        hint: `${name} · logistik`,
      },
      {
        id: "sumatera",
        title: "Rute Sumatera",
        prompt: "Kenapa Sumatera turun?",
        hint: "Gangguan rute demo",
      },
      {
        id: "region",
        title: "Koridor wilayah",
        prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
        hint: "Performa antar pulau",
      },
      {
        id: "segment",
        title: "Tipe pengirim",
        prompt: "Tampilkan pendapatan per segmen.",
        hint: "B2B vs UMKM",
      },
      SHARED_TAIL.save,
    ],
  };

  if (byId[id]) return byId[id]!;

  // Fallback berdasarkan sektor
  return [
    {
      id: "compare",
      title: "Bandingkan pendapatan",
      prompt: "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
      hint: sector || name,
    },
    {
      id: "region",
      title: "Per wilayah",
      prompt: "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
      hint: "Rincian regional",
    },
    {
      id: "segment",
      title: "Per segmen",
      prompt: "Tampilkan pendapatan per segmen.",
      hint: "Korporasi · Menengah · UMKM",
    },
    SHARED_TAIL.save,
  ];
}

/** Kartu alur SDD di beranda — taut ke prompt demo. */
export function getHomeFlowCards(company: Company | null) {
  const cards = getCompanyDemoCards(company);
  const compare = cards.find((c) => c.id === "compare") ?? cards[0]!;
  const deep = cards.find((c) => c.id === "sumatera" || c.id === "region") ?? cards[1]!;
  const save = cards.find((c) => c.id === "save") ?? cards[cards.length - 1]!;

  return [
    {
      title: "Tanya",
      body: `"${compare.prompt}"`,
      prompt: compare.prompt,
      href: `/copilot?q=${encodeURIComponent(compare.prompt)}`,
    },
    {
      title: "Rencana",
      body: "Metrik: pendapatan · Perbandingan · Rincian wilayah/segmen",
      prompt: compare.prompt,
      href: `/copilot?q=${encodeURIComponent(compare.prompt)}`,
    },
    {
      title: "Eksekusi",
      body: "Kueri semantik terkendali ke SQLite per tenant",
      prompt: deep.prompt,
      href: `/copilot?q=${encodeURIComponent(deep.prompt)}`,
    },
    {
      title: "Jelaskan",
      body: `"${deep.prompt}"`,
      prompt: deep.prompt,
      href: `/copilot?q=${encodeURIComponent(deep.prompt)}`,
    },
    {
      title: "Visualisasi",
      body: "Grafik berbasis bukti dengan gaya logo",
      prompt: deep.prompt,
      href: `/copilot?q=${encodeURIComponent(deep.prompt)}`,
    },
    {
      title: "Simpan",
      body: `"${save.prompt}"`,
      prompt: save.prompt,
      href: `/copilot?q=${encodeURIComponent(save.prompt)}`,
    },
  ];
}
