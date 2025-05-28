# 🎯 Virtual Memory Board - Backend API

RESTful API for Virtual Memory Board application, built with ASP.NET Core 8 and Entity Framework Core.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **RESTful API** - Clean and intuitive API design
- **Entity Framework Core** - Code-first database approach
- **PostgreSQL Database** - Robust and scalable database
- **AutoMapper** - Efficient object mapping
- **Swagger Documentation** - Interactive API documentation
- **File Upload System** - Secure image upload functionality
- **Global Exception Handling** - Comprehensive error management

## 🛠️ Technologies

- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core 9** - ORM
- **PostgreSQL** - Database
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation
- **JWT Bearer** - Authentication
- **Serilog** - Structured logging
- **Swagger/OpenAPI** - API documentation

## 📦 Getting Started

### Prerequisites
- .NET 8 SDK
- PostgreSQL database
- Visual Studio or VS Code (optional)

### Installation

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd SanalAniPanosu.API
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Configure database**
   Update `appsettings.json` with your PostgreSQL connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=SanalAniPanosu;Username=your_username;Password=your_password"
     }
   }
   ```

4. **Run migrations**
   ```bash
   dotnet ef database update
   ```

5. **Start the server**
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:5154`

## 📁 Project Structure

```
├── Controllers/           # API Controllers
│   ├── AuthController.cs     # Authentication endpoints
│   ├── BoardsController.cs   # Board management
│   ├── PostsController.cs    # Post management
│   ├── UserController.cs     # User management
│   └── ...
├── Models/               # Entity Models
│   ├── AppUser.cs           # User entity
│   ├── Board.cs             # Board entity
│   ├── Post.cs              # Post entity
│   └── Comment.cs           # Comment entity
├── DTOs/                 # Data Transfer Objects
│   ├── UserDTOs.cs          # User DTOs
│   ├── BoardDTOs.cs         # Board DTOs
│   └── ...
├── Data/                 # Database Context
│   └── ApplicationDbContext.cs
├── Services/             # Business Logic
│   └── TokenService.cs      # JWT token service
├── Mapping/              # AutoMapper Profiles
├── Middleware/           # Custom Middleware
└── Migrations/           # EF Core Migrations
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Authenticated Requests
Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

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
- `GET /api/posts` - Get posts for a board
- `POST /api/posts` - Create new post
- `GET /api/posts/{id}` - Get specific post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Comments
- `GET /api/comments` - Get comments for a post
- `POST /api/comments` - Create new comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### File Upload
- `POST /api/file/upload` - Upload image file

## 📊 Database Schema

### AppUser
- Id (Primary Key)
- Email (Unique)
- FirstName
- LastName
- ProfileImageUrl
- CreatedAt

### Board
- Id (Primary Key)
- Title
- Description
- CoverImageUrl
- UserId (Foreign Key)
- CreatedAt
- UpdatedAt

### Post
- Id (Primary Key)
- Title
- Content
- ImageUrl
- BoardId (Foreign Key)
- UserId (Foreign Key)
- CreatedAt
- UpdatedAt

### Comment
- Id (Primary Key)
- Content
- PostId (Foreign Key)
- UserId (Foreign Key)
- CreatedAt

## 🔧 Configuration

### JWT Settings (appsettings.json)
```json
{
  "JwtSettings": {
    "Key": "your-super-secret-key-here",
    "Issuer": "SanalAniPanosu.API",
    "Audience": "SanalAniPanosu.Client",
    "ExpireInDays": 7
  }
}
```

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:3000` (Development frontend)
- `https://localhost:3001` (HTTPS frontend)

## 📝 Swagger Documentation

When running in development mode, access the interactive API documentation at:
`https://localhost:5154/swagger`

## 🧪 Testing

### Run Unit Tests
```bash
dotnet test
```

### Test with Swagger
1. Start the API (`dotnet run`)
2. Navigate to `https://localhost:5154/swagger`
3. Use the interactive interface to test endpoints

### Test with HTTP Client
Use the included `SanalAniPanosu.API.http` file with tools like:
- REST Client (VS Code extension)
- Postman
- Insomnia

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t memory-board-api .

# Run container
docker run -p 5154:80 memory-board-api
```

### Azure App Service
1. Configure connection strings in Azure
2. Set environment variables
3. Deploy using Azure DevOps or GitHub Actions

### Production Configuration
- Update connection strings
- Configure proper JWT secrets
- Set up HTTPS certificates
- Configure logging levels

## 🔍 Logging

The API uses Serilog for structured logging:
- Request/Response logging
- Error tracking
- Performance monitoring
- Configurable log levels

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - ASP.NET Core Identity
- **Input Validation** - FluentValidation
- **CORS Policy** - Controlled cross-origin requests
- **File Upload Validation** - Secure file handling
- **Global Exception Handling** - Secure error responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
