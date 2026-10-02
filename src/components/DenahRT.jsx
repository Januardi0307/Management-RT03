import React, { useState } from "react";

const dataAwal = [
  {
    id: "bidang-a",
    nama: "Bidang A",
    tipe: "Rumah Tinggal",
    x: 50,
    y: 50,
    width: 240,
    height: 130,

    unit: [
      {
        id: "unit-a-1",
        nama: "Rumah Tinggal",
        fungsi: "Tempat Tinggal",
      },
      {
        id: "unit-a-2",
        nama: "Kost",
        fungsi: "Kost",
      },
    ],

    kk: [
      {
        id: "warga-001",
        nama: "Abdul Gani",
      },
      {
        id: "warga-002",
        nama: "I Made Wibawa Kusuma",
      },
      {
        id: "warga-003",
        nama: "Astari Desquamila",
      },
      {
        id: "warga-004",
        nama: "I Putu Suardika",
      },
      {
        id: "warga-005",
        nama: "I Ketut Mertha Yasa",
      },
      {
        id: "warga-006",
        nama: "Ni Wayan Sri Utami",
      },
    ],
  },

  {
    id: "bidang-b",
    nama: "Bidang B",
    tipe: "Rumah Tinggal",
    x: 350,
    y: 50,
    width: 220,
    height: 130,

    unit: [
      {
        id: "unit-b-1",
        nama: "Rumah Tinggal",
        fungsi: "Tempat Tinggal",
      },
      {
        id: "unit-b-2",
        nama: "Kost",
        fungsi: "Kost",
      },
    ],

    kk: [
      {
        id: "warga-007",
        nama: "Kepala Keluarga A",
      },
      {
        id: "warga-008",
        nama: "Kepala Keluarga B",
      },
    ],
  },

  {
    id: "bidang-c",
    nama: "Bidang C",
    tipe: "Bangunan Campuran",
    x: 50,
    y: 230,
    width: 240,
    height: 130,

    unit: [
      {
        id: "unit-c-1",
        nama: "Kost",
        fungsi: "Kost",
      },
      {
        id: "unit-c-2",
        nama: "Barber Shop",
        fungsi: "Usaha",
      },
      {
        id: "unit-c-3",
        nama: "Laundry",
        fungsi: "Usaha",
      },
    ],

    kk: [],
  },

  {
    id: "bidang-d",
    nama: "Bidang D",
    tipe: "Usaha",
    x: 350,
    y: 230,
    width: 220,
    height: 130,

    unit: [
      {
        id: "unit-d-1",
        nama: "Bengkel",
        fungsi: "Usaha",
      },
    ],

    kk: [],
  },

  {
    id: "bidang-e",
    nama: "Bidang E",
    tipe: "Kontrakan",
    x: 50,
    y: 400,
    width: 240,
    height: 130,

    unit: [
      {
        id: "unit-e-1",
        nama: "Rumah Kontrakan",
        fungsi: "Kontrakan",
      },
    ],

    kk: [],
  },
];

const daftarKK = [
  { id: "warga-001", nama: "Abdul Gani" },
  { id: "warga-002", nama: "I Made Wibawa Kusuma" },
  { id: "warga-003", nama: "Astari Desquamila" },
  { id: "warga-004", nama: "I Putu Suardika" },
  { id: "warga-005", nama: "I Ketut Mertha Yasa" },
  { id: "warga-006", nama: "Ni Wayan Sri Utami" },
  { id: "warga-007", nama: "Kepala Keluarga A" },
  { id: "warga-008", nama: "Kepala Keluarga B" },
  { id: "warga-009", nama: "Budi Santoso" },
  { id: "warga-010", nama: "Siti Aminah" },
  { id: "warga-011", nama: "Made Wijaya" },
  { id: "warga-012", nama: "Agus Setiawan" },
];

function DenahRT() {
  const [bidang, setBidang] = useState(dataAwal);
  const [bidangDipilih, setBidangDipilih] = useState(null);
  const [modalPilihKK, setModalPilihKK] = useState(false);
  const [modalPindahKK, setModalPindahKK] = useState(false);
  const [kkYangDipindahkan, setKkYangDipindahkan] = useState(null);

  const pilihBidang = (item) => {
    setBidangDipilih(item);
  };

  const tutupDetail = () => {
    setBidangDipilih(null);
  };

  // =========================================================
  // TAMBAH KK
  // =========================================================

  const tambahKK = () => {
    if (!bidangDipilih) return;

    setModalPilihKK(true);
  };

  const pilihKK = (warga) => {
    if (!bidangDipilih) return;

    // Cek apakah KK sudah ada di bidang ini
    const sudahAdaDiBidang = bidangDipilih.kk.some((kk) => kk.id === warga.id);

    if (sudahAdaDiBidang) {
      window.alert("Kepala Keluarga tersebut sudah ada di bidang ini.");
      return;
    }

    // Cek apakah KK sudah ditempatkan di bidang lain
    const sudahAdaDiBidangLain = bidang.some(
      (item) =>
        item.id !== bidangDipilih.id &&
        item.kk.some((kk) => kk.id === warga.id),
    );

    if (sudahAdaDiBidangLain) {
      window.alert(
        "Kepala Keluarga tersebut sudah terdaftar pada bidang lain.",
      );
      return;
    }

    const kkBaru = {
      id: warga.id,
      nama: warga.nama,
    };

    const dataBaru = bidang.map((item) => {
      if (item.id !== bidangDipilih.id) {
        return item;
      }

      return {
        ...item,
        kk: [...item.kk, kkBaru],
      };
    });

    setBidang(dataBaru);

    setBidangDipilih({
      ...bidangDipilih,
      kk: [...bidangDipilih.kk, kkBaru],
    });

    setModalPilihKK(false);
  };

  // =========================================================
  // LEPAS KK DARI BIDANG
  // =========================================================

  const hapusKK = (kkId) => {
    if (!bidangDipilih) return;

    const dataBaru = bidang.map((item) => {
      if (item.id !== bidangDipilih.id) {
        return item;
      }

      return {
        ...item,

        // Hanya melepas hubungan dengan bidang.
        // Data warga/KK tidak dihapus.
        kk: item.kk.filter((kk) => kk.id !== kkId),
      };
    });

    setBidang(dataBaru);

    setBidangDipilih({
      ...bidangDipilih,
      kk: bidangDipilih.kk.filter((kk) => kk.id !== kkId),
    });
  };



  // =========================================================
  // PINDAHKAN KK KE BIDANG LAIN
  // =========================================================

  const bukaPindahKK = (kk) => {
    if (!bidangDipilih) return;

    setKkYangDipindahkan(kk);
    setModalPindahKK(true);
  };

  const pindahkanKK = (bidangTujuanId) => {
    if (!bidangDipilih || !kkYangDipindahkan) return;

    if (bidangTujuanId === bidangDipilih.id) {
      window.alert("Bidang tujuan sama dengan bidang saat ini.");
      return;
    }

    const bidangTujuan = bidang.find((item) => item.id === bidangTujuanId);

    if (!bidangTujuan) return;

    const sudahAdaDiTujuan = bidangTujuan.kk.some(
      (kk) => kk.id === kkYangDipindahkan.id,
    );

    if (sudahAdaDiTujuan) {
      window.alert("Kepala Keluarga tersebut sudah ada di bidang tujuan.");
      return;
    }

    const dataBaru = bidang.map((item) => {
      // Hapus hubungan dari bidang asal
      if (item.id === bidangDipilih.id) {
        return {
          ...item,
          kk: item.kk.filter((kk) => kk.id !== kkYangDipindahkan.id),
        };
      }

      // Tambahkan hubungan ke bidang tujuan
      if (item.id === bidangTujuanId) {
        return {
          ...item,
          kk: [...item.kk, kkYangDipindahkan],
        };
      }

      return item;
    });

    setBidang(dataBaru);

    // Detail modal tetap terbuka,
    // tetapi daftar KK mengikuti bidang asal yang sudah diperbarui.
    setBidangDipilih({
      ...bidangDipilih,
      kk: bidangDipilih.kk.filter((kk) => kk.id !== kkYangDipindahkan.id),
    });

    setKkYangDipindahkan(null);
    setModalPindahKK(false);
  };

  // =========================================================
  // TAMBAH UNIT
  // =========================================================

  const tambahUnit = () => {
    if (!bidangDipilih) return;

    const namaUnit = window.prompt("Masukkan nama unit / fungsi:");

    if (!namaUnit || !namaUnit.trim()) return;

    const namaBersih = namaUnit.trim();

    const unitBaru = {
      id: `${bidangDipilih.id}-${Date.now()}`,
      nama: namaBersih,
      fungsi: "Lainnya",
    };

    const dataBaru = bidang.map((item) => {
      if (item.id !== bidangDipilih.id) {
        return item;
      }

      return {
        ...item,
        unit: [...item.unit, unitBaru],
      };
    });

    setBidang(dataBaru);

    setBidangDipilih({
      ...bidangDipilih,
      unit: [...bidangDipilih.unit, unitBaru],
    });
  };

  // =========================================================
  // HAPUS UNIT
  // =========================================================

  const hapusUnit = (unitId) => {
    if (!bidangDipilih) return;

    const dataBaru = bidang.map((item) => {
      if (item.id !== bidangDipilih.id) {
        return item;
      }

      return {
        ...item,

        unit: item.unit.filter((unit) => unit.id !== unitId),
      };
    });

    setBidang(dataBaru);

    setBidangDipilih({
      ...bidangDipilih,
      unit: bidangDipilih.unit.filter((unit) => unit.id !== unitId),
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Denah RT 03 / RW 07</h2>

          <p style={styles.subtitle}>Prototype Denah Bidang dan Bangunan</p>
        </div>
      </div>

      {/* LEGEND */}
      <div style={styles.legend}>
        <div>
          <span
            style={{
              ...styles.legendBox,
              background: "#e8edf2",
            }}
          />
          Rumah Tinggal
        </div>

        <div>
          <span
            style={{
              ...styles.legendBox,
              background: "#f6e5b8",
            }}
          />
          Bangunan Campuran
        </div>

        <div>
          <span
            style={{
              ...styles.legendBox,
              background: "#ead8d8",
            }}
          />
          Usaha
        </div>

        <div>
          <span
            style={{
              ...styles.legendBox,
              background: "#90caf9",
            }}
          />
          Kontrakan
        </div>
      </div>

      {/* MAP */}
      <div style={styles.mapWrapper}>
        <div style={styles.map}>
          {/* JALAN UTAMA */}
          <div style={styles.jalanUtama}>
            <span>JALAN</span>
          </div>

          {/* GANG */}
          <div style={styles.gang}>
            <span>GANG</span>
          </div>

          {/* BIDANG */}
          {bidang.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pilihBidang(item)}
              style={{
                ...styles.bidang,

                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,

                background:
                  item.tipe === "Kontrakan"
                    ? "#90caf9"
                    : item.tipe === "Usaha"
                      ? "#ead8d8"
                      : item.tipe === "Bangunan Campuran"
                        ? "#f6e5b8"
                        : "#e8edf2",
              }}
            >
              <div style={styles.bidangNama}>{item.nama}</div>

              <div style={styles.bidangTipe}>{item.tipe}</div>

              <div style={styles.bidangKK}>{item.kk.length} KK</div>

              <div style={styles.unitContainer}>
                {item.unit.map((unit) => (
                  <span key={unit.id} style={styles.unitBadge}>
                    {unit.nama}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL DETAIL BIDANG */}
      {bidangDipilih && (
        <div style={styles.overlay} onClick={tutupDetail}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{bidangDipilih.nama}</h2>

                <div style={styles.modalSubTitle}>{bidangDipilih.tipe}</div>
              </div>

              <button
                type="button"
                onClick={tutupDetail}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            {/* UNIT */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Unit / Fungsi</h3>

                <button
                  type="button"
                  style={styles.addButton}
                  onClick={tambahUnit}
                >
                  + Tambah Unit
                </button>
              </div>

              {bidangDipilih.unit.length === 0 ? (
                <div style={styles.empty}>Belum ada unit.</div>
              ) : (
                <div style={styles.list}>
                  {bidangDipilih.unit.map((unit) => (
                    <div key={unit.id} style={styles.listItem}>
                      <div>
                        <strong>{unit.nama}</strong>

                        <div style={styles.smallText}>{unit.fungsi}</div>
                      </div>

                      <button
                        type="button"
                        style={styles.removeButton}
                        onClick={() => hapusUnit(unit.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KK */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  Kepala Keluarga ({bidangDipilih.kk.length})
                </h3>

                <button
                  type="button"
                  style={styles.addButton}
                  onClick={tambahKK}
                >
                  + Tambah KK
                </button>
              </div>

              {bidangDipilih.kk.length === 0 ? (
                <div style={styles.empty}>Belum ada Kepala Keluarga.</div>
              ) : (
                <div style={styles.list}>
                  {bidangDipilih.kk.map((kk) => (
                    <div key={kk.id} style={styles.listItem}>
                      <div>
                        <strong>{kk.nama}</strong>

                        <div style={styles.smallText}>ID: {kk.id}</div>
                      </div>

                      <div style={styles.kkActionContainer}>
                        <button
                          type="button"
                          style={styles.moveButton}
                          onClick={() => bukaPindahKK(kk)}
                        >
                          Pindahkan
                        </button>

                        <button
                          type="button"
                          style={styles.removeButton}
                          onClick={() => hapusKK(kk.id)}
                        >
                          Lepas
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CATATAN */}
            <div style={styles.info}>
              <strong>Catatan:</strong>
              <br />
              Prototype ini masih menggunakan data sementara. Setiap KK sudah
              memiliki ID sendiri. Melepas KK hanya menghapus hubungan KK dengan
              bidang, bukan menghapus data warga.
            </div>
          </div>
        </div>
      )}

           {/* MODAL PILIH KK */}
      {modalPilihKK && bidangDipilih && (
        <div
          style={styles.overlay}
          onClick={() => setModalPilihKK(false)}
        >
          <div
            style={styles.pilihKKModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Pilih Kepala Keluarga
                </h2>

                <div style={styles.modalSubTitle}>
                  Tambahkan ke {bidangDipilih.nama}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalPilihKK(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.pilihKKList}>
              {daftarKK.map((warga) => {
                const sudahDiBidangIni = bidangDipilih.kk.some(
                  (kk) => kk.id === warga.id
                );

                const sudahDiBidangLain = bidang.some(
                  (item) =>
                    item.id !== bidangDipilih.id &&
                    item.kk.some((kk) => kk.id === warga.id)
                );

                const tidakBisaDipilih =
                  sudahDiBidangIni || sudahDiBidangLain;

                return (
                  <button
                    key={warga.id}
                    type="button"
                    disabled={tidakBisaDipilih}
                    onClick={() => pilihKK(warga)}
                    style={{
                      ...styles.pilihKKItem,
                      opacity: tidakBisaDipilih ? 0.45 : 1,
                      cursor: tidakBisaDipilih
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    <div>
                      <strong>{warga.nama}</strong>

                      <div style={styles.smallText}>
                        ID: {warga.id}
                      </div>
                    </div>

                    <span>
                      {sudahDiBidangIni
                        ? "Sudah di bidang ini"
                        : sudahDiBidangLain
                          ? "Sudah di bidang lain"
                          : "Pilih"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

            {/* MODAL PINDAH KK */}
      {modalPindahKK && kkYangDipindahkan && bidangDipilih && (
        <div
          style={styles.overlay}
          onClick={() => {
            setModalPindahKK(false);
            setKkYangDipindahkan(null);
          }}
        >
          <div
            style={styles.pindahKKModal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Pindahkan Kepala Keluarga
                </h2>

                <div style={styles.modalSubTitle}>
                  {kkYangDipindahkan.nama}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalPindahKK(false);
                  setKkYangDipindahkan(null);
                }}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            {/* BIDANG SAAT INI */}
            <div style={styles.pindahInfo}>
              <strong>Bidang saat ini:</strong>{" "}
              {bidangDipilih.nama}
            </div>

            {/* PILIH BIDANG TUJUAN */}
            <div style={styles.pindahTitle}>
              Pilih bidang tujuan:
            </div>

            <div style={styles.pindahList}>
              {bidang
                .filter(
                  (item) => item.id !== bidangDipilih.id
                )
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={styles.pindahItem}
                    onClick={() => pindahkanKK(item.id)}
                  >
                    <div>
                      <strong>{item.nama}</strong>

                      <div style={styles.smallText}>
                        {item.tipe} • {item.kk.length} KK
                      </div>
                    </div>

                    <span style={styles.pindahArrow}>
                      Pindahkan →
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    background: "#f5f6f8",
    minHeight: "100%",
    boxSizing: "border-box",
  },

  header: {
    marginBottom: "16px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#666",
  },

  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "15px",
    fontSize: "13px",
    color: "#555",
  },

  legendBox: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "1px solid #999",
    marginRight: "6px",
    verticalAlign: "middle",
  },

  mapWrapper: {
    width: "100%",
    overflowX: "auto",
    overflowY: "auto",
    border: "1px solid #cfd5dc",
    borderRadius: "12px",
    background: "#dfe4e8",
    padding: "15px",
    boxSizing: "border-box",
  },

  map: {
    position: "relative",
    width: "1100px",
    height: "750px",
    background: "#cfd5ca",
    border: "2px solid #8f9890",
    borderRadius: "8px",
    overflow: "hidden",
  },

  jalanUtama: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "80px",
    background: "#9da2a6",
    borderTop: "3px solid #777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "2px",
  },

  gang: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "650px",
    width: "55px",
    background: "#a9adb0",
    borderLeft: "2px solid #888",
    borderRight: "2px solid #888",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    writingMode: "vertical-rl",
    letterSpacing: "2px",
  },

  bidang: {
    position: "absolute",
    border: "2px solid #59636b",
    borderRadius: "4px",
    padding: "12px",
    boxSizing: "border-box",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  bidangNama: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "4px",
  },

  bidangTipe: {
    fontSize: "12px",
    color: "#555",
    marginBottom: "12px",
  },

  bidangKK: {
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "8px",
  },

  unitContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },

  unitBadge: {
    padding: "4px 7px",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "12px",
    fontSize: "10px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #ddd",
    paddingBottom: "16px",
    marginBottom: "20px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "24px",
  },

  modalSubTitle: {
    marginTop: "5px",
    color: "#666",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    lineHeight: 1,
  },

  section: {
    marginBottom: "24px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  sectionTitle: {
    margin: 0,
  },

  addButton: {
    border: "none",
    borderRadius: "7px",
    padding: "8px 12px",
    cursor: "pointer",
    background: "#222",
    color: "#fff",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "11px 12px",
  },

  smallText: {
    marginTop: "3px",
    fontSize: "12px",
    color: "#777",
  },

  removeButton: {
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    color: "#555",
  },

  empty: {
    padding: "14px",
    background: "#f7f7f7",
    borderRadius: "8px",
    color: "#777",
  },

  pilihKKModal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
  },

  pilihKKList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  pilihKKItem: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
  },

  info: {
    padding: "12px 14px",
    borderRadius: "8px",
    background: "#f1f4f7",
    fontSize: "13px",
    lineHeight: 1.5,
  },
};

export default DenahRT;
