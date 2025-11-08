import React, { useState, useEffect, Suspense, lazy } from "react";

// Lazy load the components for code splitting
const HomeMobile = lazy(() => import('./Home-Mobile'));
const HomePC = lazy(() => import('./Home-PC'));

// Loading component for Suspense
const Loader: React.FC = () => (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
    </div>
);

// Custom hook to check window size
const useIsDesktop = (breakpoint = 1024) => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= breakpoint);
        };

        window.addEventListener('resize', handleResize);
        // Cleanup listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isDesktop;
};

const Home: React.FC = () => {
    const isDesktop = useIsDesktop();

    return (
        <Suspense fallback={<Loader />}>
            {isDesktop ? <HomePC /> : <HomeMobile />}
        </Suspense>
    );
};

export default Home;