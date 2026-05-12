# Root-AI-Assistian-

ROOT (KÖK)


# AI Masaüstü Asistanı Kurulum Rehberi

Bu proje, Tauri, React, TypeScript, TailwindCSS v4 ve Python (FastAPI) kullanılarak modern bir yapay zeka masaüstü asistanı olarak yapılandırılmıştır.

## 1. Sistem Gereksinimleri

Geliştirme ortamınızda yapılan kontrollerde aşağıdaki araçların kurulu olduğu tespit edilmiştir:
- **Node.js** (v24.13.0)
- **npm** (v11.6.2)
- **Python** (v3.14.2)
- **Git** (v2.54.0)

⚠️ **Aşağıdaki araçlar eksiktir ve kurulması gerekmektedir:**

### Rust ve Cargo Kurulumu
Tauri, arka planda (masaüstü uygulamasını derlemek için) Rust dilini kullanır.
- Terminalinizi yönetici olarak açın (PowerShell) ve şu komutu çalıştırın:
  ```powershell
  winget install --id Rustlang.Rustup
  ```
  Veya [Rust Resmi Sitesi](https://rustup.rs/)'ne gidip `rustup-init.exe` dosyasını indirerek kurabilirsiniz. (Kurulum sırasında varsayılan seçenekleri kabul edin).

### FFmpeg Kurulumu
Whisper ile ses işleme yapabilmek için sisteminizde FFmpeg kurulu olmalıdır.
- Terminalinizi yönetici olarak açıp şu komutu çalıştırın (Eğer Chocolatey veya Winget kullanıyorsanız):
  ```powershell
  winget install ffmpeg
  ```
- Ya da [FFmpeg Sitesinden](https://ffmpeg.org/download.html) indirip sistem PATH değişkeninize eklemeniz gerekmektedir.

> **Not:** Rust, Cargo ve FFmpeg kurulumundan sonra bilgisayarınızı veya terminalinizi **mutlaka yeniden başlatın**.

---

## 2. Proje Yapısı

Oluşturulan klasör yapısı şu şekildedir:
```text
assistant-app/
│
├── src/                    # React Frontend
│   ├── components/         # Yeniden kullanılabilir UI bileşenleri
│   ├── pages/              # Sayfa yapıları
│   ├── hooks/              # Özel React hook'ları
│   ├── services/           # API çağrıları
│   ├── voice/              # Ses kayıt ve işleme mantığı
│   ├── automation/         # Masaüstü otomasyonları (isteğe bağlı)
│   ├── memory/             # Uygulama içi hafıza (Zustand store)
│   └── agents/             # Farklı AI ajan modelleri
│
├── backend/                # Python FastAPI Backend
│   ├── main.py             # Ana API sunucusu
│   └── requirements.txt    # Python bağımlılıkları
```

---

## 3. Kurulum ve Çalıştırma

### Frontend Kurulumu
Proje dosyaları oluşturulmuş ve gerekli npm paketleri yüklenmiştir (`tailwindcss`, `framer-motion`, `lucide-react`, `axios`, `zustand`).

```powershell
cd assistant-app
npm install
```

### Python Backend Kurulumu
Python tabanlı FastAPI ve Whisper/OpenAI yapısı için bir sanal ortam oluşturup paketleri kuralım.

```powershell
cd assistant-app/backend

# Sanal ortam (virtual environment) oluştur
python -m venv venv

# Sanal ortamı aktif et (Windows için)
.\venv\Scripts\activate

# Gerekli kütüphaneleri yükle
pip install -r requirements.txt

# API'yi başlat (8000 portunda çalışacaktır)
uvicorn main:app --reload
```

### Tauri (Uygulama) Çalıştırma
Backend çalışırken, yeni bir terminal sekmesi açın ve asistanın arayüzünü (Tauri) başlatın. Rust kurulumunuzun tamamlandığından emin olun.

```powershell
cd assistant-app
npm run tauri dev
```

Tauri ilk derlemesinde Rust bağımlılıklarını indireceği için biraz zaman alabilir.

---

## 4. İletişim Yapısı
- **React Frontend (Tauri)** arayüzden mesajınızı alır.
- **`axios` / `fetch`** ile `http://localhost:8000/api/chat` adresine POST isteği gönderir.
- **Python (FastAPI)** mesajı alır, Whisper/OpenAI işlemleri uygulanabilir ve frontend'e geri döner.
- Modern **Tailwind CSS v4** ve **Lucide React** ikonları ile dark tema hazır olarak kullanıma sunulmuştur.



Premium AI Desktop Assistant UI Implementation Plan
Bu plan, Tauri tabanlı AI asistan uygulamanız için yüksek kaliteli, "Jarvis" hissiyatı veren modern ve glassmorphism odaklı UI iskeletini oluşturma adımlarını içermektedir.
Open Questions
NOTE
AI Orb (merkezdeki animasyonlu küre) şu an için sadece UI (arayüz) seviyesinde simüle edilecek (idle, listening, thinking, speaking durumlarını test edebileceğiniz butonlarla beraber). Arka plan bağlantısı (Python) daha sonra entegre edilecek. Bu yaklaşım sizin için uygun mu?
Proposed Changes
1. Stil ve Tasarım Sistemi (CSS & Utils)
clsx ve tailwind-merge kütüphanelerinin kurulumu (yapıldı).
src/lib/utils.ts (veya ui/utils) dosyasının oluşturulması.
src/App.css güncellenerek CSS değişkenlerinin (neon renkler, glassmorphism arka planları, koyu tema) eklenmesi.
Ana arkaplanın (mesh gradient veya dark space) ayarlanması.
2. State Management (Zustand)
[NEW] src/store/useAppStore.ts
AI Durumları: idle, listening, thinking, speaking.
UI State: Mesaj geçmişi, aktif panel, sistem metrikleri (mock).
Asistanın hissiyatını verecek sahte (mock) etkileşim aksiyonları.
3. Layout Bileşenleri
[NEW] src/components/layout/MainLayout.tsx
Uygulamanın 3 ana sütuna (Sidebar, Center, Right Panel) bölünmesi.
Ekranı tamamen kaplayan grid/flex yapısı.
Glassmorphism yüzey kaplamaları.
[NEW] src/components/sidebar/Sidebar.tsx
Menü öğeleri: Dashboard, Chat, Voice, Tasks vb.
Lucide-react ikonları.
Hover animasyonları ve aktif/neon glow efektleri.
[NEW] src/components/system/SystemPanel.tsx
Sağ panelde RAM, CPU, Ağ durumunu gösteren mock widgetlar.
AI'ın aktif/pasif durum göstergesi.
4. Core AI Area (Orta Alan)
[NEW] src/components/orb/AIOrb.tsx
Framer Motion kullanılarak tasarlanmış interaktif küre.
Zustand state'ine göre şekil ve renk değiştiren yapı (Pulse, Spin, Wave).
[NEW] src/components/chat/ChatArea.tsx
Mesaj balonları, timestamp.
Framer Motion ile slide-up animasyonları.
Yazıyor (Typing) indikatörü.
[NEW] src/components/chat/BottomInput.tsx
Alt bilgi giriş çubuğu, mikrofon butonu.
Focus efekti (Glow).
5. Entegrasyon
[MODIFY] src/App.tsx
Yeni MainLayout ve bileşenlerinin App içerisine yerleştirilmesi.
Eski demo kodunun temizlenmesi.
Verification Plan
Manual Verification
Vite sunucusunda (veya tauri dev üzerinden) çalıştırılıp arayüzün görsel kalitesinin test edilmesi.
Ekran boyutlandırmalarında 3-panelli yapının ve bottom bar'ın stabilitesinin kontrolü.
Orb animasyonlarının akıcılığının ve "gerçekçi bir AI" hissiyatı verip vermediğinin doğrulanması.
