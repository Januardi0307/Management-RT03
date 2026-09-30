import { useEffect, useRef, useState } from "react";
import "./Pengaturan.css";
import { supabase } from "../lib/supabase";

function Pengaturan() {
  const fileInputRef = useRef(null);

  const [sedangBackup, setSedangBackup] = useState(false);
  const [sedangRestore, setSedangRestore] = useState(false);
  const [pesan, setPesan] = useState("");
  const [tipePesan, setTipePesan] = useState("");

  // =========================================================
  // DATA KEPALA KELUARGA
  // =========================================================

  const [kepalaKeluarga, setKepalaKeluarga] = useState([]);
  const [kepalaKeluargaId, setKepalaKeluargaId] = useState("");
  const [loadingKepalaKeluarga, setLoadingKepalaKeluarga] = useState(false);

  const [statusPesertaDanaDuka, setStatusPesertaDanaDuka] = useState({});
  const [menyimpanPesertaDanaDuka, setMenyimpanPesertaDanaDuka] =
    useState(false);

  const [riwayatIuran, setRiwayatIuran] = useState([]);
  const [loadingRiwayatIuran, setLoadingRiwayatIuran] = useState(false);

  const [sedangBayar, setSedangBayar] = useState("");

  // =========================================================
  // TANGGAL SEKARANG
  // =========================================================

  const sekarang = new Date();

  const tahunSekarang = sekarang.getFullYear();
  const bulanSekarang = sekarang.getMonth() + 1;

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  function formatRupiah(nilai) {
    return `Rp ${Number(nilai || 0).toLocaleString("id-ID")}`;
  }

  // =========================================================
  // FORMAT BULAN
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

  function formatBulan(tahun, bulan) {
    return `${namaBulan[bulan - 1]} ${tahun}`;
  }

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const date = new Date(`${tanggal}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return tanggal;
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // =========================================================
  // MEMBUAT DAFTAR BULAN
  // MULAI NOVEMBER 2024 SAMPAI BULAN SEKARANG
  // =========================================================

  function buatDaftarBulanIuran() {
    const hasil = [];

    const mulaiTahun = 2024;
    const mulaiBulan = 11;

    let tahun = mulaiTahun;
    let bulan = mulaiBulan;

    while (
      tahun < tahunSekarang ||
      (tahun === tahunSekarang && bulan <= bulanSekarang)
    ) {
      const nilaiBulan = String(bulan).padStart(2, "0");

      hasil.push({
        tahun,
        bulan,
        nilai: `${tahun}-${nilaiBulan}`,
        nama: formatBulan(tahun, bulan),
      });

      bulan++;

      if (bulan > 12) {
        bulan = 1;
        tahun++;
      }
    }

    return hasil.reverse();
  }

  const daftarBulanIuran = buatDaftarBulanIuran();

  // =========================================================
  // LOAD KEPALA KELUARGA
  // =========================================================

  async function loadKepalaKeluarga() {
    try {
      setLoadingKepalaKeluarga(true);

      console.log("MEMUAT DATA KEPALA KELUARGA UNTUK IURAN DANA DUKA...");

      const { data, error } = await supabase
  .from("warga")
  .select("id, nama, nik, kk, ikut_dana_duka")
  .eq("status", "Aktif")
  .eq("status_kependudukan", "Warga RT03")
  .eq("status_keluarga", "Kepala Keluarga")
  .order("nama", { ascending: true });
      if (error) {
        throw error;
      }

      const hasil = (data || []).map((item) => ({
        id: item.id,
        nama: item.nama || "-",
        nik: item.nik || "-",
        kk: item.kk || "-",
        ikutDanaDuka: item.ikut_dana_duka === true,
      }));

      setKepalaKeluarga(hasil);
      const statusAwal = {};

      hasil.forEach((item) => {
        statusAwal[item.id] = item.ikutDanaDuka;
      });

      setStatusPesertaDanaDuka(statusAwal);

      console.log(`BERHASIL MEMUAT ${hasil.length} KEPALA KELUARGA.`);
    } catch (error) {
      console.error("GAGAL MEMUAT KEPALA KELUARGA:", error);

      setKepalaKeluarga([]);

      setPesan(
        "Gagal memuat data Kepala Keluarga.\n\n" +
          (error.message || "Terjadi kesalahan."),
      );

      setTipePesan("error");
    } finally {
      setLoadingKepalaKeluarga(false);
    }
  }

  function handleTogglePesertaDanaDuka(wargaId) {
    setStatusPesertaDanaDuka((prev) => ({
      ...prev,
      [wargaId]: !prev[wargaId],
    }));
  }

  async function handleSimpanPesertaDanaDuka() {
    try {
      setMenyimpanPesertaDanaDuka(true);

      console.log("MENYIMPAN PESERTA DANA DUKA...");

      for (const item of kepalaKeluarga) {
        const ikutDanaDuka = statusPesertaDanaDuka[item.id] === true;

        const { error } = await supabase
          .from("warga")
          .update({
            ikut_dana_duka: ikutDanaDuka,
          })
          .eq("id", item.id);

        if (error) {
          throw error;
        }
      }

      await loadKepalaKeluarga();

      if (
  kepalaKeluargaId &&
  statusPesertaDanaDuka[kepalaKeluargaId] !== true
) {
  setKepalaKeluargaId("");
  setRiwayatIuran([]);
}

      setPesan("Data peserta Iuran Dana Duka berhasil disimpan.");
      setTipePesan("success");

      console.log("PESERTA DANA DUKA BERHASIL DISIMPAN.");
    } catch (error) {
      console.error("GAGAL MENYIMPAN PESERTA DANA DUKA:", error);

      setPesan(
        "Gagal menyimpan peserta Dana Duka.\n\n" +
          (error.message || "Terjadi kesalahan."),
      );
      setTipePesan("error");
    } finally {
      setMenyimpanPesertaDanaDuka(false);
    }
  }

  // =========================================================
  // LOAD RIWAYAT IURAN KEPALA KELUARGA
  // =========================================================

  async function loadRiwayatIuran(wargaId) {
    if (!wargaId) {
      setRiwayatIuran([]);
      return;
    }

    try {
      setLoadingRiwayatIuran(true);

      console.log("MEMUAT RIWAYAT IURAN DANA DUKA:", wargaId);

      const { data, error } = await supabase
        .from("iuran_dana_duka")
        .select(
          `
          id,
          warga_id,
          kk,
          nama_kepala_keluarga,
          bulan,
          jumlah,
          status_pembayaran,
          tanggal_bayar,
          keterangan
        `,
        )
        .eq("warga_id", wargaId);

      if (error) {
        throw error;
      }

      const dataPembayaran = data || [];

      const hasil = daftarBulanIuran.map((periode) => {
        const pembayaran = dataPembayaran.find(
          (item) => item.bulan === periode.nilai,
        );

        return {
          ...periode,
          pembayaran: pembayaran || null,
          sudahBayar: pembayaran?.status_pembayaran === "Lunas",
        };
      });

      setRiwayatIuran(hasil);

      console.log(`BERHASIL MEMUAT ${hasil.length} PERIODE IURAN.`);
    } catch (error) {
      console.error("GAGAL MEMUAT RIWAYAT IURAN:", error);

      setRiwayatIuran([]);

      setPesan(
        "Gagal memuat riwayat iuran.\n\n" +
          (error.message || "Terjadi kesalahan."),
      );

      setTipePesan("error");
    } finally {
      setLoadingRiwayatIuran(false);
    }
  }

  // =========================================================
  // EFFECT
  // =========================================================

  useEffect(() => {
    loadKepalaKeluarga();
  }, []);

  useEffect(() => {
    if (kepalaKeluargaId) {
      loadRiwayatIuran(kepalaKeluargaId);
    } else {
      setRiwayatIuran([]);
    }
  }, [kepalaKeluargaId]);

  // =========================================================
  // BAYAR IURAN
  // =========================================================

  // =========================================================
  // UBAH STATUS IURAN
  // LUNAS <-> BELUM BAYAR
  // =========================================================

  async function handleUbahStatusIuran(item) {
    if (!kepalaKeluargaTerpilih) {
      alert("Kepala Keluarga belum dipilih.");
      return;
    }

    const pembayaran = item.pembayaran;

    // =======================================================
    // DARI LUNAS -> BELUM BAYAR
    // =======================================================

    if (item.sudahBayar) {
      const yakin = window.confirm(
        "UBAH STATUS PEMBAYARAN\n\n" +
          `Kepala Keluarga: ${kepalaKeluargaTerpilih.nama}\n` +
          `Periode: ${item.nama}\n` +
          `Status saat ini: Lunas\n\n` +
          "Status akan diubah menjadi BELUM BAYAR.\n" +
          "Tanggal pembayaran akan dikosongkan.\n\n" +
          "Apakah Anda yakin?",
      );

      if (!yakin) return;

      try {
        setSedangBayar(item.nilai);

        const { error } = await supabase
          .from("iuran_dana_duka")
          .update({
            status_pembayaran: "Belum Bayar",
            tanggal_bayar: null,
          })
          .eq("id", pembayaran.id);

        if (error) {
          throw error;
        }

        await loadRiwayatIuran(kepalaKeluargaTerpilih.id);

        setPesan(
          `Status iuran ${item.nama} berhasil diubah menjadi Belum Bayar.`,
        );

        setTipePesan("sukses");
      } catch (error) {
        console.error("GAGAL MENGUBAH STATUS IURAN:", error);

        setPesan(
          "Gagal mengubah status iuran.\n\n" +
            (error.message || "Terjadi kesalahan."),
        );

        setTipePesan("error");
      } finally {
        setSedangBayar("");
      }

      return;
    }

    // =======================================================
    // DARI BELUM BAYAR -> LUNAS
    // =======================================================

    const tanggalHariIni = new Date().toISOString().slice(0, 10);

    const yakin = window.confirm(
      "KONFIRMASI PEMBAYARAN\n\n" +
        `Kepala Keluarga: ${kepalaKeluargaTerpilih.nama}\n` +
        `Periode: ${item.nama}\n` +
        `Jumlah: ${formatRupiah(10000)}\n\n` +
        "Status akan diubah menjadi LUNAS.\n" +
        `Tanggal pembayaran: ${formatTanggal(tanggalHariIni)}\n\n` +
        "Apakah pembayaran ini sudah diterima?",
    );

    if (!yakin) return;

    try {
      setSedangBayar(item.nilai);

      // -----------------------------------------------------
      // Jika sudah ada record tetapi statusnya Belum Bayar
      // -----------------------------------------------------

      if (pembayaran) {
        const { error } = await supabase
          .from("iuran_dana_duka")
          .update({
            jumlah: 10000,
            status_pembayaran: "Lunas",
            tanggal_bayar: tanggalHariIni,
          })
          .eq("id", pembayaran.id);

        if (error) {
          throw error;
        }
      } else {
        // ---------------------------------------------------
        // Jika record belum ada sama sekali
        // ---------------------------------------------------

        const { error } = await supabase.from("iuran_dana_duka").insert({
          id: crypto.randomUUID(),
          warga_id: kepalaKeluargaTerpilih.id,
          kk: kepalaKeluargaTerpilih.kk,
          nama_kepala_keluarga: kepalaKeluargaTerpilih.nama,
          bulan: item.nilai,
          jumlah: 10000,
          status_pembayaran: "Lunas",
          tanggal_bayar: tanggalHariIni,
          keterangan: null,
        });

        if (error) {
          throw error;
        }
      }

      await loadRiwayatIuran(kepalaKeluargaTerpilih.id);

      setPesan(`Pembayaran ${item.nama} berhasil diubah menjadi Lunas.`);

      setTipePesan("sukses");
    } catch (error) {
      console.error("GAGAL MENGUBAH STATUS IURAN:", error);

      setPesan(
        "Gagal mengubah status iuran.\n\n" +
          (error.message || "Terjadi kesalahan."),
      );

      setTipePesan("error");
    } finally {
      setSedangBayar("");
    }
  }

  // =========================================================
  // BACKUP SEMUA DATA
  // =========================================================

  async function handleBackup() {
    try {
      setSedangBackup(true);
      setPesan("");
      setTipePesan("");

      console.log("MEMULAI BACKUP SEMUA DATA SUPABASE...");

      // -----------------------------------------------------
      // WARGA
      // -----------------------------------------------------

      const { data: dataWarga, error: errorWarga } = await supabase
        .from("warga")
        .select("*");

      if (errorWarga) {
        throw new Error("Gagal mengambil data warga: " + errorWarga.message);
      }

      // -----------------------------------------------------
      // TEMPAT KOST
      // -----------------------------------------------------

      const { data: dataTempatKost, error: errorTempatKost } = await supabase
        .from("tempat_kost")
        .select("*");

      if (errorTempatKost) {
        throw new Error(
          "Gagal mengambil data tempat kost: " + errorTempatKost.message,
        );
      }

      // -----------------------------------------------------
      // SURAT PENGANTAR
      // -----------------------------------------------------

      const { data: dataSurat, error: errorSurat } = await supabase
        .from("surat_pengantar")
        .select("*");

      if (errorSurat) {
        throw new Error(
          "Gagal mengambil data surat pengantar: " + errorSurat.message,
        );
      }

      // -----------------------------------------------------
      // DISTRIBUSI KOST BULANAN
      // -----------------------------------------------------

      const { data: dataDistribusi, error: errorDistribusi } = await supabase
        .from("distribusi_kost_bulanan")
        .select("*");

      if (errorDistribusi) {
        throw new Error(
          "Gagal mengambil data distribusi kost bulanan: " +
            errorDistribusi.message,
        );
      }

      // -----------------------------------------------------
      // IURAN DANA DUKA
      // -----------------------------------------------------

      const { data: dataIuranDanaDuka, error: errorIuranDanaDuka } =
        await supabase.from("iuran_dana_duka").select("*");

      if (errorIuranDanaDuka) {
        throw new Error(
          "Gagal mengambil data iuran dana duka: " + errorIuranDanaDuka.message,
        );
      }

      // -----------------------------------------------------
      // SANTUNAN DANA DUKA
      // -----------------------------------------------------

      const { data: dataSantunanDanaDuka, error: errorSantunanDanaDuka } =
        await supabase.from("santunan_dana_duka").select("*");

      if (errorSantunanDanaDuka) {
        throw new Error(
          "Gagal mengambil data santunan dana duka: " +
            errorSantunanDanaDuka.message,
        );
      }

      // -----------------------------------------------------
      // SALDO AWAL DANA DUKA
      // -----------------------------------------------------

      const { data: dataSaldoDanaDuka, error: errorSaldoDanaDuka } =
        await supabase.from("saldo_dana_duka_tahunan").select("*");

      if (errorSaldoDanaDuka) {
        throw new Error(
          "Gagal mengambil data saldo dana duka tahunan: " +
            errorSaldoDanaDuka.message,
        );
      }

      // -----------------------------------------------------
      // BENTUK DATA BACKUP
      // -----------------------------------------------------

      const backupData = {
        aplikasi: "Management RT03 / RW07",
        versiBackup: "1.1",
        tanggalBackup: new Date().toISOString(),

        data: {
          warga: dataWarga || [],
          tempat_kost: dataTempatKost || [],
          surat_pengantar: dataSurat || [],
          distribusi_kost_bulanan: dataDistribusi || [],

          iuran_dana_duka: dataIuranDanaDuka || [],

          santunan_dana_duka: dataSantunanDanaDuka || [],

          saldo_dana_duka_tahunan: dataSaldoDanaDuka || [],
        },

        jumlahData: {
          warga: (dataWarga || []).length,

          tempat_kost: (dataTempatKost || []).length,

          surat_pengantar: (dataSurat || []).length,

          distribusi_kost_bulanan: (dataDistribusi || []).length,

          iuran_dana_duka: (dataIuranDanaDuka || []).length,

          santunan_dana_duka: (dataSantunanDanaDuka || []).length,

          saldo_dana_duka_tahunan: (dataSaldoDanaDuka || []).length,
        },
      };

      // -----------------------------------------------------
      // BUAT FILE JSON
      // -----------------------------------------------------

      const isiFile = JSON.stringify(backupData, null, 2);

      const blob = new Blob([isiFile], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const tanggal = new Date().toISOString().slice(0, 10);

      link.download = `backup-rt03-${tanggal}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log("BACKUP BERHASIL:", backupData.jumlahData);

      setPesan(
        `Backup berhasil dibuat.\n\n` +
          `Warga: ${backupData.jumlahData.warga}\n` +
          `Tempat Kost: ${backupData.jumlahData.tempat_kost}\n` +
          `Surat: ${backupData.jumlahData.surat_pengantar}\n` +
          `Distribusi: ${backupData.jumlahData.distribusi_kost_bulanan}\n` +
          `Iuran Dana Duka: ${backupData.jumlahData.iuran_dana_duka}\n` +
          `Santunan Dana Duka: ${backupData.jumlahData.santunan_dana_duka}\n` +
          `Saldo Tahunan: ${backupData.jumlahData.saldo_dana_duka_tahunan}`,
      );

      setTipePesan("sukses");
    } catch (error) {
      console.error("GAGAL BACKUP DATA:", error);

      setPesan("Backup gagal.\n\n" + (error.message || "Terjadi kesalahan."));

      setTipePesan("error");
    } finally {
      setSedangBackup(false);
    }
  }

  // =========================================================
  // PILIH FILE RESTORE
  // =========================================================

  function handlePilihFileRestore() {
    setPesan("");
    setTipePesan("");

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  // =========================================================
  // RESTORE DATA
  // =========================================================

  async function handleRestore(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setSedangRestore(true);
      setPesan("");
      setTipePesan("");

      console.log("MEMBACA FILE RESTORE:", file.name);

      const isiFile = await file.text();

      let backupData;

      try {
        backupData = JSON.parse(isiFile);
      } catch {
        throw new Error("File backup bukan file JSON yang valid.");
      }

      // -----------------------------------------------------
      // VALIDASI DASAR FILE
      // -----------------------------------------------------

      if (
        !backupData ||
        !backupData.data ||
        typeof backupData.data !== "object"
      ) {
        throw new Error(
          "Format file backup tidak sesuai dengan backup aplikasi RT03.",
        );
      }

      const {
        warga = [],
        tempat_kost = [],
        surat_pengantar = [],
        distribusi_kost_bulanan = [],

        iuran_dana_duka = [],
        santunan_dana_duka = [],
        saldo_dana_duka_tahunan = [],
      } = backupData.data;

      if (
        !Array.isArray(warga) ||
        !Array.isArray(tempat_kost) ||
        !Array.isArray(surat_pengantar) ||
        !Array.isArray(distribusi_kost_bulanan) ||
        !Array.isArray(iuran_dana_duka) ||
        !Array.isArray(santunan_dana_duka) ||
        !Array.isArray(saldo_dana_duka_tahunan)
      ) {
        throw new Error("Struktur data dalam file backup tidak valid.");
      }

      // -----------------------------------------------------
      // KONFIRMASI
      // -----------------------------------------------------

      const yakin = window.confirm(
        "FILE BACKUP DITEMUKAN\n\n" +
          `Warga: ${warga.length}\n` +
          `Tempat Kost: ${tempat_kost.length}\n` +
          `Surat Pengantar: ${surat_pengantar.length}\n` +
          `Distribusi Kost Bulanan: ${distribusi_kost_bulanan.length}\n` +
          `Iuran Dana Duka: ${iuran_dana_duka.length}\n` +
          `Santunan Dana Duka: ${santunan_dana_duka.length}\n` +
          `Saldo Dana Duka Tahunan: ${saldo_dana_duka_tahunan.length}\n\n` +
          "Data akan dipulihkan ke Supabase berdasarkan ID.\n" +
          "Data dengan ID yang sama akan diperbarui.\n\n" +
          "Apakah Anda yakin ingin melanjutkan restore?",
      );

      if (!yakin) {
        console.log("RESTORE DIBATALKAN OLEH PENGGUNA.");
        return;
      }

      console.log("MEMULAI RESTORE DATA...");

      // -----------------------------------------------------
      // RESTORE WARGA
      // -----------------------------------------------------

      if (warga.length > 0) {
        const { error } = await supabase.from("warga").upsert(warga, {
          onConflict: "id",
        });

        if (error) {
          throw new Error("Gagal restore data warga: " + error.message);
        }

        console.log(`BERHASIL RESTORE ${warga.length} DATA WARGA.`);
      }

      // -----------------------------------------------------
      // RESTORE TEMPAT KOST
      // -----------------------------------------------------

      if (tempat_kost.length > 0) {
        const { error } = await supabase
          .from("tempat_kost")
          .upsert(tempat_kost, {
            onConflict: "id",
          });

        if (error) {
          throw new Error("Gagal restore tempat kost: " + error.message);
        }

        console.log(`BERHASIL RESTORE ${tempat_kost.length} TEMPAT KOST.`);
      }

      // -----------------------------------------------------
      // RESTORE SURAT PENGANTAR
      // -----------------------------------------------------

      if (surat_pengantar.length > 0) {
        const { error } = await supabase
          .from("surat_pengantar")
          .upsert(surat_pengantar, {
            onConflict: "id",
          });

        if (error) {
          throw new Error("Gagal restore surat pengantar: " + error.message);
        }

        console.log(`BERHASIL RESTORE ${surat_pengantar.length} SURAT.`);
      }

      // -----------------------------------------------------
      // RESTORE DISTRIBUSI KOST
      // -----------------------------------------------------

      if (distribusi_kost_bulanan.length > 0) {
        const { error } = await supabase
          .from("distribusi_kost_bulanan")
          .upsert(distribusi_kost_bulanan, {
            onConflict: "id",
          });

        if (error) {
          throw new Error(
            "Gagal restore distribusi kost bulanan: " + error.message,
          );
        }

        console.log(
          `BERHASIL RESTORE ${distribusi_kost_bulanan.length} DATA DISTRIBUSI.`,
        );
      }

      // -----------------------------------------------------
      // RESTORE IURAN DANA DUKA
      // -----------------------------------------------------

      if (iuran_dana_duka.length > 0) {
        const { error } = await supabase
          .from("iuran_dana_duka")
          .upsert(iuran_dana_duka, {
            onConflict: "id",
          });

        if (error) {
          throw new Error("Gagal restore iuran dana duka: " + error.message);
        }

        console.log(
          `BERHASIL RESTORE ${iuran_dana_duka.length} DATA IURAN DANA DUKA.`,
        );
      }

      // -----------------------------------------------------
      // RESTORE SANTUNAN DANA DUKA
      // -----------------------------------------------------

      if (santunan_dana_duka.length > 0) {
        const { error } = await supabase
          .from("santunan_dana_duka")
          .upsert(santunan_dana_duka, {
            onConflict: "id",
          });

        if (error) {
          throw new Error("Gagal restore santunan dana duka: " + error.message);
        }

        console.log(
          `BERHASIL RESTORE ${santunan_dana_duka.length} DATA SANTUNAN DANA DUKA.`,
        );
      }

      // -----------------------------------------------------
      // RESTORE SALDO DANA DUKA TAHUNAN
      // -----------------------------------------------------

      if (saldo_dana_duka_tahunan.length > 0) {
        const { error } = await supabase
          .from("saldo_dana_duka_tahunan")
          .upsert(saldo_dana_duka_tahunan, {
            onConflict: "tahun",
          });

        if (error) {
          throw new Error(
            "Gagal restore saldo dana duka tahunan: " + error.message,
          );
        }

        console.log(
          `BERHASIL RESTORE ${saldo_dana_duka_tahunan.length} DATA SALDO TAHUNAN.`,
        );
      }

      console.log("RESTORE SEMUA DATA BERHASIL.");

      setPesan(
        "Restore berhasil.\n\n" +
          `Warga: ${warga.length}\n` +
          `Tempat Kost: ${tempat_kost.length}\n` +
          `Surat Pengantar: ${surat_pengantar.length}\n` +
          `Distribusi Kost Bulanan: ${distribusi_kost_bulanan.length}\n` +
          `Iuran Dana Duka: ${iuran_dana_duka.length}\n` +
          `Santunan Dana Duka: ${santunan_dana_duka.length}\n` +
          `Saldo Dana Duka Tahunan: ${saldo_dana_duka_tahunan.length}`,
      );

      setTipePesan("sukses");

      // Refresh data kepala keluarga
      await loadKepalaKeluarga();

      if (kepalaKeluargaId) {
        await loadRiwayatIuran(kepalaKeluargaId);
      }
    } catch (error) {
      console.error("GAGAL RESTORE DATA:", error);

      setPesan("Restore gagal.\n\n" + (error.message || "Terjadi kesalahan."));

      setTipePesan("error");
    } finally {
      setSedangRestore(false);

      // Reset input supaya file yang sama
      // bisa dipilih kembali
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // =========================================================
  // KEPALA KELUARGA YANG DIPILIH
  // =========================================================

  const kepalaKeluargaTerpilih = kepalaKeluarga.find(
    (item) => item.id === kepalaKeluargaId,
  );

  const kepalaKeluargaPeserta = kepalaKeluarga.filter(
    (item) => statusPesertaDanaDuka[item.id] === true,
  );

  

  const jumlahPesertaDanaDuka = kepalaKeluarga.filter(
    (item) => statusPesertaDanaDuka[item.id] === true,
  ).length;

  // =========================================================
  // STATISTIK RIWAYAT
  // =========================================================

  const jumlahSudahBayar = riwayatIuran.filter(
    (item) => item.sudahBayar,
  ).length;

  const jumlahBelumBayar = riwayatIuran.length - jumlahSudahBayar;

  const totalSudahDibayar = riwayatIuran
    .filter((item) => item.sudahBayar)
    .reduce((total, item) => total + Number(item.pembayaran?.jumlah || 0), 0);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pengaturan-page">
      <div className="page-header">
        <div>
          <h2>Pengaturan</h2>

          <p>Pengaturan dan pemeliharaan data aplikasi RT 03 / RW 07</p>
        </div>
      </div>

      {/* =====================================================
          BACKUP & RESTORE
      ====================================================== */}

      <div className="pengaturan-section">
        <h3>Backup & Restore Data</h3>

        <p>
          Backup seluruh data aplikasi RT 03 / RW 07 dari Supabase ke dalam satu
          file.
        </p>

        <div className="backup-restore-actions">
          <button
            type="button"
            onClick={handleBackup}
            disabled={sedangBackup || sedangRestore}
          >
            {sedangBackup ? "Sedang Membuat Backup..." : "Backup Semua Data"}
          </button>

          <button
            type="button"
            onClick={handlePilihFileRestore}
            disabled={sedangBackup || sedangRestore}
          >
            {sedangRestore ? "Sedang Restore..." : "Restore Data"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleRestore}
            style={{
              display: "none",
            }}
          />
        </div>
      </div>

      <section className="pengaturan-section peserta-dana-duka-section">
        <div className="section-header">
          <div>
            <h2>Peserta Iuran Dana Duka</h2>

            <p>
              Tentukan Kepala Keluarga yang benar-benar mengikuti program Dana
              Duka.
            </p>
          </div>

          <div className="peserta-dana-duka-jumlah">
            Peserta:{" "}
            <strong>
              {jumlahPesertaDanaDuka} dari {kepalaKeluarga.length}
            </strong>
          </div>
        </div>

        {loadingKepalaKeluarga ? (
          <div className="loading-peserta-dana-duka">
            Memuat data Kepala Keluarga...
          </div>
        ) : kepalaKeluarga.length === 0 ? (
          <div className="empty-peserta-dana-duka">
            Tidak ada data Kepala Keluarga.
          </div>
        ) : (
          <div
            className="daftar-peserta-dana-duka"
            style={{
              gridTemplateRows: `repeat(${Math.ceil(
                kepalaKeluarga.length / 3,
              )}, auto)`,
            }}
          >
            {kepalaKeluarga.map((item, index) => {
              const ikut = statusPesertaDanaDuka[item.id] === true;

              return (
                <label
                  key={item.id}
                  className={`peserta-dana-duka-item ${ikut ? "aktif" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={ikut}
                    onChange={() => handleTogglePesertaDanaDuka(item.id)}
                  />

                  <span className="peserta-dana-duka-no">{index + 1}.</span>

                  <span className="peserta-dana-duka-info">
                    <strong>{item.nama}</strong>

                    <small>KK: {item.kk || "-"}</small>
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="peserta-dana-duka-catatan">
          <strong>Catatan:</strong> perubahan pilihan belum tersimpan ke
          database sampai tombol <strong>Simpan Peserta</strong> digunakan.
        </div>
      </section>

      <div className="peserta-dana-duka-footer">
        <button
          type="button"
          className="btn-simpan-peserta-dana-duka"
          onClick={handleSimpanPesertaDanaDuka}
          disabled={menyimpanPesertaDanaDuka || loadingKepalaKeluarga}
        >
          {menyimpanPesertaDanaDuka
            ? "Menyimpan..."
            : "Simpan Peserta Dana Duka"}
        </button>
      </div>

      {/* =====================================================
          PEMBAYARAN IURAN DANA DUKA
      ====================================================== */}

      <div className="pengaturan-section dana-duka-pengaturan">
        <div className="dana-duka-pengaturan-header">
          <div>
            <h3>Pembayaran Iuran Dana Duka</h3>

            <p>
              Pencatatan pembayaran iuran Kepala Keluarga sebesar Rp10.000 per
              bulan.
            </p>
          </div>

          <div className="dana-duka-tarif">
            <span>Tarif Iuran</span>

            <strong>Rp10.000 / bulan</strong>
          </div>
        </div>

        {/* PILIH KEPALA KELUARGA */}

        <div className="dana-duka-pilih-kk">
          <label htmlFor="pilih-kepala-keluarga">Kepala Keluarga</label>

          <select
            id="pilih-kepala-keluarga"
            value={kepalaKeluargaId}
            onChange={(event) => setKepalaKeluargaId(event.target.value)}
            disabled={loadingKepalaKeluarga || sedangBayar !== ""}
          >
            <option value="">
              {loadingKepalaKeluarga
                ? "Memuat Kepala Keluarga..."
                : "-- Pilih Kepala Keluarga --"}
            </option>

            {kepalaKeluargaPeserta.map((warga) => (
              <option key={warga.id} value={warga.id}>
                {warga.nama} — KK: {warga.kk}
              </option>
            ))}
          </select>
        </div>

        {/* INFORMASI KK */}

        {kepalaKeluargaTerpilih && (
          <div className="dana-duka-info-kk">
            <div>
              <span>Nama Kepala Keluarga</span>

              <strong>{kepalaKeluargaTerpilih.nama}</strong>
            </div>

            <div>
              <span>Nomor KK</span>

              <strong>{kepalaKeluargaTerpilih.kk}</strong>
            </div>

            <div>
              <span>Sudah Bayar</span>

              <strong>{jumlahSudahBayar} bulan</strong>
            </div>

            <div>
              <span>Belum Bayar</span>

              <strong>{jumlahBelumBayar} bulan</strong>
            </div>

            <div>
              <span>Total Dibayar</span>

              <strong>{formatRupiah(totalSudahDibayar)}</strong>
            </div>
          </div>
        )}

        {/* RIWAYAT */}

        {!kepalaKeluargaId ? (
          <div className="dana-duka-empty">
            <div className="dana-duka-empty-icon">💰</div>

            <strong>Silakan pilih Kepala Keluarga</strong>

            <span>
              Setelah dipilih, riwayat iuran sejak November 2024 akan
              ditampilkan di sini.
            </span>
          </div>
        ) : loadingRiwayatIuran ? (
          <div className="dana-duka-loading">Memuat riwayat iuran...</div>
        ) : (
          <div className="dana-duka-riwayat">
            <div className="dana-duka-riwayat-header">
              <div>
                <h4>Riwayat Pembayaran</h4>

                <span>
                  November 2024 sampai{" "}
                  {formatBulan(tahunSekarang, bulanSekarang)}
                </span>
              </div>
            </div>

            <div className="dana-duka-table-wrapper">
              <table className="dana-duka-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Periode</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                    <th>Tanggal Bayar</th>
                    <th>Keterangan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {riwayatIuran.map((item, index) => (
                    <tr key={item.nilai}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>{item.nama}</strong>
                      </td>

                      <td>
                        {item.sudahBayar
                          ? formatRupiah(item.pembayaran?.jumlah)
                          : formatRupiah(10000)}
                      </td>

                      <td>
                        {item.sudahBayar ? (
                          <button
                            type="button"
                            className="btn-ubah-status-iuran"
                            onClick={() => handleUbahStatusIuran(item)}
                            disabled={sedangBayar !== ""}
                          >
                            {sedangBayar === item.nilai
                              ? "Menyimpan..."
                              : "Ubah ke Belum Bayar"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-bayar-iuran"
                            onClick={() => handleUbahStatusIuran(item)}
                            disabled={sedangBayar !== ""}
                          >
                            {sedangBayar === item.nilai
                              ? "Menyimpan..."
                              : "Bayar Rp10.000"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          PESAN
      ====================================================== */}

      {pesan && (
        <div
          className={`backup-restore-message ${
            tipePesan === "sukses" ? "sukses" : "error"
          }`}
        >
          {pesan}
        </div>
      )}
    </div>
  );
}

export default Pengaturan;
