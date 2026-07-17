import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState("fadeIn");

    useEffect(() => {
        if (children !== displayChildren) {
            setTransitionStage("fadeOut");
        }
    }, [children, displayChildren, location]);

    const handleTransitionEnd = () => {
        if (transitionStage === "fadeOut") {
            setDisplayChildren(children);
            setTransitionStage("fadeIn");
        }
    };

    return (
        <div
            onAnimationEnd={handleTransitionEnd}
            className={`page-transition-wrapper ${transitionStage === "fadeIn" ? "anim-page-enter" : "anim-page-exit"}`}
            style={{
                width: '100%',
                minHeight: '100vh',
                position: 'relative'
            }}
        >
            {displayChildren}
        </div>
    );
};

export default PageTransition;
