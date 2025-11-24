/**
 * Apply filters and sorting to a workout grid
 * {string} gridId - ID of the grid element
 * {object} filters - Filter object with muscles, equipment, sort
 * {string} emptyIcon - Icon class for empty state
 * {string} emptyMessage - Message to show when no workouts match
 * {string} emptyLink - Optional link to show in empty state
 * {string} filterEmptyText - Text to append when filters are active
 */
function applyWorkoutFilters(gridId, filters, emptyIcon = 'fa-dumbbell', emptyMessage = 'No workouts found', emptyLink = null, filterEmptyText = 'match your filters. Try adjusting your selection.') {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const cards = Array.from(grid.querySelectorAll('[data-workout-id]'));
    
    // If no cards exist at all, don't show filter empty state
    if (cards.length === 0) return;
    
    // Save original order on first run (using data attribute)
    cards.forEach((card, index) => {
        if (!card.dataset.originalOrder) {
            card.dataset.originalOrder = index.toString();
        }
    });
    
    // First, apply visibility filters
    cards.forEach(card => {
        let shouldShow = true;
        
        // Filter by muscles
        if (filters.muscles.length > 0) {
            const cardMuscles = (card.getAttribute('data-workout-muscles') || '')
                .split(',')
                .map(m => m.trim().toLowerCase())
                .filter(m => m.length > 0);
            
            shouldShow = filters.muscles.some(filterMuscle => 
                cardMuscles.some(cardMuscle => 
                    cardMuscle.includes(filterMuscle.toLowerCase()) || 
                    filterMuscle.toLowerCase().includes(cardMuscle)
                )
            );
        }
        
        // Filter by equipment
        if (shouldShow && filters.equipment.length > 0) {
            const cardEquipment = (card.getAttribute('data-workout-equipment') || '')
                .split(',')
                .map(e => e.trim().toLowerCase())
                .filter(e => e.length > 0);
            
            shouldShow = filters.equipment.some(filterEq => 
                cardEquipment.some(cardEq => 
                    cardEq.includes(filterEq.toLowerCase()) || 
                    filterEq.toLowerCase().includes(cardEq)
                )
            );
        }
        
        // Apply visibility immediately
        card.style.display = shouldShow ? '' : 'none';
    });
    
    // Sort cards based on selected option
    const cardSortData = cards.map(card => ({
        card,
        sortValue: getSortValue(card, filters.sort)
    }));
    
    cardSortData.sort((a, b) => {
        if (filters.sort === 'a-z') {
            return a.sortValue.localeCompare(b.sortValue, undefined, { sensitivity: 'base' });
        }
        return a.sortValue - b.sortValue;
    });
    
    // Apply CSS order property to reorder cards visually
    cardSortData.forEach((item, index) => {
        item.card.style.order = index.toString();
    });
    
    // Get visible cards for empty state check
    const visibleCards = cards.filter(card => card.style.display !== 'none');
    
    // Check empty state
    showEmptyStateIfNeeded(grid, visibleCards, filters, emptyIcon, emptyMessage, emptyLink, filterEmptyText);
}

/**
 * Show empty state if no cards are visible
 */
function showEmptyStateIfNeeded(grid, visibleCards, filters, emptyIcon, emptyMessage, emptyLink, filterEmptyText) {
    // Remove existing empty state
    const existingEmptyState = grid.querySelector('.empty-state-message');
    if (existingEmptyState) {
        existingEmptyState.remove();
    }
    
    if (visibleCards.length === 0) {
        const hasFilters = filters.muscles.length > 0 || filters.equipment.length > 0;
        const message = hasFilters 
            ? emptyMessage.replace('found', filterEmptyText)
            : emptyMessage;
        
        const description = !hasFilters && emptyLink ? emptyLink : null;
        
        const emptyState = createEmptyState({
            icon: emptyIcon,
            title: message,
            description: description,
            className: 'w-full py-12'
        });
        
        grid.appendChild(emptyState);
    }
}

/**
 * Remove card with fade out animation
 */
function removeCardWithAnimation(workoutId, gridId, emptyIcon, emptyMessage, emptyLink) {
    const card = document.querySelector(`[data-workout-id="${workoutId}"]`);
    if (card) {
        // Fade out animation
        card.style.transition = 'opacity 0.3s ease-out';
        card.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
            card.remove();
            
            // Check if grid is now empty
            const grid = document.getElementById(gridId);
            const remainingCards = grid?.querySelectorAll('[data-workout-id]');
            
            if (!remainingCards || remainingCards.length === 0) {
                // Show empty state
                grid.innerHTML = '';
                const emptyState = createEmptyState({
                    icon: emptyIcon,
                    title: emptyMessage,
                    description: emptyLink,
                    className: 'w-full py-12'
                });
                grid.appendChild(emptyState);
            }
        }, 300);
    }
}

/**
 * Update checkmark icon (for "Remove from My Workouts")
 */
function updateCheckmarkIcon(workoutId) {
    const card = document.querySelector(`[data-workout-id="${workoutId}"]`);
    if (card) {
        const addButton = card.querySelector('.add-to-my-workouts-btn');
        if (addButton) {
            const icon = addButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                addButton.classList.remove('text-green-500');
                addButton.classList.add('text-gray-400', 'hover:text-primary');
                addButton.title = 'Add to My Workouts';
            }
        }
    }
}
