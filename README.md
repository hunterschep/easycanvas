# EasyCanvas 📚

A modern, intuitive interface for Canvas LMS that simplifies course management, assignment tracking, and provides enhanced analytics - all with a beautiful UI and optimized performance.

![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6)
![Firebase](https://img.shields.io/badge/Firebase-11.1.0-FFCA28)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688)

## 📖 Overview

EasyCanvas provides a streamlined experience for students using Canvas LMS. It focuses on:

- **Clean, intuitive interface** for viewing courses and assignments
- **Enhanced caching** with React Query for performance and offline capability
- **Personalized insights** with assignment analytics and tracking
- **Integrated AI assistance** for summarizing content and providing help
- **Secure authentication** via Google/Firebase

## ✨ Features

### Core Features
- ✅ **Secure Authentication**: Google authentication via Firebase with protected routes
- ✅ **Course Management**: View all courses with detailed information and modules
- ✅ **Assignment Tracking**: Track all assignments with due dates, submission types, and grades
- ✅ **Assignment Details**: Rich view of assignment descriptions and details
- ✅ **Analytics Dashboard**: Visual representation of course performance and upcoming work
- ✅ **Calendar View**: Visualize assignments across courses by date
- ✅ **Announcements Board**: Stay updated with latest course announcements
- ✅ **AI Integration**: Get AI-powered summaries and assistance with assignments
- ✅ **Smart Caching**: Persistent caching with React Query for fast loading and offline access

### Technical Features
- ✅ **Advanced Data Management**: Multi-level caching strategy with React Query
- ✅ **Error Resilience**: Comprehensive error handling and error boundaries
- ✅ **Responsive Design**: Built with modern TailwindCSS for all screen sizes
- ✅ **Type Safety**: Full TypeScript implementation for reliability
- ✅ **Performance Optimization**: Efficient data loading and component rendering
- ✅ **Secure Data Storage**: Encrypted token storage and secure API communication

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ and npm
- Python 3.8+
- Firebase account
- Canvas LMS access token

### Frontend Setup
1. Clone the repository
   ```
   git clone https://github.com/yourusername/easycanvas.git
   cd easycanvas/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   Create a `.env` file in the frontend directory with:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory
   ```
   cd ../backend
   ```

2. Create and activate a virtual environment
   ```
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Configure environment variables
   Create a `.env` file in the backend directory with:
   ```
   CANVAS_BASE_URL=your_canvas_instance_url
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   SECRET_KEY=your_secret_key
   ```

5. Start the backend server
   ```
   uvicorn main:app --reload
   ```

## 🏗️ Project Structure

### Frontend
```
/frontend
  /src
    /components        # Shared/reusable components
      /common          # Generic UI elements (buttons, cards, etc.)
      /layouts         # Page layout components
    /contexts          # React context providers
    /features          # Feature-specific modules
      /account         # Account management features
      /ai              # AI integration services
      /auth            # Authentication features
      /courses         # Course and assignment features
        /components    # Course UI components
        /hooks         # Course-related custom hooks
        /pages         # Page components
        /services      # API services
        /types         # TypeScript types
      /static-pages    # Static content pages
    /firebase          # Firebase configuration
    /services          # Global services
      /api             # API communication layer
    /styles            # Global styles
    /types             # Shared type definitions
    /utils             # Utility functions
    App.tsx            # Main app component with routing
    main.tsx           # Entry point
```

### Backend
```
/backend
  /src
    /api
      /middleware      # Request middlewares (auth, error handling)
      /routes          # API route definitions
    /config            # Configuration settings
    /models            # Data models
    /services          # Business logic services
      /canvas          # Canvas API integration
      /course          # Course-related services
      /ai              # AI integration services
    /utils             # Utility functions
  main.py              # FastAPI application entry point
```

## 🧪 Key Technologies

### Frontend
- **React 18**: UI library with hooks and functional components
- **TypeScript**: Type-safe JavaScript
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Firebase**: Authentication and data storage
- **Vite**: Build tool and development server

### Backend
- **FastAPI**: High-performance Python web framework
- **Firebase Admin**: Server-side Firebase integration
- **CanvasAPI**: Canvas LMS API client
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation and settings management

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **JWT Validation**: Token-based API security
- **Encrypted Storage**: Secure storage of sensitive data
- **CORS Protection**: Configured Cross-Origin Resource Sharing
- **Environment Variables**: Secure configuration management

## 🔮 Roadmap

- [ ] **Assignment Submission**: Direct submission capability from within EasyCanvas
- [ ] **Message Integration**: Access Canvas messages and discussions
- [ ] **Mobile Optimization**: Better responsive design for mobile use
- [ ] **Dark/Light Theme**: Configurable UI theme
- [ ] **Multiple Canvas Instances**: Support for connecting to multiple Canvas instances
- [ ] **Student Groups**: Integration with Canvas groups and collaborations
- [ ] **Notifications**: Push notifications for due dates and announcements
- [ ] **File Management**: Better handling of course files and submissions

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

This strong copyleft license requires anyone who distributes or modifies this code to make their modifications available under the same terms. This includes using the code to provide a web service.

## 🙏 Acknowledgments

- Built by [Hunter Scheppat](https://linkedin.com/in/hunterscheppat/)
- Powered by [Canvas LMS API](https://canvas.instructure.com/doc/api/)
- Built with React, Firebase, and FastAPI