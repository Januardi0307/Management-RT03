import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import "./DataWarga.css";
import { createPortal } from "react-dom";
const initialForm = {
  nik: "",
  kk: "",
  nama: "",
  nomorTelepon: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  alamat: "",
  rtRw: "03/07",
  kelurahan: "Karet",
  kecamatan: "Setiabudi",
  agama: "",
  statusPerkawinan: "",
  pekerjaan: "",
  kewarganegaraan: "WNI",
  statusKeluarga: "",

  statusKependudukan: "Warga RT03",
  statusTinggal: "Tinggal di RT03",
  jenisTinggal: "",
  tempatKostId: "",
  tempatKostNama: "",
  alamatKontrak: "",

  status: "Aktif",
  tanggalMeninggal: "",
  keteranganMeninggal: "",
};

function normalisasiData(data) {
  return data.map((item) => ({
    ...item,

    id: item.id || Date.now() + Math.random(),

    status:
      item.status === "Meninggal"
        ? "Meninggal"
        : item.status === "Pindah"
          ? "Pindah"
          : "Aktif",

    statusPerkawinan:
      item.statusPerkawinan === "Kawin"
        ? "Kawin Tercatat"
        : item.statusPerkawinan === "Belum Catat"
          ? "Kawin Belum Tercatat"
          : item.statusPerkawinan === "Belum Nikah"
            ? "Belum Kawin"
            : item.statusPerkawinan === "Cerai"
              ? "Cerai Mati"
              : item.statusPerkawinan || "",

    statusKeluarga: item.statusKeluarga || "",

    nomorTelepon: item.nomorTelepon || "",

    statusKependudukan: item.statusKependudukan || "Warga RT03",

    statusTinggal: item.statusTinggal || "Tinggal di RT03",

    jenisTinggal: item.jenisTinggal || "",

    tanggalMeninggal: item.tanggalMeninggal || "",
    keteranganMeninggal: item.keteranganMeninggal || "",
  }));
}

function mapSupabaseToWarga(row) {
  return {
    id: row.id,

    nama: row.nama || "",
    nik: row.nik || "",
    kk: row.kk || "",

    nomorTelepon: row.nomor_telepon || "",

    tempatLahir: row.tempat_lahir || "",
    tanggalLahir: row.tanggal_lahir || "",

    jenisKelamin: row.jenis_kelamin || "",

    alamat: row.alamat || "",
    rtRw: row.rt_rw || "03/07",

    kelurahan: row.kelurahan || "Karet",
    kecamatan: row.kecamatan || "Setiabudi",

    agama: row.agama || "",
    statusPerkawinan: row.status_perkawinan || "",
    pekerjaan: row.pekerjaan || "",
    kewarganegaraan: row.kewarganegaraan || "",

    statusKeluarga: row.status_keluarga || "",

    statusKependudukan: row.status_kependudukan || "Warga RT03",

    statusTinggal: row.status_tinggal || "Tinggal di RT03",

    jenisTinggal: row.jenis_tinggal || "",

    tempatKostId: row.tempat_kost_id || "",

    tempatKostNama: row.nama_tempat_kost || "",

    alamatKontrak: row.alamat_kontrak || "",

    status: row.status || "Aktif",

    tanggalMeninggal: row.tanggal_meninggal || "",

    keteranganMeninggal: row.keterangan_meninggal || "",
  };
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function DataWarga() {
  const [openActionId, setOpenActionId] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const [warga, setWarga] = useState([]);
  const [daftarKost, setDaftarKost] = useState([]);
  const [form, setForm] = useState(initialForm);

  const tableWargaAktifRef = useRef(null);
  const floatingScrollRef = useRef(null);
  const tableWargaMeninggalRef = useRef(null);
  const floatingScrollMeninggalRef = useRef(null);
  const tableKeluargaRef = useRef(null);
  const floatingScrollKeluargaRef = useRef(null);

  const [showForm, setShowForm] = useState(false);

  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [tabAktif, setTabAktif] = useState("aktif");

  const [selectedWarga, setSelectedWarga] = useState(null);

  const [selectedKK, setSelectedKK] = useState(null);

  useEffect(() => {
    if (tabAktif !== "aktif") return;
    const table = tableWargaAktifRef.current;
    const floating = floatingScrollRef.current;
    const content = floating?.firstElementChild;

    if (!table || !floating || !content) return;

    const updateFloating = () => {
      const rect = table.getBoundingClientRect();

      content.style.width = `${table.scrollWidth}px`;

      floating.style.left = `${rect.left}px`;
      floating.style.width = `${rect.width}px`;
    };

    const syncFromTable = () => {
      floating.scrollLeft = table.scrollLeft;
    };

    const syncFromFloating = () => {
      table.scrollLeft = floating.scrollLeft;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          floating.style.display = "block";
          updateFloating();
        } else {
          floating.style.display = "none";
        }
      },
      {
        threshold: 0,
      },
    );

    observer.observe(table);

    table.addEventListener("scroll", syncFromTable);

    floating.addEventListener("scroll", syncFromFloating);

    window.addEventListener("scroll", updateFloating);

    window.addEventListener("resize", updateFloating);

    updateFloating();

    return () => {
      observer.disconnect();

      table.removeEventListener("scroll", syncFromTable);

      floating.removeEventListener("scroll", syncFromFloating);

      window.removeEventListener("scroll", updateFloating);

      window.removeEventListener("resize", updateFloating);
    };
  }, [warga.length, tabAktif]);

  useEffect(() => {
    async function loadDaftarKost() {
      try {
        console.log("MEMUAT DAFTAR KOST UNTUK DATA WARGA DARI SUPABASE...");

        const { data, error } = await supabase
          .from("tempat_kost")
          .select("*")
          .eq("status", "Aktif")
          .order("nama_kost", { ascending: true });

        if (error) {
          console.error("GAGAL MEMUAT DAFTAR KOST DARI SUPABASE:", error);

          return;
        }

        const kostAktif = data.map((item) => ({
          id: item.id,
          namaKost: item.nama_kost || "",
          alamat: item.alamat || "",
          jumlahKamar: Number(item.jumlah_kamar || 0),
          jumlahAnakKost: Number(item.jumlah_anak_kost || 0),
          distribusiPerOrang: Number(item.distribusi_per_orang || 0),
          totalDistribusi: Number(item.total_distribusi || 0),
          status: item.status || "Aktif",
        }));

        setDaftarKost(kostAktif);

        console.log(
          `BERHASIL MEMUAT ${kostAktif.length} KOST AKTIF DARI SUPABASE.`,
        );
      } catch (error) {
        console.error("ERROR MEMUAT DAFTAR KOST DARI SUPABASE:", error);
      }
    }

    loadDaftarKost();
  }, []);

  useEffect(() => {
    if (tabAktif !== "meninggal") return;
    const table = tableWargaMeninggalRef.current;
    const floating = floatingScrollMeninggalRef.current;
    const content = floating?.firstElementChild;

    if (!table || !floating || !content) return;

    const updateFloating = () => {
      const rect = table.getBoundingClientRect();

      content.style.width = `${table.scrollWidth}px`;

      floating.style.left = `${rect.left}px`;
      floating.style.width = `${rect.width}px`;
    };

    const syncFromTable = () => {
      floating.scrollLeft = table.scrollLeft;
    };

    const syncFromFloating = () => {
      table.scrollLeft = floating.scrollLeft;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          floating.style.display = "block";
          updateFloating();
        } else {
          floating.style.display = "none";
        }
      },
      {
        threshold: 0,
      },
    );

    observer.observe(table);

    table.addEventListener("scroll", syncFromTable);

    floating.addEventListener("scroll", syncFromFloating);

    window.addEventListener("scroll", updateFloating);

    window.addEventListener("resize", updateFloating);

    updateFloating();

    return () => {
      observer.disconnect();

      table.removeEventListener("scroll", syncFromTable);

      floating.removeEventListener("scroll", syncFromFloating);

      window.removeEventListener("scroll", updateFloating);

      window.removeEventListener("resize", updateFloating);
    };
  }, [warga.length, tabAktif]);

  useEffect(() => {
    if (tabAktif !== "keluarga") return;
    const table = tableKeluargaRef.current;
    const floating = floatingScrollKeluargaRef.current;
    const content = floating?.firstElementChild;

    if (!table || !floating || !content) return;

    const updateFloating = () => {
      const rect = table.getBoundingClientRect();

      content.style.width = `${table.scrollWidth}px`;

      floating.style.left = `${rect.left}px`;
      floating.style.width = `${rect.width}px`;
    };

    const syncFromTable = () => {
      floating.scrollLeft = table.scrollLeft;
    };

    const syncFromFloating = () => {
      table.scrollLeft = floating.scrollLeft;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          floating.style.display = "block";
          updateFloating();
        } else {
          floating.style.display = "none";
        }
      },
      {
        threshold: 0,
      },
    );

    observer.observe(table);

    table.addEventListener("scroll", syncFromTable);

    floating.addEventListener("scroll", syncFromFloating);

    window.addEventListener("scroll", updateFloating);

    window.addEventListener("resize", updateFloating);

    updateFloating();

    return () => {
      observer.disconnect();

      table.removeEventListener("scroll", syncFromTable);

      floating.removeEventListener("scroll", syncFromFloating);

      window.removeEventListener("scroll", updateFloating);

      window.removeEventListener("resize", updateFloating);
    };
  }, [warga.length, tabAktif]);

  useEffect(() => {
    async function loadDataWarga() {
      try {
        console.log("MEMUAT DATA WARGA DARI SUPABASE...");

        const { data, error } = await supabase
          .from("warga")
          .select("*")
          .order("nama", { ascending: true });

        if (error) {
          console.error("GAGAL MEMUAT DATA DARI SUPABASE:", error);
          return;
        }

        const dataWarga = data.map(mapSupabaseToWarga);
        const dataNormal = normalisasiData(dataWarga);

        setWarga(dataNormal);

        console.log(
          `BERHASIL MEMUAT ${dataNormal.length} DATA WARGA DARI SUPABASE.`,
        );
      } catch (error) {
        console.error("ERROR MEMUAT DATA WARGA:", error);
      }
    }

    loadDataWarga();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      // Jika memilih Warga RT03
      if (name === "statusKependudukan" && value === "Warga RT03") {
        next.jenisTinggal = "";
        next.tempatKostId = "";
        next.tempatKostNama = "";
        next.alamatKontrak = "";
      }

      // Jika memilih Pendatang
      if (name === "statusKependudukan" && value === "Pendatang") {
        next.statusTinggal = "Tinggal di RT03";
      }

      // Jika memilih Tinggal di luar RT03
      // hanya boleh untuk Warga RT03
      if (name === "statusTinggal" && value === "Tinggal di luar RT03") {
        next.statusKependudukan = "Warga RT03";
        next.jenisTinggal = "";
        next.tempatKostId = "";
        next.tempatKostNama = "";
        next.alamatKontrak = "";
      }

      // Jika memilih jenis tinggal Kost
      if (name === "jenisTinggal" && value === "Kost") {
        next.alamatKontrak = "";
      }

      // Jika memilih jenis tinggal Kontrak
      if (name === "jenisTinggal" && value === "Kontrak") {
        next.tempatKostId = "";
        next.tempatKostNama = "";
      }

      // Jika memilih tempat kost
      if (name === "tempatKostId") {
        const kostTerpilih = daftarKost.find(
          (item) => String(item.id) === String(value),
        );

        next.tempatKostNama = kostTerpilih?.namaKost || "";
      }

      return next;
    });
  }

  function bukaFormTambah() {
    setForm({
      ...initialForm,
    });

    setEditId(null);
    setShowForm(true);
  }

  function toggleActionMenu(id) {
    setOpenActionId((current) => (current === id ? null : id));
  }

  function bukaFormEdit(item) {
    setForm({
      ...initialForm,
      ...item,
    });

    setEditId(item.id);
    setShowForm(true);
  }

  function bukaDetail(item) {
    setSelectedWarga(item);
  }

  function batalForm() {
    setForm({
      ...initialForm,
    });

    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    /*
    NIK dan KK boleh kosong.
    Tetapi jika diisi harus 16 digit.
  */

    if (form.nik && !/^\d{16}$/.test(form.nik)) {
      alert("NIK harus terdiri dari 16 digit angka.");
      return;
    }

    if (form.kk && !/^\d{16}$/.test(form.kk)) {
      alert("Nomor KK harus terdiri dari 16 digit angka.");
      return;
    }

    if (!form.nama.trim()) {
      alert("Nama wajib diisi.");
      return;
    }

    if (form.statusKependudukan === "Pendatang") {
      if (!form.jenisTinggal) {
        alert("Silakan pilih Jenis Tinggal.");
        return;
      }

      if (form.statusTinggal !== "Tinggal di RT03") {
        alert("Pendatang harus tinggal di RT03.");
        return;
      }

      if (form.jenisTinggal === "Kost" && !form.tempatKostId) {
        alert("Silakan pilih Tempat Kost.");
        return;
      }

      if (form.jenisTinggal === "Kontrak" && !form.alamatKontrak.trim()) {
        alert("Silakan isi Alamat Kontrak.");
        return;
      }
    }

    if (form.statusKependudukan === "Warga RT03") {
      if (form.statusTinggal === "Tinggal di luar RT03") {
        form.jenisTinggal = "";
        form.tempatKostId = "";
        form.tempatKostNama = "";
        form.alamatKontrak = "";
      }
    }

    if (form.status === "Meninggal") {
      if (!form.tanggalMeninggal) {
        alert("Tanggal meninggal wajib diisi untuk status Meninggal.");
        return;
      }
    }

    /*
    ==========================================
    EDIT
    ==========================================
    Untuk sementara TIDAK diubah.
  */

    if (editId) {
      const dataSupabase = {
        nama: form.nama || "",
        nik: form.nik || "",
        kk: form.kk || "",

        nomor_telepon: form.nomorTelepon || "",

        tempat_lahir: form.tempatLahir || "",
        tanggal_lahir: form.tanggalLahir || "",

        jenis_kelamin: form.jenisKelamin || "",

        alamat: form.alamat || "",
        rt_rw: form.rtRw || "03/07",

        kelurahan: form.kelurahan || "Karet",
        kecamatan: form.kecamatan || "Setiabudi",

        agama: form.agama || "",
        status_perkawinan: form.statusPerkawinan || "",
        pekerjaan: form.pekerjaan || "",
        kewarganegaraan: form.kewarganegaraan || "",

        status_keluarga: form.statusKeluarga || "",

        status_kependudukan: form.statusKependudukan || "Warga RT03",

        status_tinggal: form.statusTinggal || "Tinggal di RT03",

        jenis_tinggal: form.jenisTinggal || "",

        tempat_kost_id: form.tempatKostId || "",

        nama_tempat_kost: form.tempatKostNama || "",

        alamat_kontrak: form.alamatKontrak || "",

        status: form.status || "Aktif",

        tanggal_meninggal: form.tanggalMeninggal || "",

        keterangan_meninggal: form.keteranganMeninggal || "",
      };

      console.log("MENGUPDATE DATA WARGA DI SUPABASE:", editId, dataSupabase);

      const { data, error } = await supabase
        .from("warga")
        .update(dataSupabase)
        .eq("id", String(editId))
        .select()
        .single();

      if (error) {
        console.error("GAGAL MENGUPDATE WARGA DI SUPABASE:", error);

        alert("Data warga gagal diperbarui di Supabase.");

        return;
      }

      console.log("DATA WARGA BERHASIL DIUPDATE DI SUPABASE:", data);

      const wargaUpdated = mapSupabaseToWarga(data);

      const dataBaru = warga.map((item) =>
        String(item.id) === String(editId) ? wargaUpdated : item,
      );

      const dataNormal = normalisasiData(dataBaru);

      setWarga(dataNormal);

      alert("Data warga berhasil diperbarui.");

      batalForm();
      return;
    }

    /*
    ==========================================
    TAMBAH DATA BARU → SUPABASE
    ==========================================
  */

    const idBaru = String(Date.now());

    const dataSupabase = {
      id: idBaru,

      nama: form.nama || "",
      nik: form.nik || "",
      kk: form.kk || "",

      nomor_telepon: form.nomorTelepon || "",

      tempat_lahir: form.tempatLahir || "",
      tanggal_lahir: form.tanggalLahir || "",

      jenis_kelamin: form.jenisKelamin || "",

      alamat: form.alamat || "",
      rt_rw: form.rtRw || "03/07",

      kelurahan: form.kelurahan || "Karet",
      kecamatan: form.kecamatan || "Setiabudi",

      agama: form.agama || "",
      status_perkawinan: form.statusPerkawinan || "",
      pekerjaan: form.pekerjaan || "",
      kewarganegaraan: form.kewarganegaraan || "",

      status_keluarga: form.statusKeluarga || "",

      status_kependudukan: form.statusKependudukan || "Warga RT03",

      status_tinggal: form.statusTinggal || "Tinggal di RT03",

      jenis_tinggal: form.jenisTinggal || "",

      tempat_kost_id: form.tempatKostId || "",

      nama_tempat_kost: form.tempatKostNama || "",

      alamat_kontrak: form.alamatKontrak || "",

      status: form.status || "Aktif",

      tanggal_meninggal: form.tanggalMeninggal || "",

      keterangan_meninggal: form.keteranganMeninggal || "",
    };

    console.log("MENYIMPAN DATA WARGA BARU KE SUPABASE:", dataSupabase);

    const { data, error } = await supabase
      .from("warga")
      .insert(dataSupabase)
      .select()
      .single();

    if (error) {
      console.error("GAGAL MENYIMPAN WARGA KE SUPABASE:", error);

      alert("Data warga gagal disimpan ke Supabase.");

      return;
    }

    console.log("DATA WARGA BERHASIL DISIMPAN KE SUPABASE:", data);

    /*
    Ubah kembali data Supabase ke format
    yang digunakan oleh DataWarga.jsx.
  */

    const wargaBaru = mapSupabaseToWarga(data);

    /*
    Normalisasi agar format data tetap sama
    dengan data warga yang sudah ada.
  */

    const dataNormal = normalisasiData([...warga, wargaBaru]);

    setWarga(dataNormal);

    alert("Data warga berhasil disimpan.");

    batalForm();
  }

  async function handleDelete(id) {
    const konfirmasi = window.confirm(
      "Data warga akan dihapus permanen.\n\nApakah Anda yakin?",
    );

    if (!konfirmasi) return;

    console.log("MENGHAPUS DATA WARGA DARI SUPABASE:", id);

    const { error } = await supabase
      .from("warga")
      .delete()
      .eq("id", String(id));

    if (error) {
      console.error("GAGAL MENGHAPUS WARGA DARI SUPABASE:", error);

      alert("Data warga gagal dihapus dari Supabase.");
      return;
    }

    const dataBaru = warga.filter((item) => String(item.id) !== String(id));

    setWarga(dataBaru);

    console.log("DATA WARGA BERHASIL DIHAPUS DARI SUPABASE:", id);

    alert("Data warga berhasil dihapus.");
  }

  function tandaiMeninggal(item) {
    const konfirmasi = window.confirm(
      `Apakah ${item.nama} akan dipindahkan ke data Orang Meninggal?`,
    );

    if (!konfirmasi) return;

    setForm({
      ...initialForm,
      ...item,
      status: "Meninggal",
    });

    setEditId(item.id);
    setShowForm(true);
  }
  async function tandaiPindah(item) {
    const konfirmasi = window.confirm(
      `Apakah ${item.nama} benar sudah pindah dari lingkungan RT03?`,
    );

    if (!konfirmasi) return;

    const { data, error } = await supabase
      .from("warga")
      .update({
        status: "Pindah",
      })
      .eq("id", String(item.id))
      .select()
      .single();

    if (error) {
      console.error("GAGAL MENANDAI WARGA PINDAH:", error);
      alert("Gagal mengubah status warga menjadi Pindah.");
      return;
    }

    const wargaPindahBaru = normalisasiData([mapSupabaseToWarga(data)])[0];

    setWarga((prev) =>
      prev.map((w) => (String(w.id) === String(item.id) ? wargaPindahBaru : w)),
    );

    setOpenActionId(null);

    alert(`${item.nama} berhasil ditandai sebagai Pindah.`);
  }

  async function jadikanKepalaKeluarga(item) {
  if (!item) return;

  if (item.status !== "Aktif") {
    alert("Hanya warga Aktif yang dapat dijadikan Kepala Keluarga.");
    return;
  }

  // Cari anggota keluarga dalam KK yang sama
  const anggotaDalamKK = warga.filter(
    (w) => w.kk === item.kk,
  );

  // Cek apakah sudah ada Kepala Keluarga Aktif
  const kepalaAktif = anggotaDalamKK.find((w) => {
    const statusKeluarga = String(w.statusKeluarga || "")
      .trim()
      .toLowerCase();

    return (
      statusKeluarga === "kepala keluarga" &&
      w.status === "Aktif"
    );
  });

  if (kepalaAktif) {
    alert(
      `KK ini sudah memiliki Kepala Keluarga Aktif:\n\n${kepalaAktif.nama}\n\nSilakan ubah terlebih dahulu Status Keluarga Kepala Keluarga tersebut sebelum menetapkan Kepala Keluarga baru.`,
    );

    return;
  }

  const konfirmasi = window.confirm(
    `Jadikan ${item.nama} sebagai Kepala Keluarga?`,
  );

  if (!konfirmasi) return;

  const { data, error } = await supabase
    .from("warga")
    .update({
      status_keluarga: "Kepala Keluarga",
    })
    .eq("id", String(item.id))
    .select()
    .single();

  if (error) {
    console.error(
      "GAGAL MENJADIKAN KEPALA KELUARGA:",
      error,
    );

    alert("Gagal menetapkan Kepala Keluarga.");
    return;
  }

  const wargaBaru = normalisasiData([
    mapSupabaseToWarga(data),
  ])[0];

  setWarga((prev) =>
    prev.map((w) =>
      String(w.id) === String(item.id)
        ? wargaBaru
        : w,
    ),
  );

  alert(
    `${item.nama} berhasil ditetapkan sebagai Kepala Keluarga.`,
  );
}

  async function kembalikanAktif(item) {
    const konfirmasi = window.confirm(
      `Kembalikan ${item.nama} menjadi warga Aktif?`,
    );

    if (!konfirmasi) return;

    console.log("MENGEMBALIKAN WARGA MENJADI AKTIF DI SUPABASE:", item.id);

    const dataSupabase = {
      status: "Aktif",
      tanggal_meninggal: "",
      keterangan_meninggal: "",
    };

    const { data, error } = await supabase
      .from("warga")
      .update(dataSupabase)
      .eq("id", String(item.id))
      .select()
      .single();

    if (error) {
      console.error("GAGAL MENGEMBALIKAN WARGA MENJADI AKTIF:", error);

      alert("Data warga gagal dikembalikan menjadi Aktif.");
      return;
    }

    console.log("WARGA BERHASIL DIKEMBALIKAN MENJADI AKTIF:", data);

    const wargaUpdated = mapSupabaseToWarga(data);

    const dataBaru = warga.map((dataItem) =>
      String(dataItem.id) === String(item.id) ? wargaUpdated : dataItem,
    );

    const dataNormal = normalisasiData(dataBaru);

    setWarga(dataNormal);

    alert(`${item.nama} telah dikembalikan ke Warga Aktif.`);
  }

  const wargaAktif = warga.filter(
    (item) => (item.status || "Aktif") === "Aktif",
  );

  const wargaPindah = warga.filter((item) => item.status === "Pindah");

  const wargaMeninggal = warga.filter((item) => item.status === "Meninggal");

  /*
    Pencarian warga aktif
  */

  const wargaAktifFiltered = wargaAktif.filter((item) => {
    const keyword = search.toLowerCase().trim();

    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.nik?.includes(keyword) ||
      item.kk?.includes(keyword)
    );
  });

  /*
    Pencarian warga pindah
  */

  const wargaPindahFiltered = wargaPindah.filter((item) => {
    const keyword = search.toLowerCase().trim();

    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.nik?.includes(keyword) ||
      item.kk?.includes(keyword)
    );
  });

  /*
    Pencarian warga meninggal
  */

  const wargaMeninggalFiltered = wargaMeninggal.filter((item) => {
    const keyword = search.toLowerCase().trim();

    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.nik?.includes(keyword) ||
      item.kk?.includes(keyword)
    );
  });

  /*
    Membuat daftar KK unik
  */

  const daftarKK = [];

  warga.forEach((item) => {
    if (!item.kk) return;

    // KK hanya masuk daftar jika masih memiliki
    // minimal satu anggota yang Aktif
    if (item.status !== "Aktif") return;

    const sudahAda = daftarKK.find((kk) => kk.nomor === item.kk);

    if (!sudahAda) {
      daftarKK.push({
        nomor: item.kk,
        anggota: [],
      });
    }
  });

  daftarKK.forEach((kk) => {
    kk.anggota = warga.filter((item) => item.kk === kk.nomor);
  });

  const daftarKKFiltered = daftarKK.filter((kk) => {
    const keyword = search.toLowerCase().trim();

    return (
      kk.nomor.includes(keyword) ||
      kk.anggota.some((item) => item.nama?.toLowerCase().includes(keyword))
    );
  });

  /*
    Detail keluarga berdasarkan KK
  */

  const anggotaKeluarga = selectedKK
    ? warga.filter((item) => item.kk === selectedKK)
    : [];

  /*
    Keluarga dari warga yang dipilih
  */

  const keluargaWarga = selectedWarga?.kk
    ? warga.filter(
        (item) => item.kk === selectedWarga.kk && item.id !== selectedWarga.id,
      )
    : [];

  return (
    <div className="data-warga-page">
      {/* =========================
          HEADER
      ========================== */}

      <div className="page-header">
        <div>
          <h2>Data Warga</h2>

          <p>Data penduduk RT 03 / RW 07 Karet - Setiabudi</p>
        </div>

        {!showForm && (
          <button className="btn-primary" onClick={bukaFormTambah}>
            + Tambah Warga
          </button>
        )}
      </div>

      {/* =========================
          FORM
      ========================== */}

      {showForm ? (
        <div className="form-card">
          <div className="form-title">
            <h3>{editId ? "Edit Data Warga" : "Tambah Data Warga"}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* =========================
        STATUS KEPENDUDUKAN
    ========================== */}

              <div className="form-group">
                <label>Status Kependudukan</label>

                <select
                  name="statusKependudukan"
                  value={form.statusKependudukan}
                  onChange={handleChange}
                >
                  <option value="Warga RT03">Warga RT03</option>
                  <option value="Pendatang">Pendatang</option>
                </select>
              </div>

              {/* =========================
        NIK
    ========================== */}

              <div className="form-group">
                <label>NIK</label>

                <input
                  type="text"
                  name="nik"
                  value={form.nik}
                  onChange={handleChange}
                  maxLength="16"
                  placeholder="16 digit NIK"
                />
              </div>

              {/* =========================
        KARTU KELUARGA
    ========================== */}

              <div className="form-group">
                <label>Kartu Keluarga</label>

                <input
                  type="text"
                  name="kk"
                  value={form.kk}
                  onChange={handleChange}
                  maxLength="16"
                  placeholder="16 digit Nomor KK"
                />
              </div>

              {/* =========================
        NAMA
    ========================== */}

              <div className="form-group">
                <label>Nama</label>

                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                />
              </div>

              {/* =========================
        TEMPAT LAHIR
    ========================== */}

              <div className="form-group">
                <label>Tempat Lahir</label>

                <input
                  type="text"
                  name="tempatLahir"
                  value={form.tempatLahir}
                  onChange={handleChange}
                  placeholder="Tempat lahir"
                />
              </div>

              {/* =========================
        TANGGAL LAHIR
    ========================== */}

              <div className="form-group">
                <label>Tanggal Lahir</label>

                <input
                  type="date"
                  name="tanggalLahir"
                  value={form.tanggalLahir}
                  onChange={handleChange}
                />
              </div>

              {/* =========================
        JENIS KELAMIN
    ========================== */}

              <div className="form-group">
                <label>Jenis Kelamin</label>

                <select
                  name="jenisKelamin"
                  value={form.jenisKelamin}
                  onChange={handleChange}
                >
                  <option value="">-- Pilih --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* =========================
        ALAMAT
    ========================== */}

              <div className="form-group form-group-full">
                <label>Alamat</label>

                <textarea
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Alamat lengkap"
                  rows="3"
                />
              </div>

              {/* =========================
        ALAMAT / TELEPON
    ========================== */}

              {form.statusKependudukan === "Pendatang" ? (
                <div className="form-group">
                  <label>No. Tlp</label>

                  <input
                    type="text"
                    name="nomorTelepon"
                    value={form.nomorTelepon || ""}
                    onChange={handleChange}
                    placeholder="Nomor telepon / WhatsApp"
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>RT/RW</label>

                    <input type="text" name="rtRw" value={form.rtRw} readOnly />
                  </div>

                  <div className="form-group">
                    <label>Kelurahan</label>

                    <input
                      type="text"
                      name="kelurahan"
                      value={form.kelurahan}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Kecamatan</label>

                    <input
                      type="text"
                      name="kecamatan"
                      value={form.kecamatan}
                      readOnly
                    />
                  </div>
                </>
              )}

              {/* =========================
        AGAMA
    ========================== */}

              <div className="form-group">
                <label>Agama</label>

                <select name="agama" value={form.agama} onChange={handleChange}>
                  <option value="">-- Pilih --</option>
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Budha">Budha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              {/* =========================
        STATUS PERKAWINAN
    ========================== */}

              <div className="form-group">
                <label>Status Perkawinan</label>

                <select
                  name="statusPerkawinan"
                  value={form.statusPerkawinan}
                  onChange={handleChange}
                >
                  <option value="">-- Pilih --</option>
                  <option value="Kawin Tercatat">Kawin Tercatat</option>
                  <option value="Kawin Tidak Tercatat">
                    Kawin Tidak Tercatat
                  </option>
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              {/* =========================
        PEKERJAAN
    ========================== */}

              <div className="form-group">
                <label>Pekerjaan</label>

                <input
                  type="text"
                  name="pekerjaan"
                  value={form.pekerjaan}
                  onChange={handleChange}
                  placeholder="Pekerjaan"
                />
              </div>

              {/* =========================
        KEWARGANEGARAAN
    ========================== */}

              <div className="form-group">
                <label>Kewarganegaraan</label>

                <select
                  name="kewarganegaraan"
                  value={form.kewarganegaraan}
                  onChange={handleChange}
                >
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>

              {/* =========================
        STATUS DALAM KELUARGA
    ========================== */}

              <div className="form-group">
                <label>Status dalam Keluarga</label>

                <select
                  name="statusKeluarga"
                  value={form.statusKeluarga}
                  onChange={handleChange}
                >
                  <option value="">-- Pilih --</option>
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Keluarga Lain">Keluarga Lain</option>
                </select>
              </div>

              {/* =========================
    STATUS TINGGAL
========================= */}

              <div className="form-group">
                <label>Status Tinggal</label>

                {form.statusKependudukan === "Pendatang" ? (
                  <input type="text" value="Tinggal di RT03" readOnly />
                ) : (
                  <select
                    name="statusTinggal"
                    value={form.statusTinggal}
                    onChange={handleChange}
                  >
                    <option value="Tinggal di RT03">Tinggal di RT03</option>

                    <option value="Tinggal di luar RT03">
                      Tinggal di luar RT03
                    </option>
                  </select>
                )}
              </div>

              {/* =========================
    JENIS TINGGAL PENDATANG
========================= */}

              {form.statusKependudukan === "Pendatang" && (
                <>
                  <div className="form-group">
                    <label>Jenis Tinggal</label>

                    <select
                      name="jenisTinggal"
                      value={form.jenisTinggal}
                      onChange={handleChange}
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Kost">Kost</option>
                      <option value="Kontrak">Kontrak</option>
                    </select>
                  </div>

                  {/* PILIH KOST */}

                  {form.jenisTinggal === "Kost" && (
                    <div className="form-group">
                      <label>Tempat Kost</label>

                      <select
                        name="tempatKostId"
                        value={form.tempatKostId}
                        onChange={handleChange}
                      >
                        <option value="">-- Pilih Tempat Kost --</option>

                        {daftarKost.map((kost) => (
                          <option key={kost.id} value={kost.id}>
                            {kost.namaKost}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ALAMAT KONTRAK */}

                  {form.jenisTinggal === "Kontrak" && (
                    <div className="form-group form-group-full">
                      <label>Alamat Kontrak</label>

                      <textarea
                        name="alamatKontrak"
                        value={form.alamatKontrak}
                        onChange={handleChange}
                        placeholder="Masukkan alamat tempat tinggal kontrak"
                        rows="3"
                      />
                    </div>
                  )}
                </>
              )}

              {/* =========================
    STATUS WARGA
========================= */}

              <div className="form-group">
                <label>Status Warga</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pindah">Pindah</option>
                  <option value="Meninggal">Meninggal</option>
                </select>
              </div>

              {/* =========================
    DATA MENINGGAL
========================= */}

              {form.status === "Meninggal" && (
                <>
                  <div className="form-group">
                    <label>Tanggal Meninggal</label>

                    <input
                      type="date"
                      name="tanggalMeninggal"
                      value={form.tanggalMeninggal}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label>Keterangan Meninggal</label>

                    <textarea
                      name="keteranganMeninggal"
                      value={form.keteranganMeninggal}
                      onChange={handleChange}
                      placeholder="Keterangan tambahan jika diperlukan"
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={batalForm}
                >
                  Batal
                </button>

                <button type="submit" className="btn-primary">
                  {editId ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* =========================
           DATA
        ========================== */

        <div className="data-card">
          {/* TAB */}

          <div className="status-tabs">
            <button
              className={
                tabAktif === "aktif" ? "status-tab active" : "status-tab"
              }
              onClick={() => {
                setTabAktif("aktif");
                setSearch("");
              }}
            >
              👥 Warga Aktif
              <span>{wargaAktif.length}</span>
            </button>

            <button
              className={
                tabAktif === "pindah" ? "status-tab active" : "status-tab"
              }
              onClick={() => {
                setTabAktif("pindah");
                setSearch("");
              }}
            >
              🚚 Warga Pindah
              <span>{wargaPindah.length}</span>
            </button>

            <button
              className={
                tabAktif === "meninggal" ? "status-tab active" : "status-tab"
              }
              onClick={() => {
                setTabAktif("meninggal");
                setSearch("");
              }}
            >
              🕊️ Orang Meninggal
              <span>{wargaMeninggal.length}</span>
            </button>

            <button
              className={
                tabAktif === "keluarga" ? "status-tab active" : "status-tab"
              }
              onClick={() => {
                setTabAktif("keluarga");
                setSearch("");
              }}
            >
              🏠 Data Keluarga / KK
              <span>{daftarKK.length}</span>
            </button>
          </div>

          {/* TOOLBAR */}

          <div className="data-toolbar">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tabAktif === "keluarga"
                  ? "Cari No. KK atau nama keluarga..."
                  : "Cari NIK, Nama, atau No. KK..."
              }
              className="search-input"
            />

            {tabAktif === "aktif" && (
              <div className="total-data">
                Warga Aktif: <strong>{wargaAktif.length}</strong>
              </div>
            )}

            {tabAktif === "pindah" && (
              <div className="total-data">
                Warga Pindah: <strong>{wargaPindah.length}</strong>
              </div>
            )}

            {tabAktif === "meninggal" && (
              <div className="total-data">
                Orang Meninggal: <strong>{wargaMeninggal.length}</strong>
              </div>
            )}

            {tabAktif === "keluarga" && (
              <div className="total-data">
                Jumlah KK: <strong>{daftarKK.length}</strong>
              </div>
            )}
          </div>

          {/* =========================
              TAB WARGA AKTIF
          ========================== */}

          {tabAktif === "aktif" && (
            <div
              className="table-wrapper table-wrapper-warga-aktif table-scroll-floating"
              ref={tableWargaAktifRef}
            >
              <table className="data-table table-warga-aktif">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Status Keluarga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {wargaAktifFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        Belum ada data warga aktif.
                      </td>
                    </tr>
                  ) : (
                    wargaAktifFiltered.map((item, index) => (
                      <tr
                        key={item.id}
                        className={
                          item.statusKependudukan === "Pendatang"
                            ? "warga-pendatang-row"
                            : item.statusKependudukan === "Warga RT03" &&
                                item.statusTinggal === "Tinggal di luar RT03"
                              ? "warga-luar-rt-row"
                              : ""
                        }
                      >
                        <td>{index + 1}</td>

                        <td>{item.nik || "-"}</td>

                        <td>
                          <strong>{item.nama}</strong>
                        </td>

                        <td>{item.jenisKelamin || "-"}</td>

                        <td>{item.statusKeluarga || "-"}</td>

                        <td>
                          <div className="action-dropdown">
                            <button
                              type="button"
                              className="action-menu-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                const menuWidth = 175;
                                const menuHeight = 148;
                                const jarak = 6;

                                let top = rect.bottom + jarak;
                                let left = rect.right - menuWidth;

                                // Jika tidak cukup ruang di bawah,
                                // menu dibuka ke atas
                                if (top + menuHeight > window.innerHeight) {
                                  top = rect.top - menuHeight - jarak;
                                }

                                // Batas kiri
                                if (left < 5) {
                                  left = 5;
                                }

                                // Batas kanan
                                if (left + menuWidth > window.innerWidth - 5) {
                                  left = window.innerWidth - menuWidth - 5;
                                }

                                setActionMenuPosition({
                                  top,
                                  left,
                                });

                                setOpenActionId(item.id);
                              }}
                            >
                              ⋮ Aksi
                            </button>

                            {openActionId === item.id && (
                              <div
                                className="action-menu"
                                style={{
                                  position: "fixed",
                                  top: `${actionMenuPosition.top}px`,
                                  left: `${actionMenuPosition.left}px`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    bukaDetail(item);
                                  }}
                                >
                                  👁️ Detail
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    bukaFormEdit(item);
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    tandaiPindah(item);
                                  }}
                                >
                                  🚚 Tandai Pindah
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    tandaiMeninggal(item);
                                  }}
                                >
                                  🕊️ Tandai Meninggal
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    handleDelete(item.id);
                                  }}
                                >
                                  🗑️ Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="floating-scrollbar" ref={floatingScrollRef}>
                <div className="floating-scrollbar-content"></div>
              </div>
            </div>
          )}

          {/* =========================
    TAB WARGA PINDAH
========================== */}

          {tabAktif === "pindah" && (
            <div className="table-wrapper table-wrapper-warga-pindah table-scroll-floating">
              <table className="data-table table-warga-pindah">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>No. KK</th>
                    <th>Jenis Kelamin</th>
                    <th>Status Keluarga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {wargaPindahFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table">
                        Belum ada data warga pindah.
                      </td>
                    </tr>
                  ) : (
                    wargaPindahFiltered.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>{item.nik || "-"}</td>

                        <td>
                          <strong>{item.nama}</strong>
                        </td>

                        <td>{item.kk || "-"}</td>

                        <td>{item.jenisKelamin || "-"}</td>

                        <td>{item.statusKeluarga || "-"}</td>

                        <td>
                          <div className="action-dropdown">
                            <button
                              type="button"
                              className="action-menu-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                const menuWidth = 175;
                                const menuHeight = 148;
                                const jarak = 6;

                                let top = rect.bottom + jarak;
                                let left = rect.right - menuWidth;

                                if (top + menuHeight > window.innerHeight) {
                                  top = rect.top - menuHeight - jarak;
                                }

                                if (left < 5) {
                                  left = 5;
                                }

                                if (left + menuWidth > window.innerWidth - 5) {
                                  left = window.innerWidth - menuWidth - 5;
                                }

                                setActionMenuPosition({
                                  top,
                                  left,
                                });

                                setOpenActionId(item.id);
                              }}
                            >
                              ⋮ Aksi
                            </button>

                            {openActionId === item.id && (
                              <div
                                className="action-menu"
                                style={{
                                  position: "fixed",
                                  top: `${actionMenuPosition.top}px`,
                                  left: `${actionMenuPosition.left}px`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    bukaDetail(item);
                                  }}
                                >
                                  👁️ Detail
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    bukaFormEdit(item);
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    kembalikanAktif(item);
                                  }}
                                >
                                  ↩️ Kembalikan Aktif
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    handleDelete(item.id);
                                  }}
                                  className="danger"
                                >
                                  🗑️ Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* =========================
              TAB MENINGGAL
          ========================== */}

          {tabAktif === "meninggal" && (
            <div
              className="table-wrapper table-wrapper-warga-meninggal table-scroll-floating"
              ref={tableWargaMeninggalRef}
            >
              <table className="data-table table-warga-meninggal">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>No. KK</th>
                    <th>Tanggal Meninggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {wargaMeninggalFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        Belum ada data orang meninggal.
                      </td>
                    </tr>
                  ) : (
                    wargaMeninggalFiltered.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>{item.nik || "-"}</td>

                        <td>
                          <strong>{item.nama}</strong>
                        </td>

                        <td>{item.kk || "-"}</td>

                        <td>{formatTanggal(item.tanggalMeninggal)}</td>

                        <td>
                          <div className="action-dropdown">
                            <button
                              type="button"
                              className="action-menu-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                const menuWidth = 175;
                                const menuHeight = 148;
                                const jarak = 6;

                                let top = rect.bottom + jarak;
                                let left = rect.right - menuWidth;

                                // Jika tidak cukup ruang di bawah,
                                // menu dibuka ke atas
                                if (top + menuHeight > window.innerHeight) {
                                  top = rect.top - menuHeight - jarak;
                                }

                                // Batas kiri
                                if (left < 5) {
                                  left = 5;
                                }

                                // Batas kanan
                                if (left + menuWidth > window.innerWidth - 5) {
                                  left = window.innerWidth - menuWidth - 5;
                                }

                                setActionMenuPosition({
                                  top,
                                  left,
                                });

                                setOpenActionId(item.id);
                              }}
                            >
                              ⋮ Aksi
                            </button>

                            {openActionId === item.id && (
                              <div
                                className="action-menu"
                                style={{
                                  position: "fixed",
                                  top: `${actionMenuPosition.top}px`,
                                  left: `${actionMenuPosition.left}px`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    bukaDetail(item);
                                  }}
                                >
                                  👁️ Detail
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    bukaFormEdit(item);
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    kembalikanAktif(item);
                                  }}
                                >
                                  ↩️ Kembalikan Aktif
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    handleDelete(item.id);
                                  }}
                                >
                                  🗑️ Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div
                className="floating-scrollbar floating-scrollbar-meninggal"
                ref={floatingScrollMeninggalRef}
              >
                <div className="floating-scrollbar-content"></div>
              </div>
            </div>
          )}

          {/* =========================
              TAB DATA KELUARGA
          ========================== */}

          {tabAktif === "keluarga" && (
            <div
              className="table-wrapper table-wrapper-keluarga table-scroll-floating"
              ref={tableKeluargaRef}
            >
              <table className="data-table table-keluarga">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>No. KK</th>
                    <th>Kepala Keluarga</th>
                    <th>Jumlah Anggota</th>
                    <th>Anggota Keluarga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {daftarKKFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        Belum ada data keluarga.
                      </td>
                    </tr>
                  ) : (
                    daftarKKFiltered.map((keluarga, index) => {
                      const kepala = keluarga.anggota.find((item) => {
                        const statusKeluarga = String(item.statusKeluarga || "")
                          .trim()
                          .toLowerCase();

                        return (
                          statusKeluarga === "kepala keluarga" &&
                          item.status === "Aktif"
                        );
                      });

                      return (
                        <tr key={keluarga.nomor}>
                          <td>{index + 1}</td>

                          <td>
                            <strong>{keluarga.nomor}</strong>
                          </td>

                          <td>
                            {kepala ? (
                              kepala.nama
                            ) : (
                              <span className="kepala-belum-ditentukan">
                                Belum ditentukan
                              </span>
                            )}
                          </td>

                          <td>{keluarga.anggota.length}</td>

                          <td>
                            {keluarga.anggota.slice(0, 3).map((item) => (
                              <div key={item.id}>{item.nama}</div>
                            ))}

                            {keluarga.anggota.length > 3 && (
                              <small>
                                +{keluarga.anggota.length - 3} anggota lainnya
                              </small>
                            )}
                          </td>

                          <td>
                            <button
                              className="btn-detail"
                              onClick={() => setSelectedKK(keluarga.nomor)}
                            >
                              Lihat Keluarga
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div
                className="floating-scrollbar floating-scrollbar-keluarga"
                ref={floatingScrollKeluargaRef}
              >
                <div className="floating-scrollbar-content"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================
          MODAL DETAIL WARGA
      ================================================== */}

      {selectedWarga && (
        <div className="detail-overlay" onClick={() => setSelectedWarga(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* =========================
          HEADER
      ========================= */}
            <div className="detail-header">
              <div>
                <h3>Detail Warga</h3>
                <p>Data lengkap penduduk</p>
              </div>

              <button
                type="button"
                className="detail-close"
                onClick={() => setSelectedWarga(null)}
              >
                ✕
              </button>
            </div>

            {/* =========================
          BODY
      ========================= */}
            <div className="detail-body">
              {/* =========================
            PROFIL
        ========================= */}
              <div className="detail-profile">
                <div className="detail-avatar">
                  {selectedWarga.nama?.charAt(0)?.toUpperCase() || "?"}
                </div>

                <div className="detail-profile-info">
                  <h2>{selectedWarga.nama || "Tanpa Nama"}</h2>

                  <div className="detail-profile-meta">
                    <span
                      className={
                        selectedWarga.status === "Meninggal"
                          ? "status-badge deceased"
                          : selectedWarga.status === "Pindah"
                            ? "status-badge pindah"
                            : "status-badge active"
                      }
                    >
                      {selectedWarga.status === "Meninggal"
                        ? "Meninggal"
                        : selectedWarga.status === "Pindah"
                          ? "Pindah"
                          : "Aktif"}
                    </span>

                    {selectedWarga.statusKeluarga && (
                      <span className="detail-family-badge">
                        {selectedWarga.statusKeluarga}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* =========================
            IDENTITAS
        ========================= */}
              <div className="detail-section">
                <div className="detail-section-title">
                  <h4>🪪 Identitas</h4>
                </div>

                <div className="detail-item">
                  <label>Status Kependudukan</label>
                  <strong>{selectedWarga.statusKependudukan || "-"}</strong>
                </div>

                <div className="detail-item">
                  <label>Status Tinggal</label>
                  <strong>{selectedWarga.statusTinggal || "-"}</strong>
                </div>

                {selectedWarga.statusKependudukan === "Pendatang" && (
                  <div className="detail-item">
                    <label>No. Tlp</label>
                    <strong>{selectedWarga.nomorTelepon || "-"}</strong>
                  </div>
                )}

                {selectedWarga.statusKependudukan === "Pendatang" && (
                  <>
                    <div className="detail-item">
                      <label>Jenis Tinggal</label>
                      <strong>{selectedWarga.jenisTinggal || "-"}</strong>
                    </div>
                    ...
                  </>
                )}

                <div className="detail-item">
                  <label>Status Tinggal</label>
                  <strong>{selectedWarga.statusTinggal || "-"}</strong>
                </div>

                {selectedWarga.statusKependudukan === "Pendatang" && (
                  <>
                    <div className="detail-item">
                      <label>Jenis Tinggal</label>
                      <strong>{selectedWarga.jenisTinggal || "-"}</strong>
                    </div>

                    {selectedWarga.jenisTinggal === "Kost" && (
                      <div className="detail-item">
                        <label>Tempat Kost</label>
                        <strong>{selectedWarga.tempatKostNama || "-"}</strong>
                      </div>
                    )}

                    {selectedWarga.jenisTinggal === "Kontrak" && (
                      <div className="detail-item">
                        <label>Alamat Kontrak</label>
                        <strong>{selectedWarga.alamatKontrak || "-"}</strong>
                      </div>
                    )}
                  </>
                )}

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>NIK</label>
                    <strong>{selectedWarga.nik || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>No. KK</label>
                    <strong>{selectedWarga.kk || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* =========================
            DATA PRIBADI
        ========================= */}
              <div className="detail-section">
                <div className="detail-section-title">
                  <h4>👤 Data Pribadi</h4>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tempat Lahir</label>
                    <strong>{selectedWarga.tempatLahir || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Tanggal Lahir</label>
                    <strong>{formatTanggal(selectedWarga.tanggalLahir)}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Jenis Kelamin</label>
                    <strong>{selectedWarga.jenisKelamin || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Agama</label>
                    <strong>{selectedWarga.agama || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Status Perkawinan</label>
                    <strong>{selectedWarga.statusPerkawinan || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Pekerjaan</label>
                    <strong>{selectedWarga.pekerjaan || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Kewarganegaraan</label>
                    <strong>{selectedWarga.kewarganegaraan || "-"}</strong>
                  </div>

                  <div className="detail-item">
                    <label>Status dalam Keluarga</label>
                    <strong>{selectedWarga.statusKeluarga || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* =========================
            ALAMAT
        ========================= */}
              <div className="detail-section">
                <div className="detail-section-title">
                  <h4>📍 Alamat</h4>
                </div>

                <div className="detail-address">
                  <strong>{selectedWarga.alamat || "-"}</strong>

                  <div className="detail-location">
                    <span>
                      RT/RW: <strong>{selectedWarga.rtRw || "03/07"}</strong>
                    </span>

                    <span>
                      Kelurahan:{" "}
                      <strong>{selectedWarga.kelurahan || "Karet"}</strong>
                    </span>

                    <span>
                      Kecamatan:{" "}
                      <strong>{selectedWarga.kecamatan || "Setiabudi"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* =========================
            INFORMASI MENINGGAL
        ========================= */}
              {selectedWarga.status === "Meninggal" && (
                <div className="deceased-info">
                  <div className="deceased-title">
                    <span className="deceased-icon">🕊️</span>

                    <div>
                      <h4>Informasi Meninggal</h4>
                      <p>Data riwayat warga yang telah meninggal</p>
                    </div>
                  </div>

                  <div className="deceased-grid">
                    <div>
                      <label>Tanggal Meninggal</label>
                      <strong>
                        {formatTanggal(selectedWarga.tanggalMeninggal)}
                      </strong>
                    </div>

                    <div>
                      <label>Keterangan</label>
                      <strong>
                        {selectedWarga.keteranganMeninggal || "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================
            DATA KELUARGA
        ========================= */}
              <div className="family-section">
                <div className="family-section-header">
                  <div>
                    <h4>🏠 Data Keluarga</h4>

                    <p>
                      No. KK: <strong>{selectedWarga.kk || "-"}</strong>
                    </p>
                  </div>
                </div>

                {!selectedWarga.kk ? (
                  <div className="family-empty">Nomor KK belum tersedia.</div>
                ) : keluargaWarga.length === 0 ? (
                  <div className="family-empty">
                    Tidak ada anggota keluarga lain yang terdaftar dengan No. KK
                    ini.
                  </div>
                ) : (
                  <div className="family-list">
                    {keluargaWarga.map((anggota) => (
                      <div className="family-item" key={anggota.id}>
                        <div className="family-avatar">
                          {anggota.nama?.charAt(0)?.toUpperCase() || "?"}
                        </div>

                        <div className="family-info">
                          <strong>{anggota.nama || "Tanpa Nama"}</strong>

                          <span>{anggota.statusKeluarga || "-"}</span>

                          <small>NIK: {anggota.nik || "-"}</small>
                        </div>

                        <span
                          className={
                            anggota.status === "Meninggal"
                              ? "status-badge deceased"
                              : anggota.status === "Pindah"
                                ? "status-badge pindah"
                                : "status-badge active"
                          }
                        >
                          {anggota.status === "Meninggal"
                            ? "Meninggal"
                            : anggota.status === "Pindah"
                              ? "Pindah"
                              : "Aktif"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* =========================
            FOOTER
        ========================= */}
              <div className="detail-footer">
                <button
                  type="button"
                  className="detail-close-button"
                  onClick={() => setSelectedWarga(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL DETAIL KELUARGA
      ================================================== */}

      {selectedKK && (
        <div className="detail-overlay" onClick={() => setSelectedKK(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div>
                <h3>Data Keluarga</h3>

                <p>
                  No. KK: <strong>{selectedKK}</strong>
                </p>
              </div>

              <button
                className="detail-close"
                onClick={() => setSelectedKK(null)}
              >
                ✕
              </button>
            </div>

            <div className="detail-body">
              <div className="family-list">
                {anggotaKeluarga.map((anggota) => (
                  <div className="family-item" key={anggota.id}>
                    <div className="family-avatar">
                      {anggota.nama?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div className="family-info">
                      <strong>{anggota.nama || "Tanpa Nama"}</strong>

                      <span>{anggota.statusKeluarga || "-"}</span>

                      <small>NIK: {anggota.nik || "-"}</small>

                      {anggota.status === "Aktif" &&
                        anggota.statusKeluarga !== "Kepala Keluarga" && (
                          <button
                            type="button"
                            className="btn-jadikan-kepala"
                            onClick={() => jadikanKepalaKeluarga(anggota)}
                          >
                            👑 Jadikan Kepala Keluarga
                          </button>
                        )}
                    </div>

                    <span
                      className={
                        anggota.status === "Meninggal"
                          ? "status-badge deceased"
                          : anggota.status === "Pindah"
                            ? "status-badge pindah"
                            : "status-badge active"
                      }
                    >
                      {anggota.status === "Meninggal"
                        ? "Meninggal"
                        : anggota.status === "Pindah"
                          ? "Pindah"
                          : "Aktif"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataWarga;
