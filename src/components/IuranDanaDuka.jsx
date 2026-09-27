import { useEffect, useState } from "react";
import "./IuranDanaDuka.css";
import { supabase } from "../lib/supabase";

function IuranDanaDuka() {
  const [kepalaKeluarga, setKepalaKeluarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bulanIuran, setBulanIuran] = useState(() => {
    const sekarang = new Date();

    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");

    return `${tahun}-${bulan}`;
  });

  const [dataIuran, setDataIuran] = useState([]);
  const [loadingIuran, setLoadingIuran] = useState(false);

  const [wargaBayar, setWargaBayar] = useState(null);
  const [tanggalBayar, setTanggalBayar] = useState("");
  const [keteranganBayar, setKeteranganBayar] = useState("");
  const [menyimpanPembayaran, setMenyimpanPembayaran] = useState(false);

  const [pembayaranEdit, setPembayaranEdit] = useState(null);
  const [pembayaranDetail, setPembayaranDetail] = useState(null);
  const [statusEdit, setStatusEdit] = useState("Lunas");
  const [pencarian, setPencarian] = useState("");

  const [dataSantunan, setDataSantunan] = useState([]);
  const [loadingSantunan, setLoadingSantunan] = useState(false);

  const [wargaMeninggal, setWargaMeninggal] = useState([]);
  const [dataWargaSantunan, setDataWargaSantunan] = useState([]);
  const [keluargaPenerima, setKeluargaPenerima] = useState([]);

  const [formSantunan, setFormSantunan] = useState({
    tanggal_santunan: "",
    warga_meninggal_id: "",
    nama_almarhum: "",
    nama_penerima: "",
    hubungan_penerima: "",
    jumlah: "",
    keterangan: "",
  });

  const [menyimpanSantunan, setMenyimpanSantunan] = useState(false);
  const [showFormSantunan, setShowFormSantunan] = useState(false);
  const [editSantunanId, setEditSantunanId] = useState(null);

  const [tahunRekap, setTahunRekap] = useState(() => {
    return new Date().getFullYear();
  });

  const [rekapIuran, setRekapIuran] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const [saldoAwalTahun, setSaldoAwalTahun] = useState(0);
  const [loadingSaldoAwal, setLoadingSaldoAwal] = useState(false);
  const [saldoAwalInput, setSaldoAwalInput] = useState("");
  const [menyimpanSaldoAwal, setMenyimpanSaldoAwal] = useState(false);

  const jumlahSudahBayar = dataIuran.filter(
    (item) => item.status_pembayaran === "Lunas",
  ).length;

  const jumlahBelumBayar = kepalaKeluarga.length - jumlahSudahBayar;

  const totalDiterima = dataIuran
    .filter((item) => item.status_pembayaran === "Lunas")
    .reduce((total, item) => total + Number(item.jumlah || 0), 0);

  useEffect(() => {
    loadKepalaKeluarga();
  }, []);

  async function loadKepalaKeluarga() {
    try {
      setLoading(true);
      setError("");

      console.log("MEMUAT DATA KEPALA KELUARGA UNTUK IURAN DANA DUKA...");

      const { data, error } = await supabase
        .from("warga")
        .select("id, nama, kk")
        .eq("status", "Aktif")
        .eq("status_kependudukan", "Warga RT03")
        .eq("status_keluarga", "Kepala Keluarga")
        .order("nama", { ascending: true });

      if (error) {
        console.error("GAGAL MEMUAT KEPALA KELUARGA:", error);
        throw error;
      }

      const dataBersih = (data || []).map((item) => ({
        id: item.id,
        nama: item.nama || "-",
        kk: item.kk || "-",
      }));

      console.log(
        `BERHASIL MEMUAT ${dataBersih.length} KEPALA KELUARGA DARI SUPABASE.`,
      );

      setKepalaKeluarga(dataBersih);
    } catch (err) {
      console.error("ERROR IURAN DANA DUKA:", err);
      setError("Data Kepala Keluarga gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  async function loadIuranBulanan(bulan) {
    try {
      setLoadingIuran(true);

      console.log(
        `MEMUAT DATA IURAN DANA DUKA BULAN ${bulan} DARI SUPABASE...`,
      );

      const { data, error } = await supabase
        .from("iuran_dana_duka")
        .select(
          "id, warga_id, kk, nama_kepala_keluarga, bulan, jumlah, status_pembayaran, tanggal_bayar, keterangan",
        )
        .eq("bulan", bulan);

      if (error) {
        console.error("GAGAL MEMUAT DATA IURAN:", error);
        throw error;
      }

      console.log(
        `BERHASIL MEMUAT ${data?.length || 0} DATA IURAN BULAN ${bulan}.`,
      );

      setDataIuran(data || []);
    } catch (err) {
      console.error("ERROR MEMUAT IURAN DANA DUKA:", err);
      setDataIuran([]);
    } finally {
      setLoadingIuran(false);
    }
  }

  async function loadRekapIuran(tahun) {
  try {
    setLoadingRekap(true);

    console.log(`MEMUAT REKAP IURAN DANA DUKA TAHUN ${tahun}...`);

    const awalTahun = `${tahun}-01`;
    const akhirTahun = `${tahun}-12`;

    let semuaDataIuran = [];
    let halaman = 0;
    const ukuranHalaman = 1000;

    while (true) {
      const dari = halaman * ukuranHalaman;
      const sampai = dari + ukuranHalaman - 1;

      const { data: dataHalaman, error } = await supabase
        .from("iuran_dana_duka")
        .select(
          "id, warga_id, kk, nama_kepala_keluarga, bulan, jumlah, status_pembayaran, tanggal_bayar",
        )
        .gte("bulan", awalTahun)
        .lte("bulan", akhirTahun)
        .eq("status_pembayaran", "Lunas")
        .order("bulan", { ascending: true })
        .range(dari, sampai);

      if (error) {
        throw error;
      }

      console.log(
        `REKAP IURAN HALAMAN ${halaman + 1}:`,
        dataHalaman?.length || 0,
        "DATA",
      );

      semuaDataIuran = [
        ...semuaDataIuran,
        ...(dataHalaman || []),
      ];

      if (!dataHalaman || dataHalaman.length < ukuranHalaman) {
        break;
      }

      halaman++;
    }

    console.log(
      "TOTAL DATA IURAN UNTUK REKAP:",
      semuaDataIuran.length,
    );

    const dataBulan = Array.from({ length: 12 }, (_, index) => {
      const nomorBulan = String(index + 1).padStart(2, "0");
      const bulan = `${tahun}-${nomorBulan}`;

      const dataBulanIni = semuaDataIuran.filter(
        (item) => item.bulan === bulan,
      );

      const jumlahKK = dataBulanIni.length;

      const total = dataBulanIni.reduce(
        (sum, item) => sum + Number(item.jumlah || 0),
        0,
      );

      return {
        bulan,
        nomorBulan: index + 1,
        namaBulan: new Date(
          tahun,
          index,
          1,
        ).toLocaleDateString("id-ID", {
          month: "long",
        }),
        jumlahKK,
        total,
      };
    });

    console.log("REKAP IURAN:", dataBulan);

    setRekapIuran(dataBulan);
  } catch (err) {
    console.error(
      `GAGAL MEMUAT REKAP IURAN TAHUN ${tahun}:`,
      err,
    );

    setRekapIuran([]);
  } finally {
    setLoadingRekap(false);
  }
}

  async function loadSaldoAwalTahun(tahun) {
    console.log("=== DEBUG SALDO AWAL ===");
    console.log("TAHUN YANG DIMINTA:", tahun);
    console.log("SALDO AWAL SEBELUM PROSES:", saldoAwalTahun);

    try {
      setLoadingSaldoAwal(true);

      console.log("MEMUAT SALDO AWAL DANA DUKA TAHUN:", tahun);

      // =====================================================
      // TAHUN DASAR 2024
      // =====================================================
      if (Number(tahun) === 2024) {
        const saldoAwal2024 = 0;

        console.log("TAHUN DASAR 2024 - SALDO AWAL:", saldoAwal2024);

        setSaldoAwalTahun(saldoAwal2024);
        setSaldoAwalInput(String(saldoAwal2024));

        return;
      }

      // =====================================================
      // TAHUN SETELAH 2024
      // SALDO AWAL = SALDO AKHIR TAHUN SEBELUMNYA
      // =====================================================
      const tahunSebelumnya = Number(tahun) - 1;

      console.log(`MENGAMBIL SALDO AKHIR TAHUN ${tahunSebelumnya}...`);

      const saldoAkhirSebelumnya = await hitungSaldoAkhirTahun(tahunSebelumnya);

      console.log(`SALDO AKHIR ${tahunSebelumnya}:`, saldoAkhirSebelumnya);

      setSaldoAwalTahun(saldoAkhirSebelumnya);

      setSaldoAwalInput(String(saldoAkhirSebelumnya));

      console.log(`SALDO AWAL ${tahun} OTOMATIS:`, saldoAkhirSebelumnya);
    } catch (err) {
      console.error("ERROR MEMUAT SALDO AWAL DANA DUKA:", err);

      setSaldoAwalTahun(0);
      setSaldoAwalInput("");
    } finally {
      setLoadingSaldoAwal(false);
    }
  }

  async function hitungSaldoAkhirTahun(tahun) {
    try {
      console.log(`MENGHITUNG SALDO AKHIR TAHUN ${tahun}...`);

      // ==========================================
      // 1. TENTUKAN SALDO AWAL
      // ==========================================

      let saldoAwal = 0;

      // Tahun dasar 2024
      if (Number(tahun) === 2024) {
        saldoAwal = 0;

        console.log("TAHUN DASAR 2024 - SALDO AWAL:", saldoAwal);
      } else {
        // Tahun berikutnya mengambil saldo akhir
        // dari tahun sebelumnya
        const tahunSebelumnya = Number(tahun) - 1;

        console.log(`MENGAMBIL SALDO AKHIR TAHUN ${tahunSebelumnya}...`);

        saldoAwal = await hitungSaldoAkhirTahun(tahunSebelumnya);

        console.log(`SALDO AWAL ${tahun} OTOMATIS:`, saldoAwal);
      }

      // ==========================================
      // 2. AMBIL SELURUH IURAN TAHUN TERSEBUT
      // ==========================================

      const awalTahun = `${tahun}-01`;
      const akhirTahun = `${tahun}-12`;

      let semuaDataIuran = [];
      let halaman = 0;
      const ukuranHalaman = 1000;

      while (true) {
        const dari = halaman * ukuranHalaman;
        const sampai = dari + ukuranHalaman - 1;

        const { data: dataHalaman, error: errorIuran } = await supabase
          .from("iuran_dana_duka")
          .select("jumlah, status_pembayaran, bulan")
          .gte("bulan", awalTahun)
          .lte("bulan", akhirTahun)
          .eq("status_pembayaran", "Lunas")
          .range(dari, sampai);

        if (errorIuran) {
          throw errorIuran;
        }

        console.log(
          `HALAMAN IURAN ${halaman + 1}:`,
          dataHalaman?.length || 0,
          "DATA",
        );

        semuaDataIuran = [...semuaDataIuran, ...(dataHalaman || [])];

        if (!dataHalaman || dataHalaman.length < ukuranHalaman) {
          break;
        }

        halaman++;
      }

      const dataIuran = semuaDataIuran;

      console.log("TOTAL SELURUH DATA IURAN YANG DIBACA:", dataIuran.length);

      const totalIuran = (dataIuran || []).reduce(
        (sum, item) => sum + Number(item.jumlah || 0),
        0,
      );

      console.log(
        "JUMLAH BARIS IURAN YANG DIBACA FUNGSI:",
        (dataIuran || []).length,
      );

      console.log("DATA IURAN YANG DIBACA FUNGSI:", dataIuran);

      console.log("TOTAL IURAN HASIL FUNGSI:", totalIuran);

      // ==========================================
      // 3. AMBIL SELURUH SANTUNAN TAHUN TERSEBUT
      // ==========================================

      const { data: dataSantunan, error: errorSantunan } = await supabase
        .from("santunan_dana_duka")
        .select("jumlah")
        .eq("tahun", tahun);

      if (errorSantunan) {
        throw errorSantunan;
      }

      const totalSantunan = (dataSantunan || []).reduce(
        (sum, item) => sum + Number(item.jumlah || 0),
        0,
      );

      // ==========================================
      // 4. HITUNG SALDO AKHIR
      // ==========================================

      const saldoAkhir = saldoAwal + totalIuran - totalSantunan;

      console.log("===== CEK PERHITUNGAN SALDO =====");
      console.log("TAHUN:", tahun);
      console.log("SALDO AWAL YANG DIPAKAI:", saldoAwal);
      console.log("TOTAL IURAN YANG DIPAKAI:", totalIuran);
      console.log("TOTAL SANTUNAN YANG DIPAKAI:", totalSantunan);
      console.log("HASIL SALDO AKHIR:", saldoAkhir);
      console.log("=================================");

      // ==========================================
      // 5. DEBUG
      // ==========================================

      console.log("===== DETAIL SALDO DANA DUKA =====");

      console.log("TAHUN:", tahun);
      console.log("SALDO AWAL:", saldoAwal);
      console.log("TOTAL IURAN:", totalIuran);
      console.log("TOTAL SANTUNAN:", totalSantunan);
      console.log("SALDO AKHIR:", saldoAkhir);

      console.log("===================================");

      return saldoAkhir;
    } catch (err) {
      console.error(`GAGAL MENGHITUNG SALDO AKHIR ${tahun}:`, err);

      return 0;
    }
  }

  async function simpanSaldoAwalTahun() {
    const nilaiSaldo = Number(String(saldoAwalInput).replace(/\D/g, ""));

    if (nilaiSaldo < 0) {
      alert("Saldo awal tidak boleh negatif.");
      return;
    }

    try {
      setMenyimpanSaldoAwal(true);

      const dataSaldo = {
        tahun: tahunRekap,
        saldo_awal: nilaiSaldo,
      };

      console.log("MENYIMPAN SALDO AWAL TAHUN:", dataSaldo);

      const { error } = await supabase
        .from("saldo_dana_duka_tahunan")
        .upsert(dataSaldo, {
          onConflict: "tahun",
        });

      if (error) {
        console.error("GAGAL MENYIMPAN SALDO AWAL:", error);
        throw error;
      }

      setSaldoAwalTahun(nilaiSaldo);
      setSaldoAwalInput(String(nilaiSaldo));

      console.log("SALDO AWAL TAHUN BERHASIL DISIMPAN.");

      alert(`Saldo awal tahun ${tahunRekap} berhasil disimpan.`);
    } catch (err) {
      console.error("ERROR SIMPAN SALDO AWAL:", err);

      alert("Saldo awal tahun gagal disimpan.");
    } finally {
      setMenyimpanSaldoAwal(false);
    }
  }

  async function loadSantunan(tahun) {
  try {
    setLoadingSantunan(true);

    console.log(
      `MEMUAT DATA SANTUNAN DANA DUKA TAHUN ${tahun} DARI SUPABASE...`,
    );

    const { data, error } = await supabase
      .from("santunan_dana_duka")
      .select(
        "id, tanggal_santunan, tahun, nama_almarhum, warga_meninggal_id, nama_penerima, hubungan_penerima, jumlah, keterangan",
      )
      .eq("tahun", tahun)
      .order("tanggal_santunan", { ascending: true })
      .range(0, 4999);

    if (error) {
      console.error("GAGAL MEMUAT DATA SANTUNAN:", error);
      throw error;
    }

    console.log(
      `BERHASIL MEMUAT ${data?.length || 0} DATA SANTUNAN TAHUN ${tahun}.`,
    );

    console.log("DATA SANTUNAN:", data);

    setDataSantunan(data || []);
  } catch (err) {
    console.error("ERROR MEMUAT SANTUNAN DANA DUKA:", err);
    setDataSantunan([]);
  } finally {
    setLoadingSantunan(false);
  }
}

  async function loadWargaUntukSantunan() {
    try {
      console.log("MEMUAT DATA WARGA UNTUK SANTUNAN...");

      const { data, error } = await supabase
        .from("warga")
        .select("*")
        .order("nama", { ascending: true });

      if (error) {
        console.error("GAGAL MEMUAT DATA WARGA UNTUK SANTUNAN:", error);
        throw error;
      }

      console.log("DATA WARGA UNTUK SANTUNAN:", data);

      setDataWargaSantunan(data || []);

      const dataMeninggal = (data || []).filter(
        (item) => item.status === "Meninggal",
      );

      console.log(
        `BERHASIL MEMUAT ${dataMeninggal.length} DATA WARGA MENINGGAL.`,
      );

      setWargaMeninggal(dataMeninggal);
    } catch (err) {
      console.error("ERROR MEMUAT DATA WARGA UNTUK SANTUNAN:", err);

      setWargaMeninggal([]);
    }
  }

  async function simpanSantunan() {
    if (!formSantunan.tanggal_santunan) {
      alert("Tanggal santunan wajib diisi.");
      return;
    }

    if (!formSantunan.warga_meninggal_id) {
      alert("Nama almarhum wajib dipilih.");
      return;
    }

    if (!formSantunan.nama_almarhum.trim()) {
      alert("Nama almarhum wajib diisi.");
      return;
    }

    if (!formSantunan.nama_penerima.trim()) {
      alert("Nama penerima wajib diisi.");
      return;
    }

    if (!formSantunan.jumlah || Number(formSantunan.jumlah) <= 0) {
      alert("Jumlah santunan harus lebih dari 0.");
      return;
    }

    try {
      setMenyimpanSantunan(true);

      const tahun = Number(formSantunan.tanggal_santunan.slice(0, 4));

      const dataSantunan = {
        tanggal_santunan: formSantunan.tanggal_santunan,

        tahun,

        nama_almarhum: formSantunan.nama_almarhum.trim(),

        warga_meninggal_id: formSantunan.warga_meninggal_id || null,

        nama_penerima: formSantunan.nama_penerima.trim(),

        hubungan_penerima: formSantunan.hubungan_penerima.trim() || null,

        jumlah: Number(formSantunan.jumlah),

        keterangan: formSantunan.keterangan.trim() || null,
      };

      console.log("DATA SANTUNAN YANG AKAN DISIMPAN:", dataSantunan);

      let error;

      // =====================================================
      // MODE EDIT
      // =====================================================
      if (editSantunanId) {
        console.log("MODE EDIT SANTUNAN:", editSantunanId);

        const hasilUpdate = await supabase
          .from("santunan_dana_duka")
          .update({
            ...dataSantunan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editSantunanId);

        error = hasilUpdate.error;

        if (error) {
          console.error("GAGAL UPDATE SANTUNAN:", error);
          throw error;
        }

        console.log("DATA SANTUNAN BERHASIL DIUPDATE.");

        alert("Data santunan berhasil diperbarui.");

        // =====================================================
        // MODE TAMBAH BARU
        // =====================================================
      } else {
        console.log("MODE TAMBAH SANTUNAN BARU.");

        const dataBaru = {
          id: crypto.randomUUID(),
          ...dataSantunan,
        };

        const hasilInsert = await supabase
          .from("santunan_dana_duka")
          .insert([dataBaru]);

        error = hasilInsert.error;

        if (error) {
          console.error("GAGAL MENYIMPAN SANTUNAN:", error);
          throw error;
        }

        console.log("DATA SANTUNAN BERHASIL DISIMPAN.");

        alert("Data santunan berhasil disimpan.");
      }

      // =====================================================
      // MUAT ULANG DATA
      // =====================================================
      await loadSantunan(tahunRekap);

      // =====================================================
      // RESET FORM
      // =====================================================
      setFormSantunan({
        tanggal_santunan: "",
        warga_meninggal_id: "",
        nama_almarhum: "",
        nama_penerima: "",
        hubungan_penerima: "",
        jumlah: "",
        keterangan: "",
      });

      setKeluargaPenerima([]);

      setEditSantunanId(null);

      setShowFormSantunan(false);
    } catch (err) {
      console.error("ERROR SIMPAN/UPDATE SANTUNAN DANA DUKA:", err);

      alert("Data santunan gagal disimpan.");
    } finally {
      setMenyimpanSantunan(false);
    }
  }

  async function editSantunan(item) {
    console.log("EDIT DATA SANTUNAN:", item);

    setEditSantunanId(item.id);

    setFormSantunan({
      tanggal_santunan: item.tanggal_santunan || "",
      warga_meninggal_id: item.warga_meninggal_id || "",
      nama_almarhum: item.nama_almarhum || "",
      nama_penerima: item.nama_penerima || "",
      hubungan_penerima: item.hubungan_penerima || "",
      jumlah: item.jumlah || "",
      keterangan: item.keterangan || "",
    });

    // =====================================================
    // MUAT KEMBALI ANGGOTA KELUARGA ALMARHUM
    // =====================================================

    setKeluargaPenerima([]);

    if (item.warga_meninggal_id) {
      try {
        console.log("MEMUAT KELUARGA UNTUK EDIT SANTUNAN...");

        const wargaMeninggalTerpilih = wargaMeninggal.find(
          (warga) => String(warga.id) === String(item.warga_meninggal_id),
        );

        if (wargaMeninggalTerpilih) {
          const kkAlmarhum = String(wargaMeninggalTerpilih.kk || "").trim();

          console.log("NO KK ALMARHUM:", kkAlmarhum);

          const { data: anggotaKeluarga, error: errorKeluarga } = await supabase
            .from("warga")
            .select(
              "id, nama, nik, kk, status, status_kependudukan, status_keluarga",
            )
            .eq("kk", kkAlmarhum)
            .order("nama", {
              ascending: true,
            });

          if (errorKeluarga) {
            console.error("GAGAL MEMUAT KELUARGA UNTUK EDIT:", errorKeluarga);
          } else {
            const penerimaKeluarga = (anggotaKeluarga || []).filter(
              (anggota) =>
                String(anggota.id) !== String(wargaMeninggalTerpilih.id),
            );

            console.log("KELUARGA UNTUK EDIT SANTUNAN:", penerimaKeluarga);

            setKeluargaPenerima(penerimaKeluarga);
          }
        }
      } catch (err) {
        console.error("ERROR MEMUAT KELUARGA UNTUK EDIT:", err);

        setKeluargaPenerima([]);
      }
    }

    setShowFormSantunan(true);
  }

  async function hapusSantunan(item) {
    const yakin = window.confirm(
      `Apakah Anda yakin ingin menghapus data santunan untuk ${item.nama_almarhum}?`,
    );

    if (!yakin) {
      return;
    }

    try {
      console.log("MENGHAPUS DATA SANTUNAN:", item);

      const { error } = await supabase
        .from("santunan_dana_duka")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.error("GAGAL MENGHAPUS SANTUNAN:", error);
        throw error;
      }

      console.log("DATA SANTUNAN BERHASIL DIHAPUS.");

      await loadSantunan(tahunRekap);

      alert("Data santunan berhasil dihapus.");
    } catch (err) {
      console.error("ERROR HAPUS SANTUNAN:", err);

      alert("Data santunan gagal dihapus.");
    }
  }

  async function simpanPembayaran() {
    if (!wargaBayar) {
      return;
    }

    if (!tanggalBayar) {
      alert("Tanggal pembayaran wajib diisi.");
      return;
    }

    try {
      setMenyimpanPembayaran(true);

      console.log(
        "MENYIMPAN PEMBAYARAN IURAN DANA DUKA:",
        wargaBayar.nama,
        wargaBayar.kk,
        bulanIuran,
      );

      const dataBaru = {
        id: crypto.randomUUID(),
        warga_id: wargaBayar.id,
        kk: wargaBayar.kk,
        nama_kepala_keluarga: wargaBayar.nama,
        bulan: bulanIuran,
        jumlah: 10000,
        status_pembayaran: "Lunas",
        tanggal_bayar: tanggalBayar,
        keterangan: keteranganBayar.trim() || null,
      };

      const { error } = await supabase
        .from("iuran_dana_duka")
        .insert([dataBaru]);

      if (error) {
        console.error("GAGAL MENYIMPAN PEMBAYARAN:", error);
        throw error;
      }

      console.log("PEMBAYARAN BERHASIL DISIMPAN.");

      await loadIuranBulanan(bulanIuran);

      setWargaBayar(null);
      setTanggalBayar("");
      setKeteranganBayar("");

      alert("Pembayaran berhasil disimpan.");
    } catch (err) {
      console.error("ERROR SIMPAN PEMBAYARAN:", err);
      alert("Pembayaran gagal disimpan.");
    } finally {
      setMenyimpanPembayaran(false);
    }
  }

  async function editPembayaran() {
    if (!pembayaranEdit) {
      return;
    }

    if (statusEdit === "Lunas" && !tanggalBayar) {
      alert("Tanggal pembayaran wajib diisi jika status Lunas.");
      return;
    }

    try {
      setMenyimpanPembayaran(true);

      console.log(
        "MENGEDIT PEMBAYARAN IURAN DANA DUKA:",
        pembayaranEdit.nama_kepala_keluarga,
        pembayaranEdit.kk,
        pembayaranEdit.bulan,
        statusEdit,
      );

      const dataUpdate = {
        status_pembayaran: statusEdit,
        tanggal_bayar: statusEdit === "Lunas" ? tanggalBayar || null : null,
        keterangan: keteranganBayar.trim() || null,
      };

      const { error } = await supabase
        .from("iuran_dana_duka")
        .update(dataUpdate)
        .eq("id", pembayaranEdit.id);

      if (error) {
        console.error("GAGAL MENGEDIT PEMBAYARAN:", error);
        throw error;
      }

      console.log("PEMBAYARAN BERHASIL DIUBAH.");

      await loadIuranBulanan(bulanIuran);

      setPembayaranEdit(null);
      setWargaBayar(null);
      setTanggalBayar("");
      setKeteranganBayar("");
      setStatusEdit("Lunas");

      alert("Pembayaran berhasil diubah.");
    } catch (err) {
      console.error("ERROR EDIT PEMBAYARAN:", err);
      alert("Pembayaran gagal diubah.");
    } finally {
      setMenyimpanPembayaran(false);
    }
  }

  useEffect(() => {
    if (bulanIuran) {
      loadIuranBulanan(bulanIuran);
    }
  }, [bulanIuran]);

  useEffect(() => {
    loadRekapIuran(tahunRekap);
  }, [tahunRekap]);

  useEffect(() => {
    loadSantunan(tahunRekap);
  }, [tahunRekap]);

  useEffect(() => {
    loadSaldoAwalTahun(tahunRekap);
  }, [tahunRekap]);

  useEffect(() => {
    loadWargaUntukSantunan();
  }, []);

  const kepalaKeluargaTampil = kepalaKeluarga.filter((warga) => {
    const kata = pencarian.toLowerCase().trim();

    if (!kata) return true;

    return (
      warga.nama.toLowerCase().includes(kata) ||
      warga.kk.toLowerCase().includes(kata)
    );
  });

  const totalIuranTahunan = rekapIuran.reduce(
    (total, item) => total + item.total,
    0,
  );

  const totalKKBayarTahunan = rekapIuran.reduce(
    (total, item) => total + item.jumlahKK,
    0,
  );

  const totalSantunanTahunan = dataSantunan.reduce(
    (total, item) => total + Number(item.jumlah || 0),
    0,
  );

  const saldoDanaDukaTahunan =
    saldoAwalTahun + totalIuranTahunan - totalSantunanTahunan;

  return (
    <div className="iuran-dana-duka-page">
      <div className="iuran-header">
        <div>
          <h2>Iuran Dana Duka</h2>
          <p>Pengelolaan iuran Dana Duka warga RT 03 / RW 07</p>
        </div>

        <div className="iuran-tarif">
          <span>Tarif Iuran</span>
          <strong>Rp10.000 / KK / Bulan</strong>
        </div>
      </div>

      <div className="iuran-summary">
        <div className="iuran-summary-card">
          <span>Total KK</span>
          <strong>{kepalaKeluarga.length}</strong>
          <small>KK wajib iuran</small>
        </div>

        <div className="iuran-summary-card">
          <span>Sudah Bayar</span>
          <strong>{jumlahSudahBayar}</strong>
          <small>KK sudah lunas</small>
        </div>

        <div className="iuran-summary-card">
          <span>Belum Bayar</span>
          <strong>{jumlahBelumBayar}</strong>
          <small>KK belum lunas</small>
        </div>

        <div className="iuran-summary-card">
          <span>Total Diterima</span>
          <strong>Rp{totalDiterima.toLocaleString("id-ID")}</strong>
          <small>{bulanIuran}</small>
        </div>
      </div>

      {loading ? (
        <div className="iuran-empty">
          <div className="iuran-empty-icon">⏳</div>
          <h3>Memuat Data...</h3>
          <p>Data Kepala Keluarga sedang diambil dari Supabase.</p>
        </div>
      ) : error ? (
        <div className="iuran-empty">
          <div className="iuran-empty-icon">⚠️</div>
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="iuran-table-container">
          <div className="iuran-table-header">
            <div>
              <h3>Daftar Kepala Keluarga</h3>
              <span>
                Total: <strong>{kepalaKeluarga.length} KK</strong>
              </span>
            </div>

            <div className="iuran-bulan-control">
              <label htmlFor="bulan-iuran">Bulan Iuran</label>

              <input
                id="bulan-iuran"
                type="month"
                value={bulanIuran}
                onChange={(e) => setBulanIuran(e.target.value)}
              />
            </div>

            <div className="iuran-pencarian">
              <label htmlFor="pencarian-iuran">Cari Kepala Keluarga</label>

              <input
                id="pencarian-iuran"
                type="text"
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                placeholder="Cari nama atau No. KK..."
              />
            </div>
          </div>

          <div className="iuran-table-wrapper">
            <table className="iuran-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kepala Keluarga</th>
                  <th>No. KK</th>
                  <th>Status Iuran</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {kepalaKeluargaTampil.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="iuran-no-data">
                      {pencarian
                        ? "Data Kepala Keluarga tidak ditemukan."
                        : "Tidak ada data Kepala Keluarga."}
                    </td>
                  </tr>
                ) : (
                  kepalaKeluargaTampil.map((warga, index) => (
                    <tr key={warga.id}>
                      <td>{index + 1}</td>

                      <td className="iuran-nama">{warga.nama}</td>

                      <td>{warga.kk}</td>

                      <td>
                        {(() => {
                          const pembayaran = dataIuran.find(
                            (item) => item.warga_id === warga.id,
                          );

                          const sudahLunas =
                            pembayaran?.status_pembayaran === "Lunas";

                          return (
                            <span
                              className={
                                sudahLunas
                                  ? "status-lunas"
                                  : "status-belum-bayar"
                              }
                            >
                              {sudahLunas ? "Lunas" : "Belum Bayar"}
                            </span>
                          );
                        })()}
                      </td>

                      <td>
                        {(() => {
                          const pembayaran = dataIuran.find(
                            (item) => item.warga_id === warga.id,
                          );

                          const sudahLunas =
                            pembayaran?.status_pembayaran === "Lunas";

                          return (
                            <div className="iuran-aksi">
                              {sudahLunas ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn-iuran-detail"
                                    onClick={() => {
                                      setPembayaranDetail(pembayaran);
                                    }}
                                  >
                                    Detail
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-iuran-bayar"
                                    onClick={() => {
                                      setPembayaranEdit(pembayaran);
                                      setWargaBayar(warga);
                                      setTanggalBayar(
                                        pembayaran.tanggal_bayar || "",
                                      );
                                      setKeteranganBayar(
                                        pembayaran.keterangan || "",
                                      );
                                      setStatusEdit(
                                        pembayaran.status_pembayaran || "Lunas",
                                      );
                                    }}
                                  >
                                    Edit
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-iuran-bayar"
                                  onClick={() => {
                                    setPembayaranEdit(null);
                                    setWargaBayar(warga);
                                    setTanggalBayar("");
                                    setKeteranganBayar("");
                                    setStatusEdit("Lunas");
                                  }}
                                >
                                  Bayar
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pembayaranDetail && (
            <div className="modal-overlay">
              <div className="modal-iuran">
                <div className="modal-iuran-header">
                  <h3>Detail Pembayaran Iuran Dana Duka</h3>

                  <button
                    type="button"
                    className="modal-iuran-close"
                    onClick={() => setPembayaranDetail(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-iuran-body">
                  <div className="detail-iuran-row">
                    <span>Kepala Keluarga</span>
                    <strong>{pembayaranDetail.nama_kepala_keluarga}</strong>
                  </div>

                  <div className="detail-iuran-row">
                    <span>No. KK</span>
                    <strong>{pembayaranDetail.kk}</strong>
                  </div>

                  <div className="detail-iuran-row">
                    <span>Bulan Iuran</span>
                    <strong>
                      {pembayaranDetail.bulan
                        ? `${pembayaranDetail.bulan.slice(5, 7)}/${pembayaranDetail.bulan.slice(0, 4)}`
                        : "-"}
                    </strong>
                  </div>

                  <div className="detail-iuran-row">
                    <span>Jumlah Iuran</span>
                    <strong>
                      Rp
                      {Number(pembayaranDetail.jumlah || 0).toLocaleString(
                        "id-ID",
                      )}
                    </strong>
                  </div>

                  <div className="detail-iuran-row">
                    <span>Status</span>
                    <strong
                      className={
                        pembayaranDetail.status_pembayaran === "Lunas"
                          ? "status-lunas"
                          : "status-belum-bayar"
                      }
                    >
                      {pembayaranDetail.status_pembayaran}
                    </strong>
                  </div>

                  <div className="detail-iuran-row">
                    <span>Tanggal Bayar</span>
                    <strong>{pembayaranDetail.tanggal_bayar || "-"}</strong>
                  </div>

                  <div className="detail-iuran-row">
                    <span>Keterangan</span>
                    <strong>{pembayaranDetail.keterangan || "-"}</strong>
                  </div>
                </div>

                <div className="modal-iuran-footer">
                  <button
                    type="button"
                    className="btn-iuran-tutup"
                    onClick={() => setPembayaranDetail(null)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {wargaBayar && (
        <div className="iuran-modal-overlay">
          <div className="iuran-modal">
            <div className="iuran-modal-header">
              <div>
                <h3>
                  {pembayaranEdit
                    ? "Edit Pembayaran Iuran Dana Duka"
                    : "Pembayaran Iuran Dana Duka"}
                </h3>

                <p>{bulanIuran}</p>
              </div>

              <button
                type="button"
                className="iuran-modal-close"
                onClick={() => {
                  setWargaBayar(null);
                  setPembayaranEdit(null);
                  setStatusEdit("Lunas");
                }}
                disabled={menyimpanPembayaran}
              >
                ×
              </button>
            </div>

            <div className="iuran-modal-body">
              <div className="iuran-detail">
                <span>Kepala Keluarga</span>
                <strong>{wargaBayar.nama}</strong>
              </div>

              <div className="iuran-detail">
                <span>No. KK</span>
                <strong>{wargaBayar.kk}</strong>
              </div>

              <div className="iuran-detail">
                <span>Jumlah Iuran</span>
                <strong>Rp10.000</strong>
              </div>

              {pembayaranEdit && (
                <div className="form-group">
                  <label htmlFor="status-pembayaran">Status Pembayaran</label>

                  <select
                    id="status-pembayaran"
                    value={statusEdit}
                    onChange={(e) => {
                      const nilai = e.target.value;

                      setStatusEdit(nilai);

                      if (nilai === "Belum Bayar") {
                        setTanggalBayar("");
                      }
                    }}
                    disabled={menyimpanPembayaran}
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Belum Bayar">Belum Bayar</option>
                  </select>
                </div>
              )}

              {(!pembayaranEdit || statusEdit === "Lunas") && (
                <div className="form-group">
                  <label htmlFor="tanggal-bayar">Tanggal Bayar</label>

                  <input
                    id="tanggal-bayar"
                    type="date"
                    value={tanggalBayar}
                    onChange={(e) => setTanggalBayar(e.target.value)}
                    disabled={menyimpanPembayaran}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="keterangan-bayar">Keterangan</label>

                <textarea
                  id="keterangan-bayar"
                  value={keteranganBayar}
                  onChange={(e) => setKeteranganBayar(e.target.value)}
                  placeholder="Keterangan pembayaran (opsional)"
                  rows="3"
                  disabled={menyimpanPembayaran}
                />
              </div>
            </div>

            <div className="iuran-modal-footer">
              <button
                type="button"
                className="btn-iuran-batal"
                onClick={() => {
                  setWargaBayar(null);
                  setPembayaranEdit(null);
                  setStatusEdit("Lunas");
                }}
                disabled={menyimpanPembayaran}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-simpan-iuran"
                onClick={pembayaranEdit ? editPembayaran : simpanPembayaran}
                disabled={menyimpanPembayaran}
              >
                {menyimpanPembayaran
                  ? "Menyimpan..."
                  : pembayaranEdit
                    ? "Simpan Perubahan"
                    : "Simpan Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormSantunan && (
        <div className="santunan-modal-overlay">
          <div className="santunan-modal">
            <div className="santunan-modal-header">
              <div>
                <h3>Tambah Santunan Dana Duka</h3>
                <p>Input pemberian santunan Dana Duka</p>
              </div>

              <button
                type="button"
                className="santunan-modal-close"
                onClick={() => {
                  if (!menyimpanSantunan) {
                    setShowFormSantunan(false);
                  }
                }}
                disabled={menyimpanSantunan}
              >
                ×
              </button>
            </div>

            <div className="santunan-modal-body">
              <div className="form-group">
                <label htmlFor="tanggal-santunan">Tanggal Santunan</label>

                <input
                  id="tanggal-santunan"
                  type="date"
                  value={formSantunan.tanggal_santunan}
                  onChange={(e) =>
                    setFormSantunan({
                      ...formSantunan,
                      tanggal_santunan: e.target.value,
                    })
                  }
                  disabled={menyimpanSantunan}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nama-almarhum">Nama Almarhum</label>

                <select
                  id="nama-almarhum"
                  value={formSantunan.warga_meninggal_id || ""}
                  onChange={async (e) => {
                    const idMeninggal = e.target.value;

                    const warga = wargaMeninggal.find(
                      (item) => String(item.id) === String(idMeninggal),
                    );

                    if (!warga) {
                      setFormSantunan({
                        ...formSantunan,
                        warga_meninggal_id: "",
                        nama_almarhum: "",
                        nama_penerima: "",
                        hubungan_penerima: "",
                      });

                      setKeluargaPenerima([]);

                      return;
                    }

                    setFormSantunan({
                      ...formSantunan,
                      warga_meninggal_id: warga.id,
                      nama_almarhum: warga.nama || "",
                      nama_penerima: "",
                      hubungan_penerima: "",
                    });

                    // =====================================================
                    // AMBIL ANGGOTA KELUARGA LANGSUNG DARI SUPABASE
                    // BERDASARKAN NO. KK ALMARHUM
                    // =====================================================

                    const kkAlmarhum = String(warga.kk || "").trim();

                    console.log("MENCARI ANGGOTA KELUARGA DI SUPABASE...");

                    console.log("NAMA ALMARHUM:", warga.nama);

                    console.log("ID ALMARHUM:", warga.id);

                    console.log("NO KK ALMARHUM:", kkAlmarhum);

                    try {
                      const { data: anggotaKeluarga, error: errorKeluarga } =
                        await supabase
                          .from("warga")
                          .select(
                            "id, nama, nik, kk, status, status_kependudukan, status_keluarga",
                          )
                          .eq("kk", kkAlmarhum)
                          .order("nama", { ascending: true });

                      if (errorKeluarga) {
                        console.error(
                          "GAGAL MENCARI ANGGOTA KELUARGA:",
                          errorKeluarga,
                        );

                        setKeluargaPenerima([]);

                        return;
                      }

                      console.log(
                        "HASIL PENCARIAN KELUARGA DARI SUPABASE:",
                        anggotaKeluarga,
                      );

                      const penerimaKeluarga = (anggotaKeluarga || []).filter(
                        (anggota) => String(anggota.id) !== String(warga.id),
                      );

                      console.log("CALON PENERIMA SANTUNAN:", penerimaKeluarga);

                      setKeluargaPenerima(penerimaKeluarga);
                    } catch (err) {
                      console.error("ERROR MENCARI ANGGOTA KELUARGA:", err);

                      setKeluargaPenerima([]);
                    }
                  }}
                >
                  <option value="">-- Pilih Nama Almarhum --</option>

                  {wargaMeninggal.map((warga) => (
                    <option key={warga.id} value={warga.id}>
                      {warga.nama}
                      {warga.nik ? ` - NIK ${warga.nik}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nama-penerima">Nama Penerima Santunan</label>

                <select
                  id="nama-penerima"
                  value={formSantunan.nama_penerima}
                  onChange={(e) => {
                    const namaPenerima = e.target.value;

                    const penerima = keluargaPenerima.find(
                      (item) => item.nama === namaPenerima,
                    );

                    setFormSantunan({
                      ...formSantunan,
                      nama_penerima: namaPenerima,
                      hubungan_penerima: penerima?.status_keluarga || "",
                    });
                  }}
                  disabled={!formSantunan.warga_meninggal_id}
                >
                  <option value="">
                    {!formSantunan.warga_meninggal_id
                      ? "-- Pilih Almarhum Terlebih Dahulu --"
                      : keluargaPenerima.length === 0
                        ? "-- Tidak Ada Anggota Keluarga --"
                        : "-- Pilih Penerima --"}
                  </option>

                  {keluargaPenerima.map((anggota) => (
                    <option key={anggota.id} value={anggota.nama}>
                      {anggota.nama}
                      {anggota.status_keluarga
                        ? ` - ${anggota.status_keluarga}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="hubungan-penerima">
                  Hubungan dengan Almarhum
                </label>

                <input
                  id="hubungan-penerima"
                  type="text"
                  value={formSantunan.hubungan_penerima}
                  readOnly
                  placeholder="Otomatis dari Data Warga"
                />
              </div>

              <div className="form-group">
                <label htmlFor="jumlah-santunan">Jumlah Santunan</label>

                <input
                  id="jumlah-santunan"
                  type="number"
                  min="1"
                  value={formSantunan.jumlah}
                  onChange={(e) =>
                    setFormSantunan({
                      ...formSantunan,
                      jumlah: e.target.value,
                    })
                  }
                  placeholder="Contoh: 1500000"
                  disabled={menyimpanSantunan}
                />
              </div>

              <div className="form-group">
                <label htmlFor="keterangan-santunan">Keterangan</label>

                <textarea
                  id="keterangan-santunan"
                  value={formSantunan.keterangan}
                  onChange={(e) =>
                    setFormSantunan({
                      ...formSantunan,
                      keterangan: e.target.value,
                    })
                  }
                  placeholder="Keterangan santunan (opsional)"
                  rows="3"
                  disabled={menyimpanSantunan}
                />
              </div>
            </div>

            <div className="santunan-modal-footer">
              <button
                type="button"
                className="btn-santunan-batal"
                onClick={() => {
                  if (!menyimpanSantunan) {
                    setShowFormSantunan(false);
                  }
                }}
                disabled={menyimpanSantunan}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-simpan-santunan"
                onClick={simpanSantunan}
                disabled={menyimpanSantunan}
              >
                {menyimpanSantunan ? "Menyimpan..." : "Simpan Santunan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rekap-iuran-container">
        <div className="rekap-iuran-header">
          <div>
            <h3>Rekap Pemasukan Dana Duka</h3>

            <span>Rekap iuran warga tahun {tahunRekap}</span>
          </div>

          <div className="rekap-tahun-control">
            <label htmlFor="tahun-rekap">Tahun</label>

            <select
              id="tahun-rekap"
              value={tahunRekap}
              onChange={(e) => setTahunRekap(Number(e.target.value))}
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
        </div>

        <div className="saldo-awal-editor">
          <div className="saldo-awal-editor-info">
            <strong>Saldo Awal Tahun {tahunRekap}</strong>
            <span>Masukkan saldo Dana Duka yang tersedia pada awal tahun.</span>
          </div>

          <div className="saldo-awal-editor-form">
            <div className="saldo-awal-input-wrapper">
              <span>Rp</span>

              <input
                type="number"
                min="0"
                value={saldoAwalInput}
                onChange={(e) => setSaldoAwalInput(e.target.value)}
                placeholder="0"
              />
            </div>

            <button
              type="button"
              onClick={simpanSaldoAwalTahun}
              disabled={menyimpanSaldoAwal}
            >
              {menyimpanSaldoAwal ? "Menyimpan..." : "Simpan Saldo Awal"}
            </button>
          </div>
        </div>

        {loadingRekap ? (
          <div className="rekap-iuran-loading">Memuat rekap pemasukan...</div>
        ) : (
          <>
            <div className="rekap-iuran-summary">
              <div className="rekap-iuran-card">
                <span>Saldo Awal Tahun</span>

                <strong>Rp{saldoAwalTahun.toLocaleString("id-ID")}</strong>

                <small>Saldo awal {tahunRekap}</small>
              </div>

              <div className="rekap-iuran-card">
                <span>Total Iuran Masuk</span>

                <strong>Rp{totalIuranTahunan.toLocaleString("id-ID")}</strong>

                <small>Tahun {tahunRekap}</small>
              </div>

              <div className="rekap-iuran-card">
                <span>Total Pembayaran</span>

                <strong>{totalKKBayarTahunan}</strong>

                <small>Pembayaran lunas</small>
              </div>

              <div className="rekap-iuran-card rekap-saldo-card">
                <span>Saldo Akhir Tahun</span>

                <strong>
                  Rp{saldoDanaDukaTahunan.toLocaleString("id-ID")}
                </strong>

                <small>Saldo awal + Iuran − Santunan</small>
              </div>
            </div>

            <div className="saldo-dana-duka-ringkasan">
              <div className="saldo-ringkasan-item">
                <span>Saldo Awal {tahunRekap}</span>
                <strong>Rp{saldoAwalTahun.toLocaleString("id-ID")}</strong>
              </div>

              <div className="saldo-ringkasan-operator">+</div>

              <div className="saldo-ringkasan-item">
                <span>Iuran {tahunRekap}</span>
                <strong>Rp{totalIuranTahunan.toLocaleString("id-ID")}</strong>
              </div>

              <div className="saldo-ringkasan-operator">−</div>

              <div className="saldo-ringkasan-item">
                <span>Santunan {tahunRekap}</span>
                <strong>
                  Rp{totalSantunanTahunan.toLocaleString("id-ID")}
                </strong>
              </div>

              <div className="saldo-ringkasan-operator">=</div>

              <div className="saldo-ringkasan-item saldo-ringkasan-akhir">
                <span>Saldo Akhir {tahunRekap}</span>
                <strong>
                  Rp{saldoDanaDukaTahunan.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>

            <div className="rekap-iuran-table-wrapper">
              <table className="rekap-iuran-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Bulan</th>
                    <th>KK Bayar</th>
                    <th>Total Pemasukan</th>
                  </tr>
                </thead>

                <tbody>
                  {rekapIuran.map((item) => (
                    <tr key={item.bulan}>
                      <td>{item.nomorBulan}</td>

                      <td>{item.namaBulan}</td>

                      <td>{item.jumlahKK} KK</td>

                      <td>
                        Rp
                        {item.total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}

                  <tr className="rekap-iuran-total">
                    <td></td>

                    <td>TOTAL</td>

                    <td>{totalKKBayarTahunan} pembayaran</td>

                    <td>
                      Rp
                      {totalIuranTahunan.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
    DATA SANTUNAN DANA DUKA
    ===================================================== */}

      <div className="santunan-dana-duka-container">
        <div className="santunan-dana-duka-header">
          <div>
            <h3>Data Santunan Dana Duka</h3>

            <span>Data santunan yang diberikan pada tahun {tahunRekap}</span>
          </div>

          <div className="santunan-header-actions">
            <div className="santunan-total">
              <span>Total Santunan</span>

              <strong>Rp{totalSantunanTahunan.toLocaleString("id-ID")}</strong>
            </div>

            <button
              type="button"
              className="btn-tambah-santunan"
              onClick={() => {
                setFormSantunan({
                  tanggal_santunan: "",
                  warga_meninggal_id: "",
                  nama_almarhum: "",
                  nama_penerima: "",
                  hubungan_penerima: "",
                  jumlah: "",
                  keterangan: "",
                });

                setKeluargaPenerima([]);

                setShowFormSantunan(true);
              }}
            >
              + Tambah Santunan
            </button>
          </div>
        </div>

        {loadingSantunan ? (
          <div className="santunan-loading">Memuat data santunan...</div>
        ) : dataSantunan.length === 0 ? (
          <div className="santunan-empty">
            <div className="santunan-empty-icon">📋</div>

            <h4>Belum Ada Data Santunan</h4>

            <p>
              Belum ada santunan Dana Duka yang tercatat pada tahun {tahunRekap}
              .
            </p>
          </div>
        ) : (
          <div className="santunan-table-wrapper">
            <table className="santunan-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Nama Almarhum</th>
                  <th>Penerima</th>
                  <th>Hubungan</th>
                  <th>Jumlah</th>
                  <th>Keterangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {dataSantunan.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>{item.tanggal_santunan || "-"}</td>

                    <td className="santunan-nama-almarhum">
                      {item.nama_almarhum || "-"}
                    </td>

                    <td>{item.nama_penerima || "-"}</td>

                    <td>{item.hubungan_penerima || "-"}</td>

                    <td className="santunan-jumlah">
                      Rp
                      {Number(item.jumlah || 0).toLocaleString("id-ID")}
                    </td>

                    <td>{item.keterangan || "-"}</td>

                    <td>
                      <div className="santunan-aksi">
                        <button
                          type="button"
                          className="btn-santunan-detail"
                          onClick={() => {
                            console.log("DETAIL SANTUNAN:", item);
                          }}
                        >
                          Detail
                        </button>

                        <button
                          type="button"
                          className="btn-santunan-edit"
                          onClick={() => editSantunan(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn-santunan-hapus"
                          onClick={() => hapusSantunan(item)}
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
  );
}

export default IuranDanaDuka;
