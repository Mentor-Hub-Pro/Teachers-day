# 🎓 The Golden Memory Book

**Happy Teachers' Day — Dipankar Saha Sir**
আগরপাড়া · উত্তর ২৪ পরগনা · Teachers' Day 2026

আমরা ৯ জন ছাত্রছাত্রীর তরফ থেকে স্যারের জন্য একটা ছোট্ট উপহার।

🔗 **Live:** https://mentor-hub-pro.github.io/Teachers-day/

---

## ✨ কী কী আছে

| Section | কী |
|---|---|
| Preloader | চক দিয়ে লেখা ফুটে উঠে সিনেমার পর্দার মতো খোলে |
| Hero | স্যারের ছবি ঘূর্ণায়মান গোল্ডেন রিং-এ, 3D tilt, typewriter |
| Dedication | আমাদের মনের কথা + ছবির স্ট্যাক |
| Journey | zig-zag গোল্ডেন timeline, স্ক্রলে লাইন আঁকা হয় |
| Students | ৯ জনের flip card — হোভার/ট্যাপে ঘুরে যায় |
| Gallery | ২৩টা ছবির masonry + lightbox (কি-বোর্ড ← → , swipe) |
| Slideshow | Ken Burns zoom সহ auto slider |
| Memory Board | polaroid ছবি washi-tape দিয়ে আটকানো |
| Letters | ৯টা খাম — ক্লিকে চিঠি খোলে |
| Wish Wall | নিজের শুভেচ্ছা লেখা যায় (localStorage) |
| গুরুবন্দনা | শ্লোক + 🪔 প্রদীপ জ্বালানো |
| Finale | 🎉 confetti + WhatsApp share |

## 🛠️ Tech

Pure **HTML + CSS + Vanilla JS**. কোনো build, npm বা backend নেই।
Background music Web Audio API দিয়ে তৈরি — কোনো অডিও ফাইল লাগে না।

## ✏️ কীভাবে বদলাবে

সব কনটেন্ট একটাই ফাইলে — **`assets/js/data.js`**

- **ছবি বদলাতে** → `TD_PHOTOS` তালিকায় url পাল্টাও
- **কোন ছবি কোথায়** → `TD_MAP`-এ নম্বর পাল্টাও (`teacher`, `students`, `timeline`…)
- **নাম / চিঠি / quote** → `TD_STUDENTS`
- **Timeline লেখা** → `TD_JOURNEY`

> ছবি repo-তে রাখতে চাইলে `assets/photos/` ফোল্ডারে রেখে url টা
> `"assets/photos/01.jpg"` করে দিলেই হবে।

## 🚀 Deploy (GitHub Pages)

Settings → Pages → Source: `main` / `root` → Save. ২ মিনিটে লাইভ।

---

`proposal/` আর `demo/` ফোল্ডারে ডিজাইন কনসেপ্ট আর প্ল্যান রাখা আছে (রেফারেন্সের জন্য)।
