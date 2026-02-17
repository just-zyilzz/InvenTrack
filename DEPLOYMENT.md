# Panduan Deployment InvenTrack ke VPS

Panduan ini akan membantu Anda men-deploy aplikasi InvenTrack ke VPS (Virtual Private Server) menggunakan database PostgreSQL di server yang sama (self-hosted).

## Prasyarat
1.  **VPS**: Server Linux (Ubuntu 20.04/22.04 LTS direkomendasikan) dengan akses root/sudo.
2.  **Domain**: Domain yang sudah diarahkan (A Record) ke IP Address VPS Anda.
3.  **SSH Client**: Terminal (Mac/Linux) atau PuTTY/PowerShell (Windows) untuk akses server.

---

## 1. Persiapan Server

Login ke VPS Anda via SSH:
```bash
ssh root@ip_vps_anda
```

Update package list dan upgrade sistem:
```bash
sudo apt update && sudo apt upgrade -y
```

Install tools dasar (Git, Curl, Unzip):
```bash
sudo apt install git curl unzip -y
```

### Install Node.js (Versi LTS)
Kita akan menggunakan NodeSource untuk menginstall Node.js versi terbaru (ex: v20).
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Cek versi:
```bash
node -v
npm -v
```

### Install Process Manager (PM2)
PM2 digunakan agar aplikasi tetap berjalan di background (uptime managed).
```bash
sudo npm install -g pm2
```

---

## 2. Setup Database (PostgreSQL)

Install PostgreSQL:
```bash
sudo apt install postgresql postgresql-contrib -y
```

Start service:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Masuk ke shell Postgres:
```bash
sudo -u postgres psql
```

Buat Database dan User baru:
Ganti `password_db_anda` dengan password yang kuat!
```sql
CREATE USER inventrack WITH PASSWORD 'password_db_anda';
CREATE DATABASE inventrack_db OWNER inventrack;
ALTER USER inventrack WITH SUPERUSER;
\q
```
*(Perintah `\q` untuk keluar dari shell psql)*

Connection String Anda sekarang adalah:
`postgresql://inventrack:password_db_anda@localhost:5432/inventrack_db`

---

## 3. Deployment Aplikasi

### Clone Repository
Pindah ke folder deployment (biasanya `/var/www` atau home directory). Kita gunakan home directory user saat ini.
```bash
cd ~
git clone https://github.com/just-zyilzz/InvenTrack.git
cd InvenTrack
```

### Install Dependencies
```bash
npm install
```

### Konfigurasi Environment Variables (.env)
Copy file contoh `.env`:
```bash
cp .env.example .env
```
Edit file `.env` menggunakan nano:
```bash
nano .env
```
Isi konfigurasi berikut (sesuaikan value-nya):
```env
# Database URL dari langkah 2
DATABASE_URL="postgresql://inventrack:password_db_anda@localhost:5432/inventrack_db"

# Generate string acak untuk secret (bisa pakai: openssl rand -base64 32)
AUTH_SECRET="rahasia_super_secure_auth_secret"

# URL Domain Anda (PENTING untuk NextAuth)
NEXTAUTH_URL="https://subdomain.domainanda.com"

# API Key Kurir (jika pakai)
KLIKRESI_API_KEY="api_key_anda"
```
Simpan: `Ctrl+O`, `Enter`, `Ctrl+X`.

### Setup Database Schema
Push schema Prisma ke database PostgreSQL lokal:
```bash
npx prisma db push
```
*(Opsional) Seed database jika perlu data awal:*
```bash
npx prisma db seed
```

### Build Aplikasi
```bash
npm run build
```

### Jalankan dengan PM2
Jalankan aplikasi di port 3000:
```bash
pm2 start npm --name "inventrack" -- start
pm2 save
pm2 startup
```
*(Jalankan command yang muncul setelah `pm2 startup` untuk memastikan auto-start saat reboot)*

---

## 4. Setup Domain & SSL (Nginx)

Install Nginx:
```bash
sudo apt install nginx -y
```

Buat konfigurasi server block:
```bash
sudo nano /etc/nginx/sites-available/inventrack
```
Isi konfigurasi berikut (ganti `domainanda.com` dengan domain asli):
```nginx
server {
    listen 80;
    server_name subdomain.domainanda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/inventrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL (HTTPS Gratis dengan Certbot)
Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```
Request sertifikat SSL:
```bash
sudo certbot --nginx -d subdomain.domainanda.com
```
Ikuti instruksi di layar (masukkan email, pilih agree, dan pilih Redirect HTTP to HTTPS).

---

## Selesai! 🎉
Aplikasi Anda sekarang harusnya sudah bisa diakses secara aman di `https://subdomain.domainanda.com`.

## Cara Update Aplikasi (Re-deploy)
Jika Anda melakukan push update code ke GitHub, lakukan langkah ini di VPS:
```bash
cd ~/InvenTrack
git pull origin main
npm install             # Jika ada update package
npx prisma db push      # Jika ada perubahan schema DB
npm run build           # Re-build aplikasi
pm2 reload inventrack   # Restart proses
```
