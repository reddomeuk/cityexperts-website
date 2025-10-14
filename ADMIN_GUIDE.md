# 🔐 City Experts Admin & User Management Guide

## Quick Start - Login Credentials

### **Main Admin Panel**: http://localhost:3001/admin.html
**Default Login Credentials:**
- **Email**: `admin@cityexperts.ae`
- **Password**: `TestPassword123`

**Alternative Credentials:**
- **Email**: `admin@localhost`
- **Password**: `admin123`

### **User Management Panel**: http://localhost:3001/user-management.html
Use the same credentials as above.

---

## 🎯 Features Overview

### 1. **Main Admin Dashboard** (`admin.html`)
✅ **Project Management**
- View all published projects
- Search and filter projects
- Toggle featured status (adds to homepage)
- Create new projects with form builder
- Manage project images

✅ **Featured Projects Management**
- See which projects appear on homepage
- One-click feature/unfeature buttons
- Spotlight project management

✅ **Page Headers Management**
- Replace hero images for all pages
- Upload instructions for local images

✅ **Image Upload System**
- Dimension validation
- File type checking
- Manual upload instructions

### 2. **User Management System** (`user-management.html`)
✅ **User Administration**
- Create new admin users
- Edit existing users
- Delete users (except current user)
- Role management (Admin, Editor, Viewer)

✅ **Multi-Factor Authentication (MFA)**
- Setup TOTP (Google Authenticator compatible)
- Mock QR code generation
- MFA requirement toggle
- Per-user MFA settings

✅ **Password Management**
- Change password functionality
- Password strength requirements
- Secure password storage (local development)

---

## 🚀 How to Use

### **Logging In**
1. Go to http://localhost:3001/admin.html
2. Enter credentials: `admin@cityexperts.ae` / `TestPassword123`
3. Click "Sign in"
4. You'll be redirected to the dashboard

### **Managing Projects**
1. **Toggle Featured Status**:
   - Find any project in the "📋 Published Projects" section
   - Click "Feature" to add to homepage
   - Click "Remove" to unfeature

2. **Create New Project**:
   - Click "+ New Project" button
   - Fill in project details
   - Check "Feature on homepage" if desired
   - Click "Save Project"
   - Copy the JSON from browser console
   - Add it to `public/data/projects.json`

3. **Search Projects**:
   - Use the search box to find projects by name, category, or city
   - Filter by status (Published/Draft/All)

### **Managing Users**
1. Go to http://localhost:3001/user-management.html
2. **Add New User**:
   - Click "+ Add New User"
   - Enter email, name, role, and temporary password
   - Optionally require MFA for this user
   - Click "Create User"

3. **Setup MFA**:
   - Click "Setup MFA" in your profile
   - Scan QR code with authenticator app
   - Enter verification code (use `123456` for demo)
   - MFA will be enabled

4. **Edit/Delete Users**:
   - Click "Edit" to modify user details
   - Click "Delete" to remove users (with confirmation)

---

## 🔧 Technical Details

### **Authentication System**
- **Local Storage Based**: Uses browser localStorage for development
- **Session Management**: Maintains login state across browser sessions
- **Fallback System**: Works with or without backend API
- **Default Users**: Pre-configured admin accounts

### **Data Storage**
- **Projects**: JSON file at `public/data/projects.json`
- **Users**: Browser localStorage (`cityexpert_users`)
- **Sessions**: Browser localStorage (`cityexpert_local_auth`)
- **MFA Settings**: Browser localStorage (`cityexpert_mfa_settings`)

### **Security Features**
- **CSRF Protection**: Token-based (when API available)
- **Role-Based Access**: Admin, Editor, Viewer roles
- **MFA Support**: TOTP-based two-factor authentication
- **Password Requirements**: 8+ characters, uppercase, numbers

---

## 🛠️ Development Mode Features

### **No Backend Required**
- Works entirely with static files
- No database needed for development
- All data stored in browser localStorage

### **Mock Services**
- **MFA Setup**: Mock QR codes and verification
- **File Upload**: Shows manual upload instructions
- **Authentication**: Local credential validation

### **Production Ready Structure**
- **API Integration Points**: Ready for backend integration
- **Cloudflare Pages Compatible**: Works with existing deployment
- **Scalable Architecture**: Easy to extend with real backend

---

## 📝 Next Steps for Production

1. **Backend Integration**:
   - Implement real user database
   - Add proper password hashing (bcrypt)
   - Real TOTP MFA implementation
   - File upload API

2. **Enhanced Security**:
   - JWT tokens for sessions
   - Rate limiting for login attempts
   - Email verification for new users
   - Audit logs for admin actions

3. **Advanced Features**:
   - Bulk project operations
   - Image optimization pipeline
   - Content approval workflows
   - Analytics dashboard

---

## 🎉 You're All Set!

The admin system now provides:
- ✅ **User Management** with MFA support
- ✅ **Project Management** with featured toggle
- ✅ **Image Upload** system
- ✅ **Local Development** authentication
- ✅ **Production Ready** structure

**Start managing your City Experts website with ease!** 🏗️✨