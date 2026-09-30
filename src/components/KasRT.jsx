import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "./KasRT.css";

function KasRT() {
  const [tabAktif, setTabAktif] = useState("pemasukan");

  const [dataPemasukan, setDataPemasukan] = useState([]);
  const [loadingPemasukan, setLoadingPemasukan] = useState(false);
  const [error, setError] = useState("");

  const [formPemasukan, setFormPemasukan] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    sumber: "",
    keterangan: "",
    jumlah: "",
  });

  const [menyimpan, setMenyimpan] = useState(false);
  const [editId, setEditId] = useState(null);

  const [dataPengeluaran, setDataPengeluaran] = useState([]);
  const [loadingPengeluaran, setLoadingPengeluaran] = useState(false);
  const [menyimpanPengeluaran, setMenyimpanPengeluaran] = useState(false);
  const [editPengeluaranId, setEditPengeluaranId] = useState(null);
  const [tahunLaporan, setTahunLaporan] = useState(new Date().getFullYear());

  const [saldoAwal, setSaldoAwal] = useState("");
  const [menyimpanSaldoAwal, setMenyimpanSaldoAwal] = useState(false);

  const [pemasukanLaporan, setPemasukanLaporan] = useState(0);
  const [pengeluaranLaporan, setPengeluaranLaporan] = useState(0);
  const [memuatLaporan, setMemuatLaporan] = useState(false);
  const [rekapBulanan, setRekapBulanan] = useState([]);

  const [formPengeluaran, setFormPengeluaran] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    judul_acara: "",
    keperluan: "",
    keterangan: "",
    jumlah: "",
  });

  // =========================================================
  // MEMUAT DATA PEMASUKAN
  // =========================================================

  async function loadPemasukan() {
    try {
      setLoadingPemasukan(true);
      setError("");

      console.log("MEMUAT DATA PEMASUKAN KAS RT...");

      const { data, error } = await supabase
        .from("kas_rt_pemasukan")
        .select("*")
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("GAGAL MEMUAT PEMASUKAN:", error);
        throw error;
      }

      console.log(
        `BERHASIL MEMUAT ${data?.length || 0} DATA PEMASUKAN KAS RT.`,
      );

      setDataPemasukan(data || []);
    } catch (err) {
      console.error("ERROR MEMUAT PEMASUKAN KAS RT:", err);
      setError("Data pemasukan gagal dimuat.");
    } finally {
      setLoadingPemasukan(false);
    }
  }

  async function loadPengeluaran() {
    try {
      setLoadingPengeluaran(true);
      setError("");

      console.log("MEMUAT DATA PENGELUARAN KAS RT...");

      const { data, error } = await supabase
        .from("kas_rt_pengeluaran")
        .select("*")
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("GAGAL MEMUAT PENGELUARAN:", error);
        throw error;
      }

      console.log(
        `BERHASIL MEMUAT ${data?.length || 0} DATA PENGELUARAN KAS RT.`,
      );

      setDataPengeluaran(data || []);
    } catch (err) {
      console.error("ERROR MEMUAT PENGELUARAN KAS RT:", err);
      setError("Data pengeluaran gagal dimuat.");
    } finally {
      setLoadingPengeluaran(false);
    }
  }

  async function simpanSaldoAwal() {
    if (saldoAwal === "" || saldoAwal === null || saldoAwal === undefined) {
      alert("Saldo awal harus diisi.");
      return;
    }

    if (Number(saldoAwal) < 0) {
      alert("Saldo awal tidak boleh kurang dari 0.");
      return;
    }

    try {
      setMenyimpanSaldoAwal(true);
      setError("");

      console.log(
        `MEMERIKSA APAKAH TAHUN ${tahunLaporan} BOLEH MEMILIKI SALDO AWAL MANUAL...`,
      );

      // =========================================================
      // 1. Periksa apakah sudah ada transaksi sebelum tahun ini
      // =========================================================

      const batasTanggal = `${tahunLaporan}-01-01`;

      const { data: pemasukanSebelumnya, error: errorMasuk } = await supabase
        .from("kas_rt_pemasukan")
        .select("id, tanggal, jumlah")
        .lt("tanggal", batasTanggal)
        .limit(1);

      if (errorMasuk) throw errorMasuk;

      const { data: pengeluaranSebelumnya, error: errorKeluar } = await supabase
        .from("kas_rt_pengeluaran")
        .select("id, tanggal, jumlah")
        .lt("tanggal", batasTanggal)
        .limit(1);

      if (errorKeluar) throw errorKeluar;

      const sudahAdaTransaksiSebelumnya =
        (pemasukanSebelumnya || []).length > 0 ||
        (pengeluaranSebelumnya || []).length > 0;

      // =========================================================
      // 2. Kalau sudah ada transaksi tahun-tahun sebelumnya,
      //    saldo awal harus otomatis.
      // =========================================================

      if (sudahAdaTransaksiSebelumnya) {
        alert(
          `Saldo awal tahun ${tahunLaporan} tidak dapat diubah manual.\n\n` +
            `Saldo awal tahun ini dihitung otomatis dari saldo akhir tahun sebelumnya.`,
        );

        console.log(
          `SALDO AWAL ${tahunLaporan} DITOLAK: ADA TRANSAKSI SEBELUM TAHUN TERSEBUT.`,
        );

        return;
      }

      // =========================================================
      // 3. Tahun ini merupakan titik awal.
      //    Boleh disimpan sebagai saldo awal manual.
      // =========================================================

      const dataSimpan = {
        tahun: tahunLaporan,
        saldo_awal: Number(saldoAwal),
      };

      console.log("MENYIMPAN SALDO AWAL MANUAL KAS RT:", dataSimpan);

      // =========================================================
      // 4. Cek apakah sudah ada data saldo untuk tahun tersebut
      // =========================================================

      const { data: dataLama, error: errorCek } = await supabase
        .from("kas_rt_saldo_tahunan")
        .select("id")
        .eq("tahun", tahunLaporan)
        .maybeSingle();

      if (errorCek) throw errorCek;

      if (dataLama) {
        const { error } = await supabase
          .from("kas_rt_saldo_tahunan")
          .update({
            saldo_awal: Number(saldoAwal),
            updated_at: new Date().toISOString(),
          })
          .eq("id", dataLama.id);

        if (error) throw error;

        alert(`Saldo awal tahun ${tahunLaporan} berhasil diperbarui.`);
      } else {
        const { error } = await supabase
          .from("kas_rt_saldo_tahunan")
          .insert([dataSimpan]);

        if (error) throw error;

        alert(`Saldo awal tahun ${tahunLaporan} berhasil disimpan.`);
      }

      // Muat ulang laporan agar tampilan langsung mengikuti data terbaru
      await loadLaporanTahunan();
    } catch (err) {
      console.error("GAGAL MENYIMPAN SALDO AWAL:", err);

      alert("Saldo awal gagal disimpan.");
    } finally {
      setMenyimpanSaldoAwal(false);
    }
  }

  async function loadLaporanTahunan() {
    try {
      setMemuatLaporan(true);
      setError("");

      console.log(`MEMUAT LAPORAN KAS RT TAHUN ${tahunLaporan}...`);

      // =========================================================
      // 1. Ambil seluruh transaksi pemasukan
      // =========================================================
      const { data: semuaPemasukan, error: errorSemuaMasuk } = await supabase
        .from("kas_rt_pemasukan")
        .select("tanggal, jumlah")
        .order("tanggal", { ascending: true });

      if (errorSemuaMasuk) throw errorSemuaMasuk;

      // =========================================================
      // 2. Ambil seluruh transaksi pengeluaran
      // =========================================================
      const { data: semuaPengeluaran, error: errorSemuaKeluar } = await supabase
        .from("kas_rt_pengeluaran")
        .select("tanggal, jumlah")
        .order("tanggal", { ascending: true });

      if (errorSemuaKeluar) throw errorSemuaKeluar;

      // =========================================================
      // 3. Cari saldo awal tahun yang dipilih
      //
      // Jika belum ada saldo awal tersimpan untuk tahun tersebut,
      // hitung otomatis dari seluruh transaksi tahun-tahun sebelumnya.
      // =========================================================

      const { data: dataSaldo, error: errorSaldo } = await supabase
        .from("kas_rt_saldo_tahunan")
        .select("saldo_awal")
        .eq("tahun", tahunLaporan)
        .maybeSingle();

      if (errorSaldo) throw errorSaldo;

      let nilaiSaldoAwal = 0;

      if (dataSaldo && dataSaldo.saldo_awal !== null) {
        // Ada saldo awal yang memang tersimpan untuk tahun tersebut.
        nilaiSaldoAwal = Number(dataSaldo.saldo_awal || 0);

        console.log(
          `SALDO AWAL ${tahunLaporan} DIAMBIL DARI SUPABASE:`,
          nilaiSaldoAwal,
        );
      } else {
        // Belum ada saldo awal tersimpan.
        // Hitung saldo dari seluruh transaksi sebelum tahun laporan.

        const pemasukanSebelumnya = (semuaPemasukan || [])
          .filter((item) => {
            const tahun = Number(String(item.tanggal).slice(0, 4));
            return tahun < tahunLaporan;
          })
          .reduce((total, item) => total + Number(item.jumlah || 0), 0);

        const pengeluaranSebelumnya = (semuaPengeluaran || [])
          .filter((item) => {
            const tahun = Number(String(item.tanggal).slice(0, 4));
            return tahun < tahunLaporan;
          })
          .reduce((total, item) => total + Number(item.jumlah || 0), 0);

        nilaiSaldoAwal = pemasukanSebelumnya - pengeluaranSebelumnya;

        console.log(`SALDO AWAL ${tahunLaporan} DIHITUNG OTOMATIS:`, {
          pemasukanSebelumnya,
          pengeluaranSebelumnya,
          saldoAwal: nilaiSaldoAwal,
        });
      }

      setSaldoAwal(nilaiSaldoAwal);

      // =========================================================
      // 4. Ambil transaksi untuk tahun laporan
      // =========================================================

      const awalTahun = `${tahunLaporan}-01-01`;
      const akhirTahun = `${tahunLaporan}-12-31`;

      const dataMasuk = (semuaPemasukan || []).filter((item) => {
        return item.tanggal >= awalTahun && item.tanggal <= akhirTahun;
      });

      const dataKeluar = (semuaPengeluaran || []).filter((item) => {
        return item.tanggal >= awalTahun && item.tanggal <= akhirTahun;
      });

      console.log("===== DATA LAPORAN TAHUNAN =====");
      console.log("TAHUN:", tahunLaporan);
      console.log("SALDO AWAL:", nilaiSaldoAwal);
      console.log("PEMASUKAN TAHUN INI:", dataMasuk);
      console.log("PENGELUARAN TAHUN INI:", dataKeluar);

      // =========================================================
      // 5. Hitung total pemasukan dan pengeluaran tahun tersebut
      // =========================================================

      const totalMasuk = dataMasuk.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0,
      );

      const totalKeluar = dataKeluar.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0,
      );

      setPemasukanLaporan(totalMasuk);
      setPengeluaranLaporan(totalKeluar);

      // =========================================================
      // 6. Rekap per bulan
      // =========================================================

      const namaBulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      let saldoBerjalan = nilaiSaldoAwal;

      const hasilRekapBulanan = namaBulan.map((nama, index) => {
        const nomorBulan = index + 1;

        const pemasukanBulan = dataMasuk
          .filter((item) => {
            const tanggal = new Date(`${item.tanggal}T00:00:00`);
            return tanggal.getMonth() + 1 === nomorBulan;
          })
          .reduce((total, item) => total + Number(item.jumlah || 0), 0);

        const pengeluaranBulan = dataKeluar
          .filter((item) => {
            const tanggal = new Date(`${item.tanggal}T00:00:00`);
            return tanggal.getMonth() + 1 === nomorBulan;
          })
          .reduce((total, item) => total + Number(item.jumlah || 0), 0);

        const saldoAwalBulan = saldoBerjalan;

        const saldoAkhirBulan =
          saldoAwalBulan + pemasukanBulan - pengeluaranBulan;

        saldoBerjalan = saldoAkhirBulan;

        return {
          bulan: nomorBulan,
          namaBulan: nama,
          saldoAwal: saldoAwalBulan,
          pemasukan: pemasukanBulan,
          pengeluaran: pengeluaranBulan,
          saldoAkhir: saldoAkhirBulan,
        };
      });

      setRekapBulanan(hasilRekapBulanan);

      // =========================================================
      // 7. Log hasil akhir
      // =========================================================

      console.log(`===== HASIL LAPORAN ${tahunLaporan} =====`);
      console.log("Saldo Awal :", nilaiSaldoAwal);
      console.log("Pemasukan  :", totalMasuk);
      console.log("Pengeluaran:", totalKeluar);
      console.log("Saldo Akhir:", nilaiSaldoAwal + totalMasuk - totalKeluar);

      console.log("REKAP BULANAN KAS RT:", hasilRekapBulanan);
    } catch (err) {
      console.error("GAGAL MEMUAT LAPORAN TAHUNAN:", err);
      setError("Laporan tahunan gagal dimuat.");
    } finally {
      setMemuatLaporan(false);
    }
  }

  useEffect(() => {
    loadPemasukan();
    loadPengeluaran();
  }, []);

  useEffect(() => {
    loadLaporanTahunan();
  }, [tahunLaporan]);

  // =====================================================
  // CETAK LAPORAN
  // =====================================================

  function cetakLaporanKas() {
    window.print();
  }
  function getTanggalCetak() {
    return new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatRupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(nilai || 0));
  }

  // =========================================================
  // HANDLE FORM
  // =========================================================

  function handlePemasukanChange(e) {
    const { name, value } = e.target;

    setFormPemasukan((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePengeluaranChange(e) {
    const { name, value } = e.target;

    setFormPengeluaran((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // SIMPAN / UPDATE PEMASUKAN
  // =========================================================

  async function simpanPemasukan(e) {
    e.preventDefault();

    if (!formPemasukan.tanggal) {
      alert("Tanggal pemasukan harus diisi.");
      return;
    }

    if (!formPemasukan.sumber.trim()) {
      alert("Sumber pemasukan harus diisi.");
      return;
    }

    if (!formPemasukan.jumlah || Number(formPemasukan.jumlah) <= 0) {
      alert("Jumlah pemasukan harus lebih dari 0.");
      return;
    }

    try {
      setMenyimpan(true);
      setError("");

      const dataSimpan = {
        tanggal: formPemasukan.tanggal,
        sumber: formPemasukan.sumber.trim(),
        keterangan: formPemasukan.keterangan.trim() || null,
        jumlah: Number(formPemasukan.jumlah),
      };

      if (editId) {
        console.log("MENGUPDATE PEMASUKAN KAS RT:", editId);

        const { error } = await supabase
          .from("kas_rt_pemasukan")
          .update(dataSimpan)
          .eq("id", editId);

        if (error) {
          throw error;
        }

        alert("Data pemasukan berhasil diperbarui.");
      } else {
        console.log("MENAMBAHKAN PEMASUKAN KAS RT...");

        const { error } = await supabase
          .from("kas_rt_pemasukan")
          .insert([dataSimpan]);

        if (error) {
          throw error;
        }

        alert("Data pemasukan berhasil disimpan.");
      }

      resetFormPemasukan();
      await loadPemasukan();
    } catch (err) {
      console.error("GAGAL MENYIMPAN PEMASUKAN:", err);
      alert("Data pemasukan gagal disimpan.");
    } finally {
      setMenyimpan(false);
    }
  }

  async function simpanPengeluaran(e) {
    e.preventDefault();

    if (!formPengeluaran.tanggal) {
      alert("Tanggal pengeluaran harus diisi.");
      return;
    }

    if (!formPengeluaran.judul_acara.trim()) {
      alert("Judul acara/kegiatan harus diisi.");
      return;
    }

    if (!formPengeluaran.keperluan.trim()) {
      alert("Keperluan harus diisi.");
      return;
    }

    if (!formPengeluaran.jumlah || Number(formPengeluaran.jumlah) <= 0) {
      alert("Jumlah pengeluaran harus lebih dari 0.");
      return;
    }

    try {
      setMenyimpanPengeluaran(true);
      setError("");

      const dataSimpan = {
        tanggal: formPengeluaran.tanggal,
        judul_acara: formPengeluaran.judul_acara.trim(),
        keperluan: formPengeluaran.keperluan.trim(),
        keterangan: formPengeluaran.keterangan.trim() || null,
        jumlah: Number(formPengeluaran.jumlah),
      };

      if (editPengeluaranId) {
        console.log("MENGUPDATE PENGELUARAN KAS RT:", editPengeluaranId);

        const { error } = await supabase
          .from("kas_rt_pengeluaran")
          .update(dataSimpan)
          .eq("id", editPengeluaranId);

        if (error) {
          throw error;
        }

        alert("Data pengeluaran berhasil diperbarui.");
      } else {
        console.log("MENAMBAHKAN PENGELUARAN KAS RT...");

        const { error } = await supabase
          .from("kas_rt_pengeluaran")
          .insert([dataSimpan]);

        if (error) {
          throw error;
        }

        alert("Data pengeluaran berhasil disimpan.");
      }

      resetFormPengeluaran();
      await loadPengeluaran();
    } catch (err) {
      console.error("GAGAL MENYIMPAN PENGELUARAN:", err);
      alert("Data pengeluaran gagal disimpan.");
    } finally {
      setMenyimpanPengeluaran(false);
    }
  }

  // =========================================================
  // EDIT PEMASUKAN
  // =========================================================

  function editPemasukan(item) {
    setEditId(item.id);

    setFormPemasukan({
      tanggal: item.tanggal || "",
      sumber: item.sumber || "",
      keterangan: item.keterangan || "",
      jumlah: item.jumlah || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function editPengeluaran(item) {
    setEditPengeluaranId(item.id);

    setFormPengeluaran({
      tanggal: item.tanggal || "",
      judul_acara: item.judul_acara || "",
      keperluan: item.keperluan || "",
      keterangan: item.keterangan || "",
      jumlah: item.jumlah || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // HAPUS PEMASUKAN
  // =========================================================

  async function hapusPemasukan(id) {
    const yakin = window.confirm(
      "Apakah Anda yakin ingin menghapus data pemasukan ini?",
    );

    if (!yakin) {
      return;
    }

    try {
      console.log("MENGHAPUS PEMASUKAN KAS RT:", id);

      const { error } = await supabase
        .from("kas_rt_pemasukan")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert("Data pemasukan berhasil dihapus.");

      await loadPemasukan();
    } catch (err) {
      console.error("GAGAL MENGHAPUS PEMASUKAN:", err);
      alert("Data pemasukan gagal dihapus.");
    }
  }

  async function hapusPengeluaran(id) {
    const yakin = window.confirm(
      "Apakah Anda yakin ingin menghapus data pengeluaran ini?",
    );

    if (!yakin) {
      return;
    }

    try {
      console.log("MENGHAPUS PENGELUARAN KAS RT:", id);

      const { error } = await supabase
        .from("kas_rt_pengeluaran")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert("Data pengeluaran berhasil dihapus.");

      await loadPengeluaran();
    } catch (err) {
      console.error("GAGAL MENGHAPUS PENGELUARAN:", err);
      alert("Data pengeluaran gagal dihapus.");
    }
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  function resetFormPemasukan() {
    setEditId(null);

    setFormPemasukan({
      tanggal: new Date().toISOString().split("T")[0],
      sumber: "",
      keterangan: "",
      jumlah: "",
    });
  }

  function resetFormPengeluaran() {
    setEditPengeluaranId(null);

    setFormPengeluaran({
      tanggal: new Date().toISOString().split("T")[0],
      judul_acara: "",
      keperluan: "",
      keterangan: "",
      jumlah: "",
    });
  }

  // =========================================================
  // TOTAL PEMASUKAN
  // =========================================================

  const totalPemasukan = useMemo(() => {
    return dataPemasukan.reduce(
      (total, item) => total + Number(item.jumlah || 0),
      0,
    );
  }, [dataPemasukan]);

  const totalPengeluaran = useMemo(() => {
    return dataPengeluaran.reduce(
      (total, item) => total + Number(item.jumlah || 0),
      0,
    );
  }, [dataPengeluaran]);

  const saldoAkhir = useMemo(() => {
    return (
      Number(saldoAwal || 0) +
      Number(pemasukanLaporan || 0) -
      Number(pengeluaranLaporan || 0)
    );
  }, [saldoAwal, pemasukanLaporan, pengeluaranLaporan]);

  return (
    <div className="kas-rt-container">
      <div className="kas-rt-header">
        <div>
          <h2>KAS RT 03</h2>
          <p>Pengelolaan Pemasukan dan Pengeluaran Kas RT</p>
        </div>
      </div>

      {/* =====================================================
          TAB
      ===================================================== */}

      <div className="kas-rt-tabs">
        <button
          type="button"
          className={tabAktif === "pemasukan" ? "active" : ""}
          onClick={() => setTabAktif("pemasukan")}
        >
          Pemasukan
        </button>

        <button
          type="button"
          className={tabAktif === "pengeluaran" ? "active" : ""}
          onClick={() => setTabAktif("pengeluaran")}
        >
          Pengeluaran
        </button>

        <button
          type="button"
          className={tabAktif === "laporan" ? "active" : ""}
          onClick={() => setTabAktif("laporan")}
        >
          Laporan
        </button>
      </div>

      {/* =====================================================
          TAB PEMASUKAN
      ===================================================== */}

      {tabAktif === "pemasukan" && (
        <div className="kas-rt-section">
          <div className="kas-rt-card">
            <div className="kas-rt-card-header">
              <div>
                <h3>
                  {editId ? "Edit Pemasukan Kas RT" : "Tambah Pemasukan Kas RT"}
                </h3>
                <span>Catat setiap uang yang masuk ke kas RT.</span>
              </div>
            </div>

            <form onSubmit={simpanPemasukan}>
              <div className="kas-rt-form-grid">
                <div className="kas-rt-form-group">
                  <label>Tanggal</label>

                  <input
                    type="date"
                    name="tanggal"
                    value={formPemasukan.tanggal}
                    onChange={handlePemasukanChange}
                  />
                </div>

                <div className="kas-rt-form-group">
                  <label>Sumber Pemasukan</label>

                  <input
                    type="text"
                    name="sumber"
                    value={formPemasukan.sumber}
                    onChange={handlePemasukanChange}
                    placeholder="Contoh: Iuran warga"
                  />
                </div>

                <div className="kas-rt-form-group">
                  <label>Jumlah</label>

                  <input
                    type="number"
                    name="jumlah"
                    value={formPemasukan.jumlah}
                    onChange={handlePemasukanChange}
                    min="0"
                    placeholder="Masukkan jumlah"
                  />
                </div>

                <div className="kas-rt-form-group kas-rt-form-full">
                  <label>Keterangan</label>

                  <textarea
                    name="keterangan"
                    value={formPemasukan.keterangan}
                    onChange={handlePemasukanChange}
                    placeholder="Keterangan tambahan (opsional)"
                    rows="3"
                  />
                </div>
              </div>

              <div className="kas-rt-form-actions">
                <button
                  type="submit"
                  className="kas-rt-btn-primary"
                  disabled={menyimpan}
                >
                  {menyimpan
                    ? "Menyimpan..."
                    : editId
                      ? "Simpan Perubahan"
                      : "Simpan Pemasukan"}
                </button>

                {editId && (
                  <button
                    type="button"
                    className="kas-rt-btn-secondary"
                    onClick={resetFormPemasukan}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* =================================================
              RINGKASAN
          ================================================= */}

          <div className="kas-rt-summary">
            <div className="kas-rt-summary-card">
              <span>Total Transaksi</span>
              <strong>{dataPemasukan.length}</strong>
            </div>

            <div className="kas-rt-summary-card">
              <span>Total Pemasukan</span>
              <strong>{formatRupiah(totalPemasukan)}</strong>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && <div className="kas-rt-error">{error}</div>}

          {/* =================================================
              DATA PEMASUKAN
          ================================================= */}

          <div className="kas-rt-card">
            <div className="kas-rt-card-header">
              <div>
                <h3>Data Pemasukan</h3>
                <span>Seluruh transaksi pemasukan kas RT.</span>
              </div>
            </div>

            {loadingPemasukan ? (
              <div className="kas-rt-loading">Memuat data pemasukan...</div>
            ) : dataPemasukan.length === 0 ? (
              <div className="kas-rt-empty">Belum ada data pemasukan.</div>
            ) : (
              <div className="kas-rt-table-wrapper">
                <table className="kas-rt-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Sumber</th>
                      <th>Keterangan</th>
                      <th>Jumlah</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataPemasukan.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>
                          {item.tanggal
                            ? new Date(
                                `${item.tanggal}T00:00:00`,
                              ).toLocaleDateString("id-ID")
                            : "-"}
                        </td>

                        <td>
                          <strong>{item.sumber}</strong>
                        </td>

                        <td>{item.keterangan || "-"}</td>

                        <td className="kas-rt-jumlah">
                          {formatRupiah(item.jumlah)}
                        </td>

                        <td>
                          <div className="kas-rt-action-buttons">
                            <button
                              type="button"
                              onClick={() => editPemasukan(item)}
                              className="kas-rt-btn-edit"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => hapusPemasukan(item.id)}
                              className="kas-rt-btn-delete"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
    TAB PENGELUARAN
===================================================== */}

      {tabAktif === "pengeluaran" && (
        <div className="kas-rt-section">
          {/* =================================================
        FORM PENGELUARAN
    ================================================= */}

          <div className="kas-rt-card">
            <div className="kas-rt-card-header">
              <div>
                <h3>
                  {editPengeluaranId
                    ? "Edit Pengeluaran Kas RT"
                    : "Tambah Pengeluaran Kas RT"}
                </h3>

                <span>
                  Catat setiap pengeluaran kas RT berdasarkan acara atau
                  kegiatan.
                </span>
              </div>
            </div>

            <form onSubmit={simpanPengeluaran}>
              <div className="kas-rt-form-grid">
                <div className="kas-rt-form-group">
                  <label>Tanggal</label>

                  <input
                    type="date"
                    name="tanggal"
                    value={formPengeluaran.tanggal}
                    onChange={handlePengeluaranChange}
                  />
                </div>

                <div className="kas-rt-form-group">
                  <label>Judul Acara / Kegiatan</label>

                  <input
                    type="text"
                    name="judul_acara"
                    value={formPengeluaran.judul_acara}
                    onChange={handlePengeluaranChange}
                    placeholder="Contoh: HUT RI 2026"
                  />
                </div>

                <div className="kas-rt-form-group">
                  <label>Keperluan</label>

                  <input
                    type="text"
                    name="keperluan"
                    value={formPengeluaran.keperluan}
                    onChange={handlePengeluaranChange}
                    placeholder="Contoh: Konsumsi"
                  />
                </div>

                <div className="kas-rt-form-group">
                  <label>Jumlah</label>

                  <input
                    type="number"
                    name="jumlah"
                    value={formPengeluaran.jumlah}
                    onChange={handlePengeluaranChange}
                    min="0"
                    placeholder="Masukkan jumlah"
                  />
                </div>

                <div className="kas-rt-form-group kas-rt-form-full">
                  <label>Keterangan</label>

                  <textarea
                    name="keterangan"
                    value={formPengeluaran.keterangan}
                    onChange={handlePengeluaranChange}
                    placeholder="Keterangan tambahan (opsional)"
                    rows="3"
                  />
                </div>
              </div>

              <div className="kas-rt-form-actions">
                <button
                  type="submit"
                  className="kas-rt-btn-primary"
                  disabled={menyimpanPengeluaran}
                >
                  {menyimpanPengeluaran
                    ? "Menyimpan..."
                    : editPengeluaranId
                      ? "Simpan Perubahan"
                      : "Simpan Pengeluaran"}
                </button>

                {editPengeluaranId && (
                  <button
                    type="button"
                    className="kas-rt-btn-secondary"
                    onClick={resetFormPengeluaran}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* =================================================
        RINGKASAN PENGELUARAN
    ================================================= */}

          <div className="kas-rt-summary">
            <div className="kas-rt-summary-card">
              <span>Total Transaksi</span>
              <strong>{dataPengeluaran.length}</strong>
            </div>

            <div className="kas-rt-summary-card">
              <span>Total Pengeluaran</span>
              <strong>{formatRupiah(totalPengeluaran)}</strong>
            </div>
          </div>

          {/* =================================================
        ERROR
    ================================================= */}

          {error && <div className="kas-rt-error">{error}</div>}

          {/* =================================================
        DATA PENGELUARAN
    ================================================= */}

          <div className="kas-rt-card">
            <div className="kas-rt-card-header">
              <div>
                <h3>Data Pengeluaran</h3>

                <span>Seluruh transaksi pengeluaran kas RT.</span>
              </div>
            </div>

            {loadingPengeluaran ? (
              <div className="kas-rt-loading">Memuat data pengeluaran...</div>
            ) : dataPengeluaran.length === 0 ? (
              <div className="kas-rt-empty">Belum ada data pengeluaran.</div>
            ) : (
              <div className="kas-rt-table-wrapper">
                <table className="kas-rt-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Acara / Kegiatan</th>
                      <th>Keperluan</th>
                      <th>Keterangan</th>
                      <th>Jumlah</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataPengeluaran.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>
                          {item.tanggal
                            ? new Date(
                                `${item.tanggal}T00:00:00`,
                              ).toLocaleDateString("id-ID")
                            : "-"}
                        </td>

                        <td>
                          <strong>{item.judul_acara}</strong>
                        </td>

                        <td>{item.keperluan}</td>

                        <td>{item.keterangan || "-"}</td>

                        <td className="kas-rt-jumlah">
                          {formatRupiah(item.jumlah)}
                        </td>

                        <td>
                          <div className="kas-rt-action-buttons">
                            <button
                              type="button"
                              onClick={() => editPengeluaran(item)}
                              className="kas-rt-btn-edit"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => hapusPengeluaran(item.id)}
                              className="kas-rt-btn-delete"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
    TAB LAPORAN
===================================================== */}

      {tabAktif === "laporan" && (
        <div className="kas-rt-section">
          {/* =================================================
        PENGATURAN LAPORAN
    ================================================= */}

          <div className="kas-rt-card">
            <div className="kas-rt-card-header">
              <div>
                <h3>Laporan Kas RT</h3>
                <span>Pilih tahun laporan dan tentukan saldo awal tahun.</span>
              </div>

              <button
                type="button"
                className="kas-rt-btn-primary"
                onClick={cetakLaporanKas}
              >
                🖨️ Cetak Laporan
              </button>
            </div>

            <div className="kas-rt-form-grid">
              <div className="kas-rt-form-group">
                <label>Tahun Laporan</label>

                <select
                  value={tahunLaporan}
                  onChange={(e) => setTahunLaporan(Number(e.target.value))}
                >
                  {Array.from(
                    { length: 10 },
                    (_, index) => new Date().getFullYear() - 5 + index,
                  ).map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>

              <div className="kas-rt-form-group">
                <label>Saldo Awal Tahun</label>

                <input
                  type="number"
                  min="0"
                  value={saldoAwal}
                  onChange={(e) => setSaldoAwal(e.target.value)}
                  placeholder="Masukkan saldo awal"
                />
              </div>
            </div>

            <div className="kas-rt-form-actions">
              <button
                type="button"
                className="kas-rt-btn-primary"
                onClick={simpanSaldoAwal}
                disabled={menyimpanSaldoAwal}
              >
                {menyimpanSaldoAwal ? "Menyimpan..." : "Simpan Saldo Awal"}
              </button>
            </div>
          </div>

          {/* =================================================
    RINGKASAN KEUANGAN
================================================= */}

          <div className="kas-rt-summary">
            <div className="kas-rt-summary-card">
              <span>Saldo Awal {tahunLaporan}</span>

              <strong>{formatRupiah(saldoAwal)}</strong>
            </div>

            <div className="kas-rt-summary-card">
              <span>Total Pemasukan</span>

              <strong>{formatRupiah(pemasukanLaporan)}</strong>
            </div>

            <div className="kas-rt-summary-card">
              <span>Total Pengeluaran</span>

              <strong>{formatRupiah(pengeluaranLaporan)}</strong>
            </div>

            <div className="kas-rt-summary-card">
              <span>Saldo Akhir {tahunLaporan}</span>

              <strong>{formatRupiah(saldoAkhir)}</strong>
            </div>
          </div>

          {/* TAMBAHKAN BLOK INI TEPAT DI SINI */}

          <div className="kas-rt-card kas-rt-laporan-bulanan">
            <div className="kas-rt-laporan-bulanan-header">
              <div>
                <h3>Rekap Kas RT Per Bulan</h3>
                <span>
                  Rekap pemasukan dan pengeluaran tahun {tahunLaporan}
                </span>
              </div>
            </div>

            {memuatLaporan ? (
              <div className="kas-rt-loading">Memuat rekap bulanan...</div>
            ) : (
              <div className="kas-rt-table-wrapper">
                <table className="kas-rt-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Bulan</th>
                      <th>Saldo Awal</th>
                      <th>Pemasukan</th>
                      <th>Pengeluaran</th>
                      <th>Saldo Akhir</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rekapBulanan.map((item) => (
                      <tr key={item.bulan}>
                        <td>{item.bulan}</td>

                        <td>{item.namaBulan}</td>

                        <td className="kas-rt-jumlah">
                          {formatRupiah(item.saldoAwal)}
                        </td>

                        <td className="kas-rt-jumlah">
                          {formatRupiah(item.pemasukan)}
                        </td>

                        <td className="kas-rt-jumlah">
                          {formatRupiah(item.pengeluaran)}
                        </td>

                        <td className="kas-rt-jumlah">
                          {formatRupiah(item.saldoAkhir)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th colSpan="2">TOTAL / AKHIR TAHUN</th>

                      <th>{formatRupiah(Number(saldoAwal || 0))}</th>

                      <th>{formatRupiah(pemasukanLaporan)}</th>

                      <th>{formatRupiah(pengeluaranLaporan)}</th>

                      <th>{formatRupiah(saldoAkhir)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          DOKUMEN KHUSUS CETAK LAPORAN KAS RT
          ===================================================== */}
      <div className="kas-rt-print-area">
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
        <div className="kas-rt-print-header">
          <h1>LAPORAN KAS RT 03 / RW 07</h1>

          <h2>
            KARET – SETIABUDI
            <span className="print-tahun">
              &nbsp;&nbsp;&nbsp; TAHUN {tahunLaporan}
            </span>
          </h2>
        </div>

        <div className="kas-rt-print-line"></div>

        <div className="kas-rt-print-identitas">
          <div>
            <span>Saldo Awal Tahun</span>
            <strong>{formatRupiah(saldoAwal)}</strong>
          </div>

          <div>
            <span>Total Pemasukan</span>
            <strong>{formatRupiah(pemasukanLaporan)}</strong>
          </div>

          <div>
            <span>Total Pengeluaran</span>
            <strong>{formatRupiah(pengeluaranLaporan)}</strong>
          </div>

          <div>
            <span>Saldo Akhir Tahun</span>
            <strong>{formatRupiah(saldoAkhir)}</strong>
          </div>
        </div>

        <h3 className="kas-rt-print-title">REKAP KAS RT PER BULAN</h3>

        <table className="kas-rt-print-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Bulan</th>
              <th>Saldo Awal</th>
              <th>Pemasukan</th>
              <th>Pengeluaran</th>
              <th>Saldo Akhir</th>
            </tr>
          </thead>

          <tbody>
            {rekapBulanan.map((item) => (
              <tr key={item.bulan}>
                <td>{item.bulan}</td>
                <td>{item.namaBulan}</td>
                <td>{formatRupiah(item.saldoAwal)}</td>
                <td>{formatRupiah(item.pemasukan)}</td>
                <td>{formatRupiah(item.pengeluaran)}</td>
                <td>{formatRupiah(item.saldoAkhir)}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <th colSpan="2">TOTAL / AKHIR TAHUN</th>
              <th>{formatRupiah(saldoAwal)}</th>
              <th>{formatRupiah(pemasukanLaporan)}</th>
              <th>{formatRupiah(pengeluaranLaporan)}</th>
              <th>{formatRupiah(saldoAkhir)}</th>
            </tr>
          </tfoot>
        </table>

        <div className="kas-rt-print-footer">
          <div className="kas-rt-print-signature">
            <p>Dicetak pada:</p>
            <strong>{getTanggalCetak()}</strong>

            <p className="ttd-jabatan">Ketua RT 03</p>

            <div className="ttd-space"></div>

            <strong>( Januardi Pratomo )</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KasRT;
