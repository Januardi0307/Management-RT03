import { useEffect, useState } from "react";
import "./WargaPendatang.css";
import { supabase } from "../lib/supabase";

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  return date.toLocaleDateString("id-ID");
}

function WargaPendatang() {
  const [pendatang, setPendatang] = useState([]);
  const [search, setSearch] = useState("");
  const [filterJenisTinggal, setFilterJenisTinggal] = useState("Semua");
  const [filterTempatKost, setFilterTempatKost] = useState("Semua");
  const [wargaTerpilih, setWargaTerpilih] = useState(null);

  // =========================================================
  // AMBIL DATA DARI DATA WARGA
  // =========================================================

  async function loadDataPendatang() {
  try {
    console.log("MEMUAT DATA WARGA PENDATANG DARI SUPABASE...");

    const { data, error } = await supabase
      .from("warga")
      .select("*")
      .eq("status_kependudukan", "Pendatang")
      .order("nama", { ascending: true });

    if (error) {
      console.error(
        "GAGAL MEMUAT DATA WARGA PENDATANG DARI SUPABASE:",
        error
      );

      setPendatang([]);
      return;
    }

    const dataPendatang = data.map((item) => ({
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
        item.status_kependudukan || "Pendatang",
      statusTinggal:
        item.status_tinggal || "Tinggal di RT03",
      jenisTinggal: item.jenis_tinggal || "",
      tempatKostId: item.tempat_kost_id || "",
      namaTempatKost: item.nama_tempat_kost || "",
      alamatKontrak: item.alamat_kontrak || "",
    }));

    setPendatang(dataPendatang);

    console.log(
      `BERHASIL MEMUAT ${dataPendatang.length} DATA WARGA PENDATANG DARI SUPABASE.`
    );
  } catch (error) {
    console.error(
      "ERROR MEMUAT DATA WARGA PENDATANG:",
      error
    );

    setPendatang([]);
  }
}

  useEffect(() => {
    loadDataPendatang();
  }, []);

  // =========================================================
  // REFRESH SAAT KEMBALI KE MENU
  // =========================================================

  useEffect(() => {
    function handleFocus() {
      loadDataPendatang();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // =========================================================
  // PENCARIAN
  // =========================================================

  const pendatangFiltered = pendatang.filter((item) => {
    const keyword = search.toLowerCase().trim();

    // FILTER JENIS TINGGAL
    const sesuaiJenisTinggal =
      filterJenisTinggal === "Semua" ||
      item.jenisTinggal === filterJenisTinggal;

    const sesuaiTempatKost =
      filterTempatKost === "Semua" || item.tempatKostNama === filterTempatKost;

    if (!sesuaiJenisTinggal || !sesuaiTempatKost) {
      return false;
    }

    // PENCARIAN
    if (!keyword) {
      return true;
    }

    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.nik?.toLowerCase().includes(keyword) ||
      item.kk?.toLowerCase().includes(keyword) ||
      item.noHp?.toLowerCase().includes(keyword) ||
      item.tempatKostNama?.toLowerCase().includes(keyword) ||
      item.alamatKontrak?.toLowerCase().includes(keyword)
    );
  });

  const daftarTempatKost = [
    ...new Set(
      pendatang
        .filter((item) => item.jenisTinggal === "Kost")
        .map((item) => item.tempatKostNama)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  // =========================================================
  // TEMPAT TINGGAL
  // =========================================================

  function getTempatTinggal(item) {
    if (item.jenisTinggal === "Kost") {
      return item.tempatKostNama || "-";
    }

    if (item.jenisTinggal === "Kontrak") {
      return item.alamatKontrak || "-";
    }

    return "-";
  }

  // =========================================================
  // JENIS TINGGAL
  // =========================================================

  function getJenisTinggal(item) {
    return item.jenisTinggal || "-";
  }

  // =========================================================
  // KETERANGAN
  // =========================================================

  function getKeterangan(item) {
    if (item.jenisTinggal === "Kost") {
      return "Kost";
    }

    if (item.jenisTinggal === "Kontrak") {
      return "Kontrak";
    }

    return "-";
  }

  // =========================================================
  // TAMPILAN
  // =========================================================

  return (
    <div className="data-warga-page">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h3>Warga Kost / Pendatang</h3>

          <p>Daftar pendatang yang tinggal di wilayah RT 03 / RW 07</p>
        </div>
      </div>

      {/* DATA CARD */}

      <div className="data-card">
        {/* TOOLBAR */}

        <div className="data-toolbar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Nama, NIK, KK, Kost, atau Alamat..."
            className="search-input"
          />

          <select
            value={filterJenisTinggal}
            onChange={(e) => setFilterJenisTinggal(e.target.value)}
            className="filter-jenis-tinggal"
          >
            <option value="Semua">Semua Jenis Tinggal</option>
            <option value="Kost">Kost</option>
            <option value="Kontrak">Kontrak</option>
          </select>

          <select
            value={filterTempatKost}
            onChange={(e) => setFilterTempatKost(e.target.value)}
            className="filter-tempat-kost"
          >
            <option value="Semua">Semua Tempat Kost</option>

            {daftarTempatKost.map((tempat) => (
              <option key={tempat} value={tempat}>
                {tempat}
              </option>
            ))}
          </select>

          <div className="total-data">
            Total Pendatang: <strong>{pendatang.length}</strong>
          </div>
        </div>

        {/* TABEL */}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIK</th>
                <th>Jenis Tinggal</th>
                <th>Tempat Tinggal</th>
                <th>No. HP</th>
                <th>Mulai Tinggal</th>
              </tr>
            </thead>

            <tbody>
              {pendatangFiltered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    Belum ada data warga pendatang.
                  </td>
                </tr>
              ) : (
                pendatangFiltered.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <button
                        type="button"
                        className="nama-warga-button"
                        onClick={() => setWargaTerpilih(item)}
                      >
                        {item.nama || "-"}
                      </button>
                    </td>

                    <td>{item.nik || "-"}</td>

                    <td>{getJenisTinggal(item)}</td>

                    <td>{getTempatTinggal(item)}</td>

                    <td>{item.noHp || "-"}</td>

                    <td>{formatTanggal(item.tanggalMulaiTinggal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL WARGA PENDATANG */}
      {wargaTerpilih && (
        <div className="modal-overlay" onClick={() => setWargaTerpilih(null)}>
          <div
            className="modal-detail-warga"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-detail-header">
              <div>
                <h3>Detail Warga Pendatang</h3>
                <p>Data warga RT 03 / RW 07</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setWargaTerpilih(null)}
              >
                ×
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Nama</span>
                <strong>{wargaTerpilih.nama || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>NIK</span>
                <strong>{wargaTerpilih.nik || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>No. KK</span>
                <strong>{wargaTerpilih.kk || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Jenis Kelamin</span>
                <strong>{wargaTerpilih.jenisKelamin || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Tempat Lahir</span>
                <strong>{wargaTerpilih.tempatLahir || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Tanggal Lahir</span>
                <strong>{formatTanggal(wargaTerpilih.tanggalLahir)}</strong>
              </div>

              <div className="detail-item">
                <span>Agama</span>
                <strong>{wargaTerpilih.agama || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Pekerjaan</span>
                <strong>{wargaTerpilih.pekerjaan || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>No. HP</span>
                <strong>{wargaTerpilih.noHp || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Status Kependudukan</span>
                <strong>{wargaTerpilih.statusKependudukan || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Jenis Tinggal</span>
                <strong>{wargaTerpilih.jenisTinggal || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Tempat Kost</span>
                <strong>{wargaTerpilih.tempatKostNama || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Alamat Kontrak</span>
                <strong>{wargaTerpilih.alamatKontrak || "-"}</strong>
              </div>

              <div className="detail-item">
                <span>Mulai Tinggal</span>
                <strong>
                  {formatTanggal(wargaTerpilih.tanggalMulaiTinggal)}
                </strong>
              </div>
            </div>

            <div className="modal-detail-footer">
              <button
                type="button"
                className="btn-tutup-detail"
                onClick={() => setWargaTerpilih(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WargaPendatang;
