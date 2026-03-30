# AUREX - Civic Issue Reporting System

A comprehensive web-based platform for reporting, tracking, and managing civic issues in urban areas. Citizens can report infrastructure problems, public safety concerns, and environmental issues, while administrators can review, assign, and track resolution progress.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AUREX is a full-stack civic issue reporting and management system designed to bridge the gap between citizens and municipal authorities. It provides an intuitive platform for reporting civic problems with detailed information, location-based tracking, and real-time status updates.

**Key Goals:**
- Enable citizens to easily report civic issues
- Provide transparency in issue resolution
- Facilitate efficient resource allocation for authorities
- Build community awareness through shared issue tracking
- Support multi-language and accessibility features

---

## ✨ Features

### 🏠 User Features

#### 1. **4-Step Report Submission Form**
   - **Step 1: Basic Information**
     - Issue title and detailed description
     - Category selection (16+ categories)
     - Comment counter (5000 char limit)

   - **Step 2: Category Details**
     - Dynamic fields based on selected category
     - Road incidents, water supply, electricity, etc.
     - Specific issue type selection

   - **Step 3: Location & Media (L & M)**
     - GPS location capture
     - Manual address entry
     - Date & time of incident
     - Priority level selection
     - Emergency flag toggle
     - Photo/video upload (10MB max per file)
     - Community sharing option

   - **Step 4: Contact Information**
     - Optional contact name and phone
     - Anonymous submission option
     - Report summary preview
     - Final submission

#### 2. **Report Categories** (16 types)
   - 🛣️ Roads & Potholes
   - 💧 Water Supply
   - ⚡ Electricity
   - 🧹 Sanitation
   - 🗑️ Garbage Collection
   - 💡 Street Lights
   - 🚌 Public Transport
   - 🌳 Parks & Recreation
   - 🔊 Noise Pollution
   - 🌫️ Air Pollution
   - 🚧 Illegal Construction
   - 🚦 Traffic Issues
   - 🛡️ Public Safety
   - 🏥 Healthcare
   - 📚 Education
   - 📋 Other

#### 3. **Report Tracking**
   - View all submitted reports
   - Real-time status updates
   - Track location on map
   - View evidence (photos/videos)
   - Admin responses
   - Status history timeline

#### 4. **Community Features**
   - Post reports to community
   - View community posts
   - Comment on issues
   - Share experiences
   - Community engagement

#### 5. **User Dashboard**
   - Profile management
   - Settings (theme, language, notifications)
   - View my reports
   - Track report status
   - Message inbox

#### 6. **Profile & Settings**
   - Theme toggle (Dark/Light/System)
   - Language selection (Multi-language support)
   - Notification preferences
   - Privacy settings
   - Account information

#### 7. **Real-time Messaging**
   - Direct messaging with admins
   - Floating message button
   - Message history
   - Real-time notifications

---

### 👨‍💼 Admin Features

#### 1. **Report Management Dashboard**
   - View all submitted reports
   - Filter by status, priority, category
   - Search reports
   - Assign reports to admins
   - "Assigned to me" filter view

#### 2. **Report Detail View**
   - Complete report information
   - Category-specific details display
   - Location with map link
   - Incident date & time
   - Evidence gallery
   - Contact information
   - Reporter details
   - Anonymous badge indicator

#### 3. **Report Assignment**
   - "Assign to me" button
   - Toggle assignment status
   - Show assigned admin name in list
   - Badge display for assignment status

#### 4. **Status Management**
   - Update report status
   - Status options:
     - Pending
     - Under Review
     - In Progress
     - Resolved
     - Rejected
     - Escalated
   - Add notes to status changes
   - View status history timeline

#### 5. **Admin Responses**
   - Add official responses to reports
   - Response tracking
   - Admin name and timestamp
   - Public visibility of responses

#### 6. **User Management**
   - View all users
   - User statistics
   - Filter by role
   - Manage user permissions

#### 7. **Community Management**
   - Moderate community posts
   - Manage comments
   - Delete inappropriate content
   - Monitor discussions

#### 8. **Laws & Policies**
   - Create and manage civic laws
   - Display relevant regulations
   - Link to reports

#### 9. **Contact Management**
   - View public contact requests
   - Manage contact information
   - Respond to inquiries

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Custom shadcn/ui components
- **Routing:** React Router v6
- **State Management:** React Context API
- **API Client:** Axios
- **Icons:** Lucide React
- **Maps:** Leaflet (OpenStreetMap)
- **File Upload:** Cloudinary
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form with Zod validation
- **Date Handling:** date-fns
- **Theme Management:** next-themes

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Image Processing:** Multer
- **Real-time:** Socket.io
- **Validation:** Custom middleware validators
- **Security:** bcryptjs for password hashing
- **CORS:** cors middleware

### Development Tools
- **Frontend Dev Server:** Vite
- **Backend Dev Server:** Nodemon
- **Testing:** Jest
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Package Manager:** npm

---

## 📁 Project Structure

```
AUREX Civic Issue/
├── .gitignore                       # Git ignore rules (root level)
├── .env.example                     # Environment template
├── README.md                        # Main project documentation
├── Project_Viva.md                  # Viva exam Q&A documentation
├── app/                             # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── messaging/           # Chat components
│   │   │   │   ├── FloatingMessageButton.tsx
│   │   │   ├── navigation/          # Navigation components
│   │   │   │   ├── BottomNavbar.tsx
│   │   │   │   ├── BrandLogo.tsx
│   │   │   │   └── TopNavbar.tsx
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ... (40+ components)
│   │   │   └── SplashScreen.tsx     # Loading screen
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.tsx      # Authentication state
│   │   │   ├── ThemeContext.tsx     # Theme management
│   │   │   ├── LanguageContext.tsx  # Multi-language support
│   │   │   ├── NotificationContext.tsx
│   │   │   └── SocketContext.tsx    # Real-time updates
│   │   ├── pages/
│   │   │   ├── auth/                # Authentication pages
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   └── TermsAndConditionsPage.tsx
│   │   │   ├── user/                # User-facing pages
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── ReportPage.tsx   # 4-step report form
│   │   │   │   ├── TrackPage.tsx    # Report tracking
│   │   │   │   ├── CommunityPage.tsx
│   │   │   │   ├── LawsPage.tsx
│   │   │   │   ├── MessagesPage.tsx
│   │   │   │   ├── ContactsPage.tsx
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── EmergencyPage.tsx
│   │   │   │   └── LawDetailPage.tsx
│   │   │   └── admin/               # Admin pages
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── ReportsPage.tsx  # Report management
│   │   │       ├── ReportDetailPage.tsx
│   │   │       ├── UsersPage.tsx
│   │   │       ├── CommunityPage.tsx
│   │   │       ├── LawsPage.tsx
│   │   │       ├── ContactsPage.tsx
│   │   │       └── ReportDetailPage.tsx
│   │   ├── services/                # API service layer
│   │   │   ├── api.ts               # Axios configuration
│   │   │   ├── authService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── communityService.ts
│   │   │   ├── lawService.ts
│   │   │   ├── messageService.ts
│   │   │   └── contactService.ts
│   │   ├── router/                  # Route configuration
│   │   │   └── index.tsx
│   │   ├── layouts/                 # Layout components
│   │   │   ├── MainLayout.tsx       # User layout
│   │   │   ├── AdminLayout.tsx      # Admin layout
│   │   │   └── AuthLayout.tsx       # Auth layout
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── use-mobile.ts
│   │   ├── lib/                     # Utilities
│   │   │   └── utils.ts
│   │   ├── App.tsx                  # Main app component
│   │   ├── App.css                  # App styles
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/
│   │   ├── Gif-landing.gif          # Splash screen animation
│   │   └── logo.png                 # App logo
│   ├── .env.example                 # Environment template (commit to repo)
│   ├── .gitignore                   # Git ignore rules
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tsconfig.app.json            # App TypeScript config
│   ├── tsconfig.node.json           # Node TypeScript config
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── components.json              # shadcn/ui configuration
│   ├── eslint.config.js             # ESLint configuration
│   ├── package.json                 # NPM dependencies
│   ├── README.md                    # Frontend documentation
│   └── info.md                      # Additional info
│
└── aurex-backend/                   # Node.js Express Backend
    ├── config/
    │   ├── database.js              # MongoDB connection
    │   ├── cloudinary.js            # File upload config
    │   └── socket.js                # Socket.io setup
    ├── controllers/
    │   ├── authController.js        # Authentication logic
    │   ├── reportController.js      # Report CRUD operations
    │   ├── communityController.js   # Community posts
    │   ├── lawController.js         # Laws & policies
    │   ├── messageController.js     # Messaging system
    │   ├── contactController.js     # Contact forms
    │   └── index.js                 # Controller exports
    ├── models/
    │   ├── User.js                  # User schema
    │   ├── Report.js                # Report schema
    │   ├── CommunityPost.js         # Community post schema
    │   ├── Law.js                   # Law schema
    │   ├── Message.js               # Message schema
    │   ├── Contact.js               # Contact schema
    │   └── index.js                 # Model exports
    ├── routes/
    │   ├── auth.js                  # Authentication routes
    │   ├── reports.js               # Report routes
    │   ├── community.js             # Community routes
    │   ├── laws.js                  # Law routes
    │   ├── messages.js              # Message routes
    │   ├── contacts.js              # Contact routes
    │   └── index.js                 # Route registration
    ├── middleware/
    │   ├── auth.js                  # JWT verification
    │   ├── errorHandler.js          # Global error handling
    │   ├── reportValidation.js      # Report validation
    │   ├── upload.js                # File upload handling
    │   └── validator.js             # Input validation
    ├── utils/
    │   └── seeder.js                # Database seeding
    ├── .env.example                 # Environment template (commit to repo)
    ├── .gitignore                   # Git ignore rules
    ├── server.js                    # Express app entry point
    ├── package.json                 # NPM dependencies
    └── README.md                    # Backend documentation
```

---

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local installation or cloud instance like MongoDB Atlas)
- **Git** (for cloning the repository)

### Optional but Recommended
- **Cloudinary Account** (for file uploads) - [Sign up](https://cloudinary.com/)
- **Google Maps API Key** (for location features)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "AUREX Civic Issue"
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local  # If example exists, otherwise create manually
```

Edit `.env.local` with your configuration:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd ../aurex-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env  # If example exists, otherwise create manually
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aurex
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CORS_ORIGIN=http://localhost:5173
```

### 4. Database Setup

Make sure MongoDB is running locally, or update `MONGODB_URI` to point to your MongoDB Atlas cluster.

### 5. Seed Database (Optional)

```bash
cd aurex-backend
npm run seed
```

---

## ⚙️ Configuration

### Environment Variables

#### Frontend (.env.local)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Maps (Optional)
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key

# Development
VITE_NODE_ENV=development
```

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aurex

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# File Upload (Cloudinary)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🎬 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd aurex-backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd app
npm run dev
# App runs on http://localhost:5173
```

### Production Build

**Frontend:**
```bash
cd app
npm run build
npm run preview
```

**Backend:**
```bash
cd aurex-backend
npm start
```

---

## 🧪 Testing

### Backend Testing

```bash
cd aurex-backend
npm test
```

### Frontend Testing

```bash
cd app
npm run lint
```

---

## 🚀 Deployment

### Frontend Deployment

1. Build the application:
```bash
cd app
npm run build
```

2. Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

### Backend Deployment

1. Set `NODE_ENV=production` in your environment
2. Deploy to a cloud platform (Heroku, Railway, DigitalOcean, etc.)
3. Ensure MongoDB is accessible from your deployment environment

### Environment Setup for Production

- Set strong `JWT_SECRET`
- Configure production MongoDB URI
- Set up Cloudinary for file storage
- Configure SMTP for email notifications
- Set `CORS_ORIGIN` to your frontend domain

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "secure_password"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Report Endpoints

#### Create Report
```http
POST /api/reports
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing accidents",
  "category": "roads",
  "categoryDetails": {
    "problemType": "Pothole",
    "roadName": "Main Street",
    "damageSize": "Large",
    "accidentRisk": "Yes"
  },
  "location": {
    "coordinates": [-73.935242, 40.730610],
    "address": "Main Street, New York"
  },
  "priority": "high",
  "isEmergency": false,
  "media": [file1, file2],
  "contactName": "John Doe",
  "contactPhone": "1234567890",
  "isAnonymous": false
}
```

#### Get All Reports
```http
GET /api/reports?status=pending&category=roads&priority=high&limit=50
Authorization: Bearer {token}
```

#### Get Single Report
```http
GET /api/reports/{id}
Authorization: Bearer {token}
```

#### Update Report Status (Admin)
```http
PUT /api/reports/{id}/status
Authorization: Bearer {admin_token}

{
  "status": "in_progress",
  "note": "Work has started"
}
```

#### Assign Report (Admin)
```http
PUT /api/reports/{id}/assign
Authorization: Bearer {admin_token}

{
  "adminId": "admin_user_id"
}
```

#### Add Response (Admin)
```http
POST /api/reports/{id}/response
Authorization: Bearer {admin_token}

{
  "message": "We are working on this issue"
}
```

---

## 📝 Sample Coding

This section demonstrates key code snippets from the AUREX Civic Issue Reporting System, showing how complaints are collected, processed, and stored.

### 1. Frontend Code - Complaint Submission Form

```typescript
// ReportPage.tsx - Form submission logic
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.title || !formData.description || !formData.category) {
    showError('Please fill in all required fields');
    return;
  }

  setIsSubmitting(true);

  try {
    // Upload selected files first to Cloudinary and get persistent URLs
    const uploadedMedia =
      uploadedFiles.length > 0
        ? await reportService.uploadReportFiles(uploadedFiles.map((item) => item.file))
        : [];

    const reportData = {
      ...formData,
      media: uploadedMedia,
      incidentAt: formData.incidentAt || undefined,
      categoryDetails: formData.categoryDetails || {}
    };

    const createdReport = await reportService.createReport(reportData);

    if (formData.postToCommunity) {
      const communityPriority =
        formData.priority === 'high' || formData.priority === 'emergency'
          ? 'high'
          : formData.priority === 'medium'
          ? 'medium'
          : 'normal';
      const communityCategory = formData.isEmergency ? 'emergency' : 'notice';
      await communityService.createPost({
        title: formData.title,
        category: communityCategory,
        description: formData.description,
        locationName: formData.location.address,
        eventDate: new Date().toISOString(),
        priority: communityPriority,
        allowComments: true,
        content: formData.description,
        media: uploadedMedia,
        relatedReportId: createdReport._id
      });
    }
    showSuccess(t('report.success'));
    navigate('/track');
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } } | undefined;
    showError(error?.response?.data?.message ?? 'Failed to submit report');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 2. Backend Code - API Route Handler

```javascript
// reportController.js - Create report endpoint
exports.createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      categoryDetails,
      incidentAt,
      priority = 'medium',
      isEmergency = false,
      location,
      media = [],
      isAnonymous = false,
      isPublic = true,
      contactName,
      contactPhone
    } = req.body;

    const parsedLocation = parseLocation(location);
    const parsedIsEmergency = parseBoolean(isEmergency, false);
    const parsedIsAnonymous = parseBoolean(isAnonymous, false);
    const parsedIsPublic = parseBoolean(isPublic, true);
    const existingMedia = parseMediaArray(media);
    const parsedCategoryDetails = parseJsonObject(categoryDetails);
    const parsedIncidentAt = incidentAt ? new Date(incidentAt) : null;
    const uploadedMedia = req.files?.length ? await uploadMediaFiles(req.files) : [];
    const mergedMedia = [...existingMedia, ...uploadedMedia];

    // Validation
    if (!title || !description || !category || !parsedLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and location'
      });
    }

    // Validate location coordinates
    if (!parsedLocation.coordinates || parsedLocation.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid location coordinates [longitude, latitude]'
      });
    }

    if (parsedIncidentAt && Number.isNaN(parsedIncidentAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and time'
      });
    }

    const missingFields = validateCategoryDetails(category, parsedCategoryDetails);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide required category details: ${missingFields.join(', ')}`
      });
    }

    // Create report
    const report = await Report.create({
      title,
      description,
      category,
      subcategory,
      categoryDetails: parsedCategoryDetails,
      incidentAt: parsedIncidentAt || undefined,
      priority: parsedIsEmergency ? 'emergency' : priority,
      isEmergency: parsedIsEmergency,
      location: {
        type: 'Point',
        coordinates: parsedLocation.coordinates,
        address: parsedLocation.address,
        landmark: parsedLocation.landmark,
        pincode: parsedLocation.pincode
      },
      media: mergedMedia,
      reportedBy: req.user._id,
      contactName: contactName || '',
      contactPhone: contactPhone || '',
      isAnonymous: parsedIsAnonymous,
      isPublic: parsedIsPublic,
      statusHistory: [{
        status: 'pending',
        changedBy: req.user._id,
        note: 'Report submitted'
      }]
    });

    // Populate and return
    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        report: populatedReport
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: getReadableUploadError(error)
    });
  }
};
```

### 3. Database Structure - Report Schema

```javascript
// Report.js - MongoDB Schema for storing complaints
const mongoose = require('mongoose');

// Status History Sub-Schema for tracking status changes
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'escalated'],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    maxlength: 500
  }
}, { _id: true });

// Admin Response Sub-Schema
const adminResponseSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondedAt: {
    type: Date,
    default: Date.now
  },
  isInternal: {
    type: Boolean,
    default: false // Internal notes vs public responses
  }
}, { _id: true });

// Location Sub-Schema
const locationSchema = new mongoose.Schema({
  // GeoJSON Point format for geospatial queries
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;      // latitude
      },
      message: 'Invalid coordinates'
    }
  },
  address: {
    type: String,
    maxlength: 500
  },
  landmark: {
    type: String,
    maxlength: 200
  },
  pincode: {
    type: String,
    match: [/^[0-9]{6}$/, 'Invalid pincode']
  }
}, { _id: false });

// Media Sub-Schema for images and videos
const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  publicId: {
    type: String, // Cloudinary public ID for deletion
    required: true
  },
  thumbnail: {
    type: String // For videos, thumbnail URL
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Main Report Schema
const reportSchema = new mongoose.Schema({
  // Report Identification
  reportId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Reporter Information
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactName: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact name cannot exceed 100 characters']
  },
  contactPhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Invalid contact phone']
  },
  
  // Issue Details
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  incidentAt: {
    type: Date
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'roads',
      'water_supply',
      'electricity',
      'sanitation',
      'garbage',
      'streetlights',
      'public_transport',
      'parks',
      'noise_pollution',
      'air_pollution',
      'illegal_construction',
      'traffic',
      'safety',
      'healthcare',
      'education',
      'other'
    ],
    index: true
  },
  subcategory: {
    type: String,
    maxlength: 100
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium',
    index: true
  },
  
  // Is this an emergency report
  isEmergency: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Location Information
  location: {
    type: locationSchema,
    required: true
  },
  
  // Media Evidence
  media: [mediaSchema],
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'escalated'],
    default: 'pending',
    index: true
  },
  
  // Status Change History
  statusHistory: [statusHistorySchema],
  
  // Admin Responses
  adminResponses: [adminResponseSchema],
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date
  },
  
  // Resolution Details
  resolvedAt: {
    type: Date
  },
  resolutionNote: {
    type: String,
    maxlength: 2000
  },
  resolutionMedia: [mediaSchema],
  
  // User Feedback after resolution
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    submittedAt: {
      type: Date
    }
  },
  
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Community Engagement
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
reportSchema.index({ location: '2dsphere' });
```

---

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, email support@aurex.com or join our Discord community.

---

## 🙏 Acknowledgments

- Thanks to all contributors
- Special thanks to the open-source community
- Icons by [Lucide React](https://lucide.dev/)
- UI components built with [shadcn/ui](https://ui.shadcn.com/)
