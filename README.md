# easyCanvas 🎨

A streamlined interface for Canvas LMS that simplifies managing your courses and assignments.

---

## 🚀 Current Features

### Completed
- ✅ Google Authentication with Firebase  
- ✅ Secure Canvas API token storage and encryption  
- ✅ Real-time course data synchronization  
- ✅ Comprehensive assignment tracking  
- ✅ Upcoming assignments widget  
- ✅ Individual assignment details view  
- ✅ Automatic data refresh system  
- ✅ Local caching for performance  
- ✅ Error boundary implementation  
- ✅ Protected routing system  
- ✅ User settings management  
- ✅ Account deletion 

### In Progress
- 🔄 Enhanced error handling for API failures  
- 🔄 Loading state improvements  
- 🔄 Assignment submission integration  
- 🔄 Course announcement integration  
- 🔄 AI integration and analysis  

---

## 🚧 Upcoming Features & Fixes

### High Priority
- [ ] Implement rate limiting for Canvas API  
- [ ] Add comprehensive API error logging  
- [ ] Implement batch processing for large courses  
- [ ] Add assignment submission capabilities  
- [ ] Implement course announcement integration  
- [ ] Add file download/upload functionality  

### Future Features
- [ ] Dark/Light theme toggle  
- [ ] Calendar view for assignments  
- [ ] Multiple Canvas instance support  
- [ ] Calendar export functionality  
- [ ] Email notifications system  
- [ ] Mobile app version  
- [ ] Offline mode support  
- [ ] Student collaboration tools  

---

## 🏗️ Project Structure

### Frontend
/frontend
  /src
    /features
      /courses
        /components
          CourseHomepage
          CourseHeader
          CourseList
          FilterBar
          MonthlyAssignments
          UpcomingAssignments
        /hooks
          useCourse.ts
          useCourses.ts
          useUpcomingAssignments.ts
        /pages
          HomePage.tsx
          CourseDetailsPage.tsx
          AssignmentDetailsPage.tsx
        /services
          course.service.ts
        /types
          index.ts
    /components
    /services
    /types
    /firebase
      firestore.ts

### Backend
/backend
  /src
    /api
      /routes
        course_routes.py
    /services
      course_service.py
      canvas_service.py
    /models
      course.py

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.8+ (backend)
- Firebase account
- Canvas LMS access

### Setup Steps
1. Clone repository  
2. Install dependencies: `npm install`  
3. Configure environment variables  
4. Set up Firebase project  
5. Run development server: `npm run dev`  

---

## 🔒 Security Features
- Google OAuth authentication  
- Protected routes  
- Firestore security rules  
- Environment variable protection  
- CORS configuration  

---

## 🤝 Contributing
1. Fork repository  
2. Create feature branch  
3. Commit changes  
4. Push to branch  
5. Open pull request  

---

## 📝 License
GNU Affero General Public License v3.0 - see `LICENSE` file

This strong copyleft license requires anyone who distributes or modifies this code to make their modifications available under the same terms. This includes using the code to provide a web service.

---

## ✨ Acknowledgments
- Built by [Hunter Scheppat](https://linkedin.com/in/hunterscheppat/)  
- Powered by Canvas LMS API  
- Built with React, Firebase, and TailwindCSS