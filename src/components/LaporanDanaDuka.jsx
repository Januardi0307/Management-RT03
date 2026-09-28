import { useEffect, useState } from "react";
import "./LaporanDanaDuka.css";
import { supabase } from "../lib/supabase";

function LaporanDanaDuka() {
  const [tahunLaporan, setTahunLaporan] = useState(new Date().getFullYear());
  const [tanggalLaporan, setTanggalLaporan] = useState(() => {
    const tahun = new Date().getFullYear();
    return `${tahun}-12-31`;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saldoAwal, setSaldoAwal] = useState(0);
  const [rekapIuran, setRekapIuran] = useState([]);
  const [dataSantunan, setDataSantunan] = useState([]);

  const [totalIuran, setTotalIuran] = useState(0);
  const [totalSantunan, setTotalSantunan] = useState(0);
  const [saldoAkhir, setSaldoAkhir] = useState(0);

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  function formatRupiah(nilai) {
    return `Rp${Number(nilai || 0).toLocaleString("id-ID")}`;
  }

  // =====================================================
  // AMBIL SELURUH IURAN SATU TAHUN
  // MENGGUNAKAN PAGINATION
  // =====================================================

  async function ambilSemuaIuran(tahun) {
    const awalTahun = `${tahun}-01`;
    const akhirTahun = `${tahun}-12`;

    // Ambil hanya Kepala Keluarga yang saat ini mengikuti Dana Duka
    const { data: peserta, error: errorPeserta } = await supabase
        .from("warga")
        .select("id")
        .eq("status", "Aktif")
        .eq("status_kependudukan", "Warga RT03")
        .eq("status_keluarga", "Kepala Keluarga")
        .eq("ikut_dana_duka", true);

    if (errorPeserta) {
        throw errorPeserta;
    }

    const pesertaIds = (peserta || []).map((item) => item.id);

    console.log(
        `LAPORAN DANA DUKA - JUMLAH PESERTA AKTIF: ${pesertaIds.length}`
    );

    if (pesertaIds.length === 0) {
        console.log(
            `LAPORAN DANA DUKA - TIDAK ADA PESERTA DANA DUKA.`
        );
        return [];
    }

    let semuaData = [];
    let halaman = 0;
    const ukuranHalaman = 1000;

    while (true) {
      const dari = halaman * ukuranHalaman;
      const sampai = dari + ukuranHalaman - 1;

      const { data, error } = await supabase
        .from("iuran_dana_duka")
        .select(
          "id, warga_id, kk, nama_kepala_keluarga, bulan, jumlah, status_pembayaran, tanggal_bayar",
        )
        .gte("bulan", awalTahun)
        .lte("bulan", akhirTahun)
        .eq("status_pembayaran", "Lunas")
        .in("warga_id", pesertaIds)
        .order("bulan", { ascending: true })
        .range(dari, sampai);
        

      if (error) {
        throw error;
      }

      console.log(
        `LAPORAN DANA DUKA - HALAMAN IURAN ${halaman + 1}:`,
        data?.length || 0,
      );

      semuaData = [...semuaData, ...(data || [])];

      if (!data || data.length < ukuranHalaman) {
        break;
      }

      halaman++;
    }

    console.log(`LAPORAN DANA DUKA - TOTAL IURAN ${tahun}:`, semuaData.length);

    return semuaData;
  }

  // =====================================================
  // AMBIL SELURUH SANTUNAN SATU TAHUN
  // =====================================================

  async function ambilSemuaSantunan(tahun) {
    const { data, error } = await supabase
      .from("santunan_dana_duka")
      .select(
        "id, tanggal_santunan, tahun, nama_almarhum, warga_meninggal_id, nama_penerima, hubungan_penerima, jumlah, keterangan",
      )
      .eq("tahun", tahun)
      .order("tanggal_santunan", { ascending: true })
      .range(0, 4999);

    if (error) {
      throw error;
    }

    console.log(
      `LAPORAN DANA DUKA - TOTAL SANTUNAN ${tahun}:`,
      data?.length || 0,
    );

    return data || [];
  }

  // =====================================================
  // HITUNG SALDO AKHIR TAHUN
  // =====================================================

  async function hitungSaldoAkhir(tahun) {
    let saldoAwalTahun = 0;

    if (Number(tahun) === 2024) {
      saldoAwalTahun = 0;
    } else {
      saldoAwalTahun = await hitungSaldoAkhir(Number(tahun) - 1);
    }

    const dataIuran = await ambilSemuaIuran(tahun);

    const jumlahIuran = dataIuran.reduce(
      (total, item) => total + Number(item.jumlah || 0),
      0,
    );

    const dataSantunan = await ambilSemuaSantunan(tahun);

    const jumlahSantunan = dataSantunan.reduce(
      (total, item) => total + Number(item.jumlah || 0),
      0,
    );

    const hasil = saldoAwalTahun + jumlahIuran - jumlahSantunan;

    console.log("===== PERHITUNGAN LAPORAN DANA DUKA =====");
    console.log("TAHUN:", tahun);
    console.log("SALDO AWAL:", saldoAwalTahun);
    console.log("TOTAL IURAN:", jumlahIuran);
    console.log("TOTAL SANTUNAN:", jumlahSantunan);
    console.log("SALDO AKHIR:", hasil);
    console.log("==========================================");

    return hasil;
  }

  // =====================================================
  // LOAD LAPORAN
  // =====================================================

  async function loadLaporan(tahun) {
    try {
      setLoading(true);
      setError("");

      console.log(`MEMUAT LAPORAN KEUANGAN DANA DUKA TAHUN ${tahun}...`);

      // -----------------------------------------------
      // IURAN
      // -----------------------------------------------

      const semuaIuran = await ambilSemuaIuran(tahun);

      const totalIuranTahun = semuaIuran.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0,
      );

      // -----------------------------------------------
      // REKAP JANUARI - DESEMBER
      // -----------------------------------------------

      const rekapBulanan = Array.from({ length: 12 }, (_, index) => {
        const nomorBulan = index + 1;

        const bulan = `${tahun}-${String(nomorBulan).padStart(2, "0")}`;

        const dataBulan = semuaIuran.filter((item) => item.bulan === bulan);

        const jumlahPembayaran = dataBulan.length;

        const totalBulan = dataBulan.reduce(
          (total, item) => total + Number(item.jumlah || 0),
          0,
        );

        return {
          bulan,
          nomorBulan,
          namaBulan: new Date(tahun, index, 1).toLocaleDateString("id-ID", {
            month: "long",
          }),
          jumlahPembayaran,
          total: totalBulan,
        };
      });

      // -----------------------------------------------
      // SANTUNAN
      // -----------------------------------------------

      const semuaSantunan = await ambilSemuaSantunan(tahun);

      const totalSantunanTahun = semuaSantunan.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0,
      );

      // -----------------------------------------------
      // SALDO AWAL
      // -----------------------------------------------

      let saldoAwalTahun = 0;

      if (Number(tahun) === 2024) {
        saldoAwalTahun = 0;
      } else {
        saldoAwalTahun = await hitungSaldoAkhir(Number(tahun) - 1);
      }

      // -----------------------------------------------
      // SALDO AKHIR
      // -----------------------------------------------

      const saldoAkhirTahun =
        saldoAwalTahun + totalIuranTahun - totalSantunanTahun;

      console.log("===== HASIL LAPORAN =====");

      console.log("TAHUN:", tahun);

      console.log("SALDO AWAL:", saldoAwalTahun);

      console.log("TOTAL IURAN:", totalIuranTahun);

      console.log("TOTAL SANTUNAN:", totalSantunanTahun);

      console.log("SALDO AKHIR:", saldoAkhirTahun);

      console.log("=========================");

      setSaldoAwal(saldoAwalTahun);
      setRekapIuran(rekapBulanan);
      setDataSantunan(semuaSantunan);
      setTotalIuran(totalIuranTahun);
      setTotalSantunan(totalSantunanTahun);
      setSaldoAkhir(saldoAkhirTahun);
    } catch (err) {
      console.error("GAGAL MEMUAT LAPORAN DANA DUKA:", err);

      setError("Laporan Dana Duka gagal dimuat.");

      setSaldoAwal(0);
      setRekapIuran([]);
      setDataSantunan([]);
      setTotalIuran(0);
      setTotalSantunan(0);
      setSaldoAkhir(0);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD SAAT TAHUN BERUBAH
  // =====================================================

  useEffect(() => {
    loadLaporan(tahunLaporan);
  }, [tahunLaporan]);

  // =====================================================
  // CETAK
  // =====================================================

  function cetakLaporan() {
    window.print();
  }

  // =====================================================
  // JUMLAH SELURUH PEMBAYARAN
  // =====================================================

  const totalPembayaran = rekapIuran.reduce(
    (total, item) => total + item.jumlahPembayaran,
    0,
  );

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="laporan-dana-duka-page">
      {/* =====================================================
    KOP SURAT
====================================================== */}

      <div className="preview-kop-surat">
        <div className="kop-baris kop-baris-1">RUKUN TETANGGA 003/07</div>

        <div className="kop-baris kop-baris-2">
          KELURAHAN KARET &nbsp;&nbsp;&nbsp; KECAMATAN SETIABUDI
        </div>

        <div className="kop-baris kop-baris-3">
          KOTA ADMINISTRASI JAKARTA SELATAN
        </div>

        <div className="kop-baris kop-baris-4">
          <span>Sekretariat : Jalan Setiabudi 1 No. 21</span>

          <span className="kop-kontak">📱 082113197811</span>

          <span className="kop-kontak">✉️ rt.003.07.stb@gmail.com</span>
        </div>

        <div className="kop-baris kop-baris-5">
          JAKARTA &nbsp;&nbsp;-&nbsp;&nbsp; Kode Pos : 12920
        </div>
      </div>

      <div className="preview-garis"></div>

      {/* =================================================
    JUDUL KHUSUS PRINT
    Tidak tampil di monitor
    ================================================= */}

      <div className="print-laporan-header">
        <h2>LAPORAN KEUANGAN DANA DUKA TAHUN {tahunLaporan}</h2>
      </div>

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="laporan-header">
        <div>
          <h2>Laporan Keuangan Dana Duka</h2>

          <p>RT 03 / RW 07 Karet – Setiabudi</p>

          <strong>Tahun {tahunLaporan}</strong>
        </div>

        <div className="laporan-header-control">
          <div>
            <label htmlFor="tahun-laporan">Tahun</label>

            <select
              id="tahun-laporan"
              value={tahunLaporan}
              onChange={(e) => {
                const tahunBaru = Number(e.target.value);

                setTahunLaporan(tahunBaru);

                // Default tanggal laporan = 31 Desember
                setTanggalLaporan(`${tahunBaru}-12-31`);
              }}
            >
              {Array.from({ length: 7 }, (_, index) => {
                const tahun = new Date().getFullYear() - 3 + index;

                return (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="tanggal-laporan">Tanggal Laporan</label>

            <input
              id="tanggal-laporan"
              type="date"
              value={tanggalLaporan}
              onChange={(e) => setTanggalLaporan(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-cetak-laporan"
            onClick={cetakLaporan}
            disabled={loading}
          >
            🖨️ Cetak Laporan
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && <div className="laporan-error">{error}</div>}

      {/* =================================================
          LOADING
          ================================================= */}

      {loading ? (
        <div className="laporan-loading">
          Memuat laporan keuangan Dana Duka...
        </div>
      ) : (
        <>
          {/* =============================================
              RINGKASAN
              ============================================= */}

          <div className="laporan-summary">
            <div className="laporan-summary-card">
              <span>Saldo Awal Tahun</span>

              <strong>{formatRupiah(saldoAwal)}</strong>

              <small>Saldo awal {tahunLaporan}</small>
            </div>

            <div className="laporan-summary-card">
              <span>Total Iuran Masuk</span>

              <strong>{formatRupiah(totalIuran)}</strong>

              <small>Tahun {tahunLaporan}</small>
            </div>

            <div className="laporan-summary-card">
              <span>Total Santunan</span>

              <strong>{formatRupiah(totalSantunan)}</strong>

              <small>Tahun {tahunLaporan}</small>
            </div>

            <div className="laporan-summary-card laporan-summary-final">
              <span>Saldo Akhir Tahun</span>

              <strong>{formatRupiah(saldoAkhir)}</strong>

              <small>Saldo Dana Duka</small>
            </div>
          </div>

          {/* =============================================
              PERHITUNGAN
              ============================================= */}

          <div className="laporan-section">
            <h3>Ringkasan Perhitungan Dana Duka</h3>

            <div className="laporan-perhitungan">
              <div>
                <span>Saldo Awal {tahunLaporan}</span>

                <strong>{formatRupiah(saldoAwal)}</strong>
              </div>

              <div className="operator-plus">
                <span>+ Iuran Masuk</span>

                <strong>{formatRupiah(totalIuran)}</strong>
              </div>

              <div className="operator-minus">
                <span>− Santunan</span>

                <strong>{formatRupiah(totalSantunan)}</strong>
              </div>

              <div className="perhitungan-akhir">
                <span>Saldo Akhir {tahunLaporan}</span>

                <strong>{formatRupiah(saldoAkhir)}</strong>
              </div>
            </div>
          </div>

          {/* =============================================
              REKAP BULANAN
              ============================================= */}

          <div className="laporan-section">
            <div className="laporan-section-header">
              <div>
                <h3>Rekap Iuran Dana Duka</h3>

                <p>Periode Januari – Desember {tahunLaporan}</p>
              </div>

              <div className="laporan-section-total">
                <span>Total Pembayaran</span>

                <strong>{totalPembayaran}</strong>
              </div>
            </div>

            <div className="laporan-table-wrapper laporan-rekap-lama">
              <table className="laporan-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Bulan</th>
                    <th>Jumlah Pembayaran</th>
                    <th>Total Pemasukan</th>
                  </tr>
                </thead>

                <tbody>
                  {rekapIuran.map((item) => (
                    <tr key={item.bulan}>
                      <td>{item.nomorBulan}</td>

                      <td>{item.namaBulan}</td>

                      <td>{item.jumlahPembayaran}</td>

                      <td>{formatRupiah(item.total)}</td>
                    </tr>
                  ))}

                  <tr className="laporan-table-total">
                    <td></td>

                    <td>TOTAL</td>

                    <td>{totalPembayaran}</td>

                    <td>{formatRupiah(totalIuran)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

{/* =================================================
    REKAP PRINT - 2 KOLOM
    ================================================= */}

<div className="laporan-rekap-print">

  {/* JANUARI - JUNI */}
  <div className="laporan-print-kolom">

    <h4>Januari – Juni</h4>

    <table className="laporan-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Bulan</th>
          <th>Jumlah Pembayaran</th>
          <th>Total Pemasukan</th>
        </tr>
      </thead>

      <tbody>
        {rekapIuran.slice(0, 6).map((item) => (
          <tr key={item.bulan}>
            <td>{item.nomorBulan}</td>
            <td>{item.namaBulan}</td>
            <td>{item.jumlahPembayaran}</td>
            <td>{formatRupiah(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>


  {/* JULI - DESEMBER */}
  <div className="laporan-print-kolom">

    <h4>Juli – Desember</h4>

    <table className="laporan-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Bulan</th>
          <th>Jumlah Pembayaran</th>
          <th>Total Pemasukan</th>
        </tr>
      </thead>

      <tbody>
        {rekapIuran.slice(6, 12).map((item) => (
          <tr key={item.bulan}>
            <td>{item.nomorBulan}</td>
            <td>{item.namaBulan}</td>
            <td>{item.jumlahPembayaran}</td>
            <td>{formatRupiah(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>

</div>

          </div>

          {/* =============================================
              REKAP SANTUNAN
              ============================================= */}

          <div className="laporan-section">
            <div className="laporan-section-header">
              <div>
                <h3>Rekap Santunan Dana Duka</h3>

                <p>Santunan yang diberikan selama {tahunLaporan}</p>
              </div>

              <div className="laporan-section-total">
                <span>Total Santunan</span>

                <strong>{formatRupiah(totalSantunan)}</strong>
              </div>
            </div>

            {dataSantunan.length === 0 ? (
              <div className="laporan-empty">
                Tidak ada santunan Dana Duka pada tahun {tahunLaporan}.
              </div>
            ) : (
              <div className="laporan-table-wrapper">
                <table className="laporan-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Nama Almarhum</th>
                      <th>Penerima</th>
                      <th>Hubungan</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataSantunan.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>{item.tanggal_santunan || "-"}</td>

                        <td>{item.nama_almarhum || "-"}</td>

                        <td>{item.nama_penerima || "-"}</td>

                        <td>{item.hubungan_penerima || "-"}</td>

                        <td>{formatRupiah(item.jumlah)}</td>
                      </tr>
                    ))}

                    <tr className="laporan-table-total">
                      <td colSpan="5">TOTAL SANTUNAN</td>

                      <td>{formatRupiah(totalSantunan)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* =============================================
              KETERANGAN
              ============================================= */}

          <div className="laporan-section laporan-keterangan-section">
            <h3>Keterangan</h3>

            <p className="laporan-keterangan">
              Laporan ini merupakan rekapitulasi pemasukan iuran dan pengeluaran
              santunan Dana Duka RT 03 / RW 07 Karet – Setiabudi selama tahun{" "}
              {tahunLaporan}.
            </p>

            <p className="laporan-keterangan">
              Saldo akhir diperoleh dari saldo awal tahun ditambah seluruh iuran
              yang diterima dan dikurangi seluruh santunan yang diberikan pada
              tahun berjalan.
            </p>
          </div>

          {/* =============================================
              TANDA TANGAN
              ============================================= */}

          <div className="laporan-tanda-tangan">
            <div>
              <p>Karet, __________________ {tahunLaporan}</p>

              <p>Ketua RT 03 / RW 07</p>

              <div className="ttd-space"></div>

              <strong>Januardi Pratomo</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LaporanDanaDuka;
