// import { Outlet } from "react-router-dom";
// import { Toaster } from "sonner";
// import Navbar from "../Navbar";

// export default function RootLayout() {
//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
//       <Navbar />
//       <main>
//         <Outlet />
//       </main>

//       <footer className="border-t border-slate-200 bg-white px-6 py-8 dark:border-slate-800 dark:bg-slate-900">
//         <div className="mx-auto max-w-6xl text-center">
//           <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
//             PrismaLens
//           </p>
//           <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
//             Built with ❤️ by Sakabda Das
//           </p>

//           <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-300">
//             <a
//               href="mailto:sakabda98das@gmail.com"
//               className="hover:text-blue-600 dark:hover:text-blue-400"
//             >
//               📧 sakabda98das@gmail.com
//             </a>
//             <a
//               href="https://github.com/sakabda"
//               target="_blank"
//               rel="noreferrer"
//               className="hover:text-blue-600 dark:hover:text-blue-400"
//             >
//               🐙 GitHub
//             </a>
//             <a
//               href="https://linkedin.com/in/sakabda-das-8a1414139"
//               target="_blank"
//               rel="noreferrer"
//               className="hover:text-blue-600 dark:hover:text-blue-400"
//             >
//               💼 LinkedIn
//             </a>
//             <a
//               href="https://sakabda-das-portfolio.vercel.app"
//               target="_blank"
//               rel="noreferrer"
//               className="hover:text-blue-600 dark:hover:text-blue-400"
//             >
//               🌐 Portfolio
//             </a>
//           </div>

//           <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
//             © 2026 PrismaLens
//           </p>
//         </div>
//       </footer>

//       <Toaster
//         richColors
//         position="bottom-right"
//         toastOptions={{
//           className: "text-sm",
//         }}
//       />
//     </div>
//   );
// }


import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import Navbar from "../Navbar";

export default function RootLayout() {
  return (
    <div
      className="
        flex
        min-h-screen
        flex-col
        bg-slate-50
        text-slate-900
        transition-colors
        duration-200
        dark:bg-slate-950
        dark:text-slate-100
      "
    >
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="
          border-t
          border-slate-200
          bg-white
          dark:bg-slate-900
          dark:border-slate-800
        "
      >
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Logo */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              PrismaLens
            </h2>

            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Built with ❤️ by <strong>Sakabda Das</strong>
            </p>
          </div>

          {/* Links */}
          <div
            className="
              mt-6
              flex
              flex-col
              items-center
              gap-3
              text-sm
              text-slate-600
              dark:text-slate-400
              sm:flex-row
              sm:flex-wrap
              sm:justify-center
              sm:gap-6
            "
          >
            <a
              href="mailto:sakabda98das@gmail.com"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              📧 sakabda98das@gmail.com
            </a>

            <a
              href="https://github.com/sakabda"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              🐙 GitHub
            </a>

            <a
              href="https://linkedin.com/in/sakabda-das-8a1414139"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              💼 LinkedIn
            </a>

            <a
              href="https://sakabda-das-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              🌐 Portfolio
            </a>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} PrismaLens. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
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
