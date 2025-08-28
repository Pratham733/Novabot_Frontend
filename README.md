# NovaBot - AI-Powered Document Generation Platform

A modern, cross-platform application for AI-powered document generation and management, built with React Native/Expo and Django.

## 🚀 Features

- **AI Document Generation**: Create resumes, cover letters, reports, and more with AI assistance
- **Document Management**: Organize and manage your generated documents
- **File Conversion**: Convert files between different formats
- **Cross-Platform**: Works on iOS, Android, and Web
- **Modern UI/UX**: Beautiful, responsive design with left-side navigation
- **Authentication**: Firebase and JWT-based authentication
- **Real-time Updates**: Live document generation and updates

## 🏗️ Architecture

### Frontend (React Native/Expo)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router with custom left-side navigation
- **Styling**: React Native StyleSheet with modern design system
- **State Management**: React Context for authentication
- **UI Components**: Custom components with Ionicons

### Backend (Django)
- **Framework**: Django 5.2 with Django REST Framework
- **Authentication**: JWT tokens with Firebase integration
- **AI Integration**: OpenAI and other AI providers
- **Database**: SQLite (development) / MongoDB (production)
- **File Processing**: Document conversion and generation

## 📱 Screenshots

- **Home Dashboard**: Overview with quick access to features
- **Document Generator**: AI-powered document creation
- **Document Library**: Manage and organize documents
- **File Converter**: Convert between file formats
- **History**: Track your document generation activity
- **Settings**: Configure your preferences

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- Expo CLI (optional, for development)

### Frontend Setup
```bash
cd nova_bot
npm install
npm start
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py runserver
```

### Environment Configuration
Create a `.env` file in the `nova_bot` directory:

```env
# Backend API
EXPO_PUBLIC_API_BASE=http://127.0.0.1:8000

# Firebase (optional)
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Configuration
EXPO_PUBLIC_AI_PROVIDER=openai
EXPO_PUBLIC_AI_MODEL=gpt-4
EXPO_PUBLIC_AI_TEMPERATURE=0.7
```

## 🎯 Usage

### Document Generation
1. Navigate to "Document Generator"
2. Select document type (resume, cover letter, etc.)
3. Enter title and description
4. Click "Generate Document"
5. Review and save the generated content

### Document Management
1. Access "Documents" from the sidebar
2. View all your generated documents
3. Edit, regenerate, or export documents
4. Organize by type and date

### File Conversion
1. Go to "File Converter"
2. Upload your file
3. Select target format
4. Download converted file

## 🔧 Development

### Project Structure
```
nova_bot/
├── app/                    # Expo Router pages
├── components/            # Reusable UI components
├── constants/             # Configuration and constants
├── context/               # React Context providers
├── lib/                   # API and utility functions
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

### Key Components
- **Layout.tsx**: Main layout with left sidebar navigation
- **AuthContext.tsx**: Authentication state management
- **api.ts**: Backend API integration
- **config.ts**: Environment configuration

### Styling Guidelines
- Use the provided color palette from `constants/Colors.ts`
- Follow the component structure in `components/`
- Maintain consistent spacing and typography
- Use modern design patterns (cards, gradients, shadows)

## 🚀 Deployment

### Frontend (Expo)
```bash
# Build for web
npm run build:web

# Build for mobile
expo build:android
expo build:ios
```

### Backend (Django)
```bash
# Production settings
python manage.py collectstatic
python manage.py migrate
gunicorn novabot_backend.wsgi:application
```

## 🔒 Security

- JWT token authentication
- Secure token storage (SecureStore on mobile, localStorage on web)
- Firebase authentication integration
- CORS configuration for web
- Input validation and sanitization

## 📊 Performance

- Lazy loading of components
- Optimized image assets
- Efficient state management
- Minimal re-renders
- Responsive design for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🔮 Roadmap

- [ ] Advanced AI models integration
- [ ] Real-time collaboration
- [ ] Advanced document templates
- [ ] Mobile app store deployment
- [ ] Enterprise features
- [ ] Multi-language support

---

Built with ❤️ using React Native, Expo, and Django
