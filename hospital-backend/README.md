# 🏥 MediCore Hospital Management System
## MongoDB Atlas Setup Guide

---

## 📁 Project Structure

```
medicore/
├── hospital/               ← Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── css/main.css
│   ├── js/api.js           ← API client (connects to backend)
│   └── pages/
│       ├── appointment.html
│       ├── admin-login.html
│       ├── admin-dashboard.html
│       ├── staff-login.html
│       ├── staff-dashboard.html
│       ├── patient-login.html
│       ├── patient-portal.html
│       ├── doctors.html
│       ├── services.html
│       └── contact.html
│
└── hospital-backend/       ← Backend (Node.js + Express + MongoDB)
    ├── server.js           ← Main entry point
    ├── seed.js             ← Database seeder
    ├── package.json
    ├── .env.example        ← Copy to .env and fill in
    ├── config/
    │   └── db.js           ← MongoDB Atlas connection
    ├── models/
    │   └── index.js        ← All Mongoose schemas
    ├── middleware/
    │   └── auth.js         ← JWT authentication
    └── routes/
        ├── auth.js         ← Login/register endpoints
        ├── appointments.js ← Booking & management
        └── doctors.js      ← Doctor & contact routes
```

---

## 🚀 Step 1 — Set Up MongoDB Atlas

1. Go to **https://cloud.mongodb.com** and sign up / log in
2. Click **"Build a Database"** → Choose **Free (M0)** tier
3. Select your region (e.g., AWS Mumbai for India)
4. Click **"Create"**
5. Set up a **Database User**:
   - Username: e.g., `medicore_user`
   - Password: strong password (save it!)
6. Set **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
7. Click **"Connect"** → **"Connect your application"** → Copy the connection string

It looks like:
```
mongodb+srv://medicore_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## ⚙️ Step 2 — Configure the Backend

```bash
# 1. Go into the backend folder
cd hospital-backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://medicore_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medicore?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_random_string_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
STAFF_USERNAME=staff
STAFF_PASSWORD=staff123
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 🌱 Step 3 — Seed the Database

```bash
node seed.js
```

This will create:
- ✅ Admin account (`admin` / `admin123`)
- ✅ Staff account (`staff` / `staff123`)
- ✅ 7 doctors with schedules

---

## ▶️ Step 4 — Start the Backend

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected: cluster0.xxxxx.mongodb.net
🚀 MediCore API running on http://localhost:5000
```

Test it: http://localhost:5000/api/health

---

## 🌐 Step 5 — Connect the Frontend

1. Open `hospital/js/api.js`
2. Set the API_BASE to your backend URL:
   ```js
   const API_BASE = 'http://localhost:5000/api';
   ```
3. Add this script tag to every HTML page (before closing `</body>`):
   ```html
   <script src="../js/api.js"></script>
   ```

---

## 📡 API Endpoints Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/admin/login` | Public | Admin login |
| POST | `/api/auth/staff/login` | Public | Staff login |
| POST | `/api/auth/patient/register` | Public | Patient signup |
| POST | `/api/auth/patient/login` | Public | Patient login |
| GET | `/api/auth/me` | Auth | Get current user |

### Appointments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/appointments` | Public | Book appointment |
| GET | `/api/appointments` | Staff/Admin | Get all appointments |
| GET | `/api/appointments/my` | Patient | Get own appointments |
| GET | `/api/appointments/stats` | Staff/Admin | Dashboard stats |
| PATCH | `/api/appointments/:id/status` | Staff/Admin | Update status |
| DELETE | `/api/appointments/:id` | Admin | Delete record |

### Doctors
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/doctors` | Public | List all doctors |
| GET | `/api/doctors?specialty=Cardiology` | Public | Filter by specialty |
| POST | `/api/doctors` | Admin | Add doctor |
| PATCH | `/api/doctors/:id` | Admin | Update doctor |
| DELETE | `/api/doctors/:id` | Admin | Remove doctor |

### Contact
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/contact` | Public | Submit message |
| GET | `/api/contact` | Admin | View all messages |

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Staff | `staff` | `staff123` |
| Patient | Register via patient-login.html | — |

---

## 🔄 How Data Flows

```
Patient books appointment
       ↓
POST /api/appointments → MongoDB Atlas
       ↓
Staff sees in staff-dashboard (GET /api/appointments)
       ↓
Staff checks in patient (PATCH status → Confirmed)
       ↓
Admin sees all data + stats in admin-dashboard
       ↓
Admin can approve / reject / delete
```

---

## 🌍 Deploy to Production

### Backend — Deploy to Railway / Render / Heroku

**Railway (recommended):**
1. Push `hospital-backend/` to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add environment variables (MONGODB_URI, JWT_SECRET, etc.)
4. Railway gives you a URL like `https://medicore-api.railway.app`

### Frontend — Host on Netlify / Vercel / GitHub Pages
1. Update `hospital/js/api.js` → `const API_BASE = 'https://medicore-api.railway.app/api'`
2. Drag and drop the `hospital/` folder to netlify.com

---

## ✅ Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access set to `0.0.0.0/0`
- [ ] `.env` file configured with your connection string
- [ ] `npm install` done
- [ ] `node seed.js` run successfully
- [ ] `npm start` running — can visit `/api/health`
- [ ] Frontend `api.js` pointing to correct backend URL
