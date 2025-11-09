# Mobiprotect - Family Digital Safety Platform

**URL**: https://lovable.dev/projects/3d12cb41-e670-4967-a72c-f8a0712cfae1

A comprehensive Progressive Web App (PWA) for parental control and family digital safety with modern, futuristic design.

## 🚀 Features

### Core Functionality
- **Device Pairing**: Secure QR code-based pairing between parent and child devices
- **Real-time Monitoring**: Live screen sharing, activity tracking, and location monitoring
- **Smart Controls**: Remote screen lock, app restrictions, and media access management
- **Geofencing**: Create safe zones with custom alerts
- **Family Chat**: Secure real-time messaging between parents and children
- **Weekly Reports**: Automated email summaries of activity and usage
- **Interactive Onboarding**: Step-by-step guided setup for new parents

### Security & Performance
- **Comprehensive Security**: XSS, CSRF, SQL injection protection with security headers
- **Performance Monitoring**: Sentry integration for error tracking and analytics
- **E2E Testing**: Playwright test suite for critical user flows
- **PWA Optimization**: Offline support, code splitting, and caching strategies

## 🛠️ Tech Stack

This project is built with:

- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **React 18+** - UI library
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **Supabase** - Backend as a service
- **Mapbox** - Interactive maps
- **Sentry** - Error tracking
- **Playwright** - E2E testing

## 📦 Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev

# Build for production
npm run build

# Run E2E tests
npx playwright test
```

## 🎨 Design System

The app features a modern, futuristic dark theme with:
- **Primary Color**: Blue (#2563EB) - Trust and security
- **Secondary Color**: Green (#10B981) - Safety and approval
- **Accent Color**: Amber (#F59E0B) - Alerts and warnings
- **Glass morphism effects** with backdrop blur
- **Glow animations** for interactive elements

### Custom CSS Classes
- `.glass-card` - Glassmorphism effect
- `.glow-primary` - Primary color glow
- `.gradient-text` - Gradient text effect
- `.animate-glow` - Animated glow

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SENTRY_DSN=your_sentry_dsn (optional)
```

### Supabase Secrets
Add these in Supabase Dashboard → Settings → Edge Functions:
- `MAPBOX_PUBLIC_TOKEN`
- `RESEND_API_KEY`

## 🧪 Testing

Run E2E tests:
```bash
npx playwright test              # Run all tests
npx playwright test --ui         # Run with UI
npx playwright show-report       # View report
```

## 🚀 Deployment

Simply open [Lovable](https://lovable.dev/projects/3d12cb41-e670-4967-a72c-f8a0712cfae1) and click on Share -> Publish.

## 📞 Support

For issues and questions, visit [Lovable Documentation](https://docs.lovable.dev)

---

Built with ❤️ using React, Supabase, and modern web technologies
