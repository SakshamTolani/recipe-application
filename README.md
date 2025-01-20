# 🍳 Recipe Application 

A full-stack web application for managing recipes, discovering ingredients, and sharing culinary experiences!

## 🌟 Features

- 📱 Modern, responsive React frontend
- 🔍 Intelligent ingredient detection from images
- 💾 Save favorite recipes
- 🏷️ Filter recipes by dietary preferences
- ⏲️ Advanced recipe filtering (cooking time, difficulty)
- 👤 User preferences management
- 🔄 Real-time recipe search
- 📸 Image upload functionality

## 🏗️ Tech Stack

### Frontend
- ⚛️ React 
- 🎨 Chakra UI for styling
- 🛣️ React Router for navigation
- 🔄 Context API for state management
- 📡 Axios for API communication

### Backend
- 🐍 Django
- 🔧 Django REST Framework
- 🔐 JWT Authentication
- 📊 SQLite Database
- 🤖 Google Gemini AI Integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- pip
- Virtual environment

### Backend Setup
1. Navigate to the backend directory:
```bash
cd recipe_application
```

2. Create and activate virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp recipe_application/.env.example recipe_application/.env
# Add your GEMINI_API_KEY to .env
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the server:

```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
```bash
cp .env.example .env
```
4. Start the development server:
```bash
npm start
```

## 📱 Usage
1. 🏠 Visit the homepage to start exploring recipes
2. 📝 Input ingredients manually or use image detection
3. ⚙️ Set dietary preferences in user settings
4. 💖 Save your favorite recipes
5. 🔍 Use filters to find specific recipes
6. 📸 Upload images for ingredient detection

## 🔒 API Endpoints

### Recipe Endpoints
- GET /api/recipes/ - List all recipes
- GET /api/recipes/{id}/ - Get specific recipe
- POST /api/recipes/ - Create new recipe
- POST /api/ingredients/scan_image/ - Detect ingredients from image

### User Endpoints
- POST /api/preferences/ - Save user preferences
- GET /api/ingredients/ - Search ingredients

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Create React App for the frontend boilerplate
- Django community for the excellent backend framework
- Chakra UI for the beautiful components
- All contributors and users of this application

## 📫 Contact
For any queries or suggestions, please open an issue in the repository.

Made with ❤️ by Saksham Tolani





