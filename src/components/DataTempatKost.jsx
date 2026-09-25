import { useEffect, useState } from "react";
import "./DataTempatKost.css";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "rt03_data_tempat_kost";
const DISTRIBUSI_STORAGE_KEY = "rt03_distribusi_kost_bulanan";

const initialForm = {
  namaKost: "",
  alamat: "",
  jumlahKamar: "",
  jumlahAnakKost: "",
  distribusiPerOrang: "",
  status: "Aktif",
};

const initialDistribusiForm = {
  bulan: "",
  kostId: "",
  jumlahAnakKost: "",
  distribusiPerOrang: "",
  statusPenerimaan: "Belum Diterima",
  tanggalDiterima: "",
  keterangan: "",
};

function DataTempatKost() {
  const [dataKost, setDataKost] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [dataDistribusi, setDataDistribusi] = useState([]);
  const [formDistribusi, setFormDistribusi] = useState(initialDistribusiForm);
  const [editDistribusiId, setEditDistribusiId] = useState(null);
  const [showDistribusiForm, setShowDistribusiForm] = useState(false);
  const [bulanRekap, setBulanRekap] = useState("");

  // ================================
  // LOAD DATA TEMPAT KOST
  // ================================

  useEffect(() => {
    async function loadDataKost() {
      try {
        console.log("MEMUAT DATA TEMPAT KOST DARI SUPABASE...");

        const { data, error } = await supabase
          .from("tempat_kost")
          .select("*")
          .order("nama_kost", { ascending: true });

        if (error) {
          console.error("GAGAL MEMUAT DATA TEMPAT KOST DARI SUPABASE:", error);

          return;
        }

        const dataKostSupabase = data.map((item) => ({
          id: item.id,
          namaKost: item.nama_kost || "",
          alamat: item.alamat || "",
          jumlahKamar: Number(item.jumlah_kamar || 0),
          jumlahAnakKost: Number(item.jumlah_anak_kost || 0),
          distribusiPerOrang: Number(item.distribusi_per_orang || 0),
          totalDistribusi: Number(item.total_distribusi || 0),
          status: item.status || "Aktif",
        }));

        setDataKost(dataKostSupabase);

        console.log(
          `BERHASIL MEMUAT ${dataKostSupabase.length} DATA TEMPAT KOST DARI SUPABASE.`,
        );
      } catch (error) {
        console.error("ERROR MEMUAT DATA TEMPAT KOST:", error);
      }
    }

    loadDataKost();
  }, []);

  // ================================
  // LOAD DATA DISTRIBUSI BULANAN
  // ================================

  useEffect(() => {
    async function loadDataDistribusi() {
      try {
        console.log("MEMUAT DATA DISTRIBUSI BULANAN DARI SUPABASE...");

        const { data, error } = await supabase
          .from("distribusi_kost_bulanan")
          .select("*")
          .order("bulan", { ascending: false })
          .order("nama_kost", { ascending: true });

        if (error) {
          console.error(
            "GAGAL MEMUAT DATA DISTRIBUSI BULANAN DARI SUPABASE:",
            error,
          );

          return;
        }

        const dataDistribusiSupabase = data.map((item) => ({
          id: item.id,
          bulan: item.bulan || "",
          kostId: item.kost_id || "",
          namaKost: item.nama_kost || "",
          jumlahAnakKost: Number(item.jumlah_anak_kost || 0),
          distribusiPerOrang: Number(item.distribusi_per_orang || 0),
          totalDistribusi: Number(item.total_distribusi || 0),
          statusPenerimaan: item.status_penerimaan || "Belum Diterima",
          tanggalDiterima: item.tanggal_diterima || "",
          keterangan: item.keterangan || "",
        }));

        setDataDistribusi(dataDistribusiSupabase);

        console.log(
          `BERHASIL MEMUAT ${dataDistribusiSupabase.length} DATA DISTRIBUSI BULANAN DARI SUPABASE.`,
        );
      } catch (error) {
        console.error("ERROR MEMUAT DATA DISTRIBUSI BULANAN:", error);
      }
    }

    loadDataDistribusi();
  }, []);

  // ================================
  // HANDLE CHANGE TEMPAT KOST
  // ================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================================
  // RESET FORM TEMPAT KOST
  // ================================

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  // ================================
  // TAMBAH TEMPAT KOST
  // ================================

  const handleTambah = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // TOTAL DISTRIBUSI TEMPAT KOST
  // ================================

  const totalDistribusi =
    Number(form.jumlahAnakKost || 0) * Number(form.distribusiPerOrang || 0);

  // ================================
  // SIMPAN TEMPAT KOST
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.namaKost.trim()) {
      alert("Nama Kost wajib diisi.");
      return;
    }

    if (!form.alamat.trim()) {
      alert("Alamat Kost wajib diisi.");
      return;
    }

    if (!form.jumlahKamar) {
      alert("Jumlah Kamar wajib diisi.");
      return;
    }

    if (!form.jumlahAnakKost) {
      alert("Jumlah Anak Kost wajib diisi.");
      return;
    }

    if (!form.distribusiPerOrang) {
      alert("Distribusi / Orang wajib diisi.");
      return;
    }

    // =====================================================
    // EDIT DATA
    // UNTUK SEMENTARA TETAP MENGGUNAKAN CARA LAMA
    // =====================================================

    if (editId) {
      const dataSupabase = {
        nama_kost: form.namaKost.trim(),
        alamat: form.alamat.trim(),
        jumlah_kamar: Number(form.jumlahKamar),
        jumlah_anak_kost: Number(form.jumlahAnakKost),
        distribusi_per_orang: Number(form.distribusiPerOrang),
        total_distribusi: Number(totalDistribusi),
        status: form.status || "Aktif",
      };

      console.log(
        "MENGUPDATE DATA TEMPAT KOST DI SUPABASE:",
        editId,
        dataSupabase,
      );

      const { data, error } = await supabase
        .from("tempat_kost")
        .update(dataSupabase)
        .eq("id", String(editId))
        .select()
        .single();

      if (error) {
        console.error("GAGAL MENGUPDATE DATA TEMPAT KOST DI SUPABASE:", error);

        alert("Data tempat kost gagal diperbarui di Supabase.");

        return;
      }

      console.log("DATA TEMPAT KOST BERHASIL DIUPDATE DI SUPABASE:", data);

      const dataKostUpdated = {
        id: data.id,
        namaKost: data.nama_kost || "",
        alamat: data.alamat || "",
        jumlahKamar: Number(data.jumlah_kamar || 0),
        jumlahAnakKost: Number(data.jumlah_anak_kost || 0),
        distribusiPerOrang: Number(data.distribusi_per_orang || 0),
        totalDistribusi: Number(data.total_distribusi || 0),
        status: data.status || "Aktif",
      };

      setDataKost((dataSebelumnya) =>
        dataSebelumnya.map((item) =>
          String(item.id) === String(editId) ? dataKostUpdated : item,
        ),
      );

      alert("Data tempat kost berhasil diperbarui.");

      resetForm();
      return;
    }

    // =====================================================
    // TAMBAH DATA BARU → SUPABASE
    // =====================================================

    const idBaru = String(Date.now());

    const dataSupabase = {
      id: idBaru,
      nama_kost: form.namaKost.trim(),
      alamat: form.alamat.trim(),
      jumlah_kamar: Number(form.jumlahKamar),
      jumlah_anak_kost: Number(form.jumlahAnakKost),
      distribusi_per_orang: Number(form.distribusiPerOrang),
      total_distribusi: Number(totalDistribusi),
      status: form.status || "Aktif",
    };

    console.log("MENYIMPAN DATA TEMPAT KOST KE SUPABASE:", dataSupabase);

    const { data, error } = await supabase
      .from("tempat_kost")
      .insert(dataSupabase)
      .select()
      .single();

    if (error) {
      console.error("GAGAL MENYIMPAN DATA TEMPAT KOST KE SUPABASE:", error);

      alert("Data tempat kost gagal disimpan ke Supabase.");

      return;
    }

    console.log("DATA TEMPAT KOST BERHASIL DISIMPAN KE SUPABASE:", data);

    const dataKostBaru = {
      id: data.id,
      namaKost: data.nama_kost || "",
      alamat: data.alamat || "",
      jumlahKamar: Number(data.jumlah_kamar || 0),
      jumlahAnakKost: Number(data.jumlah_anak_kost || 0),
      distribusiPerOrang: Number(data.distribusi_per_orang || 0),
      totalDistribusi: Number(data.total_distribusi || 0),
      status: data.status || "Aktif",
    };

    setDataKost((dataSebelumnya) => [...dataSebelumnya, dataKostBaru]);

    alert("Data tempat kost berhasil disimpan.");

    resetForm();
  };

  // ================================
  // EDIT TEMPAT KOST
  // ================================

  const handleEdit = (item) => {
    setForm({
      namaKost: item.namaKost || "",
      alamat: item.alamat || "",
      jumlahKamar: item.jumlahKamar ?? "",
      jumlahAnakKost: item.jumlahAnakKost ?? "",
      distribusiPerOrang: item.distribusiPerOrang ?? "",
      status: item.status || "Aktif",
    });

    setEditId(item.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // HAPUS TEMPAT KOST
  // ================================

  const handleDelete = async (id) => {
    const item = dataKost.find((data) => String(data.id) === String(id));

    if (!item) return;

    const konfirmasi = window.confirm(
      `Hapus data tempat kost "${item.namaKost}"?`,
    );

    if (!konfirmasi) return;

    console.log("MENGHAPUS DATA TEMPAT KOST DARI SUPABASE:", id);

    const { error } = await supabase
      .from("tempat_kost")
      .delete()
      .eq("id", String(id));

    if (error) {
      console.error("GAGAL MENGHAPUS DATA TEMPAT KOST DARI SUPABASE:", error);

      alert("Data tempat kost gagal dihapus dari Supabase.");

      return;
    }

    const hasil = dataKost.filter((data) => String(data.id) !== String(id));

    setDataKost(hasil);

    console.log("DATA TEMPAT KOST BERHASIL DIHAPUS DARI SUPABASE:", id);

    if (String(editId) === String(id)) {
      resetForm();
    }

    alert(`Data tempat kost "${item.namaKost}" berhasil dihapus.`);
  };

  // ==================================================
  // DISTRIBUSI BULANAN
  // ==================================================

  // ================================
  // HANDLE CHANGE DISTRIBUSI
  // ================================

  const handleDistribusiChange = (e) => {
    const { name, value } = e.target;

    setFormDistribusi((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Jika memilih tempat kost,
    // otomatis mengambil data master kost
    if (name === "kostId") {
      const kostTerpilih = dataKost.find(
        (item) => String(item.id) === String(value),
      );

      if (kostTerpilih) {
        setFormDistribusi((prev) => ({
          ...prev,
          kostId: value,
          jumlahAnakKost: kostTerpilih.jumlahAnakKost ?? "",
          distribusiPerOrang: kostTerpilih.distribusiPerOrang ?? "",
        }));
      }
    }

    // Jika status kembali menjadi belum diterima,
    // tanggal penerimaan dikosongkan
    if (name === "statusPenerimaan" && value !== "Sudah Diterima") {
      setFormDistribusi((prev) => ({
        ...prev,
        statusPenerimaan: value,
        tanggalDiterima: "",
      }));
    }
  };

  // ================================
  // RESET DISTRIBUSI
  // ================================

  const resetDistribusiForm = () => {
    setFormDistribusi(initialDistribusiForm);
    setEditDistribusiId(null);
    setShowDistribusiForm(false);
  };

  // ================================
  // TAMBAH DISTRIBUSI
  // ================================

  const handleTambahDistribusi = () => {
    setFormDistribusi(initialDistribusiForm);
    setEditDistribusiId(null);
    setShowDistribusiForm(true);
  };

  // ================================
  // TOTAL DISTRIBUSI BULANAN
  // ================================

  const totalDistribusiBulanan =
    Number(formDistribusi.jumlahAnakKost || 0) *
    Number(formDistribusi.distribusiPerOrang || 0);

  // ================================
  // SIMPAN DISTRIBUSI BULANAN
  // ================================

  const handleSubmitDistribusi = async (e) => {
  e.preventDefault();

  if (!formDistribusi.bulan) {
    alert("Bulan wajib dipilih.");
    return;
  }

  if (!formDistribusi.kostId) {
    alert("Tempat Kost wajib dipilih.");
    return;
  }

  if (!formDistribusi.jumlahAnakKost) {
    alert("Jumlah Anak Kost wajib diisi.");
    return;
  }

  if (!formDistribusi.distribusiPerOrang) {
    alert("Distribusi / Orang wajib diisi.");
    return;
  }

  if (
    formDistribusi.statusPenerimaan === "Sudah Diterima" &&
    !formDistribusi.tanggalDiterima
  ) {
    alert(
      "Tanggal Diterima wajib diisi jika status Sudah Diterima."
    );
    return;
  }

  const kostTerpilih = dataKost.find(
    (item) =>
      String(item.id) === String(formDistribusi.kostId)
  );

  if (!kostTerpilih) {
    alert("Data tempat kost tidak ditemukan.");
    return;
  }

  // ==========================================
  // DATA UNTUK SUPABASE
  // ==========================================

  const dataSupabase = {
    bulan: formDistribusi.bulan,
    kost_id: String(formDistribusi.kostId),
    nama_kost: kostTerpilih.namaKost,
    jumlah_anak_kost: Number(
      formDistribusi.jumlahAnakKost
    ),
    distribusi_per_orang: Number(
      formDistribusi.distribusiPerOrang
    ),
    total_distribusi: Number(
      totalDistribusiBulanan
    ),
    status_penerimaan:
      formDistribusi.statusPenerimaan,
    tanggal_diterima:
      formDistribusi.statusPenerimaan === "Sudah Diterima"
        ? formDistribusi.tanggalDiterima
        : null,
    keterangan:
      formDistribusi.keterangan.trim(),
  };

  // ==========================================
  // EDIT
  // ==========================================

  if (editDistribusiId) {
    console.log(
      "MENGUPDATE DISTRIBUSI BULANAN DI SUPABASE:",
      editDistribusiId,
      dataSupabase
    );

    const { data, error } = await supabase
      .from("distribusi_kost_bulanan")
      .update(dataSupabase)
      .eq("id", String(editDistribusiId))
      .select()
      .single();

    if (error) {
      console.error(
        "GAGAL MENGUPDATE DISTRIBUSI BULANAN DI SUPABASE:",
        error
      );

      alert(
        "Gagal memperbarui distribusi bulanan.\n\n" +
          error.message
      );

      return;
    }

    console.log(
      "DISTRIBUSI BULANAN BERHASIL DIUPDATE DI SUPABASE:",
      data
    );

    const dataHasil = {
      id: data.id,
      bulan: data.bulan || "",
      kostId: data.kost_id || "",
      namaKost: data.nama_kost || "",
      jumlahAnakKost: Number(
        data.jumlah_anak_kost || 0
      ),
      distribusiPerOrang: Number(
        data.distribusi_per_orang || 0
      ),
      totalDistribusi: Number(
        data.total_distribusi || 0
      ),
      statusPenerimaan:
        data.status_penerimaan ||
        "Belum Diterima",
      tanggalDiterima:
        data.tanggal_diterima || "",
      keterangan:
        data.keterangan || "",
    };

    setDataDistribusi((prev) =>
      prev.map((item) =>
        String(item.id) === String(data.id)
          ? dataHasil
          : item
      )
    );

    alert(
      "Distribusi bulanan berhasil diperbarui."
    );

    resetDistribusiForm();
    return;
  }

  // ==========================================
  // ADD
  // ==========================================

  const dataBaruSupabase = {
    id: String(Date.now()),
    ...dataSupabase,
  };

  console.log(
    "MENYIMPAN DISTRIBUSI BULANAN KE SUPABASE:",
    dataBaruSupabase
  );

  const { data, error } = await supabase
    .from("distribusi_kost_bulanan")
    .insert([dataBaruSupabase])
    .select()
    .single();

  if (error) {
    console.error(
      "GAGAL MENYIMPAN DISTRIBUSI KE SUPABASE:",
      error
    );

    alert(
      "Gagal menyimpan distribusi bulanan.\n\n" +
        error.message
    );

    return;
  }

  console.log(
    "DISTRIBUSI BULANAN BERHASIL DISIMPAN DI SUPABASE:",
    data
  );

  const dataBaru = {
    id: data.id,
    bulan: data.bulan || "",
    kostId: data.kost_id || "",
    namaKost: data.nama_kost || "",
    jumlahAnakKost: Number(
      data.jumlah_anak_kost || 0
    ),
    distribusiPerOrang: Number(
      data.distribusi_per_orang || 0
    ),
    totalDistribusi: Number(
      data.total_distribusi || 0
    ),
    statusPenerimaan:
      data.status_penerimaan ||
      "Belum Diterima",
    tanggalDiterima:
      data.tanggal_diterima || "",
    keterangan:
      data.keterangan || "",
  };

  setDataDistribusi((prev) => [
    ...prev,
    dataBaru,
  ]);

  alert(
    "Distribusi bulanan berhasil disimpan."
  );

  resetDistribusiForm();
};

  // ================================
  // EDIT DISTRIBUSI
  // ================================

  const handleEditDistribusi = (item) => {
    setFormDistribusi({
      bulan: item.bulan || "",
      kostId: item.kostId || "",
      jumlahAnakKost: item.jumlahAnakKost ?? "",
      distribusiPerOrang: item.distribusiPerOrang ?? "",
      statusPenerimaan: item.statusPenerimaan || "Belum Diterima",
      tanggalDiterima: item.tanggalDiterima || "",
      keterangan: item.keterangan || "",
    });

    setEditDistribusiId(item.id);
    setShowDistribusiForm(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // ================================
  // HAPUS DISTRIBUSI
  // ================================

  const handleDeleteDistribusi = async (id) => {
  const item = dataDistribusi.find(
    (data) => String(data.id) === String(id)
  );

  if (!item) return;

  const konfirmasi = window.confirm(
    `Hapus data distribusi ${item.namaKost} bulan ${formatBulan(
      item.bulan
    )}?`
  );

  if (!konfirmasi) return;

  console.log(
    "MENGHAPUS DISTRIBUSI BULANAN DI SUPABASE:",
    id
  );

  const { error } = await supabase
    .from("distribusi_kost_bulanan")
    .delete()
    .eq("id", String(id));

  if (error) {
    console.error(
      "GAGAL MENGHAPUS DISTRIBUSI BULANAN DI SUPABASE:",
      error
    );

    alert(
      "Gagal menghapus distribusi bulanan.\n\n" +
        error.message
    );

    return;
  }

  console.log(
    "DISTRIBUSI BULANAN BERHASIL DIHAPUS DARI SUPABASE:",
    id
  );

  setDataDistribusi((prev) =>
    prev.filter(
      (data) => String(data.id) !== String(id)
    )
  );

  if (
    String(editDistribusiId) === String(id)
  ) {
    resetDistribusiForm();
  }

  alert(
    "Distribusi bulanan berhasil dihapus."
  );
};

  // ================================
  // FORMAT BULAN
  // ================================

  const formatBulan = (bulan) => {
    if (!bulan) return "-";

    const [tahun, bulanAngka] = bulan.split("-");

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

    const index = Number(bulanAngka) - 1;

    return `${namaBulan[index] || bulanAngka} ${tahun}`;
  };

  // ================================
  // FORMAT TANGGAL
  // ================================

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    const date = new Date(`${tanggal}T00:00:00`);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ================================
  // REKAP DISTRIBUSI BULANAN
  // ================================

  const dataRekap = dataDistribusi.filter((item) => item.bulan === bulanRekap);

  const jumlahKostRekap = dataRekap.length;

  const jumlahAnakKostRekap = dataRekap.reduce(
    (total, item) => total + Number(item.jumlahAnakKost || 0),
    0,
  );

  const totalTagihan = dataRekap.reduce(
    (total, item) => total + Number(item.totalDistribusi || 0),
    0,
  );

  const sudahDiterima = dataRekap
    .filter((item) => item.statusPenerimaan === "Sudah Diterima")
    .reduce((total, item) => total + Number(item.totalDistribusi || 0), 0);

  const belumDiterima = dataRekap
    .filter((item) => item.statusPenerimaan !== "Sudah Diterima")
    .reduce((total, item) => total + Number(item.totalDistribusi || 0), 0);

  // ================================
  // RENDER
  // ================================

  return (
    <div className="kost-page">
      {/* ================================
          HEADER
      ================================ */}

      <div className="kost-header">
        <h2>🏠 Data Tempat Kost</h2>

        <p>
          Data tempat kost yang berada di wilayah RT 03 / RW 07 Karet -
          Setiabudi
        </p>
      </div>

      {/* ================================
          TOMBOL TAMBAH TEMPAT KOST
      ================================ */}

      <div className="kost-form-actions">
        <button
          type="button"
          className="kost-btn-primary"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              handleTambah();
            }
          }}
        >
          {showForm ? "✕ Tutup Form" : "+ Tambah Tempat Kost"}
        </button>
      </div>

      {/* ================================
          FORM TEMPAT KOST
      ================================ */}

      {showForm && (
        <div className="kost-card">
          <div className="kost-card-title">
            <h3>{editId ? "Edit Tempat Kost" : "Tambah Tempat Kost"}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="kost-form-grid">
              <div className="kost-form-group">
                <label>Nama Kost</label>

                <input
                  type="text"
                  name="namaKost"
                  value={form.namaKost}
                  onChange={handleChange}
                  placeholder="Nama / identitas kost"
                />
              </div>

              <div className="kost-form-group">
                <label>Alamat Kost</label>

                <input
                  type="text"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Alamat tempat kost"
                />
              </div>

              <div className="kost-form-group">
                <label>Jumlah Kamar</label>

                <input
                  type="number"
                  min="0"
                  name="jumlahKamar"
                  value={form.jumlahKamar}
                  onChange={handleChange}
                  placeholder="Jumlah kamar"
                />
              </div>

              <div className="kost-form-group">
                <label>Jumlah Anak Kost</label>

                <input
                  type="number"
                  min="0"
                  name="jumlahAnakKost"
                  value={form.jumlahAnakKost}
                  onChange={handleChange}
                  placeholder="Jumlah penghuni"
                />
              </div>

              <div className="kost-form-group">
                <label>Distribusi / Orang</label>

                <input
                  type="number"
                  min="0"
                  name="distribusiPerOrang"
                  value={form.distribusiPerOrang}
                  onChange={handleChange}
                  placeholder="Contoh: 5000"
                />
              </div>

              <div className="kost-form-group">
                <label>Status Tempat Kost</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Aktif">Aktif</option>

                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              <div className="kost-form-group kost-total">
                <label>Total Distribusi</label>

                <input
                  type="text"
                  value={`Rp ${totalDistribusi.toLocaleString("id-ID")}`}
                  readOnly
                />
              </div>
            </div>

            <div className="kost-form-actions">
              <button type="submit" className="kost-btn-primary">
                {editId ? "Simpan Perubahan" : "Simpan"}
              </button>

              <button
                type="button"
                className="kost-btn-secondary"
                onClick={resetForm}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================
          DAFTAR TEMPAT KOST
      ================================ */}

      <div className="kost-card">
        <div className="kost-card-title">
          <h3>Daftar Tempat Kost</h3>
        </div>

        {dataKost.length === 0 ? (
          <div className="kost-empty">
            <div className="kost-empty-icon">🏠</div>

            <p>Belum ada data tempat kost.</p>
          </div>
        ) : (
          <div className="kost-table-wrapper">
            <table className="kost-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Kost</th>
                  <th>Alamat</th>
                  <th>Kamar</th>
                  <th>Anak Kost</th>
                  <th>Distribusi / Orang</th>
                  <th>Total Distribusi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {dataKost.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{item.namaKost}</strong>
                    </td>

                    <td>{item.alamat}</td>

                    <td>{item.jumlahKamar}</td>

                    <td>{item.jumlahAnakKost}</td>

                    <td>
                      Rp{" "}
                      {Number(item.distribusiPerOrang || 0).toLocaleString(
                        "id-ID",
                      )}
                    </td>

                    <td className="kost-total-cell">
                      Rp{" "}
                      {Number(item.totalDistribusi || 0).toLocaleString(
                        "id-ID",
                      )}
                    </td>

                    <td>
                      <span
                        className={`kost-status ${
                          item.status === "Tidak Aktif"
                            ? "tidak-aktif"
                            : "aktif"
                        }`}
                      >
                        {item.status || "Aktif"}
                      </span>
                    </td>

                    <td>
                      <div className="kost-actions">
                        <button
                          type="button"
                          className="kost-btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="kost-btn-delete"
                          onClick={() => handleDelete(item.id)}
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
      {/* ==================================================
    REKAP DISTRIBUSI
================================================== */}

      {/* ==================================================
    REKAP DISTRIBUSI
================================================== */}

      <div className="kost-card">
        <div className="kost-card-title">
          <h3>📊 Rekap Distribusi</h3>
        </div>

        {/* PILIH BULAN */}

        <div className="kost-rekap-filter">
          <label>Bulan Rekap</label>

          <input
            type="month"
            value={bulanRekap}
            onChange={(e) => setBulanRekap(e.target.value)}
          />
        </div>

        {/* HASIL REKAP */}

        <div className="kost-rekap-grid">
          {/* JUMLAH KOST */}

          <div className="kost-rekap-item">
            <div className="kost-rekap-label">🏠 Jumlah Tempat Kost</div>

            <div className="kost-rekap-value">{jumlahKostRekap} tempat</div>
          </div>

          {/* JUMLAH ANAK KOST */}

          <div className="kost-rekap-item">
            <div className="kost-rekap-label">👤 Total Anak Kost</div>

            <div className="kost-rekap-value">{jumlahAnakKostRekap} orang</div>
          </div>

          {/* TOTAL TAGIHAN */}

          <div className="kost-rekap-item">
            <div className="kost-rekap-label">💰 Total Tagihan</div>

            <div className="kost-rekap-value">
              Rp {totalTagihan.toLocaleString("id-ID")}
            </div>
          </div>

          {/* SUDAH DITERIMA */}

          <div className="kost-rekap-item">
            <div className="kost-rekap-label">✅ Sudah Diterima</div>

            <div className="kost-rekap-value">
              Rp {sudahDiterima.toLocaleString("id-ID")}
            </div>
          </div>

          {/* BELUM DITERIMA */}

          <div className="kost-rekap-item">
            <div className="kost-rekap-label">⏳ Belum Diterima</div>

            <div className="kost-rekap-value">
              Rp {belumDiterima.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          DISTRIBUSI BULANAN
      ================================================== */}

      <div className="kost-card">
        <div className="kost-card-title">
          <h3>💰 Distribusi Bulanan</h3>
        </div>

        {/* TOMBOL TAMBAH DISTRIBUSI */}

        <div className="kost-form-actions">
          <button
            type="button"
            className="kost-btn-primary"
            onClick={() => {
              if (showDistribusiForm) {
                resetDistribusiForm();
              } else {
                handleTambahDistribusi();
              }
            }}
          >
            {showDistribusiForm
              ? "✕ Tutup Form"
              : "+ Tambah Distribusi Bulanan"}
          </button>
        </div>

        {/* FORM DISTRIBUSI */}

        {showDistribusiForm && (
          <div className="kost-card">
            <div className="kost-card-title">
              <h3>
                {editDistribusiId
                  ? "Edit Distribusi Bulanan"
                  : "Tambah Distribusi Bulanan"}
              </h3>
            </div>

            <form onSubmit={handleSubmitDistribusi}>
              <div className="kost-form-grid">
                {/* BULAN */}

                <div className="kost-form-group">
                  <label>Bulan</label>

                  <input
                    type="month"
                    name="bulan"
                    value={formDistribusi.bulan}
                    onChange={handleDistribusiChange}
                  />
                </div>

                {/* TEMPAT KOST */}

                <div className="kost-form-group">
                  <label>Tempat Kost</label>

                  <select
                    name="kostId"
                    value={formDistribusi.kostId}
                    onChange={handleDistribusiChange}
                  >
                    <option value="">-- Pilih Tempat Kost --</option>

                    {dataKost
                      .filter((item) => item.status !== "Tidak Aktif")
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.namaKost}
                        </option>
                      ))}
                  </select>
                </div>

                {/* JUMLAH ANAK KOST */}

                <div className="kost-form-group">
                  <label>Jumlah Anak Kost</label>

                  <input
                    type="number"
                    min="0"
                    name="jumlahAnakKost"
                    value={formDistribusi.jumlahAnakKost}
                    onChange={handleDistribusiChange}
                    placeholder="Jumlah penghuni bulan ini"
                  />
                </div>

                {/* DISTRIBUSI / ORANG */}

                <div className="kost-form-group">
                  <label>Distribusi / Orang</label>

                  <input
                    type="number"
                    min="0"
                    name="distribusiPerOrang"
                    value={formDistribusi.distribusiPerOrang}
                    onChange={handleDistribusiChange}
                    placeholder="Contoh: 10000"
                  />
                </div>

                {/* STATUS */}

                <div className="kost-form-group">
                  <label>Status Penerimaan</label>

                  <select
                    name="statusPenerimaan"
                    value={formDistribusi.statusPenerimaan}
                    onChange={handleDistribusiChange}
                  >
                    <option value="Belum Diterima">Belum Diterima</option>

                    <option value="Sudah Diterima">Sudah Diterima</option>
                  </select>
                </div>

                {/* TANGGAL DITERIMA */}

                <div className="kost-form-group">
                  <label>Tanggal Diterima</label>

                  <input
                    type="date"
                    name="tanggalDiterima"
                    value={formDistribusi.tanggalDiterima}
                    onChange={handleDistribusiChange}
                    disabled={
                      formDistribusi.statusPenerimaan !== "Sudah Diterima"
                    }
                  />
                </div>

                {/* TOTAL */}

                <div className="kost-form-group kost-total">
                  <label>Total Distribusi</label>

                  <input
                    type="text"
                    value={`Rp ${totalDistribusiBulanan.toLocaleString(
                      "id-ID",
                    )}`}
                    readOnly
                  />
                </div>

                {/* KETERANGAN */}

                <div className="kost-form-group">
                  <label>Keterangan</label>

                  <input
                    type="text"
                    name="keterangan"
                    value={formDistribusi.keterangan}
                    onChange={handleDistribusiChange}
                    placeholder="Keterangan jika diperlukan"
                  />
                </div>
              </div>

              <div className="kost-form-actions">
                <button type="submit" className="kost-btn-primary">
                  {editDistribusiId ? "Simpan Perubahan" : "Simpan Distribusi"}
                </button>

                <button
                  type="button"
                  className="kost-btn-secondary"
                  onClick={resetDistribusiForm}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABEL DISTRIBUSI */}

        {dataDistribusi.length === 0 ? (
          <div className="kost-empty">
            <div className="kost-empty-icon">💰</div>

            <p>Belum ada data distribusi bulanan.</p>
          </div>
        ) : (
          <div className="kost-table-wrapper">
            <table className="kost-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Bulan</th>
                  <th>Tempat Kost</th>
                  <th>Anak Kost</th>
                  <th>Distribusi / Orang</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal Diterima</th>
                  <th>Keterangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {dataDistribusi.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>{formatBulan(item.bulan)}</td>

                    <td>
                      <strong>{item.namaKost}</strong>
                    </td>

                    <td>{item.jumlahAnakKost}</td>

                    <td>
                      Rp{" "}
                      {Number(item.distribusiPerOrang || 0).toLocaleString(
                        "id-ID",
                      )}
                    </td>

                    <td className="kost-total-cell">
                      Rp{" "}
                      {Number(item.totalDistribusi || 0).toLocaleString(
                        "id-ID",
                      )}
                    </td>

                    <td>
                      <span
                        className={`kost-status ${
                          item.statusPenerimaan === "Sudah Diterima"
                            ? "aktif"
                            : "tidak-aktif"
                        }`}
                      >
                        {item.statusPenerimaan}
                      </span>
                    </td>

                    <td>{formatTanggal(item.tanggalDiterima)}</td>

                    <td>{item.keterangan || "-"}</td>

                    <td>
                      <div className="kost-actions">
                        <button
                          type="button"
                          className="kost-btn-edit"
                          onClick={() => handleEditDistribusi(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="kost-btn-delete"
                          onClick={() => handleDeleteDistribusi(item.id)}
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

export default DataTempatKost;
