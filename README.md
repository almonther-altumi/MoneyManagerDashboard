# 💰 Money Manager Dashboard

A premium, high-performance financial management dashboard built with **React**, **Vite**, and **Firebase**. This application provides a comprehensive suite of tools for tracking income, managing expenses, monitoring debts, and generating professional-grade fiscal reports.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Money+Manager+Dashboard+Preview)

## 🚀 Key Features

### 📊 Advanced Financial Analytics
- **Dynamic Dashboard**: Real-time overview of gross liquidity, total expenditure, and net retained capital.
- **Interactive Charts**: Visual representation of monthly trajectories using Chart.js.
- **Efficiency Metrics**: Built-in calculation of Capital Preservation Rates.

### 📄 Professional PDF Reporting
- **Multi-page Export**: Automatic slicing logic that handles long transaction ledgers across multiple A4 pages.
- **Modern Typography**: High-end font stacks for both English and Arabic (Latin numerals preferred for modern aesthetics).
- **Arabic Connectivity**: Specialized rendering logic ensuring perfect Arabic script connectivity in PDF exports.
- **Print-Ready Layouts**: Centered, high-contrast, professional fiscal statements designed for official records.

### 🌐 Full Internationalization (i18n)
- **Dual Language**: Seamless switching between English and Arabic.
- **RTL & LTR Support**: Fully responsive layout adjustments for Right-to-Left (Arabic) and Left-to-Right (English) directions.

### 🔒 Enterprise-Grade Security
- **Environment Variables**: Sensitive Firebase credentials are secured using `.env` files and `import.meta.env`.
- **Firebase Auth & Firestore**: Real-time data synchronization and secure Google Authentication.

### 🌗 Premium UI/UX
- **Theme Support**: Full Dark and Light mode compatibility with smooth transitions.
- **Mobile Responsive**: Fully adaptive design that works perfectly on smartphones, tablets, and desktops.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Provider)
- **Reporting**: jsPDF, html2canvas
- **Data Visualization**: Chart.js, React-Chartjs-2
- **Localization**: i18next
- **Styling**: Vanilla CSS (Custom modern design system)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/MoneyManagerDashboard.git
   cd MoneyManagerDashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables***
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── components/       # Modular UI components
├── contexts/         # Global state management (Financial Context)
├── locales/          # English and Arabic translation files
├── pages/            # View components (Dashboard, Income, Reports, etc.)
├── firebase.js       # Firebase initialization and security config
└── i18n.js           # Internationalization setup
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Developed with focus on financial precision and premium user experience.*
