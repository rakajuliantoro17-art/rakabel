// default.js
export default {
  mode: "custom",        // normal | exam | hybrid | custom
  startTime: "07:00",    // jam mulai sekolah
  jpDuration: 45,        // durasi 1 JP dalam menit
  totalJP: 10,           // jumlah JP per hari
  breaks: [
    { afterJP: 4, duration: 15, name: "Istirahat Pagi" },
    { afterJP: 6, duration: 0, name: "Istirahat Siang" }
  ]
};
