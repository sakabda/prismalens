import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout";
import Home from "../pages/Home";
import Converter from "../pages/Converter";
import History from "../pages/History";
import Snippets from "../pages/Snippets";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/converter", element: <Converter /> },
      { path: "/history", element: <History /> },
      { path: "/snippets", element: <Snippets /> },
    ],
  },
]);
