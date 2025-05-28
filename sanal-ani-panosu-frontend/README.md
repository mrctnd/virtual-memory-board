# 🎯 Virtual Memory Board - Frontend

The frontend application for Virtual Memory Board, built with Next.js 15 and modern React features.

## 🚀 Features

- **Modern Next.js App Router** - Latest Next.js architecture
- **Multi-language Support** - English and Turkish i18n
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Mobile-first with TailwindCSS
- **Authentication** - JWT-based secure authentication
- **Real-time Updates** - Dynamic content without page refresh

## 🛠️ Technologies

- **Next.js 15** - React framework
- **React 19** - Latest React features
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client
- **i18next** - Internationalization

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5154/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # User dashboard
│   ├── boards/           # Board management pages
│   ├── profile/          # User profile page
│   ├── login/            # Authentication pages
│   └── register/         
├── components/           # Reusable UI components
│   ├── BoardCard.js      # Board display component
│   ├── PostCard.js       # Post display component
│   ├── Navbar.js         # Navigation component
│   └── ...
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication state
├── lib/                 # Utilities
│   ├── api.js           # API client
│   ├── i18n.js          # Internationalization
│   └── auth.js          # Auth utilities
└── locales/             # Translation files
    ├── en/              # English translations
    └── tr/              # Turkish translations
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌍 Internationalization

The app supports multiple languages. Add new translations in:
- `locales/en/common.json` - English translations
- `locales/tr/common.json` - Turkish translations

## 🎨 Styling

This project uses TailwindCSS for styling with:
- Dark/light theme support
- Responsive design utilities
- Custom color schemes
- Smooth animations

## 📱 Responsive Design

The application is designed mobile-first and works perfectly on:
- 📱 Mobile devices
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🔐 Authentication

The app uses JWT tokens for authentication:
- Secure token storage in cookies
- Automatic token refresh
- Protected routes
- User session management

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Docker
```bash
# Build image
docker build -t memory-board-frontend .

# Run container
docker run -p 3000:3000 memory-board-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
