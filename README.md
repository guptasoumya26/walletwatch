# 💰 WalletWatch - Shared Expense Tracker

A beautiful and intuitive expense tracking application designed for Soumyansh and Anu to manage their shared household expenses with ease.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=flat-square&logo=vercel)

## ✨ Features

### 🔐 **Secure Authentication**
- Individual login system for Soumyansh and Anu
- Password hashing with bcrypt
- Security questions for password recovery
- Session management with proper authentication

### 📊 **Smart Expense Management**
- **Monthly Views**: Navigate through months with year display
- **14 Predefined Categories**: Amazon, Rent, Blinkit, Zomato, Bigbasket, Meter recharge, Netflix, Broadband, Car Wash, Gas Cylinder, Swiggy, Maid, Cook, Others
- **Auto-calculations**: Real-time total calculation and balance splitting
- **Equal Sharing**: Automatic calculation of who owes whom
- **Edit Protection**: Users can only edit their own expenses

### 📈 **Visual Analytics**
- **Monthly Trends**: Interactive charts showing expense patterns
- **Balance Overview**: Clear display of expense distribution
- **Responsive Charts**: Beautiful visualizations with Chart.js

### 📝 **Personal Notes**
- Monthly notes section for each user
- Shared space for miscellaneous observations
- Persistent storage across sessions

### 🎨 **Modern UI/UX**
- **Dark/Light Theme**: Seamless theme switching
- **Responsive Design**: Perfect on desktop and mobile
- **Modern Icons**: Lucide React icon library
- **Tailwind CSS**: Clean, professional styling

## 🛠 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React Framework | 15.5.4 |
| **TypeScript** | Type Safety | 5.x |
| **Tailwind CSS** | Styling | 4.x |
| **Supabase** | Database & Auth | Latest |
| **Chart.js** | Data Visualization | 4.5.0 |
| **bcryptjs** | Password Hashing | 3.0.2 |
| **Lucide React** | Icons | 0.544.0 |
| **Vercel** | Deployment | Latest |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Git

### 1. Clone & Install
```bash
git clone <repository-url>
cd walletwatch
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema-fixed.sql` in your Supabase SQL Editor
3. Set up Row Level Security policies
4. Generate password hashes for initial users

### 4. Development
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### 5. Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── expenses/          # Expense CRUD operations
│   │   ├── chart-data/        # Chart data endpoints
│   │   └── notes/             # Notes management
│   ├── dashboard/             # Main dashboard page
│   ├── profile/               # User profile management
│   ├── reset-password/        # Password reset functionality
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Login page
├── components/                # React components
│   ├── Dashboard.tsx          # Main dashboard interface
│   ├── ExpenseForm.tsx        # Add/edit expense form
│   ├── ExpenseList.tsx        # Expense display component
│   ├── ExpenseChart.tsx       # Chart visualization
│   ├── LoginForm.tsx          # User authentication
│   └── ...                    # Other UI components
├── context/                   # React contexts
│   └── AuthContext.tsx        # Authentication state management
└── lib/                       # Utility functions
    ├── auth.ts                # Authentication helpers
    ├── supabase.ts            # Database client configuration
    └── utils.ts               # Common utilities
```

## 🗄️ Database Schema

### Tables
- **users**: User accounts with authentication
- **expenses**: Individual expense records
- **notes**: Monthly notes for each user
- **security_questions**: Password recovery questions
- **password_resets**: Password reset tokens

### Security
- Row Level Security (RLS) enabled
- User-specific data access
- Secure password storage
- Protected API endpoints

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Row Level Security**: Database-level access control
- ✅ **Environment Variables**: Secure credential storage
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **CSRF Protection**: Built-in Next.js security
- ✅ **Type Safety**: Full TypeScript implementation

## 📱 Usage Guide

### Login
1. Select your username (Soumyansh or Anu)
2. Enter your password
3. Access the dashboard

### Managing Expenses
1. **Add**: Click "Add Expense" → Select category → Enter amount → Add description
2. **Edit**: Click edit icon on your own expenses only
3. **Delete**: Remove expenses you created
4. **View Balance**: See automatic calculations showing who owes whom

### Navigation
- **Month Navigation**: Use Previous/Next buttons to browse months
- **Theme Toggle**: Switch between light and dark modes
- **Chart View**: Analyze spending trends over time

### Notes
- Add monthly observations in the notes section
- Both users can contribute to shared notes
- Notes persist across sessions and months

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
npm run build
# Deploy the .next folder to your hosting provider
```

### Environment Variables (Production)
Ensure these are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Testing

```bash
# Lint code
npm run lint

# Build test
npm run build

# Type check
npx tsc --noEmit
```

## 📊 Expense Categories

| Category | Description |
|----------|-------------|
| Amazon | Online shopping |
| Rent | Monthly housing |
| Blinkit | Quick grocery delivery |
| Zomato | Food delivery |
| Bigbasket | Grocery shopping |
| Meter recharge | Electricity/water |
| Netflix | Streaming services |
| Broadband | Internet services |
| Car Wash | Vehicle maintenance |
| Gas Cylinder | Cooking gas |
| Swiggy | Food delivery |
| Maid | Household help |
| Cook | Cooking services |
| Others | Miscellaneous expenses |

## 🤝 Contributing

This is a private project for Soumyansh and Anu. For feature requests or bug reports:
1. Create an issue with detailed description
2. Include steps to reproduce (for bugs)
3. Suggest implementation approach (for features)

## 📄 License

Private Project - All Rights Reserved

---

**Built with ❤️ for efficient expense sharing between Soumyansh and Anu**

*Secure, responsive, and feature-rich expense tracking application.*

🔗 **Live Demo**: [WalletWatch App](https://walletwatch-rose.vercel.app)