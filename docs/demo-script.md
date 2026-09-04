# Demo script

1. `npm install && npm run login` *(optional — Vertex)* `&& npm run demo`
2. Open http://localhost:3000 — use company switcher (default TokoRaya)
3. Click the **bottom-right Kopilot** bubble (or a home flow card)
4. Ask: `Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?`
5. Expand **Rencana Kueri** and **Bukti**; note **Sumatera** as the driver
6. Ask: `Kenapa Sumatera turun?`
7. Open **Jejak** and inspect `execute_sqlite` (SQL must include `company_id`)
8. Ask: `Tambahkan investigasi ini ke dasbor eksekutif.`
9. Open **Dasbor** — KPI, tren, bar wilayah
10. Ask: `Ganti wilayah dengan segmen pelanggan.`
11. Refresh Dasbor; open **Model Semantik** for specification traces
12. Optional: Maximize the dock (fullscreen under header), then Minimize / Esc

Demo clock is fixed at **2026-09-05** so “bulan lalu” is August 2026.
