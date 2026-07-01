import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "../Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Toaster
        richColors
        position="bottom-right"
        toastOptions={{
          className: "text-sm",
        }}
      />
    </div>
  );
}
