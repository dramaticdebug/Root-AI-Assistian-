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
├── src/                    # React Frontend
│   ├── components/         # Yeniden kullanılabilir UI bileşenleri
│   ├── pages/              # Sayfa yapıları
│   ├── hooks/              # Özel React hook'ları
│   ├── services/           # API çağrıları
│   ├── voice/              # Ses kayıt ve işleme mantığı
│   ├── automation/         # Masaüstü otomasyonları (isteğe bağlı)
│   ├── memory/             # Uygulama içi hafıza (Zustand store)
│   └── agents/             # Farklı AI ajan modelleri
│
├── backend/                # Python FastAPI Backend
│   ├── main.py             # Ana API sunucusu
│   └── requirements.txt    # Python bağımlılıkları
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
