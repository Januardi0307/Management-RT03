import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./DataStatistik.css";

function hitungUsia(tanggalLahir) {
  if (!tanggalLahir) return null;

  const lahir = new Date(`${tanggalLahir}T00:00:00`);

  if (Number.isNaN(lahir.getTime())) return null;

  const hariIni = new Date();

  let usia = hariIni.getFullYear() - lahir.getFullYear();

  const bulan = hariIni.getMonth() - lahir.getMonth();

  if (bulan < 0 || (bulan === 0 && hariIni.getDate() < lahir.getDate())) {
    usia--;
  }

  return usia;
}

function DataStatistik() {
  const [jenisData, setJenisData] = useState("Data Warga");
  const [tampilPreview, setTampilPreview] = useState(false);
  // ================================
  // PILIHAN KOLOM
  // ================================

  const [kolomDipilih, setKolomDipilih] = useState([
    "nama",
    "nik",
    "kk",
    "jenisKelamin",
    "tanggalLahir",
    "statusKeluarga",
  ]);

  // ================================
  // FILTER JENIS KELAMIN
  // ================================

  const [filterJenisKelamin, setFilterJenisKelamin] = useState([]);

  // ================================
  // FILTER STATUS KELUARGA
  // ================================

  const [filterStatusKeluarga, setFilterStatusKeluarga] = useState([]);

  const [filterStatusPerkawinan, setFilterStatusPerkawinan] = useState([]);

  // ================================
  // FILTER KELOMPOK USIA
  // ================================

  const [filterUsia, setFilterUsia] = useState([]);
  // ================================
  // FILTER JENIS TINGGAL
  // ================================

  const [filterJenisTinggal, setFilterJenisTinggal] = useState([]);

  const [filterTempatKost, setFilterTempatKost] = useState([]);

  // ================================
  // ================================
// DATA
// ================================

const [warga, setWarga] = useState([]);

useEffect(() => {
  async function loadDataWargaStatistik() {
    try {
      console.log("MEMUAT DATA WARGA STATISTIK DARI SUPABASE...");

      const { data, error } = await supabase
        .from("warga")
        .select("*")
        .order("nama", { ascending: true });

      if (error) {
        console.error(
          "GAGAL MEMUAT DATA WARGA STATISTIK DARI SUPABASE:",
          error
        );

        setWarga([]);
        return;
      }

      const dataWarga = data.map((item) => ({
        id: item.id,
        nama: item.nama || "",
        nik: item.nik || "",
        kk: item.kk || "",
        jenisKelamin: item.jenis_kelamin || "",
        tempatLahir: item.tempat_lahir || "",
        tanggalLahir: item.tanggal_lahir || "",
        agama: item.agama || "",
        alamat: item.alamat || "",
        pekerjaan: item.pekerjaan || "",
        statusPerkawinan: item.status_perkawinan || "",
        statusKeluarga: item.status_keluarga || "",
        kewarganegaraan: item.kewarganegaraan || "",
        rtRw: item.rt_rw || "03/07",
        kelurahan: item.kelurahan || "Karet",
        kecamatan: item.kecamatan || "Setiabudi",
        status: item.status || "Aktif",
        statusKependudukan:
          item.status_kependudukan || "Warga RT03",
        statusTinggal:
          item.status_tinggal || "Tinggal di RT03",
        jenisTinggal: item.jenis_tinggal || "",
        tempatKostId: item.tempat_kost_id || "",
        tempatKostNama: item.nama_tempat_kost || "",
        alamatKontrak: item.alamat_kontrak || "",
      }));

      setWarga(dataWarga);

      console.log(
        `BERHASIL MEMUAT ${dataWarga.length} DATA WARGA STATISTIK DARI SUPABASE.`
      );

      console.log("=== NILAI STATUS PERKAWINAN ===", [
        ...new Set(
          dataWarga
            .filter(
              (item) => (item.status || "Aktif") === "Aktif"
            )
            .map((item) => item.statusPerkawinan)
            .filter(Boolean)
        ),
      ]);

      console.log("=== NILAI STATUS KELUARGA ===", [
        ...new Set(
          dataWarga
            .filter(
              (item) => (item.status || "Aktif") === "Aktif"
            )
            .map((item) => item.statusKeluarga)
            .filter(Boolean)
        ),
      ]);
    } catch (error) {
      console.error(
        "ERROR MEMUAT DATA WARGA STATISTIK:",
        error
      );

      setWarga([]);
    }
  }

  loadDataWargaStatistik();
}, []);

  const wargaAktif = warga.filter(
    (item) => (item.status || "Aktif") === "Aktif",
  );

  const dataWarga = wargaAktif.filter(
    (item) => item.statusKependudukan !== "Pendatang",
  );

  const dataPendatang = wargaAktif.filter(
    (item) => item.statusKependudukan === "Pendatang",
  );

  const dataSumber = jenisData === "Data Warga" ? dataWarga : dataPendatang;

  // ================================
  // OPSI KOLOM
  // ================================

  const daftarKolom = [
    {
      key: "nik",
      label: "NIK",
    },
    {
      key: "kk",
      label: "Kartu Keluarga",
    },
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "tempatLahir",
      label: "Tempat Lahir",
    },
    {
      key: "tanggalLahir",
      label: "Tanggal Lahir",
    },
    {
      key: "agama",
      label: "Agama",
    },
    {
      key: "jenisKelamin",
      label: "Jenis Kelamin",
    },
    {
      key: "pekerjaan",
      label: "Pekerjaan",
    },
    {
      key: "statusPerkawinan",
      label: "Status Perkawinan",
    },
    {
      key: "statusKeluarga",
      label: "Status dalam Keluarga",
    },
    {
      key: "alamat",
      label: "Alamat",
    },
    {
      key: "nomorPonsel",
      label: "No. HP",
    },
  ];

  // ================================
  // OPSI STATUS KELUARGA
  // ================================

  const daftarStatusKeluarga = [
    "Kepala Keluarga",
    "Istri",
    "Anak",
    "Orang Tua",
    "Saudara",
    "Lainnya",
  ];

  // ================================
  // OPSI STATUS PERKAWINAN
  // ================================
  const daftarStatusPerkawinan = [
    "Belum Kawin",
    "Kawin Tercatat",
    "Kawin Tidak Tercatat",
    "Cerai Hidup",
    "Cerai Mati",
  ];

  // ================================
  // OPSI KOST KONTRAK
  // ================================
  const daftarJenisTinggal = ["Kost", "Kontrak"];

  const daftarTempatKost = [
    ...new Set(
      dataPendatang
        .filter((item) => item.jenisTinggal === "Kost" && item.tempatKostNama)
        .map((item) => item.tempatKostNama),
    ),
  ];

  // ================================
  // OPSI KELOMPOK USIA
  // ================================

  const daftarKelompokUsia = [
    {
      key: "Balita",
      label: "Balita (0–5 tahun)",
    },
    {
      key: "Anak-anak",
      label: "Anak-anak (6–10 tahun)",
    },
    {
      key: "Remaja",
      label: "Remaja (11–21 tahun)",
    },
    {
      key: "Dewasa",
      label: "Dewasa (22–59 tahun)",
    },
    {
      key: "Lansia",
      label: "Lansia (60 tahun ke atas)",
    },
  ];

  // ================================
  // FUNGSI CEK KELOMPOK USIA
  // ================================

  function cocokKelompokUsia(item) {
    if (filterUsia.length === 0) {
      return true;
    }

    const usia = hitungUsia(item.tanggalLahir);

    if (usia === null) {
      return false;
    }

    return filterUsia.some((kelompok) => {
      if (kelompok === "Balita") {
        return usia >= 0 && usia <= 5;
      }

      if (kelompok === "Anak-anak") {
        return usia >= 6 && usia <= 10;
      }

      if (kelompok === "Remaja") {
        return usia >= 11 && usia <= 21;
      }

      if (kelompok === "Dewasa") {
        return usia >= 22 && usia <= 59;
      }

      if (kelompok === "Lansia") {
        return usia >= 60;
      }

      return false;
    });
  }

  // ================================
  // FILTER DATA
  // ================================

  const dataHasil = dataSumber.filter((item) => {
    // Jenis Kelamin
    if (
      filterJenisKelamin.length > 0 &&
      !filterJenisKelamin.includes(item.jenisKelamin)
    ) {
      return false;
    }

    // Status Keluarga
    if (
      filterStatusKeluarga.length > 0 &&
      !filterStatusKeluarga.includes(item.statusKeluarga)
    ) {
      return false;
    }

    if (
      filterStatusPerkawinan.length > 0 &&
      !filterStatusPerkawinan.includes(item.statusPerkawinan)
    ) {
      return false;
    }

    if (
      filterJenisTinggal.length > 0 &&
      !filterJenisTinggal.includes(item.jenisTinggal)
    ) {
      return false;
    }

    if (
      filterTempatKost.length > 0 &&
      !filterTempatKost.includes(item.tempatKostNama)
    ) {
      return false;
    }

    // Kelompok Usia
    if (!cocokKelompokUsia(item)) {
      return false;
    }

    return true;
  });

  // ================================
  // CHECKBOX KOLOM
  // ================================

  function toggleKolom(key) {
    setKolomDipilih((sebelumnya) => {
      if (sebelumnya.includes(key)) {
        return sebelumnya.filter((item) => item !== key);
      }

      return [...sebelumnya, key];
    });
  }

  function pilihSemuaKolom() {
    setKolomDipilih(daftarKolom.map((kolom) => kolom.key));
  }

  function hapusSemuaKolom() {
    setKolomDipilih([]);
  }

  // ================================
  // CHECKBOX FILTER
  // ================================

  function toggleFilter(value, state, setState) {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  }

  // ================================
  // RESET
  // ================================

  function resetFilter() {
    setFilterJenisKelamin([]);
    setFilterStatusKeluarga([]);
    setFilterStatusPerkawinan([]);
    setFilterUsia([]);
    setFilterJenisTinggal([]);
    setFilterTempatKost([]);
  }

  return (
    <div className="data-statistik-page">
      <div className="data-statistik-header">
        <div>
          <h2>Data Statistik</h2>

          <p>Pilih data dan filter sesuai kebutuhan laporan.</p>
        </div>
      </div>

      {/* =================================
          JENIS DATA
      ================================= */}

      <div className="statistik-section">
        <h3>1. Jenis Data</h3>

        <div className="statistik-pilihan">
          <button
            type="button"
            className={jenisData === "Data Warga" ? "aktif" : ""}
            onClick={() => setJenisData("Data Warga")}
          >
            👥 Data Warga
          </button>

          <button
            type="button"
            className={jenisData === "Data Pendatang" ? "aktif" : ""}
            onClick={() => setJenisData("Data Pendatang")}
          >
            🏡 Data Pendatang
          </button>
        </div>
      </div>

      {/* =================================
          PILIH KOLOM
      ================================= */}

      <div className="statistik-section">
        <h3>2. Pilih Kolom yang Ditampilkan</h3>

        <div className="statistik-kolom-action">
          <button type="button" onClick={pilihSemuaKolom}>
            ☑ Pilih Semua
          </button>

          <button type="button" onClick={hapusSemuaKolom}>
            ☐ Hapus Semua
          </button>
        </div>

        <div className="statistik-checkbox-grid">
          {daftarKolom.map((kolom) => (
            <label key={kolom.key} className="statistik-checkbox">
              <input
                type="checkbox"
                checked={kolomDipilih.includes(kolom.key)}
                onChange={() => toggleKolom(kolom.key)}
              />

              <span>{kolom.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* =================================
          JENIS KELAMIN
      ================================= */}

      <div className="statistik-section">
        <h3>3. Jenis Kelamin</h3>

        <div className="statistik-checkbox-grid">
          <label className="statistik-checkbox">
            <input
              type="checkbox"
              checked={filterJenisKelamin.includes("Laki-laki")}
              onChange={() =>
                toggleFilter(
                  "Laki-laki",
                  filterJenisKelamin,
                  setFilterJenisKelamin,
                )
              }
            />

            <span>Laki-laki</span>
          </label>

          <label className="statistik-checkbox">
            <input
              type="checkbox"
              checked={filterJenisKelamin.includes("Perempuan")}
              onChange={() =>
                toggleFilter(
                  "Perempuan",
                  filterJenisKelamin,
                  setFilterJenisKelamin,
                )
              }
            />

            <span>Perempuan</span>
          </label>
        </div>
      </div>

      {/* =================================
          STATUS KELUARGA
      ================================= */}

      <div className="statistik-section">
        <h3>4. Status dalam Keluarga</h3>

        <div className="statistik-checkbox-grid">
          {daftarStatusKeluarga.map((status) => (
            <label key={status} className="statistik-checkbox">
              <input
                type="checkbox"
                checked={filterStatusKeluarga.includes(status)}
                onChange={() =>
                  toggleFilter(
                    status,
                    filterStatusKeluarga,
                    setFilterStatusKeluarga,
                  )
                }
              />

              <span>{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="statistik-section">
        <h3>5. Status Perkawinan</h3>

        <div className="statistik-checkbox-grid">
          {daftarStatusPerkawinan.map((status) => (
            <label key={status} className="statistik-checkbox">
              <input
                type="checkbox"
                checked={filterStatusPerkawinan.includes(status)}
                onChange={() =>
                  toggleFilter(
                    status,
                    filterStatusPerkawinan,
                    setFilterStatusPerkawinan,
                  )
                }
              />

              <span>{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* =================================
          KELOMPOK USIA
      ================================= */}

      <div className="statistik-section">
        <h3>5. Kelompok Usia</h3>

        <div className="statistik-checkbox-grid">
          {daftarKelompokUsia.map((kelompok) => (
            <label key={kelompok.key} className="statistik-checkbox">
              <input
                type="checkbox"
                checked={filterUsia.includes(kelompok.key)}
                onChange={() =>
                  toggleFilter(kelompok.key, filterUsia, setFilterUsia)
                }
              />

              <span>{kelompok.label}</span>
            </label>
          ))}
        </div>
      </div>

      {jenisData === "Data Pendatang" && (
        <div className="statistik-section">
          <h3>Jenis Tinggal</h3>

          <div className="statistik-checkbox-grid">
            {daftarJenisTinggal.map((jenis) => (
              <label key={jenis} className="statistik-checkbox">
                <input
                  type="checkbox"
                  checked={filterJenisTinggal.includes(jenis)}
                  onChange={() =>
                    toggleFilter(
                      jenis,
                      filterJenisTinggal,
                      setFilterJenisTinggal,
                    )
                  }
                />

                <span>{jenis}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {jenisData === "Data Pendatang" && daftarTempatKost.length > 0 && (
        <div className="statistik-section">
          <h3>Tempat Kost</h3>

          <div className="statistik-checkbox-grid">
            {daftarTempatKost.map((tempat) => (
              <label key={tempat} className="statistik-checkbox">
                <input
                  type="checkbox"
                  checked={filterTempatKost.includes(tempat)}
                  onChange={() =>
                    toggleFilter(tempat, filterTempatKost, setFilterTempatKost)
                  }
                />

                <span>{tempat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* =================================
          TOMBOL
      ================================= */}

      <div className="statistik-action">
        <button
          type="button"
          className="btn-preview-statistik"
          onClick={() => setTampilPreview(true)}
        >
          🖨️ Preview Laporan
        </button>
        <button
          type="button"
          className="btn-reset-statistik"
          onClick={resetFilter}
        >
          ↺ Reset Filter
        </button>
      </div>

      {/* =================================
          HASIL
      ================================= */}

      <div className="statistik-info">
        <strong>Hasil: {jenisData}</strong>

        <span>
          Jumlah data: <b>{dataHasil.length}</b>
        </span>
      </div>

      <div className="statistik-section">
        <h3>6. Hasil Data</h3>

        {dataHasil.length === 0 ? (
          <div className="statistik-coming-soon">
            <div className="statistik-coming-icon">📭</div>

            <h3>Tidak ada data</h3>

            <p>Tidak ditemukan data yang sesuai dengan filter yang dipilih.</p>
          </div>
        ) : kolomDipilih.length === 0 ? (
          <div className="statistik-coming-soon">
            <div className="statistik-coming-icon">📋</div>

            <h3>Belum ada kolom yang dipilih</h3>

            <p>Silakan pilih minimal satu kolom yang ingin ditampilkan.</p>
          </div>
        ) : (
          <div className="statistik-table-wrapper">
            <table className="statistik-table">
              <thead>
                <tr>
                  <th>No</th>

                  {kolomDipilih.map((key) => {
                    const kolom = daftarKolom.find((item) => item.key === key);

                    return <th key={key}>{kolom?.label}</th>;
                  })}
                </tr>
              </thead>

              <tbody>
                {dataHasil.map((item, index) => (
                  <tr key={item.id || item.nik || `${item.nama}-${index}`}>
                    <td>{index + 1}</td>

                    {kolomDipilih.map((key) => {
                      let nilai = item[key];

                      if (key === "tanggalLahir") {
                        if (nilai) {
                          const tanggal = new Date(`${nilai}T00:00:00`);

                          nilai = Number.isNaN(tanggal.getTime())
                            ? nilai
                            : tanggal.toLocaleDateString("id-ID");
                        }
                      }

                      return <td key={key}>{nilai || "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tampilPreview && (
        <div className="statistik-preview-overlay">
          <div className="statistik-preview-modal">
            <div className="statistik-preview-header">
              <h2>Preview Laporan</h2>

              <div className="statistik-preview-header-action">
                <button
                  type="button"
                  className="btn-cetak-statistik"
                  onClick={() => {
                    const judulLama = document.title;

                    document.title = "Laporan-Statistik";

                    window.print();

                    setTimeout(() => {
                      document.title = judulLama;
                    }, 1000);
                  }}
                >
                  🖨️ Cetak / Simpan PDF
                </button>

                <button
                  type="button"
                  className="btn-tutup-statistik"
                  onClick={() => setTampilPreview(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="statistik-preview-content">
              <div className="statistik-a4-paper">
                {/* =========================================
        KOP SURAT
    ========================================= */}

                <div className="statistik-kop-surat">
                  <div className="statistik-kop-baris statistik-kop-baris-1">
                    RUKUN TETANGGA 003/07
                  </div>

                  <div className="statistik-kop-baris statistik-kop-baris-2">
                    KELURAHAN KARET &nbsp;&nbsp;&nbsp; KECAMATAN SETIABUDI
                  </div>

                  <div className="statistik-kop-baris statistik-kop-baris-3">
                    KOTA ADMINISTRASI JAKARTA SELATAN
                  </div>

                  <div className="statistik-kop-baris statistik-kop-baris-4">
                    <span>Sekretariat : Jalan Setiabudi 1 No. 21</span>

                    <span className="statistik-kop-kontak">
                      📱 082113197811
                    </span>

                    <span className="statistik-kop-kontak">
                      ✉️ rt.003.07.stb@gmail.com
                    </span>
                  </div>

                  <div className="statistik-kop-baris statistik-kop-baris-5">
                    JAKARTA &nbsp;&nbsp;-&nbsp;&nbsp; Kode Pos : 12920
                  </div>
                </div>

                <div className="statistik-preview-garis"></div>

                {/* =========================================
        JUDUL LAPORAN
    ========================================= */}

                <div className="statistik-judul-laporan">
                  <h2>LAPORAN DATA STATISTIK</h2>

                  <div className="statistik-subjudul-laporan">
                    {jenisData.toUpperCase()}
                  </div>
                </div>

                {/* =========================================
        INFORMASI LAPORAN
    ========================================= */}

                <div className="statistik-info-laporan">
                  <div>
                    <strong>Sumber Data</strong>
                    <span>:</span>
                    <span>{jenisData}</span>
                  </div>

                  <div>
                    <strong>Jumlah Data</strong>
                    <span>:</span>
                    <span>{dataHasil.length} orang</span>
                  </div>
                </div>

                {/* =========================================
        TABEL DATA
    ========================================= */}

                {kolomDipilih.length === 0 ? (
                  <p className="statistik-tidak-ada-kolom">
                    Belum ada kolom yang dipilih.
                  </p>
                ) : (
                  <div className="statistik-laporan-table-wrapper">
                    <table className="statistik-laporan-table">
                      <thead>
                        <tr>
                          <th>No</th>

                          {kolomDipilih.map((key) => {
                            const kolom = daftarKolom.find(
                              (item) => item.key === key,
                            );

                            return <th key={key}>{kolom?.label}</th>;
                          })}
                        </tr>
                      </thead>

                      <tbody>
                        {dataHasil.map((item, index) => (
                          <tr
                            key={item.id || item.nik || `${item.nama}-${index}`}
                          >
                            <td>{index + 1}</td>

                            {kolomDipilih.map((key) => {
                              let nilai = item[key];

                              if (key === "tanggalLahir" && nilai) {
                                const tanggal = new Date(`${nilai}T00:00:00`);

                                nilai = Number.isNaN(tanggal.getTime())
                                  ? nilai
                                  : tanggal.toLocaleDateString("id-ID");
                              }

                              return <td key={key}>{nilai || "-"}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* =========================================
        TANGGAL LAPORAN
    ========================================= */}

                <div className="statistik-tanda-tangan">
                  <div className="statistik-ttd-rt">
                    <div className="statistik-tanggal-laporan">
                      Jakarta,{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>

                    <div className="statistik-ttd-jabatan">
                      KETUA RT 003/07
                      <br />
                      KELURAHAN KARET
                    </div>

                    <div className="statistik-ttd-space"></div>

                    <strong>(JANUARDI PRATOMO)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataStatistik;
