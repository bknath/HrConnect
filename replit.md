# Overview

HRConnect is a comprehensive Human Resources Management System (HRMS) built with a modern full-stack architecture. The application provides essential HR functionality including employee management, attendance tracking, leave management, department organization, and reporting capabilities. It features a clean, responsive interface designed for HR professionals to efficiently manage workforce operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript, leveraging modern development patterns and libraries:

- **UI Framework**: React 18 with TypeScript for type safety and component-based architecture
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent, accessible UI elements
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server-side follows a RESTful API design with Express.js:

- **Runtime**: Node.js with TypeScript for type safety across the stack
- **Framework**: Express.js for HTTP server and middleware handling
- **API Design**: RESTful endpoints with proper HTTP status codes and JSON responses
- **Data Storage**: In-memory storage implementation with interface-based architecture for easy database integration
- **Validation**: Zod schemas shared between client and server for consistent data validation
- **Development**: Hot module replacement and development middleware integration

## Data Storage Solutions
The application uses a flexible storage architecture:

- **Current Implementation**: In-memory storage using Maps for development and testing
- **Database Ready**: Drizzle ORM configured for PostgreSQL with Neon Database serverless integration
- **Schema Management**: Centralized schema definitions in TypeScript with automatic validation
- **Migration Support**: Drizzle Kit for database schema migrations and management

## Authentication and Authorization
The architecture includes session-based authentication patterns:

- **Session Storage**: PostgreSQL session store integration with connect-pg-simple
- **Security**: Request logging and error handling middleware for monitoring and debugging

## External Dependencies
The system integrates with several key external services and libraries:

- **Database**: Neon Database (PostgreSQL serverless) for production data persistence
- **Development Tools**: Replit-specific plugins for development environment integration
- **UI Components**: Comprehensive Radix UI ecosystem for accessible, unstyled primitives
- **Styling**: Google Fonts integration for typography (Inter, DM Sans, Fira Code, Geist Mono)
- **Validation**: Zod for runtime type validation and schema management
- **Date Handling**: date-fns for date manipulation and formatting utilities