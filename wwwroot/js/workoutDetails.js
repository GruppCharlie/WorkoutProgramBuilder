/**
 * Workout Details Page - Exercise Slider with Pagination Dots
 */

/**
 * Scroll to specific exercise card
 */
function scrollToExercise(index) {
    const slider = document.getElementById('exerciseSlider');
    const cards = slider.querySelectorAll('.flex-none');
    const card = cards[index];
    
    if (card) {
        const cardLeft = card.offsetLeft;
        const sliderWidth = slider.offsetWidth;
        const cardWidth = card.offsetWidth;
        const scrollPosition = cardLeft - (sliderWidth / 2) + (cardWidth / 2);
        
        slider.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Initialize exercise slider pagination dots
 */
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('exerciseSlider');
    const dots = document.querySelectorAll('.exercise-dot');
    
    if (!slider || !dots.length) return;
    
    /**
     * Update active dot based on most visible card
     */
    function updateActiveDot() {
        const cards = slider.querySelectorAll('.flex-none');
        const scrollLeft = slider.scrollLeft;
        const scrollRight = scrollLeft + slider.offsetWidth;
        
        let mostVisibleIndex = 0;
        let maxVisibleArea = 0;
        
        cards.forEach((card, index) => {
            const cardLeft = card.offsetLeft;
            const cardRight = cardLeft + card.offsetWidth;
            
            // Calculate visible area of this card
            const visibleLeft = Math.max(scrollLeft, cardLeft);
            const visibleRight = Math.min(scrollRight, cardRight);
            const visibleArea = Math.max(0, visibleRight - visibleLeft);
            
            if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                mostVisibleIndex = index;
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            if (index === mostVisibleIndex) {
                dot.classList.remove('bg-gray-300', 'w-2');
                dot.classList.add('bg-primary', 'w-8');
            } else {
                dot.classList.remove('bg-primary', 'w-8');
                dot.classList.add('bg-gray-300', 'w-2');
            }
        });
    }
    
    slider.addEventListener('scroll', updateActiveDot);
    updateActiveDot(); // Initial update
});
