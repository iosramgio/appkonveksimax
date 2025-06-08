# Konveksi Management System

Sistem manajemen untuk usaha konveksi dengan fitur pemesanan online, pembayaran menggunakan Midtrans, dan manajemen pesanan.

## Fitur

- Manajemen produk konveksi
- Sistem pemesanan online
- Integrasi pembayaran dengan Midtrans
- Dashboard admin
- Manajemen pesanan
- Notifikasi WhatsApp
- Dan lain-lain

## Teknologi

- Frontend: React.js dengan Vite
- Backend: Node.js dengan Express
- Database: MongoDB
- Payment Gateway: Midtrans
- Notifikasi: WhatsApp API (Fonnte)

## Instalasi

### Prerequisites

- Node.js (v14 atau lebih baru)
- MongoDB
- NPM atau Yarn

### Langkah Instalasi

1. Clone repository
```bash
git clone [URL_REPOSITORY]
```

2. Install dependencies untuk backend
```bash
cd backend
npm install
```

3. Install dependencies untuk frontend
```bash
cd frontend
npm install
```

4. Setup environment variables
- Copy `.env.example` ke `.env` di folder backend
- Isi kredensial yang diperlukan (MongoDB, Midtrans, dll)

5. Jalankan aplikasi

Development mode:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Production mode:
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Environment Variables

### Backend
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# Midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_PRODUCTION=false

# WhatsApp (Fonnte)
FONNTE_API_KEY=your_fonnte_api_key
FONNTE_API_URL=https://api.fonnte.com/send
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

## Kontribusi

Silakan buat pull request untuk kontribusi.

## Lisensi

[MIT License](LICENSE) 