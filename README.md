# RimMed - Patient Turn & Queue Management System

A comprehensive Patient Turn & Queue Management System designed specifically for clinics in Morocco. RimMed solves waiting room chaos by managing a live queue controlled by the receptionist.

## 🎯 Product Principles

### Secretary-proof UX
- Every action is 1 click
- Big buttons for easy interaction
- Zero complex forms

### Queue-first, not schedule-first
- Time is uncertain in real clinic environments
- System manages TURN ORDER and statuses
- "Scheduled time" is optional metadata

### Human control
- Receptionist always has final control
- Support for reordering, urgent insertions, and skipping

### WhatsApp is optional
- System works without WhatsApp
- WhatsApp notifications are a modular add-on

### Scalable ecosystem
- Clean path for future modules (invoicing, mini CRM, facturación)

## 🏗️ Tech Stack

### Core Framework
- **Next.js 15** with App Router
- **TypeScript 5** for type safety

### Frontend
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library (New York style)
- **Lucide React** for icons
- **Framer Motion** for animations

### Backend & Database
- **Prisma ORM** with SQLite
- **React Query (TanStack Query)** for data fetching
- **Zustand** for client state management

### Additional Features
- **date-fns** for date manipulation
- **NextAuth.js** ready for authentication
- **Real-time updates** with polling (ready for Supabase Realtime)

## 📋 Features

### Core Queue Management
- ✅ Live queue display with real-time updates
- ✅ One-click patient actions (Check-in, Call, Start, Done, Cancel, Skip)
- ✅ Urgent patient support with priority handling
- ✅ Queue statistics and overview
- ✅ Patient search and quick turn creation

### Multi-Tenancy
- ✅ Clinic-based data isolation
- ✅ Role-based access control (Admin, Doctor, Receptionist)
- ✅ User profile management

### Patient Management
- ✅ Patient registration and search
- ✅ Phone number as primary identifier
- ✅ Patient history tracking

### Future-Ready Architecture
- ✅ Notification events table for WhatsApp/SMS integration
- ✅ Service type and pricing for future invoicing
- ✅ Audit logging for compliance
- ✅ Scalable data model

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- SQLite

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd rimmed
   bun install
   ```

2. **Set up the database**
   ```bash
   bun run db:push
   bun run db:generate
   bun run db:seed
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
The system auto-logs in as admin for demo purposes. Available users:
- **Admin**: admin@rimmed.ma / demo123
- **Receptionist**: reception@rimmed.ma / demo123
- **Doctor**: doctor@rimmed.ma / demo123

## 📊 Database Schema

### Core Tables

#### `clinics`
Multi-tenant clinic management with timezone support.

#### `profiles`
User profiles linked to auth system with role-based access.

#### `patients`
Patient records with phone number as primary identifier.

#### `turns`
The core queue/turn engine with:
- Queue positioning
- Status tracking (SCHEDULED, WAITING, NEXT, IN_CONSULTATION, DONE, CANCELLED, SKIPPED)
- Urgency flags
- Service metadata for future invoicing

#### `notification_events`
Prepared for WhatsApp/SMS integration with:
- Event types
- Channel support
- Payload management
- Status tracking

#### `audit_log`
Comprehensive audit trail for compliance.

## 🎨 UI/UX Design

### Design Standards
- **Mobile-first responsive design**
- **Semantic HTML5** for accessibility
- **ARIA support** for screen readers
- **High contrast** for readability
- **Touch-friendly** 44px minimum targets

### Color System
- **Green**: Waiting patients
- **Blue**: In consultation
- **Gray**: Completed
- **Red**: Cancelled/Urgent
- **Orange**: Skipped

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── queue/             # Queue management components
│   └── providers/         # React providers
├── hooks/                 # React Query hooks
├── lib/
│   ├── types/             # TypeScript definitions
│   ├── services.ts        # Database service layer
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Utility functions
└── prisma/               # Database schema and migrations
```

### Available Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run db:push` - Push schema to database
- `bun run db:generate` - Generate Prisma client
- `bun run db:seed` - Seed demo data

## 🔄 Real-time Updates

The system currently uses polling for real-time updates:
- Queue updates: 30 seconds
- Statistics: 15 seconds
- Next patient: 10 seconds

Ready for Supabase Realtime integration when needed.

## 📱 Future Modules

### WhatsApp Integration
- Patient notifications for queue status
- "You are next" messages
- Appointment reminders

### Invoicing (RimFlow)
- Service-based billing
- Invoice generation
- Payment tracking

### Advanced Features
- Multi-doctor support
- Advanced scheduling
- Analytics and reporting
- Mobile apps

## 🌍 Morocco-Specific Features

### Localization
- **Timezone**: Africa/Casablanca
- **Phone formats**: Moroccan mobile numbers
- **Language**: Ready for Arabic/French localization

### Clinic Reality Support
- Walk-in patient management
- Urgent case prioritization
- Flexible queue ordering
- Doctor delay handling

## 🔐 Security

### Data Isolation
- Row-level security ready
- Clinic-based data separation
- Role-based access control

### Authentication
- NextAuth.js integration ready
- Multi-provider support
- Session management

## 📈 Performance

### Optimizations
- React Query for efficient data fetching
- Optimistic UI updates
- Lazy loading with scroll areas
- Component memoization

### Monitoring
- Built-in React Query DevTools
- Performance tracking ready
- Error boundary handling

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
- Create an issue in the repository
- Contact the development team

---

**RimMed** - Transforming clinic queue management in Morocco, one patient at a time.