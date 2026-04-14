import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Gallery from "./pages/Gallery";
import Auth from "./pages/Auth";
import Deck from "./pages/Deck";
import DailyPull from "./pages/DailyPull";
import Play from "./pages/Play";
import Game from "./pages/Game";
import Replay from "./pages/ReplaySelection";
import ReplayViewer from "./pages/ReplayViewer";
import NotFound from "./pages/NotFound";
import MainLayout from "./MainLayout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
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
            },
            {
                path: "/play",
                element: <Play />,
            },
            {
                path: "/game",
                element: <Game />,
            },
            {
                path: "/replay",
                element: <Replay />,
            },
            {
                path: "/replay/:gameId",
                element: <ReplayViewer />,
            },
            {
                path: "*",
                element: <NotFound />,
            }
        ],
    },
])