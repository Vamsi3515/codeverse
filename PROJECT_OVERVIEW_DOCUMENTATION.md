# 📘 CodeVerse Campus - Complete Project Documentation

**Project Name:** CodeVerse Campus  
**Type:** Multi-College Hackathon Management System  
**Version:** 1.0.0  
**Date:** January 25, 2026

---

## 🚀 1. Executive Summary

CodeVerse Campus is a comprehensive platform designed to streamline the organization and participation of inter-college hackathons. It bridges the gap between student innovators and event organizers by providing tools for:
- **Organizers:** To create, manage, and monitor hackathons (both Online and Offline).
- **Students:** To discover events, verify their identity, form teams, and participate.
- **Coordinators:** To assist in managing campus-specific events.

The system emphasizes **security** (verified student identities), **usability** (geolocation, QR codes), and **flexibility** (online/offline modes).

---

## 🔄 2. Complete System Flow (User Journey)

### Phase 1: Onboarding & Identity Verification
The platform enforces strict identity verification to ensure authentic participation.

1.  **Sign Up:** Users register as a **Student** or **Organizer**.
2.  **Email Verification:** The system sends a Time-Based OTP (One-Time Password) to the registered email. Users must verify this to proceed.
3.  **Student Identity Verification (Critical Step):**
    *   Students must upload a valid **College ID Card**.
    *   Students must capture a **Live Selfie**.
    *   The system (or admin process) verifies that the user is a legitimate student.
    *   *Note: Only verified students can register for hackathons.*

### Phase 2: Hackathon Creation (Organizer)
Organizers have a dashboard to manage the event lifecycle.

1.  **Create Event:** Organizers define:
    *   Basic Info (Title, Description, Dates).
    *   **Mode:** **Online** (Remote) or **Offline** (Physical Venue).
    *   **Problem Statements:** Define the challenges participants will solve.
2.  **Offline Specifics:**
    *   **Location Management:** Organizers set the venue location.
    *   **QR Code Generation:** The system generates a unique QR Code for the event, used for checking in participants at the venue.
3.  **Publishing:** The hackathon is published and becomes visible to students.
4.  **Management:** Organizers can update or **delete** hackathons if plans change (includes sophisticated checks to prevent deleting active events with participants).

### Phase 3: Discovery & Registration (Student)
1.  **Browse Events:** Students view a list of active hackathons.
2.  **View Details:** Access problem statements, schedules, and venue maps.
3.  **Team Formation:** Students can form teams (Leader + Members) to participate.
4.  **Registration:** The team registers for the specific hackathon.

### Phase 4: Event Day Application
The system behaves differently based on the event mode.

#### 🌍 Offline Mode (Physical Event)
1.  **Standard Navigation:** Students use the **"Get Directions"** feature.
    *   The app accesses the student's real-time **Geolocation**.
    *   It generates a **Google Maps** navigation link from their current spot to the venue.
2.  **Attendance (Check-In):**
    *   Organizers display the Event QR Code.
    *   Students scan the code within the app to mark their attendance.
    *   System validates the scan and records presence.

#### 💻 Online Mode (Remote)
1.  **Submission:** Teams work on their projects and submit them through the portal (e.g., GitHub links, documentation).

### Phase 5: Post-Event
1.  **Evaluation:** Judges/Organizers review submissions.
2.  **Results:** Winners are announced.
3.  **Certificates:** Digital certificates may be issued to participants and winners.

---

## 🏗️ 3. Technical Architecture

### Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS (UI Styling), Lucide React (Icons).
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB (with Mongoose ODM).
*   **Authentication:** JWT (JSON Web Tokens) for session management.

### Key Functional Modules

#### A. Authentication & Security
*   **Dual-Role System:** Distinct flows for `Student` vs `Organizer`.
*   **Student Coordinators:** Special role allowing students to have organizer-like privileges for specific tasks.
*   **Secure OTP:** Email-based verification using `nodemailer`.

#### B. Offline & Location Services
*   **Module:** `geolib` and Geolocation API.
*   **Function:** accurate distance calculation and Google Maps deep-linking.
*   **QR System:** `qrcode` library for generating scan-able codes for attendance.

#### C. Hackathon Management Engine
*   **CRUD Operations:** Create, Read, Update, Delete hackathons.
*   **Validation:** Logic to prevent invalid states (e.g., publishing verified events without problem statements).

#### D. File Handling
*   **Uploads:** `multer` handles ID card and image uploads.
*   **Storage:** Local `uploads/` directory (or configured cloud storage).

---

## 📂 4. Project Structure Overview

```text
HACKATHON_MANAGEMENT/
├── backend/                  # Server-side Logic
│   ├── src/
│   │   ├── config/          # DB & App Configuration
│   │   ├── controllers/     # Business Logic (Auth, Hackathon, QR)
│   │   ├── models/          # Database Schemas (User, Team, Hackathon)
│   │   ├── routes/          # API Endpoints
│   │   ├── services/        # Helper services (Email, etc.)
│   │   └── index.js         # Entry Point
│   └── package.json
│
└── frontend/                 # Client-side Application
    ├── codeverse-campus/
    │   ├── src/
    │       ├── components/  # Reusable UI (Forms, Modals, Navbar)
    │       ├── pages/       # Full Pages (Dashboard, Login, EventDetails)
    │       ├── context/     # State Management (AuthContext)
    │       └── App.jsx      # Main Router
    └── vite.config.js
```

---

## 🛠️ 5. Setup & Installation

To run this project locally:

1.  **Prerequisites:** Install Node.js and MongoDB.
2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Configure .env file with MONGODB_URI, JWT_SECRET, EMAIL_CREDENTIALS
    npm start
    ```
3.  **Frontend Setup:**
    ```bash
    cd frontend/codeverse-campus
    npm install
    npm run dev
    ```
4.  **Access:**
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:5000`

---

## 📝 6. Recent Major Features (Change Log)

*   **Problem Statement Management:** Organizers can now explicitly add/edit/delete problem statements for hackathons.
*   **Delete Hackathon Fix:** Comprehensive logic to safely delete hackathons, cleaning up associated teams and data.
*   **Offline Mode Complete:** Full implementation of QR Code generation and scanning.
*   **Geolocation:** Google Maps integration for venue navigation.
