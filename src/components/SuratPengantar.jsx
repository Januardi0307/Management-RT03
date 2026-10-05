import { supabase } from "../lib/supabase";
import React, { useEffect, useState } from "react";
import "./SuratPengantar.css";

const JENIS_SURAT = [
  "Surat Pengantar KTP",
  "Surat Pengantar KK",
  "Surat Pengantar Domisili",
  "Surat Pengantar SKCK",
  "Surat Pengantar Nikah",
  "Surat Keterangan Kelahiran",
  "Surat Pengantar Kematian",
  "Surat Pengantar Pindah",
  "Surat Pengantar SKTM",
  "Surat Pengantar Belum Punya Rumah",
  "Surat Pengantar Ahli Waris",
  "Surat Pengantar",
  "Surat Keterangan",
];

/* =======================================================
   DATA KELUARGA UNTUK SURAT KETERANGAN KELAHIRAN
======================================================= */

function getDataOrangTuaKelahiran(bayi, daftarWarga) {
  if (!bayi?.kk) {
    return {
      ayah: null,
      ibu: null,
    };
  }

  const anggotaKeluarga = daftarWarga.filter(
    (item) => String(item.kk || "").trim() === String(bayi.kk || "").trim(),
  );


  console.log("=== CEK ANGGOTA KK KELAHIRAN ===");
console.log("KK BAYI:", bayi?.kk);

console.table(
  anggotaKeluarga.map((item) => ({
    id: item.id,
    nama: item.nama,
    nik: item.nik,
    kk: item.kk,
    statusKeluarga: item.statusKeluarga,
  }))
);

  const ayah = anggotaKeluarga.find(
    (item) =>
      String(item.statusKeluarga || "")
        .trim()
        .toLowerCase() === "kepala keluarga",
  );

  const ibu = anggotaKeluarga.find(
    (item) =>
      String(item.statusKeluarga || "")
        .trim()
        .toLowerCase() === "istri",
  );

  return {
    ayah: ayah || null,
    ibu: ibu || null,
  };
}

/* =======================================================
   MENCARI KANDIDAT AYAH DARI KK IBU
======================================================= */

function getAyahDariKKIbu(ibu, daftarWarga) {
  if (!ibu?.kk) {
    return null;
  }

  const nomorKKIbu = String(ibu.kk).trim();

  const anggotaKK = daftarWarga.filter(
    (item) =>
      String(item.kk || "").trim() === nomorKKIbu &&
      String(item.id) !== String(ibu.id),
  );

  /*
    Prioritas pertama:
    Kepala Keluarga
  */
  const kepalaKeluarga = anggotaKK.find(
    (item) =>
      String(item.statusKeluarga || "")
        .trim()
        .toLowerCase() === "kepala keluarga",
  );

  return kepalaKeluarga || null;
}

/* =======================================================
   ALAMAT DOMISILI WARGA PENDATANG
======================================================= */

function getAlamatDomisiliPendatang(pendatang, daftarKost = []) {
  if (!pendatang) {
    return {
      jenisTinggal: "",
      tempatTinggal: "",
      alamatDomisili: "",
    };
  }

  const jenisTinggal = String(pendatang.jenisTinggal || "").trim();

  /* =====================================================
     KOST
  ===================================================== */

  if (jenisTinggal.toLowerCase() === "kost") {
    const namaKost = String(pendatang.tempatKostNama || "").trim();

    const kost = daftarKost.find(
      (item) =>
        String(item.namaKost || "")
          .trim()
          .toLowerCase() === namaKost.toLowerCase(),
    );

    return {
      jenisTinggal: "Kost",
      tempatTinggal: namaKost,
      alamatDomisili: kost?.alamat || "",
    };
  }

  /* =====================================================
     KONTRAK
  ===================================================== */

  if (jenisTinggal.toLowerCase() === "kontrak") {
    return {
      jenisTinggal: "Kontrak",
      tempatTinggal: "Rumah Kontrak",
      alamatDomisili: pendatang.alamatKontrak || "",
    };
  }

  /* =====================================================
     JIKA DATA JENIS TINGGAL BELUM ADA
  ===================================================== */

  return {
    jenisTinggal: jenisTinggal,
    tempatTinggal: "",
    alamatDomisili: "",
  };
}

/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const parts = String(tanggal).split("-");

  if (parts.length === 3) {
    const [tahun, bulan, hari] = parts;

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

    return `${hari} ${namaBulan[Number(bulan) - 1]} ${tahun}`;
  }

  return tanggal;
}

/* =========================================================
   DATA WARGA UNTUK SURAT
========================================================= */

function getDataWargaSurat(surat, daftarWarga) {
  /* =======================================================
     KHUSUS SURAT KEMATIAN
  ======================================================= */

  if (surat.jenisSurat === "Surat Pengantar Kematian") {
    const pelapor = daftarWarga.find(
      (item) => String(item.id) === String(surat.pelaporId),
    );

    const meninggal = daftarWarga.find(
      (item) => String(item.id) === String(surat.meninggalId),
    );

    return {
      id: meninggal?.id || surat.meninggalId || "",
      nama: meninggal?.nama || surat.namaWarga || "",
      nik: meninggal?.nik || surat.nik || "",
      statusKependudukan:
        meninggal?.statusKependudukan || surat.statusKependudukan || "",
      kk: meninggal?.kk || surat.kk || "",
      tempatLahir: meninggal?.tempatLahir || surat.tempatLahir || "",
      tanggalLahir: meninggal?.tanggalLahir || surat.tanggalLahir || "",
      jenisKelamin: meninggal?.jenisKelamin || surat.jenisKelamin || "",
      agama: meninggal?.agama || surat.agama || "",
      pekerjaan: meninggal?.pekerjaan || surat.pekerjaan || "",
      alamat: meninggal?.alamat || surat.alamat || "",
      rtRw: meninggal?.rtRw || surat.rtRw || "03/07",

      /* DATA PELAPOR */

      pelaporNama: pelapor?.nama || surat.pelaporNama || "",
      pelaporNik: pelapor?.nik || surat.pelaporNik || "",
      pelaporAlamat: pelapor?.alamat || surat.pelaporAlamat || "",

      hubunganPelapor: surat.hubunganPelapor || "",

      /* DATA KEMATIAN */

      tanggalMeninggal: surat.tanggalMeninggal || "",

      tempatMeninggal: surat.tempatMeninggal || "",

      keterangan: surat.keterangan || "",
    };
  }

  /* =======================================================
     SURAT BIASA
  ======================================================= */

  const warga = daftarWarga.find(
    (item) => String(item.id) === String(surat.wargaId),
  );

  if (warga) {
    return warga;
  }

  return {
    id: surat.wargaId || "",
    nama: surat.namaWarga || "",
    nik: surat.nik || "",
    kk: surat.kk || "",
    tempatLahir: surat.tempatLahir || "",
    tanggalLahir: surat.tanggalLahir || "",
    jenisKelamin: surat.jenisKelamin || "",
    agama: surat.agama || "",
    pekerjaan: surat.pekerjaan || "",
    alamat: surat.alamat || "",
    rtRw: surat.rtRw || "03/07",
  };
}

/* =========================================================
   ISI SURAT
========================================================= */

function getIsiSurat(surat, daftarWarga = []) {
  const warga = getDataWargaSurat(surat, daftarWarga);

  const nama = warga?.nama || warga?.namaWarga || "";
  const nik = warga?.nik || "";
  const kk = warga?.kk || "";
  const tempatLahir = warga?.tempatLahir || "";
  const tanggalLahir = warga?.tanggalLahir || "";
  const jenisKelamin = warga?.jenisKelamin || "";
  const pekerjaan = warga?.pekerjaan || "";
  const agama = warga?.agama || "";
  const statusPerkawinan = warga?.statusPerkawinan || "";
  const kewarganegaraan = warga?.kewarganegaraan || "WNI";
  const alamat = warga?.alamat || "";
  const keperluan = warga?.keperluan || surat?.keperluan || "";

  // =========================================================
  // SURAT KEMATIAN
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar Kematian") {
    return {
      judul: "SURAT KETERANGAN KEMATIAN",

      pembuka:
        "Yang bertanda tangan di bawah ini, menerangkan bahwa berdasarkan laporan pihak keluarga / kerabat:",

      data: [
        ["Nama Pelapor", warga?.pelaporNama || ""],
        ["NIK Pelapor", warga?.pelaporNik || ""],
        ["Hubungan dengan Yang Meninggal", warga?.hubunganPelapor || ""],

        ["Nama", nama],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Agama", agama],
        ["Pekerjaan", pekerjaan],
        ["Nomor KTP", nik],
        ["Alamat", alamat],
        [
          "Tanggal Meninggal",
          warga?.tanggalMeninggal ? formatTanggal(warga.tanggalMeninggal) : "",
        ],
        ["Tempat Meninggal", warga?.tempatMeninggal || ""],
      ],

      penutup:
        warga?.keterangan ||
        "Surat keterangan ini dibuat berdasarkan laporan keluarga untuk dapat dipergunakan sebagaimana mestinya dan yang berkepentingan untuk menjadi maklum.",
    };
  }

  // =========================================================
  // SURAT KETERANGAN KELAHIRAN
  // =========================================================
  if (surat.jenisSurat === "Surat Keterangan Kelahiran") {
    return {
      judul: "SURAT KETERANGAN KELAHIRAN",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama Bayi", surat?.namaBayi || ""],
        ["Jenis Kelamin", surat?.jenisKelaminBayi || ""],
        [
          "Hari, Tanggal Lahir",
          surat?.tanggalLahirBayi
            ? surat?.hariLahirBayi
              ? `${surat.hariLahirBayi}, ${formatTanggal(
                  surat.tanggalLahirBayi,
                )}`
              : formatTanggal(surat.tanggalLahirBayi)
            : "",
        ],
        ["Tempat", surat?.tempatLahirBayi || ""],

        ["Nama Ayah Kandung", surat?.namaAyah || surat?.ayahNama || ""],
["NIK Ayah", surat?.nikAyah || surat?.ayahNik || ""],
["Nama Ibu Kandung", surat?.namaIbu || surat?.ibuNama || ""],
["NIK Ibu", surat?.nikIbu || surat?.ibuNik || ""],
["Nomor Kartu Keluarga", surat?.kk || surat?.nomorKK || ""],
["Anak Ke", surat?.anakKe || ""],
["Alamat", surat?.alamat || surat?.alamatKelahiran || ""],
      ],

      penutup:
        "Demikian Surat Keterangan Kelahiran ini dibuat dengan sebenarnya, agar dapat dipergunakan sebagai mana mestinya.",
    };
  }

  // =========================================================
  // SURAT PENGANTAR KTP
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar KTP") {
    return {
      judul: "SURAT PENGANTAR PENGURUSAN KTP",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan KTP ( Kartu Tanda Penduduk ).",
    };
  }

  // =========================================================
  // SURAT PENGANTAR KK
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar KK") {
    return {
      judul: "SURAT PENGANTAR PENGURUSAN KK",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan KK ( Kartu Keluarga ).",
    };
  }

  // =========================================================
  // SURAT PENGANTAR SKCK
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar SKCK") {
    return {
      judul: "SURAT PENGANTAR SKCK",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan SKCK ( Surat Keterangan Catatan Kepolisian ).",
    };
  }

  // =========================================================
  // SURAT PENGANTAR NIKAH
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar Nikah") {
    const tempatTanggalLahir = `${tempatLahir}${
      tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
    }`;

    return {
      judul: "SURAT PENGANTAR NIKAH",

      pembuka:
        "Yang bertanda tangan di bawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        ["Tempat / Tanggal Lahir", tempatTanggalLahir],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      keteranganNikah:
        "Orang tersebut diatas memang benar adalah Warga kami, anak dari perkawinan :",

      dataOrangTua: [
        ["Nama Orang Tua Laki-laki", surat?.namaAyah || ""],
        ["NIK", surat?.nikAyah || ""],
        ["Nama Orang Tua Perempuan", surat?.namaIbu || ""],
        ["NIK", surat?.nikIbu || ""],
      ],

      penutup:
        "Demikian Surat Keterangan Pengantar Nikah ini dibuat dengan sebenarnya, agar dapat dipergunakan sebagai mana mestinya.",
    };
  }

  // =========================================================
  // SURAT PENGANTAR PINDAH
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar Pindah") {
    return {
      judul: "SURAT PENGANTAR PINDAH ALAMAT",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan Pindah Alamat.",
    };
  }

  // =========================================================
  // SURAT PENGANTAR SKTM
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar SKTM") {
    return {
      judul: "SURAT PENGANTAR SKTM",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan SKTM (Surat Keterangan Tidak Mampu).",
    };
  }

  // =========================================================
  // BELUM PUNYA RUMAH
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar Belum Punya Rumah") {
    return {
      judul: "SURAT PENGANTAR BELUM PUNYA RUMAH",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami yang masih tinggal menumpang dengan Keluarga / Kontrak. Surat Pengantar ini dibuat sebagai Keterangan atau kelengkapan pengurusan Surat Keterangan Belum Punya Rumah.",
    };
  }

  // =========================================================
  // AHLI WARIS
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar Ahli Waris") {
    return {
      judul: "SURAT PENGANTAR AHLI WARIS",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
        ["Nama Almarhum/ah", surat?.namaAlmarhum || ""],
        ["NIK Almarhum/ah", surat?.nikAlmarhum || ""],
        ["Hubungan Keluarga", surat?.hubunganKeluarga || ""],
      ],

      penutup:
        "Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan Surat Ahli Waris.",
    };
  }

  // =========================================================
  // SURAT PENGANTAR DOMISILI
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar Domisili") {
    return {
      judul: "SURAT KETERANGAN DOMISILI",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup: (() => {
        const jenisTinggal = String(surat?.jenisTinggal || "").toLowerCase();

        const alamatDomisili = surat?.alamatDomisili || alamat;

        const tempatTinggal = surat?.tempatTinggal || "";

        if (jenisTinggal === "kost") {
          return (
            "Orang tersebut diatas memang benar adalah Warga Pendatang yang tinggal di RT kami, " +
            `menempati tempat tinggal Kost di ${tempatTinggal}, dengan alamat ${alamatDomisili}. ` +
            "Surat Pengantar ini dibuat sebagai Surat Keterangan Domisili."
          );
        }

        if (jenisTinggal === "kontrak") {
          return (
            "Orang tersebut diatas memang benar adalah Warga Pendatang yang tinggal di RT kami, " +
            `menempati rumah kontrakan dengan alamat ${alamatDomisili}. ` +
            "Surat Pengantar ini dibuat sebagai Surat Keterangan Domisili."
          );
        }

        return (
          "Orang tersebut diatas memang benar adalah Warga Pendatang yang tinggal di RT kami, " +
          `dengan alamat domisili ${alamatDomisili}. ` +
          "Surat Pengantar ini dibuat Sebagai Surat Keterangan Domisili."
        );
      })(),
    };
  }

  // =========================================================
  // SURAT PENGANTAR UMUM
  // =========================================================
  if (surat.jenisSurat === "Surat Pengantar") {
  return {
    judul: "SURAT PENGANTAR",

    pembuka:
      "Yang bertanda tangan di bawah ini, menerangkan bahwa:",

    data: [
      ["Nama", nama],

      [
        "Tempat/Tgl. Lahir",
        `${tempatLahir}${
          tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
        }`,
      ],

      ["Jenis Kelamin", jenisKelamin],

      ["Agama", agama],

      ["Pekerjaan", pekerjaan],

      ["Nomor KTP", nik],

      ["Alamat", alamat],

      ["Keperluan", keperluan],
    ],

    penutup:
      "Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan yang berkepentingan untuk menjadi maklum.",
  };
}

  // =========================================================
  // SURAT KETERANGAN UMUM
  // =========================================================
  if (surat.jenisSurat === "Surat Keterangan") {
    return {
      judul: "SURAT KETERANGAN",

      pembuka:
        "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

      data: [
        ["Nama", nama],
        ["NIK", nik],
        ["KK", kk],
        [
          "Tempat / Tanggal Lahir",
          `${tempatLahir}${
            tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
          }`,
        ],
        ["Jenis Kelamin", jenisKelamin],
        ["Pekerjaan", pekerjaan],
        ["Agama", agama],
        ["Status Perkawinan", statusPerkawinan],
        ["Kewarganegaraan", kewarganegaraan],
        ["Alamat", alamat],
      ],

      penutup: `Orang tersebut diatas memang benar adalah warga kami. Surat Keterangan ini dibuat untuk keperluan ${keperluan}.`,
    };
  }

  // =========================================================
  // DEFAULT
  // =========================================================
  return {
    judul: "SURAT PENGANTAR",

    pembuka:
      "Yang bertanda tangan dibawah ini, Ketua RT/RW : 03/07, Kelurahan Karet, Kecamatan Setiabudi, dengan ini menerangkan bahwa :",

    data: [
      ["Nama", nama],
      ["NIK", nik],
      ["KK", kk],
      [
        "Tempat / Tanggal Lahir",
        `${tempatLahir}${
          tanggalLahir ? `, ${formatTanggal(tanggalLahir)}` : ""
        }`,
      ],
      ["Jenis Kelamin", jenisKelamin],
      ["Pekerjaan", pekerjaan],
      ["Agama", agama],
      ["Status Perkawinan", statusPerkawinan],
      ["Kewarganegaraan", kewarganegaraan],
      ["Alamat", alamat],
    ],

    penutup: `Orang tersebut diatas memang benar adalah warga kami. Surat Pengantar ini dibuat sebagai kelengkapan pengurusan ${keperluan}.`,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

function SuratPengantar() {
  const [showForm, setShowForm] = useState(false);

  const [showFormKematian, setShowFormKematian] = useState(false);

  const [pelaporTerpilih, setPelaporTerpilih] = useState(null);

  const [meninggalTerpilih, setMeninggalTerpilih] = useState(null);

  const [formKematian, setFormKematian] = useState({
    nomorSurat: "",
    tanggalSurat: new Date().toISOString().split("T")[0],

    pelaporId: "",
    hubunganPelapor: "",

    meninggalId: "",
    tanggalMeninggal: "",
    tempatMeninggal: "",

    keterangan: "",
  });

  const [daftarSurat, setDaftarSurat] = useState([]);
  useEffect(() => {
    async function loadDaftarSurat() {
      console.log("MEMUAT DATA SURAT DARI SUPABASE...");

      const { data, error } = await supabase
        .from("surat_pengantar")
        .select("*")
        .order("nomor_surat", {
          ascending: false,
        });

      if (error) {
        console.error("GAGAL MEMUAT SURAT DARI SUPABASE:", error);

        alert("Gagal memuat data surat dari Supabase.\n\n" + error.message);

        return;
      }

      const dataSuratSupabase = data.map((item) => ({
        id: item.id,

        nomorSurat: item.nomor_surat || "",
        tanggalSurat: item.tanggal_surat || "",
        jenisSurat: item.jenis_surat || "",

        wargaId: item.warga_id || "",
        namaWarga: item.nama_warga || "",
        nik: item.nik || "",
        kk: item.kk || "",
        tempatLahir: item.tempat_lahir || "",
        tanggalLahir: item.tanggal_lahir || "",
        jenisKelamin: item.jenis_kelamin || "",
        agama: item.agama || "",
        pekerjaan: item.pekerjaan || "",
        statusPerkawinan: item.status_perkawinan || "",
        kewarganegaraan: item.kewarganegaraan || "",
        alamat: item.alamat || "",
        rtRw: item.rt_rw || "",

        keperluan: item.keperluan || "",

        jenisTinggal: item.jenis_tinggal || "",
        tempatTinggal: item.tempat_tinggal || "",
        alamatDomisili: item.alamat_domisili || "",

        namaBayi: item.nama_bayi || "",
        jenisKelaminBayi: item.jenis_kelamin_bayi || "",
        tanggalLahirBayi: item.tanggal_lahir_bayi || "",
        hariLahirBayi: item.hari_lahir_bayi || "",
        tempatLahirBayi: item.tempat_lahir_bayi || "",
        anakKe: item.anak_ke || "",

        ayahId: item.ayah_id || "",
        namaAyah: item.nama_ayah || "",
        nikAyah: item.nik_ayah || "",

        ibuId: item.ibu_id || "",
        namaIbu: item.nama_ibu || "",
        nikIbu: item.nik_ibu || "",

        ayahNama: item.ayah_nama || "",
        ayahNik: item.ayah_nik || "",
        ibuNama: item.ibu_nama || "",
        ibuNik: item.ibu_nik || "",

        nomorKK: item.nomor_kk || "",
        alamatKelahiran: item.alamat_kelahiran || "",

        ahliWarisMode: item.ahli_waris_mode || "",
        almarhumId: item.almarhum_id || "",
        namaAlmarhum: item.nama_almarhum || "",
        nikAlmarhum: item.nik_almarhum || "",
        hubunganKeluarga: item.hubungan_keluarga || "",

        pelaporId: item.pelapor_id || "",
        pelaporNama: item.pelapor_nama || "",
        pelaporNik: item.pelapor_nik || "",
        pelaporAlamat: item.pelapor_alamat || "",
        hubunganPelapor: item.hubungan_pelapor || "",

        meninggalId: item.meninggal_id || "",
        tanggalMeninggal: item.tanggal_meninggal || "",
        tempatMeninggal: item.tempat_meninggal || "",
        keterangan: item.keterangan || "",

        createdAt: item.created_at || "",
      }));

      setDaftarSurat(dataSuratSupabase);

      console.log(
        `BERHASIL MEMUAT ${dataSuratSupabase.length} SURAT DARI SUPABASE.`,
      );
    }

    loadDaftarSurat();
  }, []);

  const [wargaAktif, setWargaAktif] = useState([]);
  const [wargaMeninggal, setWargaMeninggal] = useState([]);
  const [daftarKost, setDaftarKost] = useState([]);

  useEffect(() => {
    async function loadDataTempatKostUntukSurat() {
      try {
        console.log("MEMUAT DATA TEMPAT KOST UNTUK SURAT DARI SUPABASE...");

        const { data, error } = await supabase
          .from("tempat_kost")
          .select("*")
          .eq("status", "Aktif")
          .order("nama_kost", { ascending: true });

        if (error) {
          console.error(
            "GAGAL MEMUAT DATA TEMPAT KOST UNTUK SURAT DARI SUPABASE:",
            error,
          );

          setDaftarKost([]);
          return;
        }

        const dataKost = data.map((item) => ({
          id: item.id,
          namaKost: item.nama_kost || "",
          alamat: item.alamat || "",
          jumlahKamar: Number(item.jumlah_kamar || 0),
          jumlahAnakKost: Number(item.jumlah_anak_kost || 0),
          distribusiPerOrang: Number(item.distribusi_per_orang || 0),
          totalDistribusi: Number(item.total_distribusi || 0),
          status: item.status || "Aktif",
        }));

        setDaftarKost(dataKost);

        console.log(
          `BERHASIL MEMUAT ${dataKost.length} TEMPAT KOST UNTUK SURAT DARI SUPABASE.`,
        );
      } catch (error) {
        console.error("ERROR MEMUAT DATA TEMPAT KOST UNTUK SURAT:", error);

        setDaftarKost([]);
      }
    }

    loadDataTempatKostUntukSurat();
  }, []);

  useEffect(() => {
    async function loadDataWargaUntukSurat() {
      try {
        console.log("MEMUAT DATA WARGA AKTIF DAN MENINGGAL DARI SUPABASE...");

        const { data, error } = await supabase
          .from("warga")
          .select("*")
          .order("nama", { ascending: true });

        if (error) {
          console.error(
            "GAGAL MEMUAT DATA WARGA UNTUK SURAT DARI SUPABASE:",
            error,
          );

          setWargaAktif([]);
          setWargaMeninggal([]);

          return;
        }

        const dataWargaAktif = data
          .filter(
            (item) =>
              String(item.status || "Aktif")
                .trim()
                .toLowerCase() === "aktif",
          )
          .map((item) => ({
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
            statusKependudukan: item.status_kependudukan || "Warga RT03",
            statusTinggal: item.status_tinggal || "Tinggal di RT03",
            jenisTinggal: item.jenis_tinggal || "",
            tempatKostId: item.tempat_kost_id || "",
            namaTempatKost: item.nama_tempat_kost || "",
            alamatKontrak: item.alamat_kontrak || "",
          }));

        const dataWargaMeninggal = data
          .filter(
            (item) =>
              String(item.status || "")
                .trim()
                .toLowerCase() === "meninggal",
          )
          .map((item) => ({
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
            status: item.status || "Meninggal",
            statusKependudukan: item.status_kependudukan || "Warga RT03",
            statusTinggal: item.status_tinggal || "Tinggal di RT03",
            jenisTinggal: item.jenis_tinggal || "",
            tempatKostId: item.tempat_kost_id || "",
            namaTempatKost: item.nama_tempat_kost || "",
            alamatKontrak: item.alamat_kontrak || "",
          }));

        setWargaAktif(dataWargaAktif);
        setWargaMeninggal(dataWargaMeninggal);

        console.log(
          `BERHASIL MEMUAT ${dataWargaAktif.length} WARGA AKTIF DAN ${dataWargaMeninggal.length} WARGA MENINGGAL DARI SUPABASE.`,
        );
      } catch (error) {
        console.error("ERROR MEMUAT DATA WARGA UNTUK SURAT:", error);

        setWargaAktif([]);
        setWargaMeninggal([]);
      }
    }

    loadDataWargaUntukSurat();
  }, []);

  const [pendatangAktif, setPendatangAktif] = useState([]);

  useEffect(() => {
    const dataPendatangAktif = wargaAktif
      .filter(
        (item) =>
          String(item.status || "Aktif")
            .trim()
            .toLowerCase() === "aktif" &&
          String(item.statusKependudukan || "")
            .trim()
            .toLowerCase() === "pendatang",
      )
      .sort((a, b) =>
        String(a.nama || "").localeCompare(String(b.nama || ""), "id", {
          sensitivity: "base",
        }),
      );

    setPendatangAktif(dataPendatangAktif);
  }, [wargaAktif]);

  const [form, setForm] = useState({
    nomorSurat: "",
    tanggalSurat: new Date().toISOString().split("T")[0],
    jenisSurat: "",
    wargaId: "",
    keperluan: "",

    // DATA BAYI BELUM TERDAFTAR
    namaBayi: "",
    jenisKelaminBayi: "",
    tanggalLahirBayi: "",
    hariLahirBayi: "",
    tempatLahirBayi: "",

    // DATA AHLI WARIS
    ahliWarisMode: "warga",
    almarhumId: "",
    namaAlmarhum: "",
    nikAlmarhum: "",
    hubunganKeluarga: "",
  });

  const [wargaTerpilih, setWargaTerpilih] = useState(null);
  const [ayahTerpilih, setAyahTerpilih] = useState(null);
  const [ibuTerpilih, setIbuTerpilih] = useState(null);
  const [anakKe, setAnakKe] = useState("");
  const [statusBayi, setStatusBayi] = useState("");
  const [statusOrangTua, setStatusOrangTua] = useState("");
  const [ibuPelapor, setIbuPelapor] = useState(null);
  const [ayahKandidat, setAyahKandidat] = useState(null);

  const [searchWarga, setSearchWarga] = useState("");

  // =======================================================
  // DATA ORANG TUA SURAT PENGANTAR NIKAH
  // =======================================================

  const [ayahNikahMode, setAyahNikahMode] = useState("warga");
  const [ibuNikahMode, setIbuNikahMode] = useState("warga");

  const [ayahNikahTerpilih, setAyahNikahTerpilih] = useState(null);
  const [ibuNikahTerpilih, setIbuNikahTerpilih] = useState(null);

  const [suratTerpilih, setSuratTerpilih] = useState(null);

  const [suratPreview, setSuratPreview] = useState(null);

  const [editSuratId, setEditSuratId] = useState(null);

  const [openActionId, setOpenActionId] = useState(null);

  /* =======================================================
     NOMOR SURAT
  ======================================================= */

  function buatNomorSurat() {
    const sekarang = new Date();

    const tahun = sekarang.getFullYear();

    const namaBulan = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
    ][sekarang.getMonth()];

    const nomorTerakhir = daftarSurat.reduce((terbesar, surat) => {
      const nomor = parseInt(String(surat.nomorSurat || "").split("/")[0], 10);

      return isNaN(nomor) ? terbesar : Math.max(terbesar, nomor);
    }, 23);

    const nomorUrut = String(nomorTerakhir + 1).padStart(3, "0");

    return `${nomorUrut}/RT.03/RW.07/${namaBulan}/${tahun}`;
  }

  /* =======================================================
     BUKA FORM KEMATIAN
  ======================================================= */

  function bukaFormKematian() {
    const sekarang = new Date();

    const tanggalHariIni = `${sekarang.getFullYear()}-${String(
      sekarang.getMonth() + 1,
    ).padStart(2, "0")}-${String(sekarang.getDate()).padStart(2, "0")}`;

    setFormKematian({
      nomorSurat: buatNomorSurat(),
      tanggalSurat: tanggalHariIni,

      pelaporId: "",
      hubunganPelapor: "",

      meninggalId: "",
      tanggalMeninggal: "",
      tempatMeninggal: "",

      keterangan: "",
    });

    setPelaporTerpilih(null);
    setMeninggalTerpilih(null);

    setEditSuratId(null);
    setShowForm(false);
    setShowFormKematian(true);
  }

  /* =======================================================
     BUKA FORM SURAT BIASA
  ======================================================= */

  function bukaFormSurat() {
    const sekarang = new Date();

    const tanggalHariIni = `${sekarang.getFullYear()}-${String(
      sekarang.getMonth() + 1,
    ).padStart(2, "0")}-${String(sekarang.getDate()).padStart(2, "0")}`;

    setForm({
      nomorSurat: buatNomorSurat(),
      tanggalSurat: tanggalHariIni,
      jenisSurat: "",
      wargaId: "",
      keperluan: "",

      // Data orang tua Surat Pengantar Nikah
      ayahNikahMode: "warga",
      ayahId: "",
      namaAyah: "",
      nikAyah: "",

      ibuNikahMode: "warga",
      ibuId: "",
      namaIbu: "",
      nikIbu: "",

      // DATA AHLI WARIS
      ahliWarisMode: "warga",
      almarhumId: "",
      namaAlmarhum: "",
      nikAlmarhum: "",
      hubunganKeluarga: "",
    });

    setWargaTerpilih(null);
    setSearchWarga("");
    setEditSuratId(null);
    setAyahNikahMode("warga");
    setIbuNikahMode("warga");

    setAyahNikahTerpilih(null);
    setIbuNikahTerpilih(null);
    setShowFormKematian(false);
    setAnakKe("");
    setAyahTerpilih(null);
    setIbuTerpilih(null);
    setShowForm(true);
  }

  /* =======================================================
     TUTUP FORM
  ======================================================= */

  function tutupForm() {
    setShowForm(false);
    setWargaTerpilih(null);
    setSearchWarga("");
    setEditSuratId(null);
  }

  function tutupFormKematian() {
    setShowFormKematian(false);
    setPelaporTerpilih(null);
    setMeninggalTerpilih(null);
    setEditSuratId(null);
  }

  /* =======================================================
     HANDLE WARGA
  ======================================================= */

  function handleWargaChange(e) {
    const id = e.target.value;

    const daftarWarga =
      form.jenisSurat === "Surat Pengantar Domisili"
        ? pendatangAktif
        : wargaAktif;

    const warga = daftarWarga.find((item) => String(item.id) === String(id));

    let dataOrangTua = {
      ayah: null,
      ibu: null,
    };

    if (form.jenisSurat === "Surat Keterangan Kelahiran" && warga) {
      dataOrangTua = getDataOrangTuaKelahiran(warga, wargaAktif);
    }

    setForm((prev) => ({
      ...prev,
      wargaId: id,
    }));

    setWargaTerpilih(warga || null);

    if (form.jenisSurat === "Surat Keterangan Kelahiran") {
      setAyahTerpilih(dataOrangTua.ayah);
      setIbuTerpilih(dataOrangTua.ibu);
    } else {
      setAyahTerpilih(null);
      setIbuTerpilih(null);
    }
    if (form.jenisSurat === "Surat Pengantar Ahli Waris") {
      if (!form.namaAlmarhum?.trim()) {
        alert("Nama Almarhum / Almarhumah harus diisi.");
        return;
      }

      if (!form.nikAlmarhum?.trim()) {
        alert("NIK Almarhum / Almarhumah harus diisi.");
        return;
      }

      if (!form.hubunganKeluarga?.trim()) {
        alert("Hubungan keluarga harus diisi.");
        return;
      }
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =======================================================
   SIMPAN SURAT BIASA
======================================================= */

  async function handleSimpanSurat() {
    if (!form.nomorSurat.trim()) {
      alert("Nomor surat harus diisi.");
      return;
    }

    if (!form.jenisSurat) {
      alert("Jenis surat harus dipilih.");
      return;
    }

    if (!form.wargaId) {
      alert("Warga harus dipilih.");
      return;
    }

    if (form.jenisSurat === "Surat Keterangan Kelahiran" && !anakKe) {
      alert("Anak Ke harus diisi.");
      return;
    }

    /* =====================================================
     DATA ORANG TUA SURAT PENGANTAR NIKAH
       ===================================================== */

    let dataAyah = {
      ayahId: "",
      namaAyah: "",
      nikAyah: "",
    };

    let dataIbu = {
      ibuId: "",
      namaIbu: "",
      nikIbu: "",
    };

    let dataAhliWaris = {
      ahliWarisMode: "",
      almarhumId: "",
      namaAlmarhum: "",
      nikAlmarhum: "",
      hubunganKeluarga: "",
    };

    if (form.jenisSurat === "Surat Pengantar Ahli Waris") {
      dataAhliWaris = {
        ahliWarisMode: form.ahliWarisMode || "warga",
        almarhumId: form.almarhumId || "",
        namaAlmarhum: form.namaAlmarhum?.trim() || "",
        nikAlmarhum: form.nikAlmarhum?.trim() || "",
        hubunganKeluarga: form.hubunganKeluarga?.trim() || "",
      };
    }

    if (form.jenisSurat === "Surat Pengantar Nikah") {
      if (form.ayahNikahMode === "warga") {
        dataAyah = {
          ayahId: form.ayahId || "",
          namaAyah: ayahNikahTerpilih?.nama || "",
          nikAyah: ayahNikahTerpilih?.nik || "",
        };
      } else {
        dataAyah = {
          ayahId: "",
          namaAyah: form.namaAyah?.trim() || "",
          nikAyah: form.nikAyah?.trim() || "",
        };
      }

      if (form.ibuNikahMode === "warga") {
        dataIbu = {
          ibuId: form.ibuId || "",
          namaIbu: ibuNikahTerpilih?.nama || "",
          nikIbu: ibuNikahTerpilih?.nik || "",
        };
      } else {
        dataIbu = {
          ibuId: "",
          namaIbu: form.namaIbu?.trim() || "",
          nikIbu: form.nikIbu?.trim() || "",
        };
      }
    }
    /* =====================================================
     WARGA YANG DIPILIH
   ===================================================== */

    const warga =
      wargaTerpilih ||
      wargaAktif.find((item) => String(item.id) === String(form.wargaId)) ||
      pendatangAktif.find((item) => String(item.id) === String(form.wargaId)) ||
      null;

    if (!warga) {
      alert("Data warga tidak ditemukan.");
      return;
    }
    console.log("=== CEK KELAHIRAN SEBELUM DATA ORANG TUA ===");
    console.log("warga:", warga);
    console.log("wargaTerpilih:", wargaTerpilih);
    console.log("ayahTerpilih:", ayahTerpilih);
    console.log("ibuTerpilih:", ibuTerpilih);
    /* =========================================================
   DATA ORANG TUA - SURAT KETERANGAN KELAHIRAN
    ========================================================= */
    if (form.jenisSurat === "Surat Keterangan Kelahiran") {
      // Cari ulang orang tua berdasarkan KK warga yang dipilih
      const dataOrangTua = getDataOrangTuaKelahiran(warga, wargaAktif);

      const ayahKelahiran = ayahTerpilih || dataOrangTua.ayah || null;

      const ibuKelahiran = ibuTerpilih || dataOrangTua.ibu || null;

      dataAyah = {
        ayahId: ayahKelahiran?.id || "",
        namaAyah: ayahKelahiran?.nama || "",
        nikAyah: ayahKelahiran?.nik || "",
      };

      dataIbu = {
        ibuId: ibuKelahiran?.id || "",
        namaIbu: ibuKelahiran?.nama || "",
        nikIbu: ibuKelahiran?.nik || "",
      };

      console.log("=== DATA ORANG TUA KELAHIRAN SAAT SIMPAN ===");
      console.log("AYAH:", JSON.stringify(dataAyah, null, 2));
      console.log("IBU:", JSON.stringify(dataIbu, null, 2));
    }

    /* =====================================================
     DATA SURAT BIASA
    ===================================================== */

    const suratBaru = {
      id: Date.now(),

      nomorSurat: form.nomorSurat.trim(),
      tanggalSurat: form.tanggalSurat || null,
      jenisSurat: form.jenisSurat,

      wargaId: form.wargaId,
      namaWarga: warga.nama || "",
      nik: warga.nik || "",
      kk: warga.kk || "",
      tempatLahir: warga.tempatLahir || "",
      tanggalLahir: warga.tanggalLahir || "",
      jenisKelamin: warga.jenisKelamin || "",
      agama: warga.agama || "",
      pekerjaan: warga.pekerjaan || "",
      statusPerkawinan: warga.statusPerkawinan || "",
      kewarganegaraan: warga.kewarganegaraan || "",
      alamat: warga.alamat || "",
      rtRw: warga.rtRw || "03/07",

      keperluan: form.keperluan?.trim() || "",

      /* DATA KELAHIRAN */

      namaBayi: form.namaBayi?.trim() || "",
      jenisKelaminBayi: form.jenisKelaminBayi || "",
      tanggalLahirBayi: form.tanggalLahirBayi || "",
      hariLahirBayi: form.hariLahirBayi || "",
      tempatLahirBayi: form.tempatLahirBayi || "",
      anakKe: anakKe || "",

      /* DATA ORANG TUA */

      ayahId: dataAyah.ayahId,
      namaAyah: dataAyah.namaAyah,
      nikAyah: dataAyah.nikAyah,

      ibuId: dataIbu.ibuId,
      namaIbu: dataIbu.namaIbu,
      nikIbu: dataIbu.nikIbu,

      /* DATA AHLI WARIS */

      ahliWarisMode: dataAhliWaris.ahliWarisMode,
      almarhumId: dataAhliWaris.almarhumId,
      namaAlmarhum: dataAhliWaris.namaAlmarhum,
      nikAlmarhum: dataAhliWaris.nikAlmarhum,
      hubunganKeluarga: dataAhliWaris.hubunganKeluarga,

      createdAt: new Date().toISOString(),
    };

    console.log("=== SURAT BIASA BARU SEBELUM DISIMPAN ===");
    console.log(suratBaru);

    /* =====================================================
     SIMPAN KE SUPABASE
    ===================================================== */
let suratTersimpan;
let error;

const dataSurat = {
  nomor_surat: suratBaru.nomorSurat,
  tanggal_surat: suratBaru.tanggalSurat || null,
  jenis_surat: suratBaru.jenisSurat,

  warga_id: suratBaru.wargaId,
  nama_warga: suratBaru.namaWarga,
  nik: suratBaru.nik,
  kk: suratBaru.kk,
  tempat_lahir: suratBaru.tempatLahir,
  tanggal_lahir: suratBaru.tanggalLahir || null,
  jenis_kelamin: suratBaru.jenisKelamin,
  agama: suratBaru.agama,
  pekerjaan: suratBaru.pekerjaan,
  status_perkawinan: suratBaru.statusPerkawinan,
  kewarganegaraan: suratBaru.kewarganegaraan,
  alamat: suratBaru.alamat,
  rt_rw: suratBaru.rtRw,

  keperluan: suratBaru.keperluan,

  nama_bayi: suratBaru.namaBayi,
  jenis_kelamin_bayi: suratBaru.jenisKelaminBayi,
  tanggal_lahir_bayi: suratBaru.tanggalLahirBayi || null,
  hari_lahir_bayi: suratBaru.hariLahirBayi,
  tempat_lahir_bayi: suratBaru.tempatLahirBayi,
  anak_ke: suratBaru.anakKe,

  ayah_id: suratBaru.ayahId,
  nama_ayah: suratBaru.namaAyah,
  nik_ayah: suratBaru.nikAyah,

  ibu_id: suratBaru.ibuId,
  nama_ibu: suratBaru.namaIbu,
  nik_ibu: suratBaru.nikIbu,

  ahli_waris_mode: suratBaru.ahliWarisMode,
  almarhum_id: suratBaru.almarhumId,
  nama_almarhum: suratBaru.namaAlmarhum,
  nik_almarhum: suratBaru.nikAlmarhum,
  hubungan_keluarga: suratBaru.hubunganKeluarga,
};

if (editSuratId) {
  console.log("=== UPDATE SURAT ===");
  console.log("ID:", editSuratId);

  const hasil = await supabase
    .from("surat_pengantar")
    .update(dataSurat)
    .eq("id", editSuratId)
    .select()
    .single();

  suratTersimpan = hasil.data;
  error = hasil.error;
} else {
  console.log("=== INSERT SURAT BARU ===");

  const hasil = await supabase
    .from("surat_pengantar")
    .insert([
      {
        id: suratBaru.id,
        ...dataSurat,
      },
    ])
    .select()
    .single();

  suratTersimpan = hasil.data;
  error = hasil.error;
}
    if (error) {
      console.error("GAGAL MENYIMPAN SURAT BIASA KE SUPABASE:", error);

      alert("Gagal menyimpan surat ke Supabase.\n\n" + error.message);

      return;
    }

    console.log("SURAT BIASA BERHASIL DISIMPAN KE SUPABASE:");
    console.log(suratTersimpan);

    /* =====================================================
     MASUKKAN HASIL SUPABASE KE STATE
  ===================================================== */

    const suratBaruSupabase = {
      id: suratTersimpan.id,

      nomorSurat: suratTersimpan.nomor_surat || "",
      tanggalSurat: suratTersimpan.tanggal_surat || "",
      jenisSurat: suratTersimpan.jenis_surat || "",

      wargaId: suratTersimpan.warga_id || "",
      namaWarga: suratTersimpan.nama_warga || "",
      nik: suratTersimpan.nik || "",
      kk: suratTersimpan.kk || "",
      tempatLahir: suratTersimpan.tempat_lahir || "",
      tanggalLahir: suratTersimpan.tanggal_lahir || "",
      jenisKelamin: suratTersimpan.jenis_kelamin || "",
      agama: suratTersimpan.agama || "",
      pekerjaan: suratTersimpan.pekerjaan || "",
      statusPerkawinan: suratTersimpan.status_perkawinan || "",
      kewarganegaraan: suratTersimpan.kewarganegaraan || "",
      alamat: suratTersimpan.alamat || "",
      rtRw: suratTersimpan.rt_rw || "",

      keperluan: suratTersimpan.keperluan || "",

      namaBayi: suratTersimpan.nama_bayi || "",
      jenisKelaminBayi: suratTersimpan.jenis_kelamin_bayi || "",
      tanggalLahirBayi: suratTersimpan.tanggal_lahir_bayi || "",
      hariLahirBayi: suratTersimpan.hari_lahir_bayi || "",
      tempatLahirBayi: suratTersimpan.tempat_lahir_bayi || "",
      anakKe: suratTersimpan.anak_ke || "",

      ayahId: suratTersimpan.ayah_id || "",
      namaAyah: suratTersimpan.nama_ayah || "",
      nikAyah: suratTersimpan.nik_ayah || "",

      ibuId: suratTersimpan.ibu_id || "",
      namaIbu: suratTersimpan.nama_ibu || "",
      nikIbu: suratTersimpan.nik_ibu || "",

      ahliWarisMode: suratTersimpan.ahli_waris_mode || "",
      almarhumId: suratTersimpan.almarhum_id || "",
      namaAlmarhum: suratTersimpan.nama_almarhum || "",
      nikAlmarhum: suratTersimpan.nik_almarhum || "",
      hubunganKeluarga: suratTersimpan.hubungan_keluarga || "",

      createdAt: suratTersimpan.created_at || "",
    };

   if (editSuratId) {
  setDaftarSurat((prev) =>
    prev.map((item) =>
      String(item.id) === String(editSuratId)
        ? suratBaruSupabase
        : item
    )
  );
} else {
  setDaftarSurat((prev) => [
    suratBaruSupabase,
    ...prev,
  ]);
}

    setShowForm(false);
    setWargaTerpilih(null);
    setSearchWarga("");
    setAyahNikahTerpilih(null);
    setIbuNikahTerpilih(null);
    setAyahTerpilih(null);
    setIbuTerpilih(null);
    setAnakKe("");
    setEditSuratId(null);

    alert("Surat berhasil disimpan.");
  }

  /* =======================================================
   SIMPAN SURAT KEMATIAN
   ======================================================= */

  async function handleSimpanSuratKematian() {
    if (!formKematian.pelaporId) {
      alert("Silakan pilih pelapor.");
      return;
    }

    if (!formKematian.hubunganPelapor) {
      alert("Silakan pilih hubungan pelapor dengan yang meninggal.");
      return;
    }

    if (!formKematian.meninggalId) {
      alert("Silakan pilih warga yang meninggal.");
      return;
    }

    if (!formKematian.tanggalMeninggal) {
      alert("Silakan isi tanggal meninggal.");
      return;
    }

    if (!formKematian.tempatMeninggal.trim()) {
      alert("Silakan isi tempat meninggal.");
      return;
    }

    const pelapor =
      wargaAktif.find(
        (item) => String(item.id) === String(formKematian.pelaporId),
      ) || null;

    const meninggal =
      wargaAktif.find(
        (item) => String(item.id) === String(formKematian.meninggalId),
      ) || null;

    if (!meninggal) {
      alert("Data warga yang meninggal tidak ditemukan.");
      return;
    }

    /* =====================================================
     DATA SURAT
      ===================================================== */

    const dataSurat = {
      nomorSurat: formKematian.nomorSurat.trim(),
      tanggalSurat: formKematian.tanggalSurat,
      jenisSurat: "Surat Pengantar Kematian",

      pelaporId: formKematian.pelaporId,
      hubunganPelapor: formKematian.hubunganPelapor,

      meninggalId: formKematian.meninggalId,
      tanggalMeninggal: formKematian.tanggalMeninggal,
      tempatMeninggal: formKematian.tempatMeninggal.trim(),
      keterangan: formKematian.keterangan.trim(),

      /* SNAPSHOT YANG MENINGGAL */

      namaWarga: meninggal.nama || "",
      nik: meninggal.nik || "",
      kk: meninggal.kk || "",
      tempatLahir: meninggal.tempatLahir || "",
      tanggalLahir: meninggal.tanggalLahir || "",
      jenisKelamin: meninggal.jenisKelamin || "",
      agama: meninggal.agama || "",
      pekerjaan: meninggal.pekerjaan || "",
      alamat: meninggal.alamat || "",
      rtRw: meninggal.rtRw || "03/07",

      /* SNAPSHOT PELAPOR */

      pelaporNama: pelapor?.nama || "",
      pelaporNik: pelapor?.nik || "",
      pelaporAlamat: pelapor?.alamat || "",

      createdAt: new Date().toISOString(),
    };

    /* =====================================================
     MODE EDIT SURAT KEMATIAN
     UPDATE KE SUPABASE
       ===================================================== */

    if (editSuratId) {
      console.log("=== UPDATE SURAT KEMATIAN KE SUPABASE ===");
      console.log("ID SURAT:", editSuratId);
      console.log("DATA EDIT:", dataSurat);

      const { data: suratDiperbarui, error } = await supabase
        .from("surat_pengantar")
        .update({
          nomor_surat: dataSurat.nomorSurat,
          tanggal_surat: dataSurat.tanggalSurat || null,
          jenis_surat: dataSurat.jenisSurat,

          nama_warga: dataSurat.namaWarga,
          nik: dataSurat.nik,
          kk: dataSurat.kk,
          tempat_lahir: dataSurat.tempatLahir,
          tanggal_lahir: dataSurat.tanggalLahir || null,
          jenis_kelamin: dataSurat.jenisKelamin,
          agama: dataSurat.agama,
          pekerjaan: dataSurat.pekerjaan,
          alamat: dataSurat.alamat,
          rt_rw: dataSurat.rtRw,

          pelapor_id: dataSurat.pelaporId,
          pelapor_nama: dataSurat.pelaporNama,
          pelapor_nik: dataSurat.pelaporNik,
          pelapor_alamat: dataSurat.pelaporAlamat,
          hubungan_pelapor: dataSurat.hubunganPelapor,

          meninggal_id: dataSurat.meninggalId,
          tanggal_meninggal: dataSurat.tanggalMeninggal || null,
          tempat_meninggal: dataSurat.tempatMeninggal,
          keterangan: dataSurat.keterangan,
        })
        .eq("id", editSuratId)
        .select()
        .single();

      if (error) {
        console.error("GAGAL UPDATE SURAT KEMATIAN DI SUPABASE:", error);

        alert(
          "Gagal memperbarui Surat Kematian di Supabase.\n\n" + error.message,
        );

        return;
      }

      console.log("SURAT KEMATIAN BERHASIL DIPERBARUI DI SUPABASE:");
      console.log(suratDiperbarui);

      const dataBaru = daftarSurat.map((surat) => {
        if (String(surat.id) !== String(editSuratId)) {
          return surat;
        }

        return {
          ...surat,

          nomorSurat: suratDiperbarui.nomor_surat,
          tanggalSurat: suratDiperbarui.tanggal_surat,
          jenisSurat: suratDiperbarui.jenis_surat,

          namaWarga: suratDiperbarui.nama_warga,
          nik: suratDiperbarui.nik,
          kk: suratDiperbarui.kk,
          tempatLahir: suratDiperbarui.tempat_lahir,
          tanggalLahir: suratDiperbarui.tanggal_lahir,
          jenisKelamin: suratDiperbarui.jenis_kelamin,
          agama: suratDiperbarui.agama,
          pekerjaan: suratDiperbarui.pekerjaan,
          alamat: suratDiperbarui.alamat,
          rtRw: suratDiperbarui.rt_rw,

          pelaporId: suratDiperbarui.pelapor_id,
          pelaporNama: suratDiperbarui.pelapor_nama,
          pelaporNik: suratDiperbarui.pelapor_nik,
          pelaporAlamat: suratDiperbarui.pelapor_alamat,
          hubunganPelapor: suratDiperbarui.hubungan_pelapor,

          meninggalId: suratDiperbarui.meninggal_id,
          tanggalMeninggal: suratDiperbarui.tanggal_meninggal,
          tempatMeninggal: suratDiperbarui.tempat_meninggal,
          keterangan: suratDiperbarui.keterangan,
        };
      });

      setDaftarSurat(dataBaru);

      setShowFormKematian(false);
      setPelaporTerpilih(null);
      setMeninggalTerpilih(null);
      setEditSuratId(null);

      alert("Surat Kematian berhasil diperbarui.");

      return;
    }

    /* =====================================================
     SURAT KEMATIAN BARU
     SIMPAN KE SUPABASE
     ===================================================== */

    const suratBaru = {
      id: Date.now(),
      ...dataSurat,
    };

    console.log("=== SURAT KEMATIAN BARU SEBELUM DISIMPAN ===");
    console.log(suratBaru);

    const { data: suratTersimpan, error } = await supabase
      .from("surat_pengantar")
      .insert([
        {
          id: suratBaru.id,

          nomor_surat: suratBaru.nomorSurat,
          tanggal_surat: suratBaru.tanggalSurat || null,
          jenis_surat: suratBaru.jenisSurat,

          nama_warga: suratBaru.namaWarga,
          nik: suratBaru.nik,
          kk: suratBaru.kk,

          tempat_lahir: suratBaru.tempatLahir,
          tanggal_lahir: suratBaru.tanggalLahir || null,
          jenis_kelamin: suratBaru.jenisKelamin,
          agama: suratBaru.agama,
          pekerjaan: suratBaru.pekerjaan,

          alamat: suratBaru.alamat,
          rt_rw: suratBaru.rtRw,

          pelapor_id: suratBaru.pelaporId,
          pelapor_nama: suratBaru.pelaporNama,
          pelapor_nik: suratBaru.pelaporNik,
          pelapor_alamat: suratBaru.pelaporAlamat,
          hubungan_pelapor: suratBaru.hubunganPelapor,

          meninggal_id: suratBaru.meninggalId,
          tanggal_meninggal: suratBaru.tanggalMeninggal || null,
          tempat_meninggal: suratBaru.tempatMeninggal,
          keterangan: suratBaru.keterangan,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("GAGAL MENYIMPAN SURAT KEMATIAN KE SUPABASE:", error);

      alert("Gagal menyimpan Surat Kematian ke Supabase.\n\n" + error.message);

      return;
    }

    console.log("SURAT KEMATIAN BERHASIL DISIMPAN KE SUPABASE:");
    console.log(suratTersimpan);

    setDaftarSurat((prev) => [
      {
        id: suratTersimpan.id,
        nomorSurat: suratTersimpan.nomor_surat || "",
        tanggalSurat: suratTersimpan.tanggal_surat || "",
        jenisSurat: suratTersimpan.jenis_surat || "",
        namaWarga: suratTersimpan.nama_warga || "",
        nik: suratTersimpan.nik || "",
        kk: suratTersimpan.kk || "",
        tempatLahir: suratTersimpan.tempat_lahir || "",
        tanggalLahir: suratTersimpan.tanggal_lahir || "",
        jenisKelamin: suratTersimpan.jenis_kelamin || "",
        agama: suratTersimpan.agama || "",
        pekerjaan: suratTersimpan.pekerjaan || "",
        alamat: suratTersimpan.alamat || "",
        rtRw: suratTersimpan.rt_rw || "",
        pelaporId: suratTersimpan.pelapor_id || "",
        pelaporNama: suratTersimpan.pelapor_nama || "",
        pelaporNik: suratTersimpan.pelapor_nik || "",
        pelaporAlamat: suratTersimpan.pelapor_alamat || "",
        hubunganPelapor: suratTersimpan.hubungan_pelapor || "",
        meninggalId: suratTersimpan.meninggal_id || "",
        tanggalMeninggal: suratTersimpan.tanggal_meninggal || "",
        tempatMeninggal: suratTersimpan.tempat_meninggal || "",
        keterangan: suratTersimpan.keterangan || "",
      },
      ...prev,
    ]);

    setShowFormKematian(false);
    setPelaporTerpilih(null);
    setMeninggalTerpilih(null);
    setEditSuratId(null);

    alert("Surat Kematian berhasil disimpan.");
  }

  /* =======================================================
     DETAIL
     ======================================================= */

  function bukaDetailSurat(surat) {
    console.log("=== DATA SURAT YANG AKAN DIPREVIEW ===");
    console.log(JSON.stringify(surat, null, 2));
    setSuratTerpilih(surat);
    setOpenActionId(null);
  }

  /* =======================================================
     PREVIEW
  ======================================================= */

  function bukaPreviewSurat(surat) {
  console.log("DATA SURAT YANG DIPREVIEW:", surat);
  console.log("KEPERLUAN:", surat?.keperluan);

  setSuratPreview(surat);
  setOpenActionId(null);
}

  /* =======================================================
     EDIT
  ======================================================= */

  function bukaEditSurat(surat) {
    setOpenActionId(null);

    /* =====================================================
     EDIT SURAT KEMATIAN
  ===================================================== */

    if (surat.jenisSurat === "Surat Pengantar Kematian") {
      const pelapor =
        wargaAktif.find(
          (item) => String(item.id) === String(surat.pelaporId),
        ) || null;

      const meninggal =
        wargaAktif.find(
          (item) => String(item.id) === String(surat.meninggalId),
        ) || null;

      setEditSuratId(surat.id);

      setFormKematian({
        nomorSurat: surat.nomorSurat || "",
        tanggalSurat: surat.tanggalSurat || "",
        pelaporId: surat.pelaporId || "",
        hubunganPelapor: surat.hubunganPelapor || "",
        meninggalId: surat.meninggalId || "",
        tanggalMeninggal: surat.tanggalMeninggal || "",
        tempatMeninggal: surat.tempatMeninggal || "",
        keterangan: surat.keterangan || "",
      });

      setPelaporTerpilih(pelapor);
      setMeninggalTerpilih(meninggal);

      setShowForm(false);
      setShowFormKematian(true);

      return;
    }

    /* =====================================================
     EDIT SURAT BIASA
  ===================================================== */

    setEditSuratId(surat.id);

    /* =====================================================
     CARI WARGA YANG TERKAIT SURAT
  ===================================================== */

    const warga =
      wargaAktif.find((item) => String(item.id) === String(surat.wargaId)) ||
      null;

    /* =====================================================
     ISI FORM DASAR
  ===================================================== */

    setForm({
      nomorSurat: surat.nomorSurat || "",
      tanggalSurat: surat.tanggalSurat || "",
      jenisSurat: surat.jenisSurat || "",
      wargaId: surat.wargaId || "",
      keperluan: surat.keperluan || "",

      /* DATA KHUSUS SURAT AHLI WARIS */
      ahliWarisMode:
        surat.ahliWarisMode || (surat.almarhumId ? "warga" : "manual"),

      almarhumId: surat.almarhumId || "",
      namaAlmarhum: surat.namaAlmarhum || "",
      nikAlmarhum: surat.nikAlmarhum || "",
      hubunganKeluarga: surat.hubunganKeluarga || "",

      /* DATA KHUSUS SURAT KELAHIRAN */
      namaBayi: surat.namaBayi || "",
      jenisKelaminBayi: surat.jenisKelaminBayi || "",
      tanggalLahirBayi: surat.tanggalLahirBayi || "",
      hariLahirBayi: surat.hariLahirBayi || "",
      tempatLahirBayi: surat.tempatLahirBayi || "",
    });

    /* =====================================================
     DATA WARGA TERPILIH
  ===================================================== */

    setWargaTerpilih(
      warga || {
        id: surat.wargaId,
        nama: surat.namaWarga || "",
        nik: surat.nik || "",
        kk: surat.kk || "",
        tempatLahir: surat.tempatLahir || "",
        tanggalLahir: surat.tanggalLahir || "",
        jenisKelamin: surat.jenisKelamin || "",
        agama: surat.agama || "",
        pekerjaan: surat.pekerjaan || "",
        alamat: surat.alamat || "",
      },
    );

    setSearchWarga(surat.namaWarga || "");

    /* =====================================================
     DATA ORANG TUA SURAT KETERANGAN KELAHIRAN
  ===================================================== */

    if (surat.jenisSurat === "Surat Keterangan Kelahiran") {
      const dataOrangTua = getDataOrangTuaKelahiran(warga, wargaAktif);

      setAyahTerpilih(dataOrangTua.ayah || null);

      setIbuTerpilih(dataOrangTua.ibu || null);

      setAnakKe(surat.anakKe || "");
    } else {
      setAyahTerpilih(null);
      setIbuTerpilih(null);
      setAnakKe("");
    }

    /* =====================================================
     DATA ORANG TUA SURAT PENGANTAR NIKAH
  ===================================================== */

    if (surat.jenisSurat === "Surat Pengantar Nikah") {
      const ayah =
        wargaAktif.find((item) => String(item.id) === String(surat.ayahId)) ||
        null;

      const ibu =
        wargaAktif.find((item) => String(item.id) === String(surat.ibuId)) ||
        null;

      const modeAyah = surat.ayahId ? "warga" : "manual";

      const modeIbu = surat.ibuId ? "warga" : "manual";

      setAyahNikahMode(modeAyah);
      setIbuNikahMode(modeIbu);

      setAyahNikahTerpilih(ayah);
      setIbuNikahTerpilih(ibu);

      setForm((prev) => ({
        ...prev,

        ayahNikahMode: modeAyah,
        ayahId: surat.ayahId || "",
        namaAyah: surat.namaAyah || "",
        nikAyah: surat.nikAyah || "",

        ibuNikahMode: modeIbu,
        ibuId: surat.ibuId || "",
        namaIbu: surat.namaIbu || "",
        nikIbu: surat.nikIbu || "",
      }));
    } else {
      setAyahNikahMode("warga");
      setIbuNikahMode("warga");

      setAyahNikahTerpilih(null);
      setIbuNikahTerpilih(null);
    }

    /* =====================================================
     TAMPILKAN FORM EDIT
  ===================================================== */

    setShowFormKematian(false);
    setShowForm(true);
  }

  /* =======================================================
     HAPUS
  ======================================================= */

  async function hapusSurat(surat) {
    const yakin = window.confirm(
      `Apakah Anda yakin ingin menghapus surat ${surat.nomorSurat}?`,
    );

    if (!yakin) {
      return;
    }

    console.log("=== HAPUS SURAT ===");
    console.log("ID SURAT:", surat.id);
    console.log("NOMOR SURAT:", surat.nomorSurat);

    const { data: suratTerhapus, error } = await supabase
      .from("surat_pengantar")
      .delete()
      .eq("id", surat.id)
      .select()
      .single();

    if (error) {
      console.error("GAGAL MENGHAPUS SURAT DARI SUPABASE:", error);

      alert("Surat tidak berhasil dihapus dari Supabase.\n\n" + error.message);

      return;
    }

    console.log("HASIL DELETE DARI SUPABASE:", suratTerhapus);

    console.log("SURAT BENAR-BENAR TERHAPUS DARI SUPABASE:", suratTerhapus.id);

    setDaftarSurat((prev) =>
      prev.filter((item) => String(item.id) !== String(surat.id)),
    );

    setOpenActionId(null);

    alert("Surat berhasil dihapus.");
  }

  /* =======================================================
     ACTION MENU
  ======================================================= */

  function toggleActionSurat(id) {
    setOpenActionId((current) => (current === id ? null : id));
  }

  /* =======================================================
     HASIL PENCARIAN WARGA
  ======================================================= */

  /* =======================================================
   HASIL PENCARIAN WARGA
   SURAT DOMISILI → KHUSUS WARGA PENDATANG
======================================================= */

  const daftarWargaUntukSurat =
    form.jenisSurat === "Surat Pengantar Domisili"
      ? pendatangAktif
      : wargaAktif;

  const wargaHasilSearch = daftarWargaUntukSurat.filter((item) => {
    const keyword = searchWarga.toLowerCase().trim();

    if (!keyword) return true;

    return (
      String(item.nama || "")
        .toLowerCase()
        .includes(keyword) || String(item.nik || "").includes(keyword)
    );
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="surat-pengantar-page">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="surat-pengantar-header">
        <div>
          <h2>Surat Pengantar</h2>

          <p>Pengelolaan surat RT 03 / RW 07 Karet - Setiabudi</p>
        </div>

        <div className="surat-header-actions">
          <button
            type="button"
            className="btn-tambah-surat"
            onClick={bukaFormSurat}
          >
            + Buat Surat
          </button>
        </div>
      </div>

      {/* ===================================================
          FORM SURAT KEMATIAN
      =================================================== */}

      {showFormKematian && (
        <div className="surat-form-card">
          <div className="surat-form-header">
            <div>
              <h3>
                🕊️{" "}
                {editSuratId
                  ? "Edit Surat Keterangan Kematian"
                  : "Surat Keterangan Kematian"}
              </h3>

              <p>Isi data pelapor dan data warga yang meninggal.</p>
            </div>

            <button
              type="button"
              className="btn-close-form"
              onClick={tutupFormKematian}
            >
              ✕
            </button>
          </div>

          {/* DATA SURAT */}

          <div className="surat-section">
            <h4>Data Surat</h4>

            <div className="surat-form-grid">
              <div className="form-group">
                <label>Nomor Surat</label>

                <input type="text" value={formKematian.nomorSurat} readOnly />
              </div>

              <div className="form-group">
                <label>Tanggal Surat</label>

                <input
                  type="date"
                  value={formKematian.tanggalSurat}
                  onChange={(e) =>
                    setFormKematian((prev) => ({
                      ...prev,
                      tanggalSurat: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* DATA PELAPOR */}

          <div className="surat-section">
            <h4>Data Pelapor</h4>

            <div className="surat-form-grid">
              <div className="form-group">
                <label>Nama Pelapor</label>

                <select
                  value={formKematian.pelaporId}
                  onChange={(e) => {
                    const id = e.target.value;

                    const warga = wargaAktif.find(
                      (item) => String(item.id) === String(id),
                    );

                    setFormKematian((prev) => ({
                      ...prev,
                      pelaporId: id,
                    }));

                    setPelaporTerpilih(warga || null);
                  }}
                >
                  <option value="">-- Pilih Pelapor --</option>

                  {wargaAktif.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} - {item.nik || "-"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Hubungan dengan yang meninggal</label>

                <select
                  value={formKematian.hubunganPelapor}
                  onChange={(e) =>
                    setFormKematian((prev) => ({
                      ...prev,
                      hubunganPelapor: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Pilih Hubungan --</option>

                  <option value="Suami">Suami</option>

                  <option value="Istri">Istri</option>

                  <option value="Anak">Anak</option>

                  <option value="Orang Tua">Orang Tua</option>

                  <option value="Saudara">Saudara</option>

                  <option value="Keluarga">Keluarga</option>

                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {pelaporTerpilih && (
              <div className="warga-terpilih">
                <div className="warga-data-item">
                  <span>NIK</span>
                  <strong>{pelaporTerpilih.nik || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Nama</span>
                  <strong>{pelaporTerpilih.nama || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Alamat</span>
                  <strong>{pelaporTerpilih.alamat || "-"}</strong>
                </div>
              </div>
            )}
          </div>

          {/* DATA YANG MENINGGAL */}

          <div className="surat-section">
            <h4>Data Yang Meninggal</h4>

            <div className="form-group form-group-full">
              <label>Nama Warga yang Meninggal</label>

              <select
                value={formKematian.meninggalId}
                onChange={(e) => {
                  const id = e.target.value;

                  const warga = wargaAktif.find(
                    (item) => String(item.id) === String(id),
                  );

                  setFormKematian((prev) => ({
                    ...prev,
                    meninggalId: id,
                  }));

                  setMeninggalTerpilih(warga || null);
                }}
              >
                <option value="">-- Pilih Warga yang Meninggal --</option>

                {wargaAktif.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} - {item.nik || "-"}
                  </option>
                ))}
              </select>
            </div>

            {meninggalTerpilih && (
              <div className="warga-terpilih">
                <div className="warga-data-item">
                  <span>NIK</span>
                  <strong>{meninggalTerpilih.nik || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Nama</span>
                  <strong>{meninggalTerpilih.nama || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Tempat / Tanggal Lahir</span>

                  <strong>
                    {meninggalTerpilih.tempatLahir || "-"}
                    {meninggalTerpilih.tanggalLahir
                      ? `, ${formatTanggal(meninggalTerpilih.tanggalLahir)}`
                      : ""}
                  </strong>
                </div>

                <div className="warga-data-item">
                  <span>Alamat</span>
                  <strong>{meninggalTerpilih.alamat || "-"}</strong>
                </div>
              </div>
            )}

            <div className="surat-form-grid">
              <div className="form-group">
                <label>Tanggal Meninggal</label>

                <input
                  type="date"
                  value={formKematian.tanggalMeninggal}
                  onChange={(e) =>
                    setFormKematian((prev) => ({
                      ...prev,
                      tanggalMeninggal: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Tempat Meninggal</label>

                <input
                  type="text"
                  value={formKematian.tempatMeninggal}
                  onChange={(e) =>
                    setFormKematian((prev) => ({
                      ...prev,
                      tempatMeninggal: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Rumah Sakit / Rumah / dll."
                />
              </div>
            </div>
          </div>

          {/* KETERANGAN */}

          <div className="surat-section">
            <h4>Keterangan</h4>

            <div className="form-group">
              <label>Keterangan Tambahan</label>

              <textarea
                rows="4"
                value={formKematian.keterangan}
                onChange={(e) =>
                  setFormKematian((prev) => ({
                    ...prev,
                    keterangan: e.target.value,
                  }))
                }
                placeholder="Tuliskan keterangan tambahan jika diperlukan..."
              />
            </div>
          </div>

          {/* FOOTER */}

          <div className="surat-form-footer">
            <button
              type="button"
              className="btn-batal-surat"
              onClick={tutupFormKematian}
            >
              Batal
            </button>

            <button
              type="button"
              className="btn-simpan-surat"
              onClick={handleSimpanSuratKematian}
            >
              💾{" "}
              {editSuratId
                ? "Perbarui Surat Kematian"
                : "Simpan Surat Kematian"}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          FORM SURAT BIASA
      =================================================== */}

      {showForm && (
        <div className="surat-form-card">
          <div className="surat-form-header">
            <div>
              <h3>
                📄{" "}
                {editSuratId ? "Edit Surat Pengantar" : "Buat Surat Pengantar"}
              </h3>

              <p>Isi data surat dan pilih warga yang mengajukan surat.</p>
            </div>

            <button
              type="button"
              className="btn-close-form"
              onClick={tutupForm}
            >
              ✕
            </button>
          </div>

          {/* DATA SURAT */}

          <div className="surat-section">
            <h4>Data Surat</h4>

            <div className="surat-form-grid">
              <div className="form-group">
                <label>Nomor Surat</label>

                <input
                  type="text"
                  name="nomorSurat"
                  value={form.nomorSurat}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Tanggal Surat</label>

                <input
                  type="date"
                  name="tanggalSurat"
                  value={form.tanggalSurat}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Jenis Surat</label>

                <select
  name="jenisSurat"
  value={form.jenisSurat}
  onChange={handleChange}
>
  <option value="">-- Pilih Jenis Surat --</option>

  {JENIS_SURAT.map((jenis) => (
    <option key={jenis} value={jenis}>
      {jenis}
    </option>
  ))}
</select>
              </div>
            </div>
          </div>

          {/* DATA WARGA */}

          <div className="surat-section">
            <h4>Data Pemohon / Warga</h4>

            <div className="form-group form-group-full">
              <label>Cari Warga</label>

              <input
                type="text"
                value={searchWarga}
                onChange={(e) => setSearchWarga(e.target.value)}
                placeholder="Ketik nama atau NIK warga..."
              />

              <select value={form.wargaId} onChange={handleWargaChange}>
                <option value="">-- Pilih Warga --</option>

                {wargaHasilSearch.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} - {item.nik || "-"}
                  </option>
                ))}
              </select>

              <small className="jumlah-hasil-warga">
                Menampilkan {wargaHasilSearch.length} dari{" "}
                {daftarWargaUntukSurat.length} warga
              </small>
            </div>

            {wargaTerpilih && (
              <div className="warga-terpilih">
                <div className="warga-data-item">
                  <span>NIK</span>
                  <strong>{wargaTerpilih.nik || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Nama</span>
                  <strong>{wargaTerpilih.nama || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>No. KK</span>
                  <strong>{wargaTerpilih.kk || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Tempat / Tanggal Lahir</span>

                  <strong>
                    {wargaTerpilih.tempatLahir || "-"}
                    {wargaTerpilih.tanggalLahir
                      ? `, ${formatTanggal(wargaTerpilih.tanggalLahir)}`
                      : ""}
                  </strong>
                </div>

                <div className="warga-data-item">
                  <span>Jenis Kelamin</span>

                  <strong>{wargaTerpilih.jenisKelamin || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>Alamat</span>

                  <strong>{wargaTerpilih.alamat || "-"}</strong>
                </div>

                <div className="warga-data-item">
                  <span>RT / RW</span>

                  <strong>{wargaTerpilih.rtRw || "03/07"}</strong>
                </div>
              </div>
            )}

            {form.jenisSurat === "Surat Keterangan Kelahiran" && (
              <div className="data-kelahiran">
                {/* STATUS BAYI */}
                <div className="form-group">
                  <label>Status Bayi</label>

                  <select
                    value={statusBayi}
                    onChange={(e) => {
                      setStatusBayi(e.target.value);

                      setStatusOrangTua("");
                      setWargaTerpilih(null);
                      setAyahTerpilih(null);
                      setIbuTerpilih(null);
                      setAnakKe("");
                    }}
                  >
                    <option value="">-- Pilih Status Bayi --</option>

                    <option value="Bayi Terdaftar">Bayi Terdaftar</option>

                    <option value="Bayi Belum Terdaftar">
                      Bayi Belum Terdaftar
                    </option>
                  </select>
                </div>

                {/* STATUS ORANG TUA */}
                {statusBayi && (
                  <div className="form-group">
                    <label>Status Orang Tua</label>

                    <select
                      value={statusOrangTua}
                      onChange={(e) => {
                        setStatusOrangTua(e.target.value);

                        setWargaTerpilih(null);
                        setAyahTerpilih(null);
                        setIbuTerpilih(null);
                        setAnakKe("");
                      }}
                    >
                      <option value="">-- Pilih Status Orang Tua --</option>

                      <option value="Warga RT 03">Warga RT 03</option>

                      <option value="Warga Pendatang">Warga Pendatang</option>
                    </select>
                  </div>
                )}

                {statusBayi === "Bayi Belum Terdaftar" && statusOrangTua && (
                  <div className="form-group">
                    <label>Ibu Kandung</label>

                    <select
                      value={ibuPelapor?.id || ""}
                      onChange={(e) => {
                        const id = e.target.value;

                        const daftarIbu =
                          statusOrangTua === "Warga Pendatang"
                            ? pendatangAktif
                            : wargaAktif;

                        const ibu = daftarIbu.find(
                          (item) => String(item.id) === String(id),
                        );

                        setIbuPelapor(ibu || null);
                        setIbuTerpilih(ibu || null);

                        if (ibu) {
                          const daftarKeluarga =
                            statusOrangTua === "Warga Pendatang"
                              ? pendatangAktif
                              : wargaAktif;

                          const ayah = getAyahDariKKIbu(ibu, daftarKeluarga);

                          setAyahKandidat(ayah);
                        } else {
                          setAyahKandidat(null);
                        }
                      }}
                    >
                      <option value="">-- Pilih Ibu Kandung --</option>

                      {(statusOrangTua === "Warga Pendatang"
                        ? pendatangAktif
                        : wargaAktif
                      ).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama}
                          {item.nik ? ` - ${item.nik}` : ""}
                        </option>
                      ))}
                    </select>
                    {ibuPelapor && (
                      <div className="data-orang-tua-kelahiran">
                        <div className="warga-data-item">
                          <span>Nama Ibu Kandung</span>
                          <strong>{ibuPelapor.nama || "-"}</strong>
                        </div>

                        <div className="warga-data-item">
                          <span>NIK Ibu</span>
                          <strong>{ibuPelapor.nik || "-"}</strong>
                        </div>

                        <div className="warga-data-item">
                          <span>Nomor Kartu Keluarga Ibu</span>
                          <strong>{ibuPelapor.kk || "-"}</strong>
                        </div>

                        <div className="warga-data-item">
                          <span>Kandidat Ayah</span>
                          <strong>
                            {ayahKandidat?.nama || "Tidak ditemukan"}
                          </strong>
                        </div>

                        <div className="warga-data-item">
                          <span>NIK Ayah</span>
                          <strong>{ayahKandidat?.nik || "-"}</strong>
                        </div>
                        {ayahKandidat && (
                          <button
                            type="button"
                            onClick={() => setAyahTerpilih(ayahKandidat)}
                            className="btn-pilih-ayah"
                          >
                            ✓ Gunakan sebagai Ayah
                          </button>
                        )}

                        {ayahTerpilih && (
                          <div className="data-orang-tua-kelahiran">
                            <div className="warga-data-item">
                              <span>Ayah Terpilih</span>
                              <strong>{ayahTerpilih.nama || "-"}</strong>
                            </div>

                            <div className="warga-data-item">
                              <span>NIK Ayah</span>
                              <strong>{ayahTerpilih.nik || "-"}</strong>
                            </div>

                            <div className="warga-data-item">
                              <span>Nomor Kartu Keluarga</span>
                              <strong>{ayahTerpilih.kk || "-"}</strong>
                            </div>
                          </div>
                        )}

                        <div className="data-bayi-belum-terdaftar">
                          <div className="form-group">
                            <label>Nama Bayi</label>
                            <input
                              type="text"
                              value={form.namaBayi || ""}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  namaBayi: e.target.value,
                                }))
                              }
                              placeholder="Nama lengkap bayi"
                            />
                          </div>

                          <div className="form-group">
                            <label>Jenis Kelamin</label>
                            <select
                              value={form.jenisKelaminBayi || ""}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  jenisKelaminBayi: e.target.value,
                                }))
                              }
                            >
                              <option value="">
                                -- Pilih Jenis Kelamin --
                              </option>
                              <option value="LAKI-LAKI">LAKI-LAKI</option>
                              <option value="PEREMPUAN">PEREMPUAN</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Hari, Tanggal Lahir</label>

                            <input
                              type="date"
                              value={form.tanggalLahirBayi || ""}
                              onChange={(e) => {
                                const tanggal = e.target.value;

                                const hari = tanggal
                                  ? new Date(
                                      `${tanggal}T00:00:00`,
                                    ).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                    })
                                  : "";

                                setForm((prev) => ({
                                  ...prev,
                                  tanggalLahirBayi: tanggal,
                                  hariLahirBayi: hari,
                                }));
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label>Tempat Lahir</label>
                            <input
                              type="text"
                              value={form.tempatLahirBayi || ""}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  tempatLahirBayi: e.target.value,
                                }))
                              }
                              placeholder="Tempat lahir"
                            />
                          </div>

                          <div className="form-group">
                            <label>Anak Ke</label>
                            <input
                              type="number"
                              min="1"
                              value={anakKe}
                              onChange={(e) => setAnakKe(e.target.value)}
                              placeholder="Contoh: 1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DATA LAMA - BAYI TERDAFTAR */}
                {statusBayi === "Bayi Terdaftar" && wargaTerpilih && (
                  <div className="data-orang-tua-kelahiran">
                    <div className="warga-data-item">
                      <span>Nama Ayah Kandung</span>
                      <strong>{ayahTerpilih?.nama || "-"}</strong>
                    </div>

                    <div className="warga-data-item">
                      <span>NIK Ayah</span>
                      <strong>{ayahTerpilih?.nik || "-"}</strong>
                    </div>

                    <div className="warga-data-item">
                      <span>Nama Ibu Kandung</span>
                      <strong>{ibuTerpilih?.nama || "-"}</strong>
                    </div>

                    <div className="warga-data-item">
                      <span>NIK Ibu</span>
                      <strong>{ibuTerpilih?.nik || "-"}</strong>
                    </div>

                    <div className="warga-data-item">
                      <span>Nomor Kartu Keluarga</span>
                      <strong>{wargaTerpilih?.kk || "-"}</strong>
                    </div>

                    <div className="form-group">
                      <label>Anak Ke</label>

                      <input
                        type="number"
                        min="1"
                        value={anakKe}
                        onChange={(e) => setAnakKe(e.target.value)}
                        placeholder="Contoh: 1"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {form.jenisSurat === "Surat Pengantar Domisili" &&
            wargaTerpilih &&
            (() => {
              const domisili = getAlamatDomisiliPendatang(
                wargaTerpilih,
                daftarKost,
              );
              return (
                <div className="info-domisili-pendatang">
                  <div className="info-domisili-row">
                    <span>Jenis Tinggal</span>
                    <strong>{domisili.jenisTinggal || "-"}</strong>
                  </div>

                  {domisili.tempatTinggal && (
                    <div className="info-domisili-row">
                      <span>Tempat Tinggal</span>
                      <strong>{domisili.tempatTinggal}</strong>
                    </div>
                  )}

                  <div className="info-domisili-row">
                    <span>Alamat Domisili</span>
                    <strong>
                      {domisili.alamatDomisili || "Alamat belum ditemukan"}
                    </strong>
                  </div>
                </div>
              );
            })()}

          {/* ===================================================
    DATA ORANG TUA - SURAT PENGANTAR NIKAH
=================================================== */}

          {form.jenisSurat === "Surat Pengantar Nikah" && (
            <div className="surat-section">
              <h4>Data Orang Tua</h4>

              {/* =================================================
        AYAH
    ================================================= */}

              <div className="form-group form-group-full">
                <label>Nama Orang Tua Laki-laki</label>

                <select
                  value={ayahNikahMode}
                  onChange={(e) => {
                    const mode = e.target.value;

                    setAyahNikahMode(mode);

                    setAyahNikahTerpilih(null);

                    setForm((prev) => ({
                      ...prev,
                      ayahNikahMode: mode,
                      ayahId: "",
                      namaAyah: "",
                      nikAyah: "",
                    }));
                  }}
                >
                  <option value="warga">Pilih dari Data Warga</option>

                  <option value="manual">Isi Manual</option>
                </select>
              </div>

              {ayahNikahMode === "warga" ? (
                <div className="form-group form-group-full">
                  <label>Pilih Ayah dari Data Warga</label>

                  <select
                    value={form.ayahId || ""}
                    onChange={(e) => {
                      const id = e.target.value;

                      const warga = wargaAktif.find(
                        (item) => String(item.id) === String(id),
                      );

                      setForm((prev) => ({
                        ...prev,
                        ayahId: id,
                        namaAyah: warga?.nama || "",
                        nikAyah: warga?.nik || "",
                      }));

                      setAyahNikahTerpilih(warga || null);
                    }}
                  >
                    <option value="">-- Pilih Ayah --</option>

                    {wargaAktif.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama} - {item.nik || "-"}
                      </option>
                    ))}
                  </select>

                  {ayahNikahTerpilih && (
                    <div className="warga-terpilih">
                      <div className="warga-data-item">
                        <span>Nama</span>

                        <strong>{ayahNikahTerpilih.nama || "-"}</strong>
                      </div>

                      <div className="warga-data-item">
                        <span>NIK</span>

                        <strong>{ayahNikahTerpilih.nik || "-"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="surat-form-grid">
                  <div className="form-group">
                    <label>Nama Ayah</label>

                    <input
                      type="text"
                      value={form.namaAyah || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          namaAyah: e.target.value,
                        }))
                      }
                      placeholder="Nama ayah"
                    />
                  </div>

                  <div className="form-group">
                    <label>NIK Ayah</label>

                    <input
                      type="text"
                      value={form.nikAyah || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          nikAyah: e.target.value,
                        }))
                      }
                      placeholder="NIK ayah"
                    />
                  </div>
                </div>
              )}

              {/* =================================================
        IBU
    ================================================= */}

              <div className="form-group form-group-full">
                <label>Nama Orang Tua Perempuan</label>

                <select
                  value={ibuNikahMode}
                  onChange={(e) => {
                    const mode = e.target.value;

                    setIbuNikahMode(mode);

                    setIbuNikahTerpilih(null);

                    setForm((prev) => ({
                      ...prev,
                      ibuNikahMode: mode,
                      ibuId: "",
                      namaIbu: "",
                      nikIbu: "",
                    }));
                  }}
                >
                  <option value="warga">Pilih dari Data Warga</option>

                  <option value="manual">Isi Manual</option>
                </select>
              </div>

              {ibuNikahMode === "warga" ? (
                <div className="form-group form-group-full">
                  <label>Pilih Ibu dari Data Warga</label>

                  <select
                    value={form.ibuId || ""}
                    onChange={(e) => {
                      const id = e.target.value;

                      const warga = wargaAktif.find(
                        (item) => String(item.id) === String(id),
                      );

                      setForm((prev) => ({
                        ...prev,
                        ibuId: id,
                        namaIbu: warga?.nama || "",
                        nikIbu: warga?.nik || "",
                      }));

                      setIbuNikahTerpilih(warga || null);
                    }}
                  >
                    <option value="">-- Pilih Ibu --</option>

                    {wargaAktif.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama} - {item.nik || "-"}
                      </option>
                    ))}
                  </select>

                  {ibuNikahTerpilih && (
                    <div className="warga-terpilih">
                      <div className="warga-data-item">
                        <span>Nama</span>

                        <strong>{ibuNikahTerpilih.nama || "-"}</strong>
                      </div>

                      <div className="warga-data-item">
                        <span>NIK</span>

                        <strong>{ibuNikahTerpilih.nik || "-"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="surat-form-grid">
                  <div className="form-group">
                    <label>Nama Ibu</label>

                    <input
                      type="text"
                      value={form.namaIbu || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          namaIbu: e.target.value,
                        }))
                      }
                      placeholder="Nama ibu"
                    />
                  </div>

                  <div className="form-group">
                    <label>NIK Ibu</label>

                    <input
                      type="text"
                      value={form.nikIbu || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          nikIbu: e.target.value,
                        }))
                      }
                      placeholder="NIK ibu"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KEPERLUAN */}

          <div className="surat-section">
            <h4>Keperluan Surat</h4>

            <div className="form-group">
              <label>Keperluan</label>

              <textarea
                name="keperluan"
                value={form.keperluan}
                onChange={handleChange}
                rows="4"
                placeholder="Tuliskan keperluan surat..."
              />
            </div>
          </div>

          {/* ===================================================
    DATA ALMARHUM / ALMARHUMAH - AHLI WARIS
=================================================== */}

          {form.jenisSurat === "Surat Pengantar Ahli Waris" && (
            <div className="surat-section">
              <h4>Data Almarhum / Almarhumah</h4>

              <div className="form-group form-group-full">
                <label>Sumber Data</label>

                <select
                  value={form.ahliWarisMode || "warga"}
                  onChange={(e) => {
                    const mode = e.target.value;

                    setForm((prev) => ({
                      ...prev,
                      ahliWarisMode: mode,
                      almarhumId: "",
                      namaAlmarhum: "",
                      nikAlmarhum: "",
                    }));
                  }}
                >
                  <option value="warga">Pilih dari Data Warga</option>

                  <option value="manual">Isi Manual</option>
                </select>
              </div>

              {/* PILIH DARI DATA WARGA */}
              {form.ahliWarisMode === "warga" ? (
                <div className="form-group form-group-full">
                  <label>Pilih Almarhum / Almarhumah</label>

                  <select
                    value={form.almarhumId || ""}
                    onChange={(e) => {
                      const id = e.target.value;

                      const almarhum = wargaMeninggal.find(
                        (item) => String(item.id) === String(id),
                      );

                      setForm((prev) => ({
                        ...prev,
                        almarhumId: id,
                        namaAlmarhum: almarhum?.nama || "",
                        nikAlmarhum: almarhum?.nik || "",
                      }));
                    }}
                  >
                    <option value="">-- Pilih Data yang Meninggal --</option>

                    {wargaMeninggal.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                        {item.nik ? ` - ${item.nik}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* ISI MANUAL */
                <div className="surat-form-grid">
                  <div className="form-group">
                    <label>Nama Almarhum / Almarhumah</label>

                    <input
                      type="text"
                      value={form.namaAlmarhum || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          namaAlmarhum: e.target.value,
                        }))
                      }
                      placeholder="Nama Almarhum / Almarhumah"
                    />
                  </div>

                  <div className="form-group">
                    <label>NIK Almarhum / Almarhumah</label>

                    <input
                      type="text"
                      value={form.nikAlmarhum || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          nikAlmarhum: e.target.value,
                        }))
                      }
                      placeholder="NIK Almarhum / Almarhumah"
                    />
                  </div>
                </div>
              )}

              {/* HUBUNGAN KELUARGA */}
              <div className="form-group form-group-full">
                <label>Hubungan Keluarga</label>

                <input
                  type="text"
                  name="hubunganKeluarga"
                  value={form.hubunganKeluarga || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Ayah, Ibu, Suami, Istri, Anak, Saudara"
                />
              </div>
            </div>
          )}

          {/* FOOTER */}

          <div className="surat-form-footer">
            <button
              type="button"
              className="btn-batal-surat"
              onClick={tutupForm}
            >
              Batal
            </button>

            <button
              type="button"
              className="btn-simpan-surat"
              onClick={handleSimpanSurat}
            >
              💾 Simpan Surat
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          DETAIL SURAT
      =================================================== */}

      {suratTerpilih && (
        <div className="modal-overlay">
          <div className="modal-surat">
            <div className="modal-surat-header">
              <div>
                <h3>
                  {suratTerpilih.jenisSurat === "Surat Pengantar Kematian"
                    ? "🕊️ Detail Surat Kematian"
                    : "📄 Detail Surat"}
                </h3>

                <p>Informasi surat yang telah dibuat</p>
              </div>

              <button
                type="button"
                className="btn-close-form"
                onClick={() => setSuratTerpilih(null)}
              >
                ✕
              </button>
            </div>

            {suratTerpilih.jenisSurat === "Surat Pengantar Kematian" ? (
              <div className="detail-surat-content">
                {/* ================================
        DATA PELAPOR
        ================================ */}

                <div className="detail-surat-item">
                  <span>Nama Pelapor</span>

                  <strong>
                    {getDataWargaSurat(suratTerpilih, wargaAktif).pelaporNama ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>NIK Pelapor</span>

                  <strong>
                    {getDataWargaSurat(suratTerpilih, wargaAktif).pelaporNik ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>Hubungan dengan Yang Meninggal</span>

                  <strong>{suratTerpilih.hubunganPelapor || "-"}</strong>
                </div>

                {/* ================================
        DATA YANG MENINGGAL
        ================================ */}

                <div className="detail-surat-item">
                  <span>Nama Yang Meninggal</span>

                  <strong>
                    {getDataWargaSurat(suratTerpilih, wargaAktif).nama || "-"}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>NIK</span>

                  <strong>
                    {getDataWargaSurat(suratTerpilih, wargaAktif).nik || "-"}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>Tempat / Tanggal Lahir</span>

                  <strong>
                    {getDataWargaSurat(suratTerpilih, wargaAktif).tempatLahir ||
                      "-"}

                    {getDataWargaSurat(suratTerpilih, wargaAktif).tanggalLahir
                      ? `, ${formatTanggal(
                          getDataWargaSurat(suratTerpilih, wargaAktif)
                            .tanggalLahir,
                        )}`
                      : ""}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>Alamat</span>

                  <strong>
                    {getDataWargaSurat(suratTerpilih, wargaAktif).alamat || "-"}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>Tanggal Meninggal</span>

                  <strong>
                    {formatTanggal(suratTerpilih.tanggalMeninggal)}
                  </strong>
                </div>

                <div className="detail-surat-item">
                  <span>Tempat Meninggal</span>

                  <strong>{suratTerpilih.tempatMeninggal || "-"}</strong>
                </div>

                <div className="detail-surat-item detail-surat-full">
                  <span>Keterangan</span>

                  <strong>{suratTerpilih.keterangan || "-"}</strong>
                </div>
              </div>
            ) : (
              <div className="detail-surat-content">
                <div className="detail-surat-item">
                  <span>Nomor Surat</span>

                  <strong>{suratTerpilih.nomorSurat}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>Tanggal Surat</span>

                  <strong>{formatTanggal(suratTerpilih.tanggalSurat)}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>Jenis Surat</span>

                  <strong>{suratTerpilih.jenisSurat}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>Nama Pemohon</span>

                  <strong>{suratTerpilih.namaWarga || "-"}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>NIK</span>

                  <strong>{suratTerpilih.nik || "-"}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>Nama Almarhum/ah</span>

                  <strong>{suratTerpilih.namaAlmarhum || "-"}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>NIK Almarhum/ah</span>

                  <strong>{suratTerpilih.nikAlmarhum || "-"}</strong>
                </div>

                <div className="detail-surat-item">
                  <span>Hubungan Keluarga</span>

                  <strong>{suratTerpilih.hubunganKeluarga || "-"}</strong>
                </div>

                <div className="detail-surat-item detail-surat-full">
                  <span>Keperluan</span>

                  <strong>{suratTerpilih.keperluan || "-"}</strong>
                </div>
              </div>
            )}

            <div className="modal-surat-footer">
              <button
                type="button"
                className="btn-batal-surat"
                onClick={() => setSuratTerpilih(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          PREVIEW SURAT
      =================================================== */}

      {suratPreview && (
        <div className="modal-overlay">
          <div className="modal-preview-surat">
            <div className="modal-surat-header">
              <div>
                <h3>🖨️ Preview Surat</h3>
                <p>Pratinjau surat sebelum dicetak</p>
              </div>

              <button
                type="button"
                className="btn-close-form"
                onClick={() => setSuratPreview(null)}
              >
                ✕
              </button>
            </div>

            {(() => {
              const wargaSurat = getDataWargaSurat(suratPreview, wargaAktif);

              const isiSurat = getIsiSurat(suratPreview, wargaAktif);

              const isKematian =
                suratPreview.jenisSurat === "Surat Pengantar Kematian";

              return (
                <div className="preview-surat-paper">
                  {/* =====================================================
                KOP SURAT
            ====================================================== */}

                  <div className="preview-kop-surat">
                    <div className="kop-baris kop-baris-1">
                      RUKUN TETANGGA 003/07
                    </div>

                    <div className="kop-baris kop-baris-2">
                      KELURAHAN KARET &nbsp;&nbsp;&nbsp; KECAMATAN SETIABUDI
                    </div>

                    <div className="kop-baris kop-baris-3">
                      KOTA ADMINISTRASI JAKARTA SELATAN
                    </div>

                    <div className="kop-baris kop-baris-4">
                      <span>Sekretariat : Jalan Setiabudi 1 No. 21</span>

                      <span className="kop-kontak">📱 082113197811</span>

                      <span className="kop-kontak">
                        ✉️ rt.003.07.stb@gmail.com
                      </span>
                    </div>

                    <div className="kop-baris kop-baris-5">
                      JAKARTA &nbsp;&nbsp;-&nbsp;&nbsp; Kode Pos : 12920
                    </div>
                  </div>

                  <div className="preview-garis"></div>

                  {/* =====================================================
                JUDUL SURAT
            ====================================================== */}

                  <div className="preview-judul-surat">
  <h2>SURAT PENGANTAR</h2>

  <div className="preview-nomor-surat">
    Nomor : {suratPreview.nomorSurat}
  </div>
</div>


{/* =====================================================
    ISI SURAT — SATU FORMAT UNTUK SEMUA JENIS SURAT
====================================================== */}

<div className="preview-isi-surat">

  <p>
    Yang bertanda tangan di bawah ini, menerangkan bahwa:
  </p>

  <div className="preview-identitas-warga">

    <div className="identitas-row">
      <span>Nama</span>
      <b>:</b>
      <strong>{wargaSurat.nama || "-"}</strong>
    </div>

    <div className="identitas-row">
      <span>Tempat/Tgl. Lahir</span>
      <b>:</b>
      <strong>
        {wargaSurat.tempatLahir || "-"}
        {wargaSurat.tanggalLahir
          ? `, ${formatTanggal(wargaSurat.tanggalLahir)}`
          : ""}
      </strong>
    </div>

    <div className="identitas-row">
      <span>Jenis Kelamin</span>
      <b>:</b>
      <strong>{wargaSurat.jenisKelamin || "-"}</strong>
    </div>

    <div className="identitas-row">
      <span>Agama</span>
      <b>:</b>
      <strong>{wargaSurat.agama || "-"}</strong>
    </div>

    <div className="identitas-row">
      <span>Pekerjaan</span>
      <b>:</b>
      <strong>{wargaSurat.pekerjaan || "-"}</strong>
    </div>

    <div className="identitas-row">
      <span>Nomor KTP</span>
      <b>:</b>
      <strong>{wargaSurat.nik || "-"}</strong>
    </div>

    <div className="identitas-row identitas-alamat">
      <span>Alamat</span>
      <b>:</b>
      <strong>
        {wargaSurat.alamat || "-"}

        {String(wargaSurat.statusKependudukan || "")
          .trim()
          .toLowerCase() !== "pendatang" && (
          <>
            <br />
            KELURAHAN KARET, KECAMATAN SETIABUDI JAKARTA SELATAN
          </>
        )}
      </strong>
    </div>

    <div className="identitas-row identitas-keperluan">
  <span>Keperluan</span>
  <b>:</b>
  <strong>
    {String(suratPreview.keperluan || "-")
      .replace(/^KEPERLUAN\s*:\s*/i, "")
      .trim() || "-"}
  </strong>
</div>
</div>

  <p className="preview-penutup">
    Demikian surat pengantar ini dibuat untuk dapat dipergunakan
    sebagaimana mestinya dan yang berkepentingan untuk menjadi maklum.
  </p>

</div>

                  {/* =====================================================
                TANDA TANGAN
            ====================================================== */}

                  <div className="preview-tanda-tangan">
                    <div className="ttd-rw">
                      <div className="rw-manual">
                        <div>Nomor&nbsp;&nbsp;&nbsp; :</div>
                        <div>Tanggal&nbsp;&nbsp; :</div>
                      </div>

                      <div className="ttd-jabatan">
                        KETUA RW 07
                        <br />
                        KELURAHAN KARET
                      </div>

                      <div className="ttd-space"></div>

                      <strong>(HASAN BASRI)</strong>
                    </div>

                    <div className="ttd-rt">
                      <div className="rt-tanggal">
                        Jakarta, {formatTanggal(suratPreview.tanggalSurat)}
                      </div>

                      <div className="ttd-jabatan">
                        KETUA RT 003/07
                        <br />
                        KELURAHAN KARET
                      </div>

                      <div className="ttd-space"></div>

                      <strong>(JANUARDI PRATOMO)</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* =========================================================
          FOOTER PREVIEW
      ========================================================== */}

            <div className="modal-surat-footer">
              <button
                type="button"
                className="btn-batal-surat"
                onClick={() => setSuratPreview(null)}
              >
                Tutup
              </button>

              <button
                type="button"
                className="btn-simpan-surat"
                onClick={() => {
                  // Ambil nomor urut dari nomor surat
                  const nomorAwal = String(suratPreview.nomorSurat || "0000")
                    .split("/")[0]
                    .replace(/\D/g, "");

                  // Selalu 4 digit
                  const nomorFile = nomorAwal.padStart(4, "0");

                  // Nama file PDF
                  const namaFile = `surat${nomorFile}`;

                  // Simpan judul halaman
                  const judulLama = document.title;

                  // Nama file saat Save as PDF
                  document.title = namaFile;

                  // Cetak
                  window.print();

                  // Kembalikan judul halaman
                  setTimeout(() => {
                    document.title = judulLama;
                  }, 1000);
                }}
              >
                🖨️ Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          DAFTAR SURAT
          Jangan tampil ketika salah satu form sedang buka.
      =================================================== */}

      {!showForm && !showFormKematian && (
        <div className="surat-pengantar-card">
          {daftarSurat.length === 0 ? (
            <div className="empty-surat">
              <div className="empty-surat-icon">📄</div>

              <h3>Belum Ada Surat</h3>

              <p>Surat pengantar yang dibuat akan tampil di halaman ini.</p>
            </div>
          ) : (
            <div className="daftar-surat">
              <div className="daftar-surat-header">
                <div>
                  <h3>Daftar Surat</h3>

                  <p>Surat yang telah dibuat oleh RT 03</p>
                </div>

                <span className="jumlah-surat">{daftarSurat.length} Surat</span>
              </div>

              <div className="table-surat-wrapper">
                <table className="table-surat">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nomor Surat</th>
                      <th>Tanggal</th>
                      <th>Jenis Surat</th>
                      <th>Nama Pemohon</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {daftarSurat.map((surat, index) => {
                      const wargaSurat = getDataWargaSurat(surat, wargaAktif);

                      const isKematian =
                        surat.jenisSurat === "Surat Pengantar Kematian";

                      return (
                        <tr key={surat.id}>
                          <td>{index + 1}</td>

                          <td>{surat.nomorSurat}</td>

                          <td>{formatTanggal(surat.tanggalSurat)}</td>

                          <td>
                            {isKematian
                              ? "Surat Keterangan Kematian"
                              : surat.jenisSurat}
                          </td>

                          <td>
                            <strong>{wargaSurat.nama || "-"}</strong>

                            <small>{wargaSurat.nik || "-"}</small>
                          </td>

                          <td>
                            <div className="action-dropdown">
                              <button
                                type="button"
                                className="action-menu-button"
                                onClick={() => toggleActionSurat(surat.id)}
                              >
                                ⋮ Aksi
                              </button>

                              {openActionId === surat.id && (
                                <div className="action-menu">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      bukaDetailSurat(surat);
                                    }}
                                  >
                                    👁️ Detail
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      bukaEditSurat(surat);
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      bukaPreviewSurat(surat);
                                    }}
                                  >
                                    🖨️ Cetak
                                  </button>

                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => {
                                      hapusSurat(surat);
                                    }}
                                  >
                                    🗑️ Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SuratPengantar;
