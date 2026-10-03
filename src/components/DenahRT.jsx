import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/*
 * DenahRT
 * - Menggunakan gambar denah asli sebagai dasar.
 * - Nomor 1-50 diberi hotspot transparan yang bisa diklik.
 * - Data KK/unit tetap dikelola di modal seperti prototype sebelumnya.
 *
 * Letakkan gambar "denah-rt.jpg" di folder:
 * public/denah-rt.jpg
 */

const dataAwal = [
  {
    id: "rumah-01",
    nomor: 1,
    nama: "Bidang 01",
    tipe: "Rumah Tinggal",
    x: 166,
    y: 168,
    width: 87,
    height: 55,
    unit: [{ id: "unit-01-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022204141001", nama: "ROSYAHDAN", noKK: "3174022204141001" },
      { id: "3174020109210006", nama: "ROSMAN PONIK", noKK: "3174020109210006" },
      { id: "3174020501093431", nama: "RADITIO WAHYU", noKK: "3174020501093431" },
    ],
  },

  {
    id: "rumah-02",
    nomor: 2,
    nama: "Bidang 02",
    tipe: "Kontrak",
    x: 256,
    y: 168,
    width: 70,
    height: 27,
    unit: [{ id: "unit-02-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-03",
    nomor: 3,
    nama: "Bidang 03",
    tipe: "Rumah Tinggal",
    x: 329,
    y: 168,
    width: 50,
    height: 27,
    unit: [{ id: "unit-03-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020710200001", nama: "WAHYU NUR HIDAYAT", noKK: "3174020710200001" },
      { id: "3174020501095868", nama: "SUTARMAN", noKK: "3174020501095868" },
      { id: "3174020705121009", nama: "JOKO TRI HARJANTO", noKK: "3174020705121009" },
    ],
  },

  {
    id: "rumah-04",
    nomor: 4,
    nama: "Bidang 04",
    tipe: "Kontrak",
    x: 256,
    y: 195,
    width: 122,
    height: 31,
    unit: [{ id: "unit-04-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-05",
    nomor: 5,
    nama: "Bidang 05",
    tipe: "Rumah Tinggal",
    x: 256,
    y: 221,
    width: 123,
    height: 29,
    unit: [{ id: "unit-05-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174021412220010", nama: "ALBERT JAKA YUNIARTHA", noKK: "3174021412220010" },
      { id: "3174020607230009", nama: "ENDANG SRI MAWARTI RR", noKK: "3174020607230009" },
    ],
  },

  {
    id: "rumah-06",
    nomor: 6,
    nama: "Bidang 06",
    tipe: "Rumah Tinggal",
    x: 256,
    y: 248,
    width: 123,
    height: 29,
    unit: [{ id: "unit-06-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501098317", nama: "FX TOTO SARWOWINOTO", noKK: "3174020501098317" },
    ],
  },

  {
    id: "rumah-07",
    nomor: 7,
    nama: "Bidang 07",
    tipe: "Kontrak",
    x: 312,
    y: 277,
    width: 67,
    height: 69,
    unit: [{ id: "unit-07-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-08",
    nomor: 8,
    nama: "Bidang 08",
    tipe: "Kost",
    x: 166,
    y: 277,
    width: 145,
    height: 69,
    unit: [{ id: "unit-08-01", nama: "Kost", fungsi: "Kost" }],
    kk: [],
  },

  {
    id: "rumah-09",
    nomor: 9,
    nama: "Bidang 09",
    tipe: "Kost",
    x: 166,
    y: 223,
    width: 87,
    height: 53,
    unit: [{ id: "unit-09-01", nama: "Kost", fungsi: "Kost" }],
    kk: [],
  },

  {
    id: "rumah-10",
    nomor: 10,
    nama: "Bidang 10",
    tipe: "Rumah Tinggal",
    x: 395,
    y: 277,
    width: 52,
    height: 69,
    unit: [{ id: "unit-10-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [],
  },

  {
    id: "rumah-11",
    nomor: 11,
    nama: "Bidang 11",
    tipe: "Rumah Tinggal",
    x: 452,
    y: 277,
    width: 47,
    height: 69,
    unit: [{ id: "unit-11-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [],
  },

  {
    id: "rumah-12",
    nomor: 12,
    nama: "Bidang 12",
    tipe: "Rumah Tinggal",
    x: 171,
    y: 359,
    width: 87,
    height: 36,
    unit: [{ id: "unit-12-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022408210019", nama: "MAISAROH", noKK: "3174022408210019" },
    ],
  },

  {
    id: "rumah-13",
    nomor: 13,
    nama: "Bidang 13",
    tipe: "Rumah Tinggal",
    x: 259,
    y: 359,
    width: 57,
    height: 36,
    unit: [{ id: "unit-13-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174021002141005", nama: "JANUARDI PRATOMO", noKK: "3174021002141005" },
      { id: "3174020402210011", nama: "GEMAH RIZKIANA", noKK: "3174020402210011" },
      { id: "3174020302200008", nama: "MAIMUNAH", noKK: "3174020302200008" },
    ],
  },

  {
    id: "rumah-14",
    nomor: 14,
    nama: "Bidang 14",
    tipe: "Kontrak",
    x: 318,
    y: 359,
    width: 35,
    height: 35,
    unit: [{ id: "unit-14-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "3174021110110001", nama: "DENNY CH PANGEMANAN", noKK: "3174021110110001" },
      { id: "3174020501095798", nama: "NURYATI", noKK: "3174020501095798" },
      { id: "3174022505220010", nama: "PANDU SULAKSONO", noKK: "3174022505220010" },
    ],
  },

  {
    id: "rumah-51",
    nomor: 51,
    nama: "Bidang 51",
    tipe: "Kontrak",
    x: 354,
    y: 359,
    width: 35,
    height: 35,
    unit: [{ id: "unit-51-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-15",
    nomor: 15,
    nama: "Bidang 15",
    tipe: "Rumah Tinggal",
    x: 171,
    y: 397,
    width: 145,
    height: 28,
    unit: [{ id: "unit-15-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022405131002", nama: "MARYANAH", noKK: "3174022405131002" },
    ],
  },

  {
    id: "rumah-16",
    nomor: 16,
    nama: "Bidang 16",
    tipe: "Rumah Tinggal",
    x: 171,
    y: 427,
    width: 145,
    height: 26,
    unit: [{ id: "unit-16-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020606111006", nama: "HERRY DARMAWAN", noKK: "3174020606111006" },
    ],
  },

  {
    id: "rumah-17",
    nomor: 17,
    nama: "Bidang 17",
    tipe: "Kontrak",
    x: 171,
    y: 454,
    width: 151,
    height: 23,
    unit: [{ id: "unit-17-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-18",
    nomor: 18,
    nama: "Bidang 18",
    tipe: "Rumah Tinggal",
    x: 171,
    y: 478,
    width: 87,
    height: 25,
    unit: [{ id: "unit-18-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501095824", nama: "SULANTA R", noKK: "3174020501095824" },
      { id: "3174023001200005", nama: "ZAINUDIN AHMAD", noKK: "3174023001200005" },
      { id: "3174022407141002", nama: "AMENAH", noKK: "3174022407141002" },
      { id: "3174020709220006", nama: "HENDRA", noKK: "3174020709220006" },
      { id: "3174021101121001", nama: "UMIYENIA", noKK: "3174021101121001" },
    ],
  },

  {
    id: "rumah-19",
    nomor: 19,
    nama: "Bidang 19",
    tipe: "Rumah Tinggal",
    x: 171,
    y: 503,
    width: 87,
    height: 29,
    unit: [{ id: "unit-19-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174021711220002", nama: "BAMBANG SETIAWAN", noKK: "3174021711220002" },
      { id: "3174020501095852", nama: "MUDJENI", noKK: "3174020501095852" },
    ],
  },

  {
    id: "rumah-20",
    nomor: 20,
    nama: "Bidang 20",
    tipe: "Rumah Tinggal",
    x: 258,
    y: 477,
    width: 67,
    height: 140,
    unit: [{ id: "unit-20-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022211160005", nama: "SYARIF HIDAYATULLAH", noKK: "3174022211160005" },
      { id: "3174021203190001", nama: "AMANI", noKK: "3174021203190001" },
      { id: "3174020601092554", nama: "ROMMY HERMANSYAH", noKK: "3174020601092554" },
      { id: "3174021310220015", nama: "QAMARUL AKHYAR DINAN", noKK: "3174021310220015" },
      { id: "3174020601092373", nama: "SARTONO", noKK: "3174020601092373" },
    ],
  },

  {
    id: "rumah-21",
    nomor: 21,
    nama: "Bidang 21",
    tipe: "Kontrak",
    x: 325,
    y: 570,
    width: 31,
    height: 47,
    unit: [{ id: "unit-21-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-22",
    nomor: 22,
    nama: "Bidang 22",
    tipe: "Kost",
    x: 357,
    y: 570,
    width: 47,
    height: 47,
    unit: [{ id: "unit-22-01", nama: "Kost", fungsi: "Kost" }],
    kk: [],
  },

  {
    id: "rumah-23",
    nomor: 23,
    nama: "Bidang 23",
    tipe: "Rumah Tinggal",
    x: 325,
    y: 544,
    width: 31,
    height: 26,
    unit: [{ id: "unit-23-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501095832", nama: "NURYADIN", noKK: "3174020501095832" },
      { id: "3174020803190031", nama: "ACHMAD SANUSI INDRAWAN", noKK: "3174020803190031" },
      { id: "3174020501098253", nama: "AGUS WAHYUDI", noKK: "3174020501098253" },
      { id: "3174020501097936", nama: "SAMBAS", noKK: "3174020501097936" },
      { id: "3174022006141009", nama: "UMAR MUKHTAR", noKK: "3174022006141009" },
      { id: "3174020601092492", nama: "INDRIYATIE", noKK: "3174020601092492" },
    ],
  },

  {
    id: "rumah-24",
    nomor: 24,
    nama: "Bidang 24",
    tipe: "Rumah Tinggal",
    x: 325,
    y: 516,
    width: 48,
    height: 27,
    unit: [{ id: "unit-24-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020601092786", nama: "IWAN SETIAWAN", noKK: "3174020601092786" },
    ],
  },

  {
    id: "rumah-25",
    nomor: 25,
    nama: "Bidang 25",
    tipe: "Rumah Tinggal",
    x: 325,
    y: 488,
    width: 48,
    height: 28,
    unit: [{ id: "unit-25-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020107190004", nama: "EVAN ELIAN SETIAWAN", noKK: "3174020107190004" },
    ],
  },

  {
    id: "rumah-26",
    nomor: 26,
    nama: "Bidang 26",
    tipe: "Kontrak",
    x: 325,
    y: 459,
    width: 48,
    height: 28,
    unit: [{ id: "unit-26-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "3174022301141009", nama: "EFRIL YADI", noKK: "3174022301141009" },
    ],
  },

  {
    id: "rumah-27",
    nomor: 27,
    nama: "Bidang 27",
    tipe: "Rumah Tinggal",
    x: 325,
    y: 432,
    width: 48,
    height: 27,
    unit: [{ id: "unit-27-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020907131008", nama: "MOCHAMAD DENDI", noKK: "3174020907131008" },
      { id: "3174020601091523", nama: "MUHAMMAD FADLI", noKK: "3174020601091523" },
      { id: "3174020501095825", nama: "NINO ACHMAD ZAINO", noKK: "3174020501095825" },
    ],
  },

  {
    id: "rumah-28",
    nomor: 28,
    nama: "Bidang 28",
    tipe: "Rumah Tinggal",
    x: 320,
    y: 398,
    width: 84,
    height: 32,
    unit: [{ id: "unit-28-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022411230016", nama: "MUHAMMAD ADAM RAMADHAN NOOR", noKK: "3174022411230016" },
      { id: "3174020501098353", nama: "HAMDARIYANSYAH", noKK: "3174020501098353" },
    ],
  },

  {
    id: "rumah-29",
    nomor: 29,
    nama: "Bidang 29",
    tipe: "Rumah Tinggal",
    x: 411,
    y: 361,
    width: 45,
    height: 42,
    unit: [{ id: "unit-29-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501098279", nama: "BUDI SANTOSO", noKK: "3174020501098279" },
      { id: "3174021510110018", nama: "TEGUH WAHYONO", noKK: "3174021510110018" },
    ],
  },

  {
    id: "rumah-30",
    nomor: 30,
    nama: "Bidang 30",
    tipe: "Kontrak",
    x: 459,
    y: 361,
    width: 44,
    height: 42,
    unit: [{ id: "unit-30-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "7371111301250022", nama: "RIFHIAL ADHINUGRAHA", noKK: "7371111301250022" },
    ],
  },

  {
    id: "rumah-31",
    nomor: 31,
    nama: "Bidang 31",
    tipe: "Kontrak",
    x: 418,
    y: 404,
    width: 84,
    height: 29,
    unit: [{ id: "unit-31-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "7371102602160010", nama: "CRISYE EDWARD KALEB JUNAID SH", noKK: "7371102602160010" },
    ],
  },

  {
    id: "rumah-32",
    nomor: 32,
    nama: "Bidang 32",
    tipe: "Kontrak",
    x: 418,
    y: 435,
    width: 84,
    height: 28,
    unit: [{ id: "unit-32-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [],
  },

  {
    id: "rumah-33",
    nomor: 33,
    nama: "Bidang 33",
    tipe: "POS RT 03",
    x: 418,
    y: 465,
    width: 84,
    height: 28,
    unit: [{ id: "unit-33-01", nama: "POS RT 03", fungsi: "Fasilitas RT" }],
    kk: [],
  },

  {
    id: "rumah-34",
    nomor: 34,
    nama: "Bidang 34",
    tipe: "Rumah Tinggal",
    x: 418,
    y: 496,
    width: 84,
    height: 29,
    unit: [{ id: "unit-34-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501098708", nama: "TAJUDIN", noKK: "3174020501098708" },
      { id: "3174020601092321", nama: "NGADINO", noKK: "3174020601092321" },
      { id: "3174021904240002", nama: "SUTRISNO", noKK: "3174021904240002" },
      { id: "3174022706240014", nama: "TRI TRISNOWATI", noKK: "3174022706240014" },
    ],
  },

  {
    id: "rumah-35",
    nomor: 35,
    nama: "Bidang 35",
    tipe: "Rumah Tinggal",
    x: 418,
    y: 526,
    width: 84,
    height: 29,
    unit: [{ id: "unit-35-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501095863", nama: "ANAS YUSUP", noKK: "3174020501095863" },
      { id: "3174020808121010", nama: "HAMDANI", noKK: "3174020808121010" },
    ],
  },

  {
    id: "rumah-36",
    nomor: 36,
    nama: "Bidang 36",
    tipe: "Kontrak",
    x: 418,
    y: 556,
    width: 84,
    height: 29,
    unit: [{ id: "unit-36-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "3174020806220013", nama: "FITRIYAH", noKK: "3174020806220013" },
    ],
  },

  {
    id: "rumah-37",
    nomor: 37,
    nama: "Bidang 37",
    tipe: "Rumah Tinggal",
    x: 418,
    y: 586,
    width: 84,
    height: 39,
    unit: [{ id: "unit-37-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020601090832", nama: "IWAN SETIAWAN", noKK: "3174020601090832" },
      { id: "3174020501095819", nama: "KASIR", noKK: "3174020501095819" },
      { id: "3174020501099623", nama: "RISBIANTORO", noKK: "3174020501099623" },
    ],
  },

  {
    id: "rumah-38",
    nomor: 38,
    nama: "Bidang 38",
    tipe: "Rumah Tinggal",
    x: 399,
    y: 632,
    width: 102,
    height: 70,
    unit: [{ id: "unit-38-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020701190005", nama: "SRI RETNO KILATSIH", noKK: "3174020701190005" },
      { id: "3174020601090891", nama: "SRI RETNO KUMARYATI", noKK: "3174020601090891" },
    ],
  },

  {
    id: "rumah-39",
    nomor: 39,
    nama: "Bidang 39",
    tipe: "Rumah Tinggal",
    x: 399,
    y: 704,
    width: 102,
    height: 43,
    unit: [{ id: "unit-39-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020601091369", nama: "YANWAR ARIADI", noKK: "3174020601091369" },
      { id: "3174020601091365", nama: "MARDEH", noKK: "3174020601091365" },
    ],
  },

  {
    id: "rumah-40",
    nomor: 40,
    nama: "Bidang 40",
    tipe: "Rumah Tinggal",
    x: 504,
    y: 704,
    width: 68,
    height: 43,
    unit: [{ id: "unit-40-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020601091777", nama: "WIDJANARKO", noKK: "3174020601091777" },
      { id: "3174020804141002", nama: "FERDINANDO XANDORS SIREGAR", noKK: "3174020804141002" },
      { id: "3174020906220021", nama: "RENA LARASATI", noKK: "3174020906220021" },
    ],
  },

  {
    id: "rumah-41",
    nomor: 41,
    nama: "Bidang 41",
    tipe: "Rumah Tinggal",
    x: 575,
    y: 704,
    width: 47,
    height: 43,
    unit: [{ id: "unit-41-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022707170009", nama: "JOE NIANDHIKA BASKORO", noKK: "3174022707170009" },
      { id: "3174020501095820", nama: "JOEL TOTOK APRIYANTO", noKK: "3174020501095820" },
    ],
  },

  {
    id: "rumah-42",
    nomor: 42,
    nama: "Bidang 42",
    tipe: "Kontrak",
    x: 624,
    y: 704,
    width: 30,
    height: 43,
    unit: [{ id: "unit-42-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "3174022312160009", nama: "SOLIHIN", noKK: "3174022312160009" },
    ],
  },

  {
    id: "rumah-43",
    nomor: 43,
    nama: "Bidang 43",
    tipe: "Kost / Usaha",
    x: 534,
    y: 753,
    width: 119,
    height: 65,
    unit: [
      { id: "unit-43-01", nama: "Kost", fungsi: "Kost" },
      { id: "unit-43-02", nama: "Barbershop", fungsi: "Usaha" },
      { id: "unit-43-03", nama: "Laundry", fungsi: "Usaha" },
    ],
    kk: [],
  },

  {
    id: "rumah-44",
    nomor: 44,
    nama: "Bidang 44",
    tipe: "Rumah Tinggal",
    x: 477,
    y: 789,
    width: 40,
    height: 31,
    unit: [{ id: "unit-44-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174020501095809", nama: "YUSUF", noKK: "3174020501095809" },
    ],
  },

  {
    id: "rumah-45",
    nomor: 45,
    nama: "Bidang 45",
    tipe: "Bengkel",
    x: 430,
    y: 789,
    width: 43,
    height: 31,
    unit: [{ id: "unit-45-01", nama: "Bengkel", fungsi: "Usaha" }],
    kk: [],
  },

  {
    id: "rumah-46",
    nomor: 46,
    nama: "Bidang 46",
    tipe: "Kontrak",
    x: 381,
    y: 789,
    width: 47,
    height: 31,
    unit: [{ id: "unit-46-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "3173012309141034", nama: "MUSTHAFA", noKK: "3173012309141034" },
      { id: "3174020601090843", nama: "SUBANA", noKK: "3174020601090843" },
    ],
  },

  {
    id: "rumah-47",
    nomor: 47,
    nama: "Bidang 47",
    tipe: "Kontrak",
    x: 380,
    y: 761,
    width: 137,
    height: 27,
    unit: [{ id: "unit-47-01", nama: "Kontrak", fungsi: "Kontrak" }],
    kk: [
      { id: "3174020909190005", nama: "RENI MARWANTI", noKK: "3174020909190005" },
      { id: "3174020510220013", nama: "TEJO SUROJO", noKK: "3174020510220013" },
    ],
  },

  {
    id: "rumah-48",
    nomor: 48,
    nama: "Bidang 48",
    tipe: "Rumah Tinggal / Kost",
    x: 257,
    y: 705,
    width: 125,
    height: 114,
    unit: [
      { id: "unit-48-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" },
      { id: "unit-48-02", nama: "Kost", fungsi: "Kost" },
    ],
    kk: [
      { id: "3174020501095861", nama: "ABDUL GANI", noKK: "3174020501095861" },
      { id: "3174020501098329", nama: "I MADE WIBAWA KUSUMA", noKK: "3174020501098329" },
      { id: "3174020102240013", nama: "ASTARI DESQUAMILA", noKK: "3174020102240013" },
      { id: "3174020501098794", nama: "I PUTU SUARDIKA", noKK: "3174020501098794" },
      { id: "3174023105131004", nama: "I KETUT MERTHA YASA", noKK: "3174023105131004" },
      { id: "3174020501095862", nama: "NI WAYAN SRI UTAMI", noKK: "3174020501095862" },
    ],
  },

  {
    id: "rumah-49",
    nomor: 49,
    nama: "Bidang 49",
    tipe: "Rumah Tinggal",
    x: 212,
    y: 634,
    width: 45,
    height: 186,
    unit: [{ id: "unit-49-01", nama: "Rumah Tinggal", fungsi: "Tempat Tinggal" }],
    kk: [
      { id: "3174022111180013", nama: "SUSHERYANI", noKK: "3174022111180013" },
      { id: "3174021911200014", nama: "NISA BINTA SAKRI", noKK: "3174021911200014" },
      { id: "3174021310210002", nama: "ROKASIH", noKK: "3174021310210002" },
    ],
  },

  {
    id: "rumah-50",
    nomor: 50,
    nama: "Bidang 50",
    tipe: "Kost",
    x: 257,
    y: 634,
    width: 46,
    height: 109,
    unit: [{ id: "unit-50-01", nama: "Kost", fungsi: "Kost" }],
    kk: [],
  },
];


function DenahRT() {
  const [bidang, setBidang] = useState(dataAwal);
  const [bidangDipilih, setBidangDipilih] = useState(null);
  const [modalPilihKK, setModalPilihKK] = useState(false);
  const [modalPindahKK, setModalPindahKK] = useState(false);
  const [kkYangDipindahkan, setKkYangDipindahkan] = useState(null);

  const [daftarKK, setDaftarKK] = useState([]);

useEffect(() => {
  async function loadDaftarKK() {
    try {
      console.log("MEMUAT DAFTAR KEPALA KELUARGA UNTUK DENAH...");

      const { data, error } = await supabase
        .from("warga")
        .select("id, nama, kk, status, status_keluarga")
        .eq("status", "Aktif")
        .eq("status_keluarga", "Kepala Keluarga")
        .not("kk", "is", null)
        .neq("kk", "")
        .order("nama", { ascending: true });

      if (error) {
        console.error(
          "GAGAL MEMUAT DAFTAR KEPALA KELUARGA UNTUK DENAH:",
          error
        );
        return;
      }

      const dataKK = data.map((item) => ({
        id: item.id,
        nama: item.nama || "",
        noKK: item.kk || "",
      }));

      setDaftarKK(dataKK);

      console.log(
        `BERHASIL MEMUAT ${dataKK.length} KEPALA KELUARGA UNTUK DENAH.`
      );
    } catch (error) {
      console.error(
        "ERROR MEMUAT DAFTAR KEPALA KELUARGA UNTUK DENAH:",
        error
      );
    }
  }

  loadDaftarKK();
}, []);

  const pilihBidang = (item) => setBidangDipilih(item);
  const tutupDetail = () => setBidangDipilih(null);

  const tambahKK = () => {
    if (bidangDipilih) setModalPilihKK(true);
  };

  const pilihKK = (warga) => {
    if (!bidangDipilih) return;

    const sudahAdaDiBidang = bidangDipilih.kk.some((kk) => kk.id === warga.id);
    if (sudahAdaDiBidang) {
      window.alert("Kepala Keluarga tersebut sudah ada di rumah ini.");
      return;
    }

    const sudahAdaDiBidangLain = bidang.some(
      (item) =>
        item.id !== bidangDipilih.id &&
        item.kk.some((kk) => kk.id === warga.id)
    );

    if (sudahAdaDiBidangLain) {
      window.alert("Kepala Keluarga tersebut sudah terdaftar pada rumah lain.");
      return;
    }

    const kkBaru = {
  id: warga.id,
  nama: warga.nama,
  noKK: warga.noKK,
};

    const dataBaru = bidang.map((item) =>
      item.id === bidangDipilih.id
        ? { ...item, kk: [...item.kk, kkBaru] }
        : item
    );

    setBidang(dataBaru);
    setBidangDipilih({ ...bidangDipilih, kk: [...bidangDipilih.kk, kkBaru] });
    setModalPilihKK(false);
  };

  const hapusKK = (kkId) => {
    if (!bidangDipilih) return;

    const dataBaru = bidang.map((item) =>
      item.id === bidangDipilih.id
        ? { ...item, kk: item.kk.filter((kk) => kk.id !== kkId) }
        : item
    );

    setBidang(dataBaru);
    setBidangDipilih({
      ...bidangDipilih,
      kk: bidangDipilih.kk.filter((kk) => kk.id !== kkId),
    });
  };

  const bukaPindahKK = (kk) => {
    setKkYangDipindahkan(kk);
    setModalPindahKK(true);
  };

  const pindahkanKK = (bidangTujuanId) => {
    if (!bidangDipilih || !kkYangDipindahkan) return;

    const dataBaru = bidang.map((item) => {
      if (item.id === bidangDipilih.id) {
        return {
          ...item,
          kk: item.kk.filter((kk) => kk.id !== kkYangDipindahkan.id),
        };
      }

      if (item.id === bidangTujuanId) {
        return { ...item, kk: [...item.kk, kkYangDipindahkan] };
      }

      return item;
    });

    setBidang(dataBaru);
    setBidangDipilih({
      ...bidangDipilih,
      kk: bidangDipilih.kk.filter((kk) => kk.id !== kkYangDipindahkan.id),
    });
    setKkYangDipindahkan(null);
    setModalPindahKK(false);
  };

  const tambahUnit = () => {
    if (!bidangDipilih) return;

    const namaUnit = window.prompt("Masukkan nama unit / fungsi:");
    if (!namaUnit || !namaUnit.trim()) return;

    const unitBaru = {
      id: `${bidangDipilih.id}-${Date.now()}`,
      nama: namaUnit.trim(),
      fungsi: "Lainnya",
    };

    const dataBaru = bidang.map((item) =>
      item.id === bidangDipilih.id
        ? { ...item, unit: [...item.unit, unitBaru] }
        : item
    );

    setBidang(dataBaru);
    setBidangDipilih({
      ...bidangDipilih,
      unit: [...bidangDipilih.unit, unitBaru],
    });
  };

  const hapusUnit = (unitId) => {
    if (!bidangDipilih) return;

    const dataBaru = bidang.map((item) =>
      item.id === bidangDipilih.id
        ? { ...item, unit: item.unit.filter((unit) => unit.id !== unitId) }
        : item
    );

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
          <p style={styles.subtitle}>
            Klik nomor rumah pada denah untuk melihat dan mengelola data.
          </p>
        </div>
      </div>

      <div style={styles.mapWrapper}>
        <div style={styles.map}>
          <img
            src="/denah-rt.jpg"
            alt="Denah RT 03 / RW 07"
            style={styles.mapImage}
          />

          {bidang.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Rumah nomor ${item.nomor}`}
              title={`Rumah No. ${item.nomor}`}
              onClick={() => pilihBidang(item)}
              style={{
                ...styles.hotspot,
                left: `${(item.x / 720) * 100}%`,
                top: `${(item.y / 1040) * 100}%`,
                width: `${(item.width / 720) * 100}%`,
                height: `${(item.height / 1040) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {bidangDipilih && (
        <div style={styles.overlay} onClick={tutupDetail}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  {bidangDipilih.nama}
                </h2>
                <div style={styles.modalSubTitle}>
                  {bidangDipilih.tipe} • {bidangDipilih.kk.length} KK
                </div>
              </div>

              <button type="button" onClick={tutupDetail} style={styles.closeButton}>
                ×
              </button>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Unit / Fungsi</h3>
                <button type="button" style={styles.addButton} onClick={tambahUnit}>
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

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  Kepala Keluarga ({bidangDipilih.kk.length})
                </h3>
                <button type="button" style={styles.addButton} onClick={tambahKK}>
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
  <div style={styles.smallText}>
    No. KK: {kk.noKK || kk.id}
  </div>
</div>

                      <div style={styles.actions}>
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

            <div style={styles.info}>
              <strong>Catatan:</strong><br />
              Posisi klik mengikuti area nomor pada gambar denah asli.
              Data saat ini masih berada di state React dan belum tersimpan ke database.
            </div>
          </div>
        </div>
      )}

      {modalPilihKK && bidangDipilih && (
        <div style={styles.overlay} onClick={() => setModalPilihKK(false)}>
          <div style={styles.smallModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Pilih Kepala Keluarga</h2>
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

            <div style={styles.list}>
              {daftarKK
  .filter(
    (warga) =>
      !bidang.some((item) =>
        item.kk.some(
          (kk) =>
            String(kk.noKK || kk.id) === String(warga.noKK)
        )
      )
  )
  .map((warga) => {
                const sudahDiBidangIni = bidangDipilih.kk.some(
  (kk) =>
    String(kk.noKK || kk.id) === String(warga.noKK)
);

                  console.log(
  "CEK KK:",
  warga.nama,
  "ID Supabase:",
  warga.id,
  "KK di bidang:",
  bidangDipilih.kk.map((kk) => ({
    nama: kk.nama,
    id: kk.id,
  }))
);

                const sudahDiBidangLain = bidang.some(
  (item) =>
    item.id !== bidangDipilih.id &&
    item.kk.some(
      (kk) =>
        String(kk.noKK || kk.id) === String(warga.noKK)
    )
);
                const disabled = sudahDiBidangIni || sudahDiBidangLain;

                if (warga.nama === "ABDUL GANI") {
  console.log("=== CEK ABDUL GANI ===");
  console.log("ID Supabase:", warga.id);
  console.log("No KK Supabase:", warga.noKK);
  console.log("Sudah di bidang ini:", sudahDiBidangIni);
  console.log("Sudah di bidang lain:", sudahDiBidangLain);
}

                return (
                  <button
                    key={warga.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => pilihKK(warga)}
                    style={{
                      ...styles.pilihKKItem,
                      opacity: disabled ? 0.45 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <strong>{warga.nama}</strong>
                      <div style={styles.smallText}>ID: {warga.id}</div>
                    </div>
                    <span>
                      {sudahDiBidangIni
                        ? "Sudah di rumah ini"
                        : sudahDiBidangLain
                          ? "Sudah di rumah lain"
                          : "Pilih"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {modalPindahKK && kkYangDipindahkan && bidangDipilih && (
        <div
          style={styles.overlay}
          onClick={() => {
            setModalPindahKK(false);
            setKkYangDipindahkan(null);
          }}
        >
          <div style={styles.smallModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Pindahkan Kepala Keluarga</h2>
                <div style={styles.modalSubTitle}>{kkYangDipindahkan.nama}</div>
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

            <div style={styles.info}>
              <strong>Rumah saat ini:</strong> {bidangDipilih.nama}
            </div>

            <h3 style={{ marginTop: 20 }}>Pilih rumah tujuan:</h3>

            <div style={styles.list}>
              {bidang
                .filter((item) => item.id !== bidangDipilih.id)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={styles.pindahItem}
                    onClick={() => pindahkanKK(item.id)}
                  >
                    <div>
                      <strong>{item.nama}</strong>
                      <div style={styles.smallText}>{item.kk.length} KK</div>
                    </div>
                    <span>Pindahkan →</span>
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
  header: { marginBottom: "16px" },
  title: { margin: 0, fontSize: "26px" },
  subtitle: { margin: "6px 0 0", color: "#666" },
  mapWrapper: {
    width: "100%",
    overflow: "auto",
    border: "1px solid #cfd5dc",
    borderRadius: "12px",
    background: "#dfe4e8",
    padding: "15px",
    boxSizing: "border-box",
  },
  map: {
    position: "relative",
    width: "720px",
    maxWidth: "100%",
    aspectRatio: "720 / 1040",
    margin: "0 auto",
    background: "#fff",
    overflow: "hidden",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  mapImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "fill",
    userSelect: "none",
    pointerEvents: "none",
  },
  hotspot: {
    position: "absolute",
    padding: 0,
    margin: 0,
    border: "2px solid transparent",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "2px",
    transition: "background .15s, border-color .15s",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
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
  smallModal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "85vh",
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
  modalTitle: { margin: 0, fontSize: "24px" },
  modalSubTitle: { marginTop: "5px", color: "#666" },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    lineHeight: 1,
  },
  section: { marginBottom: "24px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  sectionTitle: { margin: 0 },
  addButton: {
    border: "none",
    borderRadius: "7px",
    padding: "8px 12px",
    cursor: "pointer",
    background: "#222",
    color: "#fff",
  },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "11px 12px",
  },
  actions: { display: "flex", gap: "6px" },
  smallText: { marginTop: "3px", fontSize: "12px", color: "#777" },
  removeButton: {
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    color: "#555",
  },
  moveButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  empty: {
    padding: "14px",
    background: "#f7f7f7",
    borderRadius: "8px",
    color: "#777",
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
  pindahItem: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
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
