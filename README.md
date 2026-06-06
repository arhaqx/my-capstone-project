# 🌿 HealSpace

**HealSpace** is a comprehensive, AI-powered mental health platform designed to provide accessible self-assessment tools, virtual counseling, and interactive relaxation exercises. Built as a Capstone Project, it leverages modern web technologies to deliver a secure and empathetic user experience.

---

## ✨ Features

*   **🤖 AI Virtual Counseling:** 24/7 non-judgmental virtual companion powered by Google Gemini API.
*   **📊 Mental Health Assessment:** Quick and accurate self-assessment tools to track your psychological well-being.
*   **🧘 Relaxation Exercises:** Interactive breathing modules to help relieve stress, panic, and anxiety instantly.
*   **📈 History Tracking:** Visualized charts and history logs to monitor your mental health progress over time.
*   **👑 Admin Dashboard:** A powerful management control panel with statistical overviews, user management, and high-risk user detection.
*   **🆘 Emergency Support:** Quick-access SOS button connecting users to national emergency hotlines and psychological support services.

## 🛠️ Technology Stack

**Frontend:**
*   React.js
*   React Router DOM
*   Recharts (for data visualization)
*   Vanilla CSS (Modern Glassmorphism Design)

**Backend:**
*   Python 3 & Django
*   Django REST Framework (DRF)
*   SimpleJWT (Authentication)
*   Google Generative AI (Gemini)

**Infrastructure & Deployment:**
*   **Cloud Provider:** Microsoft Azure (Virtual Machine)
*   **Web Server:** Nginx (Reverse Proxy & Static File Serving)
*   **App Server:** Gunicorn & Systemd

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

# Setup Database & Admin
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Create a .env file and add your Gemini API Key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run the server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Run the development server
npm start
```

---

## 🌐 Production Deployment (Azure VM)

This project is configured to run on an Ubuntu Server environment using Nginx and Gunicorn.

1.  **Clone the repository** to your Azure VM.
2.  **Build the Frontend:**
    ```bash
    cd frontend
    export REACT_APP_API_URL=/api
    export GENERATE_SOURCEMAP=false
    npm run build
    ```
3.  **Setup the Backend Service:** Configure Gunicorn to run as a Systemd service pointing to the Django WSGI application.
4.  **Configure Nginx:** Set up Nginx to serve the static files from `frontend/build` and reverse proxy `/api` requests to Gunicorn.
5.  **Restart Services:**
    ```bash
    sudo systemctl restart gunicorn
    sudo systemctl restart nginx
    ```

---

*Developed with ❤️ as a Fullstack Bootcamp Capstone Project.*
