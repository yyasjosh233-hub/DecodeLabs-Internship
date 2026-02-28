document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.scroll-container');
    const imgEducational = document.getElementById('img-educational');
    const imgIndustrial = document.getElementById('img-industrial');
    const scrollTitle = document.getElementById('scroll-title');

    window.addEventListener('scroll', () => {
        const rect = container.getBoundingClientRect();
        const scrollStart = container.offsetTop;
        const scrollRange = container.offsetHeight - window.innerHeight;

        // Calculate progress (0 to 1) based on container's scroll position
        let progress = (window.scrollY - scrollStart) / scrollRange;
        progress = Math.max(0, Math.min(1, progress));

        // Animation for Educational Image (Shrink to top-left corner)
        // Starts at 80% width/70% height centered
        const targetScale = 0.3;
        const scale = 1 - (progress * (1 - targetScale));
        const moveX = progress * -40; // Move left
        const moveY = progress * -35; // Move up

        imgEducational.style.transform = `translate(${moveX}vw, ${moveY}vh) scale(${scale})`;
        imgEducational.style.borderRadius = `${20 + progress * 30}px`;
        imgEducational.style.opacity = 1 - (progress * 0.5);

        // Animation for Industrial Image (Expand to full screen)
        // Starts at 1.2 scale, 0 opacity
        const industrialScale = 1.2 - (progress * 0.2);
        imgIndustrial.style.opacity = progress * 1.5; // Fades in quickly
        imgIndustrial.style.transform = `scale(${industrialScale})`;

        // Animation for Text
        scrollTitle.style.opacity = 1 - (progress * 2);
        scrollTitle.style.transform = `translateY(${progress * -50}px)`;
    });
});
