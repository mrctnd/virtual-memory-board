# 🎯 Virtual Memory Board (Sanal Anı Panosu)

> **🤖 AI-Powered Development**: Bu web sitesi uygulamasını tamamen yapay zeka (GitHub Copilot) birlikte geliştirdim.

A modern, full-stack web application for creating and sharing memory boards with an intuitive user interface. Built with Next.js frontend and ASP.NET Core backend.

![Virtual Memory Board](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure JWT Authentication** - Token-based authentication with refresh capability
- **User Registration & Login** - Complete user onboarding flow
- **Profile Management** - Users can update their profiles with custom avatars
- **Password Security** - Secure password hashing with Identity framework

### 📋 Board Management
- **Create Custom Boards** - Users can create personalized memory boards
- **Cover Images** - Beautiful cover images for each board
- **Board Discovery** - Explore public boards created by other users
- **Responsive Design** - Perfect viewing experience on all devices

### 📝 Post & Content Management
- **Rich Text Posts** - Create detailed posts with rich content
- **Image Uploads** - Upload and share images with your memories
- **Comment System** - Interactive commenting on posts
- **Real-time Updates** - Dynamic content updates without page refresh

### 🌍 Internationalization
- **Multi-language Support** - Currently supports English and Turkish
- **Dynamic Language Switching** - Switch languages on the fly
- **Localized Content** - All UI elements properly translated

### 🎨 Modern UI/UX
- **Dark/Light Theme** - Toggle between dark and light modes
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Smooth Animations** - Beautiful transitions and loading states
- **Intuitive Navigation** - Clean and user-friendly interface

## 🏗️ Architecture

### Frontend (Next.js)
```
sanal-ani-panosu-frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # User dashboard
│   ├── boards/           # Board management
│   ├── profile/          # User profile
│   └── auth/             # Authentication pages
├── components/           # Reusable UI components
├── contexts/            # React contexts (Auth, Theme)
├── lib/                 # Utilities and API client
└── locales/             # i18n translations
```

### Backend (ASP.NET Core)
```
SanalAniPanosu.API/
├── Controllers/         # API endpoints
├── Models/             # Entity models
├── DTOs/               # Data Transfer Objects
├── Services/           # Business logic
├── Data/               # Database context
└── Middleware/         # Custom middleware
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **.NET 8 SDK**
- **PostgreSQL** database
- **Git**

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrctnd/virtual-memory-board.git
   cd virtual-memory-board
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5154
   - Database: localhost:5432

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrctnd/virtual-memory-board.git
   cd virtual-memory-board/SanalAniPanosu.API
   ```

2. **Install dependencies**
   ```bash
   dotnet restore
   ```

3. **Configure database**
   ```bash
   # Update connection string in appsettings.json
   # Run migrations
   dotnet ef database update
   ```

4. **Start the API server**
   ```bash
   dotnet run
   ```
   The API will be available at `https://localhost:5154`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd virtual-memory-board/sanal-ani-panosu-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=https://localhost:5154/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your PostgreSQL connection string"
  },
  "JwtSettings": {
    "Key": "Your JWT secret key",
    "Issuer": "SanalAniPanosu.API",
    "Audience": "SanalAniPanosu.Client",
    "ExpireInDays": 7
  }
}
```

### Frontend Configuration (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://localhost:5154/api
NEXT_PUBLIC_APP_NAME=Virtual Memory Board
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### User Management
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/avatar` - Upload profile picture

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create new board
- `GET /api/boards/{id}` - Get specific board
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

### Posts
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

## 🛠️ Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **js-cookie** - Cookie management
- **i18next** - Internationalization

### Backend
- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core** - ORM with PostgreSQL
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation
- **JWT Bearer** - Authentication
- **Serilog** - Structured logging
- **Swagger/OpenAPI** - API documentation

### Database
- **PostgreSQL** - Primary database
- **Entity Framework Migrations** - Database versioning

## 🌟 Key Features Implementation

### Authentication Flow
- JWT token-based authentication
- Automatic token refresh
- Protected routes with middleware
- Secure cookie storage

### File Upload System
- Image upload with validation
- Automatic file optimization
- Secure file storage
- Support for multiple formats

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interfaces
- Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Social media integration
- [ ] Advanced search functionality
- [ ] Mobile application (React Native)
- [ ] Email notifications
- [ ] Advanced user permissions
- [ ] Board templates
- [ ] Export functionality

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact the development team.

---

**Made with ❤️ using modern web technologies**
