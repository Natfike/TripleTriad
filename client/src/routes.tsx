import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Gallery from "./pages/Gallery";
import Auth from "./pages/Auth";
import Deck from "./pages/Deck";
import DailyPull from "./pages/DailyPull";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/gallery",
        element: <Gallery />,
    },
    {
        path: "/authentification",
        element: <Auth />,
    },
    {
        path: "/deck",
        element: <Deck />,
    },
    {
        path: "/dailyPull",
        element: <DailyPull />,
    }
])