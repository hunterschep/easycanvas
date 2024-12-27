# easyCanvas 🎨

A streamlined interface for Canvas LMS that simplifies managing your courses and assignments.

## 🚧 Current Issues & Needed Features

### High Priority
- [ ] Encrypt the Canvas API in the user's Firebase Collection 
- [ ] Validate the Canvas API key's authenticity before login
- [ ] Add backend functionality to utilize the api 
- [ ] Add error handling for invalid Canvas tokens
- [ ] Implement proper error handling for Firebase operations
- [ ] Add loading states for async operations

### Future Features
- [ ] Dark/Light theme toggle
- [ ] Calendar view for assignments
- [ ] Grade analytics dashboard
- [ ] Mobile responsive design improvements
- [ ] Multiple Canvas instance support
- [ ] Export assignments to calendar
- [ ] Email notifications for upcoming deadlines

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** 3.8+ (for backend)
- **Firebase** account
- **Canvas LMS API** access

### Environment Setup

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/easycanvas.git
    cd easycanvas
    ```

2. **Frontend setup:**
    ```bash
    cd frontend
    npm install
    ```

3. **Create a `.env` file in the frontend directory:**
    ```env
    VITE_ENCRYPTION_KEY=your-secure-key-here
    ```

4. **Backend setup (optional):**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

### Firebase Configuration

1. **Create a new Firebase project.**
2. **Enable Authentication with Google sign-in.**
3. **Enable Firestore Database.**
4. **Add your Firebase config to `frontend/src/firebase/config.ts`.**
5. **Update Firestore rules for security.**

### Running the Application

1. **Start the frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

2. **Start the backend (if using):**
    ```bash
    cd backend
    uvicorn main:app --reload
    ```

3. **Visit** [`http://localhost:5173`](http://localhost:5173) **to view the application.**

## 🏗️ Project Structure

```
easycanvas/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── login.tsx
│   │   │   ├── setup.tsx
│   │   │   └── home.tsx
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   └── firestore.ts
│   │   └── App.tsx
│   ├── .env
│   └── package.json
├── backend/
│   ├── main.py
│   └── requirements.txt
├── firebase/
│   ├── firestore.rules
│   └── firebase.json
└── README.md
```

## 🔒 Security

- **User authentication** handled by Firebase
- **Canvas API tokens** encrypted using CryptoJS before storage
- **Firestore rules** restrict data access to authenticated users
- **Environment variables** for sensitive data
- **Backend proxy** for Canvas API calls (planned)

## 🛠️ Built With

- **React 18 + TypeScript**
- **Tailwind CSS** for styling
- **Firebase Authentication**
- **Firestore Database**
- **FastAPI** (Backend - planned)
- **Vite** (Build tool)
- **CryptoJS** for encryption

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. **Fork the repository.**
2. **Create your feature branch:**
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3. **Commit your changes:**
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4. **Push to the branch:**
    ```bash
    git push origin feature/AmazingFeature
    ```
5. **Open a Pull Request.**

## 🔧 Development Status

### Completed
- ✅ Google Authentication
- ✅ User setup flow
- ✅ Secure token storage
- ✅ Basic routing structure

### In Progress
- 🔄 Canvas API integration
- 🔄 Assignment dashboard
- 🔄 Course overview

## ✨ Acknowledgments

- Built by [Hunter Scheppat](https://linkedin.com/in/hunterscheppat/)
- Powered by **Canvas LMS API**
- Built with **React** and **Firebase**
