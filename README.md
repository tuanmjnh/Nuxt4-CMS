# Nuxt 4 CMS

A comprehensive Content Management System built with Nuxt 4, Vue 3, MongoDB, and Nuxt UI.

## Features

- **Content Management**: Full CRUD for posts, categories, and tags.
- **Media Library**: Cloudinary integration for image and file management.
- **Menu System**: Dynamic, tree-based menu builder with drag-and-drop.
- **Authentication**: Secure JWT-based auth with role-based access control.
- **SEO Optimized**: Built-in SEO best practices, meta tags, and structured data.
- **Modern UI**: Clean, responsive interface built with Nuxt UI and Tailwind CSS.

## Tech Stack

- **Framework**: Nuxt 4.2.1
- **UI Library**: Nuxt UI 4.2.1
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (jsonwebtoken, bcrypt)
- **Media**: Cloudinary
- **Icons**: Iconify (Lucide)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Nuxt4-CMS
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   Required variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

4. **Seed the Database**
   Create the initial admin account and sample data:
   ```bash
   node server/scripts/seed.js
   ```
   Default Admin: `admin@nuxt4cms.com` / `Admin@123456`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Deployment

This project is optimized for deployment on Vercel.

1. Push your code to GitHub/GitLab.
2. Import the project in Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Deploy!

## License

MIT
