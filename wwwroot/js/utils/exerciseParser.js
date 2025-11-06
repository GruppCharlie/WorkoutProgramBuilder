// Exercise data parsing utilities

/**
 * Parse exercise card element to extract all data
 * {HTMLElement} card - Exercise card element
 * returns {Object} - Parsed exercise data
 */
function parseExerciseCard(card) {
    const nameElement = card.querySelector('h3');
    const allParagraphs = card.querySelectorAll('p');
    const muscleElements = card.querySelectorAll('.bg-primary\\/10');
    
    let equipmentText = '';
    let secondaryText = '';
    
    allParagraphs.forEach(p => {
        const text = p.textContent || '';
        if (text.includes('Equipment:')) {
            equipmentText = text.replace('Equipment:', '').trim().toLowerCase();
        } else if (text.includes('Secondary:')) {
            secondaryText = text.replace('Secondary:', '').trim().toLowerCase();
        }
    });
    
    const muscles = Array.from(muscleElements).map(el => el.textContent.trim().toLowerCase());
    const exerciseName = nameElement?.textContent.trim().toLowerCase() || '';
    
    // Combine all searchable text
    const searchableText = [
        exerciseName,
        equipmentText,
        secondaryText,
        ...muscles
    ].join(' ');
    
    // Check if favorite
    const heartIcon = card.querySelector('button[data-id] i.fa-heart');
    const isFavorite = heartIcon?.classList.contains('text-red-500') || false;
    
    return {
        element: card,
        name: exerciseName,
        equipment: equipmentText,
        muscles: muscles,
        searchableText: searchableText,
        isFavorite: isFavorite
    };
}

/**
 * Parse all exercise cards in a container
 * {string} containerSelector - CSS selector for container
 * returns {Array} - Array of parsed exercise objects
 */
function parseAllExerciseCards(containerSelector = '#exerciseGrid > div') {
    const exerciseCards = document.querySelectorAll(containerSelector);
    return Array.from(exerciseCards).map(parseExerciseCard);
}
