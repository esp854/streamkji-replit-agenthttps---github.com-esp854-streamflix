# StreamFlix - Movie Streaming Platform

## Overview

StreamFlix is a modern movie streaming platform built with React and Express that allows users to browse, search, and discover movies. The application features a Netflix-inspired dark theme interface with comprehensive movie browsing capabilities, including trending movies, genre-based categorization, detailed movie information, and user favorites management. The platform integrates with The Movie Database (TMDB) API to provide up-to-date movie data and leverages a PostgreSQL database for user data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript and follows a component-based architecture. Key architectural decisions include:

- **UI Framework**: Uses Radix UI components with shadcn/ui for consistent, accessible design components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management, providing caching, synchronization, and background updates
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend is organized into logical folders with clear separation of concerns:
- `/components` for reusable UI components
- `/pages` for route-specific components  
- `/lib` for utility functions and API services
- `/hooks` for custom React hooks
- `/types` for TypeScript type definitions

### Backend Architecture
The server-side application uses Express.js with TypeScript, structured as a REST API:

- **Framework**: Express.js for HTTP server and routing
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints for user favorites, watch history, and preferences management
- **Middleware**: Request logging, JSON parsing, and error handling
- **Development Setup**: Custom Vite integration for seamless full-stack development

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for schema management:

- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema definitions
- **Data Models**: Users, favorites, watch history, and user preferences tables
- **Relationships**: Foreign key constraints ensuring data integrity
- **Type Safety**: Generated TypeScript types from database schema

### Authentication and Authorization
Currently, the application has user data models in place but authentication is not yet fully implemented:

- **User Model**: Username, email, and password fields defined
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (prepared)
- **Future Implementation**: Ready for authentication middleware integration

## External Dependencies

### Third-Party Services
- **The Movie Database (TMDB) API**: Primary source for movie data, images, and metadata
- **Neon Database**: Serverless PostgreSQL hosting for production database needs

### Key NPM Packages
- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI, TanStack Query, Wouter
- **Backend**: Express.js, Drizzle ORM, Neon Database client
- **Development**: Vite, ESBuild for production builds, TypeScript compiler
- **UI Components**: Comprehensive shadcn/ui component library for consistent design

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit-specific development features
- **Error Handling**: Runtime error overlay for development debugging
- **Font Loading**: Google Fonts integration for typography consistency

The application follows modern full-stack development practices with strong TypeScript integration throughout, ensuring type safety from database to UI components.