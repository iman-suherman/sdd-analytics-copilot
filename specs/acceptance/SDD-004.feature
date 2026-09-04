Feature: SDD-004 Analitik percakapan
  Scenario: Pendapatan bulan lalu dengan QueryPlan terkendali
    Given database demo sudah di-seed
    And perusahaan aktif tokoraya
    When pengguna bertanya "Berapa pendapatan bulan lalu?"
    Then agen mengembalikan QueryPlan dengan metric revenue
    And jawaban Bahasa Indonesia disertai bukti SQL berisi company_id
    And jejak agen tersimpan

Feature: SDD-002 Pola Sumatera
  Scenario: Sumatera Agustus lebih rendah
    Given DEMO_AS_OF 2026-09-05
    When pendapatan completed Sumatera Agustus 2026 dibandingkan Juli 2026 untuk tokoraya
    Then Agustus lebih rendah secara material
