# 📚 Bookaholic - University Library Management System

A modern, full-stack university library management platform built with Next.js 15, featuring ML-powered book recommendations, QR code authentication, and comprehensive admin tools.

![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)

## 🚀 Features

### 📖 Core Library Management

- **Book Catalog**: Comprehensive book management with metadata, covers, and availability tracking
- **Advanced Search & Filtering**: Multi-criteria search by title, author, genre, and availability
- **Borrowing System**: Shopping cart-style book borrowing with due date management
- **Book Requests**: Users can request new books for library acquisition
- **Favorites System**: Personal book collections and wishlist functionality

### 🤖 AI-Powered Recommendations

- **Machine Learning Engine**: TF-IDF vectorization with cosine similarity for semantic book matching
- **Hybrid Recommendation System**: ML-based recommendations with TypeScript fallback
- **Genre Relationship Mapping**: Intelligent genre correlation for better suggestions
- **Python API Integration**: Dedicated Flask API for ML computations

### 🔐 Advanced Authentication

- **Multi-Method Login**: Traditional email/password and innovative QR code authentication
- **QR Code Login**: Mobile-friendly authentication with real-time polling
- **Role-Based Access Control**: USER and ADMIN roles with granular permissions
- **Account Approval System**: Admin approval workflow for new registrations
- **Session Management**: JWT-based sessions with Redis caching

### 👨‍💼 Administrative Dashboard

- **User Management**: Approve/reject user accounts and monitor activity
- **Book Management**: Add, edit, and remove books with bulk operations
- **Analytics Dashboard**: Real-time statistics and activity monitoring
- **Request Management**: Handle book addition requests from users
- **Activity Logging**: Comprehensive audit trail of system activities

### 📧 Communication & Automation

- **Email Workflows**: Automated welcome emails and return reminders
- **Background Jobs**: QStash-powered workflow automation
- **Notification System**: Toast notifications and email alerts
- **Reminder System**: Automated book return reminders

### 🎨 Modern User Experience

- **Responsive Design**: Mobile-first approach with adaptive layouts
- **3D Card Effects**: Interactive book cards with depth and hover animations
- **Dark Mode Support**: Theme switching with system preference detection
- **Progressive Loading**: Optimized loading states and skeleton screens
- **Accessibility**: ARIA labels and keyboard navigation support

## 🛠 Tech Stack

### **Frontend**

- **Framework**: Next.js 15.1.5 with App Router
- **UI Library**: React 19.0.0 with TypeScript 5.0
- **Styling**: TailwindCSS 3.4.1 with custom components
- **Component Library**: Radix UI primitives
- **Animations**: Framer Motion 12.6.3
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### **Backend**

- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL (Neon) with Drizzle ORM 0.41.0
- **Authentication**: NextAuth.js v5.0.0-beta.25
- **File Storage**: ImageKit for media management
- **Email Service**: Resend for transactional emails
- **Background Jobs**: Upstash QStash workflows

### **Machine Learning**

- **ML API**: Python Flask with scikit-learn
- **Vectorization**: TF-IDF for text analysis
- **Similarity**: Cosine similarity for recommendations
- **Deployment**: Railway for Python API hosting
- **Model Storage**: Pickle serialization

### **Infrastructure**

- **Deployment**: Vercel (Frontend) + Railway (ML API)
- **Database**: Neon PostgreSQL with connection pooling
- **CDN**: ImageKit for optimized media delivery
- **Caching**: Upstash Redis for rate limiting and sessions
- **Monitoring**: Built-in analytics and logging

## 📦 Installation

### Prerequisites

- Node.js 18+
- Python 3.8+ (for ML features)
- PostgreSQL database
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/univeristy-library-webapp.git
cd univeristy-library-webapp
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for ML API)
cd python-api
pip install -r requirements.txt
cd ..
```

### 3. Database Setup

```bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run seed
```

### 4. Start Development

```bash
# Start Next.js app
npm run dev

# Start Python ML API (optional, in separate terminal)
cd python-api
python app.py
```

## 🔧 Configuration

### Database Schema

The application uses Drizzle ORM with the following main tables:

- `users` - User accounts and authentication
- `books` - Book catalog and metadata
- `borrow_records` - Borrowing history and status
- `favorite_books` - User favorites
- `book_requests` - User book requests
- `qr_login_sessions` - QR authentication sessions

### ML Model Setup

1. Train your model using the provided Google Colab notebook
2. Export model files: `tfidf_vectorizer.pkl`, `genre_relationships.pkl`
3. Place files in `python-api/models/` directory
4. Start the Python API for ML-powered recommendations

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### ML API (Railway)

1. Connect `python-api/` directory to Railway
2. Set Python environment variables
3. Deploy using Railway's automatic deployment

### Database (Neon)

1. Create a Neon PostgreSQL database
2. Run migrations in production
3. Update `DATABASE_URL` in environment variables

## 📱 Usage

### For Students

1. **Registration**: Sign up with university credentials
2. **Browse Books**: Search and filter available books
3. **Borrow Books**: Add books to cart and borrow
4. **Get Recommendations**: Discover books based on preferences
5. **Request Books**: Request new books for the library

### For Administrators

1. **User Management**: Approve/reject user registrations
2. **Book Management**: Add, edit, and remove books
3. **Monitor Activity**: View system analytics and logs
4. **Handle Requests**: Process book addition requests

### QR Code Login

1. Click "QR Code Login" on sign-in page
2. Enter your email address
3. Scan QR code with mobile device
4. Confirm login on mobile
5. Automatic sign-in on desktop

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/qr-code` - Generate QR login code

### Book Management

- `GET /api/books` - Get all books
- `POST /api/books` - Create new book (admin)
- `GET /api/books/[id]` - Get specific book
- `PUT /api/books/[id]` - Update book (admin)

### ML Recommendations

- `GET /api/ml-recommendations/[bookId]` - Get ML recommendations
- `GET /api/recommendations/[bookId]` - Get fallback recommendations

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/admin/users` - Get all users (admin)

## 🐛 Known Issues

- ML API may timeout on first request (cold start)
- QR code login requires stable internet connection
- File uploads limited to 10MB per file

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Neon for managed PostgreSQL
- ImageKit for media management
- Upstash for Redis and background jobs
- All contributors and beta testers
