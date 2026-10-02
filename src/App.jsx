import { useEffect, useState } from "react";
import "./App.css";
import DenahRT from "./components/DenahRT";
import DataWarga from "./components/DataWarga";
import WargaPendatang from "./components/WargaPendatang";
import DataStatistik from "./components/DataStatistik";
import SuratPengantar from "./components/SuratPengantar";
import DataTempatKost from "./components/DataTempatKost";
import IuranDanaDuka from "./components/IuranDanaDuka";
import LaporanDanaDuka from "./components/LaporanDanaDuka";
import { supabase } from "./lib/supabase";
import Pengaturan from "./components/Pengaturan";
import KasRT from "./components/KasRT";
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

function Dashboard() {
  const [showBirthdayList, setShowBirthdayList] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [warga, setWarga] = useState([]);

  useEffect(() => {
    async function loadDataWargaDashboard() {
      try {
        console.log("MEMUAT DATA WARGA DASHBOARD DARI SUPABASE...");

        const { data, error } = await supabase
          .from("warga")
          .select("*")
          .order("nama", { ascending: true });

        if (error) {
          console.error(
            "GAGAL MEMUAT DATA WARGA DASHBOARD DARI SUPABASE:",
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
          namaTempatKost: item.nama_tempat_kost || "",
          alamatKontrak: item.alamat_kontrak || "",
        }));

        setWarga(dataWarga);

        console.log(
          `BERHASIL MEMUAT ${dataWarga.length} DATA WARGA DASHBOARD DARI SUPABASE.`
        );
      } catch (error) {
        console.error(
          "ERROR MEMUAT DATA WARGA DASHBOARD:",
          error
        );

        setWarga([]);
      }
    }

    loadDataWargaDashboard();
  }, []);

  // ================================
  // DATA DASAR
  // ================================

  const wargaAktif = warga.filter(
    (item) => (item.status || "Aktif") === "Aktif",
  );

  // Pendatang berasal dari data warga yang sama
  const pendatangAktif = wargaAktif.filter(
    (item) => item.statusKependudukan === "Pendatang",
  );

  // Warga RT03 = bukan pendatang
  const wargaRT03 = wargaAktif.filter(
    (item) => item.statusKependudukan !== "Pendatang",
  );

  // ================================
  // FUNGSI STATISTIK
  // ================================

  function hitungStatistik(data) {
    const lakiLaki = data.filter(
      (item) => item.jenisKelamin === "Laki-laki",
    ).length;

    const perempuan = data.filter(
      (item) => item.jenisKelamin === "Perempuan",
    ).length;

    return {
      total: data.length,
      lakiLaki,
      perempuan,
    };
  }

  // ================================
  // WARGA RT03
  // ================================

  const statistikWarga = hitungStatistik(wargaRT03);

  // ================================
  // JUMLAH KK
  // ================================

  const jumlahKK = new Set(
    wargaRT03.map((item) => item.kk).filter((kk) => kk && kk.trim() !== ""),
  ).size;

  // ================================
  // KELOMPOK USIA
  // ================================

  const dataBalita = wargaRT03.filter((item) => {
    const usia = hitungUsia(item.tanggalLahir);

    return usia !== null && usia >= 0 && usia <= 5;
  });

  const dataAnakAnak = wargaRT03.filter((item) => {
    const usia = hitungUsia(item.tanggalLahir);

    return usia !== null && usia >= 6 && usia <= 10;
  });

  console.log("=== CEK CALON REMAJA ===");

  wargaRT03.forEach((item) => {
    const usia = hitungUsia(item.tanggalLahir);

    if (usia !== null && usia >= 11 && usia <= 21) {
      console.log({
        nama: item.nama,
        tanggalLahir: item.tanggalLahir,
        usia: usia,
        statusPerkawinan: item.statusPerkawinan,
        jenisKelamin: item.jenisKelamin,
      });
    }
  });

  const dataRemaja = wargaRT03.filter((item) => {
    const usia = hitungUsia(item.tanggalLahir);

    const belumMenikah =
      item.statusPerkawinan === "Belum Kawin" ||
      item.statusPerkawinan === "BELUM KAWIN" ||
      item.statusPerkawinan === "belum kawin";

    return usia !== null && usia >= 11 && usia <= 21 && belumMenikah;
  });

  const dataDewasa = wargaRT03.filter((item) => {
    const usia = hitungUsia(item.tanggalLahir);

    if (usia === null) {
      return false;
    }

    const belumMenikah =
      item.statusPerkawinan === "Belum Kawin" ||
      item.statusPerkawinan === "Belum Nikah" ||
      item.statusPerkawinan === "Belum Menikah";

    // Usia 11–21 yang belum menikah = REMAJA
    if (usia >= 11 && usia <= 21) {
      return false;
    }

    // Usia 22–59 = DEWASA
    return usia >= 22 && usia <= 59;
  });

  const dataLansia = wargaRT03.filter((item) => {
    const usia = hitungUsia(item.tanggalLahir);

    return usia !== null && usia >= 60;
  });

  const statistikBalita = hitungStatistik(dataBalita);
  const statistikAnakAnak = hitungStatistik(dataAnakAnak);
  const statistikRemaja = hitungStatistik(dataRemaja);
  const statistikDewasa = hitungStatistik(dataDewasa);
  const statistikLansia = hitungStatistik(dataLansia);
  console.log("=== CEK REMAJA ===");
  console.log("Jumlah data remaja:", dataRemaja.length);
  console.log("Data remaja:", dataRemaja);
  console.log("Statistik remaja:", statistikRemaja);

  console.log("=== CEK DEWASA ===");
  console.log("Jumlah data dewasa:", dataDewasa.length);
  console.log("Data dewasa:", dataDewasa);
  console.log("Statistik dewasa:", statistikDewasa);
  // ================================
  // PENDATANG
  // ================================

  const statistikPendatang = hitungStatistik(pendatangAktif);

  const dataKost = pendatangAktif.filter(
    (item) => item.jenisTinggal === "Kost",
  );

  const dataKontrak = pendatangAktif.filter(
    (item) => item.jenisTinggal === "Kontrak",
  );

  const statistikKost = hitungStatistik(dataKost);
  const statistikKontrak = hitungStatistik(dataKontrak);

  // ================================
  // ULANG TAHUN HARI INI
  // ================================

  const hariIni = new Date();

  const tanggalHariIni = hariIni.getDate();
  const bulanHariIni = hariIni.getMonth();

  const ulangTahunHariIni = wargaRT03.filter((item) => {
    if (!item.tanggalLahir) return false;

    const tanggalLahir = new Date(`${item.tanggalLahir}T00:00:00`);

    if (Number.isNaN(tanggalLahir.getTime())) {
      return false;
    }

    return (
      tanggalLahir.getDate() === tanggalHariIni &&
      tanggalLahir.getMonth() === bulanHariIni
    );
  });

  // ================================
  // CARD DASHBOARD
  // ================================

  const cards = [
    {
      icon: "👥",
      label: "Warga RT03",
      value: statistikWarga,
      data: wargaRT03,
      clickable: false,
    },
    {
      icon: "👶",
      label: "Balita",
      value: statistikBalita,
      data: dataBalita,
      clickable: true,
    },
    {
      icon: "🧒",
      label: "Anak-anak",
      value: statistikAnakAnak,
      data: dataAnakAnak,
      clickable: true,
    },
    {
      icon: "🧑",
      label: "Remaja",
      value: statistikRemaja,
      data: dataRemaja,
      clickable: true,
    },
    {
      icon: "👨",
      label: "Dewasa",
      value: statistikDewasa,
      data: dataDewasa,
      clickable: true,
    },
    {
      icon: "👴",
      label: "Lansia",
      value: statistikLansia,
      data: dataLansia,
      clickable: true,
    },
    {
      icon: "🏡",
      label: "Pendatang",
      value: statistikPendatang,
      data: pendatangAktif,
      clickable: true,
    },
    {
      icon: "🛏️",
      label: "Kost",
      value: statistikKost,
      data: dataKost,
      clickable: true,
    },
    {
      icon: "🏠",
      label: "Kontrak",
      value: statistikKontrak,
      data: dataKontrak,
      clickable: true,
    },
    {
      icon: "🏘️",
      label: "Jumlah KK",
      value: {
        total: jumlahKK,
        lakiLaki: null,
        perempuan: null,
      },
      isKK: true,
      clickable: false,
    },
    {
      icon: "🎂",
      label: "HUT Hari Ini",
      value: {
        total: ulangTahunHariIni.length,
        lakiLaki: null,
        perempuan: null,
      },
      data: ulangTahunHariIni,
      birthday: true,
      clickable: true,
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="welcome">
        <div>
          <h2>Selamat Datang, Admin 👋</h2>

          <p>Sistem Administrasi RT 03 / RW 07 Karet - Setiabudi</p>
        </div>

        <div className="date-box">
          <strong>
            {hariIni.toLocaleDateString("id-ID", {
              weekday: "long",
            })}
          </strong>

          <span>
            {hariIni.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* STATISTIK */}

      <div className="dashboard-grid">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`stat-card ${card.birthday ? "birthday-card" : ""}`}
            onClick={() => {
              if (!card.clickable) return;

              if (!card.data || card.data.length === 0) {
                return;
              }

              if (card.birthday) {
                setShowBirthdayList(true);
                return;
              }

              setSelectedCategory(card);
              setShowCategoryList(true);
            }}
            style={{
              cursor:
                card.clickable && card.data && card.data.length > 0
                  ? "pointer"
                  : "default",
            }}
          >
            <div className="stat-icon">{card.icon}</div>

            <div className="stat-info">
              <span>{card.label}</span>

              <strong>{card.value.total}</strong>

              {!card.isKK && !card.birthday && (
                <small>
                  L {card.value.lakiLaki} | P {card.value.perempuan}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ULANG TAHUN */}

      {showBirthdayList && (
        <div className="birthday-overlay">
          <div className="birthday-modal">
            <div className="birthday-modal-header">
              <div>
                <h3>🎂 Ulang Tahun Hari Ini</h3>

                <p>
                  {hariIni.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <button
                className="birthday-close"
                onClick={() => setShowBirthdayList(false)}
              >
                ✕
              </button>
            </div>

            <div className="birthday-modal-body">
              {ulangTahunHariIni.map((item) => {
                const usia = hitungUsia(item.tanggalLahir);

                return (
                  <div
                    className="birthday-modal-item"
                    key={item.id || item.nik}
                  >
                    <div className="birthday-person-icon">🎉</div>

                    <div>
                      <strong>{item.nama}</strong>

                      <span>Berulang tahun ke-{usia} tahun</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DAFTAR WARGA KATEGORI */}

      {showCategoryList && selectedCategory && (
        <div
          className="birthday-overlay"
          onClick={() => setShowCategoryList(false)}
        >
          <div
            className="birthday-modal category-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="birthday-modal-header">
              <div>
                <h3>
                  {selectedCategory.icon} {selectedCategory.label}
                </h3>

                <p>{selectedCategory.data.length} warga</p>
              </div>

              <button
                className="birthday-close"
                onClick={() => setShowCategoryList(false)}
              >
                ✕
              </button>
            </div>

            <div className="category-modal-body">
              {selectedCategory.data.length === 0 ? (
                <div className="category-empty">Tidak ada data warga.</div>
              ) : (
                <div className="category-table-wrapper">
                  <table className="category-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>NIK</th>
                        <th>Jenis Kelamin</th>
                        <th>Tanggal Lahir</th>
                        <th>Usia</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedCategory.data.map((item, index) => {
                        const usia = hitungUsia(item.tanggalLahir);

                        return (
                          <tr
                            key={item.id || item.nik || `${item.nama}-${index}`}
                          >
                            <td>{index + 1}</td>

                            <td>
                              <strong>{item.nama || "-"}</strong>
                            </td>

                            <td>{item.nik || "-"}</td>

                            <td>{item.jenisKelamin || "-"}</td>

                            <td>
                              {item.tanggalLahir
                                ? new Date(
                                    `${item.tanggalLahir}T00:00:00`,
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </td>

                            <td>{usia !== null ? `${usia} tahun` : "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="category-modal-footer">
              <button
                type="button"
                className="birthday-close-button"
                onClick={() => setShowCategoryList(false)}
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

function EmptyPage({ icon, title, description }) {
  return (
    <div className="empty-page">
      <div className="empty-icon">{icon}</div>

      <h2>{title}</h2>

      <p>{description}</p>
    </div>
  );
}

function App() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    {
      label: "Dashboard",
      icon: "📊",
    },
    {
      label: "Data Warga",
      icon: "👥",
    },
    {
      label: "Warga Kost / Pendatang",
      icon: "🏡",
    },
    {
      label: "Data Tempat Kost",
      icon: "🏠",
    },
    {
  label: "Denah RT",
  icon: "🗺️",
},
    {
      label: "Surat",
      icon: "📄",
    },
    {
      label: "Data Statistik",
      icon: "📈",
    },

{
  label: "Iuran Dana Duka",
  icon: "💰",
},
{
  label: "Laporan Dana Duka",
  icon: "📊",
},
{
  label: "KAS RT",
  icon: "💰",
  key: "kas-rt",
},

  ];

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-circle">RT</div>

          <div>
            <h3>ADMIN RT</h3>

            <span>RT 03 / RW 07</span>
          </div>
        </div>

        <div className="wilayah">Karet - Setiabudi</div>

        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`menu-item ${
                activeMenu === item.label ? "active" : ""
              }`}
              onClick={() => setActiveMenu(item.label)}
            >
              <span className="menu-icon">{item.icon}</span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`menu-item ${
              activeMenu === "Pengaturan" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Pengaturan")}
          >
            <span className="menu-icon">⚙️</span>

            <span>Pengaturan</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activeMenu}</h1>
          </div>

          <div className="admin-info">
            <div className="admin-avatar">JP</div>

            <div>
              <strong>Admin RT</strong>

              <span>Januardi Pratomo</span>
            </div>
          </div>
        </header>

        <div className="content">
          {activeMenu === "Dashboard" && <Dashboard />}

          {activeMenu === "Data Warga" && <DataWarga />}

          {activeMenu === "Warga Kost / Pendatang" && <WargaPendatang />}

          {activeMenu === "Data Tempat Kost" && <DataTempatKost />}

          {activeMenu === "Denah RT" && <DenahRT />}

          {activeMenu === "Surat" && <SuratPengantar />}

         {activeMenu === "Data Statistik" && <DataStatistik />}

{activeMenu === "Iuran Dana Duka" && <IuranDanaDuka />}

{activeMenu === "Laporan Dana Duka" && <LaporanDanaDuka />}

{activeMenu === "KAS RT" && <KasRT />}

{activeMenu === "Pengaturan" && <Pengaturan />}
        </div>
      </main>
    </div>
  );
}

export default App;
