# Meowmery Webapp – High-Level Implementation Guide

This guide provides a structured approach to developing the **Meowmery** web application, enabling users to commemorate their beloved cats by sharing stories and photos. The application will be built using Next.js, Supabase, and Vercel, ensuring a seamless and efficient development process.

---

## 1. Outline & Tech References

### **Technologies**

- **Frontend Framework**: [Next.js](https://nextjs.org/) (Latest version with the `/app` directory)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting & Deployment**: [Vercel](https://vercel.com/)
- **Containerization**: [Docker](https://www.docker.com/)

---

## 2. Current Folder Structure
this is the folder structure of the project so far
```

├── README.md
├── app
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── eslint.config.mjs
├── instructions.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. Pages Overview

1. **Home Page** - Displays recent and top Meowmery posts, with search options.
2. **Sign-In Page** - Allows users to log into their accounts.
3. **Sign-Up Page** - Enables users to create accounts.
4. **Dashboard Page** - Personalized view of user posts and settings.
5. **Create Meowmery Post Page** - Users can upload images, write stories, and add tags.
6. **View Meowmery Post Page** - Displays individual posts with images, stories, and comments.
7. **Edit Meowmery Post Page** - Allows users to edit their posts.
8. **User Profile Page** - Displays user details and their posted Meowmery entries.
9. **Search Results Page** - Shows posts filtered by cat name or location.
10. **Tag Results Page** - Displays posts grouped by specific tags.
11. **Comment Section** - Embedded within posts for users to leave condolences.
12. **External Sharing Confirmation Page** - Confirms successful sharing of a post.
13. **Error Page** - Displays error messages for missing pages or server issues.

---

## 4. Database Schema (Supabase)

```sql
-- Users table extending Supabase Auth users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Meowmery posts table
create table public.meowmery_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  story text,
  location text,
  created_at timestamp with time zone default now()
);

-- Media associated with Meowmery posts
create table public.media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.meowmery_posts(id) on delete cascade,
  url text not null,
  type text check (type in ('image', 'gif', 'video')),
  created_at timestamp with time zone default now()
);
```

---

## 5. Implementation Steps

### **5.1. Setup & Dependencies**

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest meowmery --typescript --use-npm
   cd meowmery
   ```
2. **Install Required Packages**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs tailwindcss postcss autoprefixer shadcn/ui
   ```
3. **Configure Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```
   Update `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
     theme: { extend: {} },
     plugins: [],
   };
   ```

---

## 6. Deployment & Scaling

- **Deployment**: Hosted on Vercel with automated CI/CD.
- **Database Management**: Supabase handles authentication and data storage.
- **Scalability**:
  - Supabase auto-scales with PostgreSQL.
  - Next.js supports static & dynamic rendering.
- **Security Considerations**:
  - Implement role-based access control (RLS in Supabase).
  - Protect API keys and sensitive data.

---

This implementation guide ensures a streamlined and efficient development process for Meowmery. Let me know if any modifications or refinements are needed!

