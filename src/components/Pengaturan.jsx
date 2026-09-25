import { useRef, useState } from "react";
import "./Pengaturan.css";
import { supabase } from "../lib/supabase";

function Pengaturan() {
  const fileInputRef = useRef(null);

  const [sedangBackup, setSedangBackup] = useState(false);
  const [sedangRestore, setSedangRestore] = useState(false);
  const [pesan, setPesan] = useState("");
  const [tipePesan, setTipePesan] = useState("");

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
      const {
        data: dataWarga,
        error: errorWarga,
      } = await supabase
        .from("warga")
        .select("*");

      if (errorWarga) {
        throw new Error(
          "Gagal mengambil data warga: " + errorWarga.message
        );
      }

      // -----------------------------------------------------
      // TEMPAT KOST
      // -----------------------------------------------------
      const {
        data: dataTempatKost,
        error: errorTempatKost,
      } = await supabase
        .from("tempat_kost")
        .select("*");

      if (errorTempatKost) {
        throw new Error(
          "Gagal mengambil data tempat kost: " +
            errorTempatKost.message
        );
      }

      // -----------------------------------------------------
      // SURAT PENGANTAR
      // -----------------------------------------------------
      const {
        data: dataSurat,
        error: errorSurat,
      } = await supabase
        .from("surat_pengantar")
        .select("*");

      if (errorSurat) {
        throw new Error(
          "Gagal mengambil data surat pengantar: " +
            errorSurat.message
        );
      }

      // -----------------------------------------------------
      // DISTRIBUSI KOST BULANAN
      // -----------------------------------------------------
      const {
        data: dataDistribusi,
        error: errorDistribusi,
      } = await supabase
        .from("distribusi_kost_bulanan")
        .select("*");

      if (errorDistribusi) {
        throw new Error(
          "Gagal mengambil data distribusi kost bulanan: " +
            errorDistribusi.message
        );
      }

      // -----------------------------------------------------
      // BENTUK DATA BACKUP
      // -----------------------------------------------------
      const backupData = {
        aplikasi: "Management RT03 / RW07",
        versiBackup: "1.0",
        tanggalBackup: new Date().toISOString(),

        data: {
          warga: dataWarga || [],
          tempat_kost: dataTempatKost || [],
          surat_pengantar: dataSurat || [],
          distribusi_kost_bulanan: dataDistribusi || [],
        },

        jumlahData: {
          warga: (dataWarga || []).length,
          tempat_kost: (dataTempatKost || []).length,
          surat_pengantar: (dataSurat || []).length,
          distribusi_kost_bulanan:
            (dataDistribusi || []).length,
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

      const tanggal = new Date()
        .toISOString()
        .slice(0, 10);

      link.download = `backup-rt03-${tanggal}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log(
        "BACKUP BERHASIL:",
        backupData.jumlahData
      );

      setPesan(
        `Backup berhasil dibuat. Warga: ${backupData.jumlahData.warga}, Tempat Kost: ${backupData.jumlahData.tempat_kost}, Surat: ${backupData.jumlahData.surat_pengantar}, Distribusi: ${backupData.jumlahData.distribusi_kost_bulanan}.`
      );

      setTipePesan("sukses");
    } catch (error) {
      console.error("GAGAL BACKUP DATA:", error);

      setPesan(
        "Backup gagal.\n\n" +
          (error.message || "Terjadi kesalahan.")
      );

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

      console.log(
        "MEMBACA FILE RESTORE:",
        file.name
      );

      const isiFile = await file.text();

      let backupData;

      try {
        backupData = JSON.parse(isiFile);
      } catch {
        throw new Error(
          "File backup bukan file JSON yang valid."
        );
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
          "Format file backup tidak sesuai dengan backup aplikasi RT03."
        );
      }

      const {
        warga = [],
        tempat_kost = [],
        surat_pengantar = [],
        distribusi_kost_bulanan = [],
      } = backupData.data;

      if (
        !Array.isArray(warga) ||
        !Array.isArray(tempat_kost) ||
        !Array.isArray(surat_pengantar) ||
        !Array.isArray(distribusi_kost_bulanan)
      ) {
        throw new Error(
          "Struktur data dalam file backup tidak valid."
        );
      }

      // -----------------------------------------------------
      // TAMPILKAN RINGKASAN DAN MINTA KONFIRMASI
      // -----------------------------------------------------
      const yakin = window.confirm(
        "FILE BACKUP DITEMUKAN\n\n" +
          `Warga: ${warga.length}\n` +
          `Tempat Kost: ${tempat_kost.length}\n` +
          `Surat Pengantar: ${surat_pengantar.length}\n` +
          `Distribusi Kost Bulanan: ${distribusi_kost_bulanan.length}\n\n` +
          "Data akan dipulihkan ke Supabase berdasarkan ID.\n" +
          "Data dengan ID yang sama akan diperbarui.\n\n" +
          "Apakah Anda yakin ingin melanjutkan restore?"
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
        const { error } = await supabase
          .from("warga")
          .upsert(warga, {
            onConflict: "id",
          });

        if (error) {
          throw new Error(
            "Gagal restore data warga: " +
              error.message
          );
        }

        console.log(
          `BERHASIL RESTORE ${warga.length} DATA WARGA.`
        );
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
          throw new Error(
            "Gagal restore tempat kost: " +
              error.message
          );
        }

        console.log(
          `BERHASIL RESTORE ${tempat_kost.length} TEMPAT KOST.`
        );
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
          throw new Error(
            "Gagal restore surat pengantar: " +
              error.message
          );
        }

        console.log(
          `BERHASIL RESTORE ${surat_pengantar.length} SURAT.`
        );
      }

      // -----------------------------------------------------
      // RESTORE DISTRIBUSI KOST BULANAN
      // -----------------------------------------------------
      if (distribusi_kost_bulanan.length > 0) {
        const { error } = await supabase
          .from("distribusi_kost_bulanan")
          .upsert(distribusi_kost_bulanan, {
            onConflict: "id",
          });

        if (error) {
          throw new Error(
            "Gagal restore distribusi kost bulanan: " +
              error.message
          );
        }

        console.log(
          `BERHASIL RESTORE ${distribusi_kost_bulanan.length} DATA DISTRIBUSI.`
        );
      }

      console.log("RESTORE SEMUA DATA BERHASIL.");

      setPesan(
        "Restore berhasil.\n\n" +
          `Warga: ${warga.length}\n` +
          `Tempat Kost: ${tempat_kost.length}\n` +
          `Surat Pengantar: ${surat_pengantar.length}\n` +
          `Distribusi Kost Bulanan: ${distribusi_kost_bulanan.length}`
      );

      setTipePesan("sukses");
    } catch (error) {
      console.error("GAGAL RESTORE DATA:", error);

      setPesan(
        "Restore gagal.\n\n" +
          (error.message || "Terjadi kesalahan.")
      );

      setTipePesan("error");
    } finally {
      setSedangRestore(false);

      // Reset input supaya file yang sama bisa dipilih lagi
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="pengaturan-page">
      <div className="page-header">
        <div>
          <h2>Pengaturan</h2>

          <p>
            Pengaturan dan pemeliharaan data aplikasi
            RT 03 / RW 07
          </p>
        </div>
      </div>

      {/* =====================================================
          BACKUP & RESTORE
      ====================================================== */}
      <div className="pengaturan-section">
        <h3>Backup & Restore Data</h3>

        <p>
          Backup seluruh data aplikasi RT 03 / RW 07
          dari Supabase ke dalam satu file.
        </p>

        <div className="backup-restore-actions">
          <button
            type="button"
            onClick={handleBackup}
            disabled={sedangBackup || sedangRestore}
          >
            {sedangBackup
              ? "Sedang Membuat Backup..."
              : "Backup Semua Data"}
          </button>

          <button
            type="button"
            onClick={handlePilihFileRestore}
            disabled={sedangBackup || sedangRestore}
          >
            {sedangRestore
              ? "Sedang Restore..."
              : "Restore Data"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleRestore}
            style={{ display: "none" }}
          />
        </div>

        {pesan && (
          <div
            className={`backup-restore-message ${
              tipePesan === "sukses"
                ? "sukses"
                : "error"
            }`}
          >
            {pesan}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pengaturan;