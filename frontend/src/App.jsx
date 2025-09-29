import React from 'react';
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;