# Project Lighthouse — Frontend

A React single-page application built with Vite. It uses React Router for navigation, Tailwind CSS for styling, Axios for API calls, and includes common utilities like Recharts for charts and Lucide React for icons.

Tech stack
- React 19 + Vite 7
- React Router 7
- Tailwind CSS v4 (via @tailwindcss/vite)
- Axios
- Recharts
- Lucide React
- ESLint 9

Prerequisites
- Node.js 18+ (LTS recommended) and npm 9+

Quick start
1) Configure environment variables (API base URL)
   - The app reads the API base URL from VITE_API_BASE_URL. If not provided, it defaults to http://localhost:5000/api/v1.
   - Create a .env file in the frontend directory with the following content (adjust as needed):

     VITE_API_BASE_URL=http://localhost:5000/api/v1

   Notes
   - Only variables prefixed with VITE_ are exposed to the client at build-time.
   - .env files are read by Vite; see https://vitejs.dev/guide/env-and-mode for modes and naming (.env, .env.local, .env.development, etc.).

2) Install dependencies

   npm install

3) Start the dev server

   npm run dev

   Default URL: http://localhost:5173

4) Build for production

   npm run build

5) Preview the production build locally

   npm run preview

Available scripts
- dev: Start the Vite dev server
- build: Build the app to the dist folder
- preview: Preview the built app locally
- lint: Run ESLint on the project

Environment and configuration
- API base URL
  - Defined in src/api/apiClient.js using Axios and resolved from import.meta.env.VITE_API_BASE_URL.
  - Example: http://localhost:5000/api/v1 (make sure the backend is running and CORS is configured accordingly).
- Tailwind setup
  - Tailwind v4 is enabled via the @tailwindcss/vite plugin in vite.config.js.
  - Tailwind is imported in src/index.css using @import "tailwindcss";

Project structure
- src/
  - api/
    - apiClient.js: Pre-configured Axios instance with baseURL and JSON headers. Intercepts 401 responses and clears localStorage token.
  - components/
    - common/Spinner.jsx: Shared loading spinner.
    - layout/
      - Header.jsx, Sidebar.jsx, MainLayout.jsx: Layout primitives.
  - context/
    - AuthContext.jsx: Authentication state (token, user, isAuthenticated) and actions (login, logout). Fetches profile from /auth/profile on load when a token is present.
  - pages/
    - AddStudentPage.jsx, DashboardPage.jsx, LoginPage.jsx, NotFoundPage.jsx, RegisterPage.jsx, StudentDetailPage.jsx, StudentsListPage.jsx
  - routes/
    - AppRoutes.jsx: Central route definitions.
    - PrivateRoute.jsx: Auth-guarded routes for protected pages.
  - App.jsx: App shell.
  - main.jsx: App bootstrap and provider mounting.
  - index.css: Global styles (Tailwind import).

Authentication flow
- Token storage
  - The JWT is stored in localStorage under the key token upon login.
  - apiClient sets the Authorization: Bearer <token> header when logged in.
- User profile
  - On app load, if a token exists, AuthContext requests /auth/profile to populate the user. If it fails with 401, the token is cleared and the user is logged out.
- Logout behavior
  - Clears token from localStorage and removes Authorization header from apiClient.

Working with the API
- Use the shared Axios instance

  import apiClient from "../api/apiClient";
  const res = await apiClient.get("/students");

- Endpoints are resolved relative to VITE_API_BASE_URL.

Routing
- Define routes in src/routes/AppRoutes.jsx. Guard protected routes with PrivateRoute.jsx when needed.

Styling
- Tailwind utility classes are available globally. Ensure your component styles are applied via className.

Charts and icons
- Recharts is available for data visualization.
- lucide-react provides a wide set of icons.

Build and deployment
- Run npm run build to generate a production build in dist.
- Deploy the contents of dist to your static host (e.g., Netlify, Vercel, S3). As a SPA, the server should rewrite unknown routes to index.html so client-side routing works.

Troubleshooting
- 401 Unauthorized
  - Your token may be missing or expired. Log in again.
  - Ensure the backend /auth/profile endpoint is reachable from the frontend.
- Network errors or CORS issues
  - Verify VITE_API_BASE_URL is correct and the backend allows CORS from the dev server origin (e.g., http://localhost:5173) and your production origin.
- Tailwind not applied
  - Confirm src/index.css includes @import "tailwindcss"; and that vite.config.js includes the Tailwind plugin.
- Router not working after deploy
  - Configure your hosting to rewrite all routes to /index.html (SPA fallback).

Contributing
- Use feature branches and open pull requests.
- Run npm run lint before committing changes.
