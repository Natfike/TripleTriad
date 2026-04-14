import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const playMusic = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(() => {});
                window.removeEventListener('click', playMusic);
            }
        };
        window.addEventListener('click', playMusic);
        return () => window.removeEventListener('click', playMusic);
    }, []);

    return (
        <>
            <audio ref={audioRef} src="/assets/music/Shuffle_or_Boogie.mp3" loop />
            <Outlet />
        </>
    );
};

export default MainLayout;