# Root AI Assistant - Backend Setup Guide

Bu rehber, FastAPI backend sistemini Windows ortamında nasıl kuracağınızı ve çalıştıracağınızı gösterir.

## 1. Sanal Ortam Oluşturma (Virtual Environment)

Terminali açın ve `backend` klasörüne gidin:

```powershell
cd backend
python -m venv venv
```

## 2. Sanal Ortamı Aktif Etme

```powershell
.\venv\Scripts\activate
```

## 3. Bağımlılıkları Yükleme

```powershell
pip install -r requirements.txt
```

## 4. .env Yapılandırması

`.env` dosyasını açın ve `OPENAI_API_KEY` kısmına kendi anahtarınızı ekleyin.

## 5. Sunucuyu Başlatma

```powershell
python main.py
```

Sunucu varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

### API Endpoint'leri:
- **Root**: `http://localhost:8000/`
- **Health**: `http://localhost:8000/api/health`
- **Chat**: `http://localhost:8000/api/chat` (POST)
- **WebSocket**: `ws://localhost:8000/ws`

### Logging:
Loglar konsolda renkli olarak görünecek ve aynı zamanda `backend/logs/` klasörüne kaydedilecektir.
