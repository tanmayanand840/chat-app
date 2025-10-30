# Real-Time Chat Application

A modern, full-stack real-time chat application built with React and Node.js, featuring user authentication, real-time messaging, image sharing, and online status indicators.

## ✨ Features

- **Real-time Messaging**: Instant message delivery with Socket.IO
- **User Authentication**: Secure JWT-based login and signup system
- **Image Sharing**: Upload and share images via Cloudinary
- **Online Status**: Real-time online/offline indicators
- **Profile Management**: Update profile picture, name, and bio
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Message History**: Persistent conversation history with MongoDB
- **Read Receipts**: Track message seen status
- **Unread Message Indicators**: Badge notifications for new messages
- **Search Functionality**: Find users quickly with search

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications
- **Context API** - State management for auth and chat
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Image upload and management
- **bcryptjs** - Password hashing

## 📂 Project Structure

```
chat-app/
├── server/
│   ├── controllers/
│   │   ├── messageController.js     # Message CRUD operations, real-time messaging
│   │   └── userController.js        # User authentication, profile management
│   ├── lib/
│   │   ├── cloudinary.js           # Cloudinary configuration for image uploads
│   │   ├── db.js                   # MongoDB connection setup
│   │   └── utils.js                # JWT token generation utilities
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── models/
│   │   ├── Message.js              # Message schema (text, image, seen status)
│   │   └── User.js                 # User schema (profile, authentication)
│   ├── routes/
│   │   ├── messageRoutes.js        # Message API endpoints
│   │   └── userRoutes.js           # User API endpoints
│   ├── server.js                   # Main server file with Socket.IO setup
│   └── package.json                # Server dependencies
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx    # Main chat interface
│   │   │   ├── SideBar.jsx         # User list and search
│   │   │   └── RightSideBar.jsx    # User info and media
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Main chat page
│   │   │   ├── LoginPage.jsx       # Authentication
│   │   │   └── ProfilePage.jsx     # Profile management
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ChatContext.jsx     # Chat functionality
│   │   ├── lib/
│   │   │   └── utils.js           # Utility functions
│   │   ├── assets/               # Images and icons
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # App entry point
│   ├── public/
│   │   └── bgImage.svg          # Background image
│   └── package.json             # Client dependencies
├── .env                         # Environment variables
└── README.md                    # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account for image uploads

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/check` - Check authentication status
- `PUT /api/auth/update-profile` - Update user profile

### Message Routes
- `GET /api/messages/users` - Get all users for sidebar
- `GET /api/messages/:id` - Get messages with specific user
- `POST /api/messages/send/:id` - Send message to user
- `PUT /api/messages/mark/:id` - Mark message as seen

## 🔧 Key Components

### Backend Architecture
- **Controllers**: Handle business logic for users and messages
- **Models**: MongoDB schemas using Mongoose
- **Middleware**: JWT authentication and request protection
- **Routes**: RESTful API endpoint definitions
- **Socket.IO**: Real-time communication server

### Frontend Architecture
- **Context API**: Global state management
- **Protected Routes**: Authentication-based navigation
- **Real-time Updates**: Socket.IO integration
- **Responsive Design**: Mobile-first approach

## 🎨 Design Features

- **Glassmorphism**: Backdrop blur effects for modern aesthetics
- **Purple Gradient Theme**: Consistent color scheme throughout
- **Mobile-First**: Responsive design prioritizing mobile experience
- **Clean Typography**: Outfit font family for readability
- **Smooth Animations**: Polished user experience

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: Authentication middleware
- **Input Validation**: Server-side validation
- **Image Upload Security**: Cloudinary integration

## 📱 Usage Guide

### Getting Started
1. **Sign Up**: Create a new account with email, name, and bio
2. **Login**: Access your account with credentials
3. **Find Users**: Browse or search for other users in the sidebar
4. **Start Chatting**: Click on a user to begin conversation
5. **Share Media**: Send images using the gallery icon
6. **Update Profile**: Modify your profile information anytime

### Features Guide
- **Send Messages**: Type and press Enter to send
- **Share Images**: Click gallery icon to upload images
- **View Online Status**: Green dot indicates online users
- **Browse Media**: View shared images in the right sidebar
- **Search Users**: Use the search bar to find specific users
- **Message Status**: See when messages are delivered and read

## 🚀 Performance Optimizations

- **Efficient State Management**: Context API optimization
- **Image Optimization**: Cloudinary transformations
- **Database Indexing**: Optimized MongoDB queries
- **Socket.IO Rooms**: Efficient real-time communication
- **Responsive Images**: Adaptive image loading

## 🔄 Real-time Features

- **Instant Messaging**: Socket.IO powered real-time chat
- **Online Status**: Live user presence indicators
- **Message Delivery**: Real-time message updates
- **Typing Indicators**: See when users are typing
- **Auto-scroll**: Smooth scroll to latest messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- Socket.IO for real-time communication
- MongoDB for the flexible database
- Tailwind CSS for the utility-first CSS framework
- Cloudinary for image management
- React Hot Toast for beautiful notifications

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the documentation
- Contact the maintainers

---

Made with ❤️ using React, Node.js, and modern web technologies
