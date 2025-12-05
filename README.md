# 🌟 Aether Blog

A modern, full-stack blog platform with React, TypeScript, Go, and PostgreSQL.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication
- ✍️ **Markdown Editor** - Real-time preview
- 📝 **Article Management** - Full CRUD operations
- 🏷️ **Categories & Tags** - Organize content
- 🔍 **Search** - Fast article search
- 📱 **Responsive Design** - Works on all devices

## 🚀 Tech Stack

**Backend:** Go 1.21+ • PostgreSQL • JWT • bcrypt  
**Frontend:** React 19 • TypeScript • Vite • Tailwind CSS • marked

## 📦 Quick Start

See [START.md](./START.md) for detailed setup instructions.

### Default Login
- Email: `admin@aether.blog`
- Password: `admin123`

## 📚 Documentation

- [START.md](./START.md) - Quick start guide
- [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) - Project summary
- [ENHANCEMENT_PLAN.md](./ENHANCEMENT_PLAN.md) - Future features

## 🗂️ Project Structure

```
aether-blog/
├── backend/              # Go backend
│   ├── config/          # Configuration
│   ├── database/        # Database & migrations
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # Middleware
│   ├── models/          # Data models
│   └── services/        # Business logic
├── aether-blog/         # React frontend
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── pages/           # Page components
│   └── services/        # API client
└── .kiro/              # Project specs
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### Articles
- `GET /api/articles` - List articles
- `GET /api/articles/{id}` - Get article
- `POST /api/articles` - Create article (admin)
- `PUT /api/articles/{id}` - Update article (admin)
- `DELETE /api/articles/{id}` - Delete article (admin)

## 📄 License

MIT License

## 👤 Author

SherryBX - [@SherryBX](https://github.com/SherryBX)

---

**Star ⭐ this repo if you find it helpful!**
