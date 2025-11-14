
/**
 * Shared workout filtering functionality
 * Used by both My Workouts and Favorites pages
 * Apply filters to a workout grid
 * {string} gridId - ID of the grid element
 * {object} filters - Filter object with muscles, equipment, sort
 * {string} emptyIcon - Icon class for empty state (e.g., 'fa-dumbbell' or 'fa-heart')
 * {string} emptyMessage - Message to show when no workouts match
 * {string} emptyLink - Optional link to show in empty state
 */
function applyWorkoutFilters(gridId, filters, emptyIcon = 'fa-dumbbell', emptyMessage = 'No workouts found', emptyLink = null) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const cards = Array.from(grid.querySelectorAll('[data-workout-id]'));
    
    // Filter cards
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
        
        // Show/hide card
        card.style.display = shouldShow ? '' : 'none';
    });
    
    // Sort visible cards
    const visibleCards = cards.filter(card => card.style.display !== 'none');
    
    if (filters.sort === 'a-z') {
        visibleCards.sort((a, b) => {
            const aName = a.querySelector('h4')?.textContent || '';
            const bName = b.querySelector('h4')?.textContent || '';
            return aName.localeCompare(bName);
        });
    } else if (filters.sort === 'favorites') {
        visibleCards.sort((a, b) => {
            const aFavorited = a.querySelector('.fa-heart')?.classList.contains('text-red-500') || false;
            const bFavorited = b.querySelector('.fa-heart')?.classList.contains('text-red-500') || false;
            if (aFavorited && !bFavorited) return -1;
            if (!aFavorited && bFavorited) return 1;
            return 0;
        });
    }
    
    // Apply order using CSS order property
    visibleCards.forEach((card, index) => {
        card.style.order = index;
    });
    
    // Reset order for hidden cards
    cards.filter(card => card.style.display === 'none').forEach(card => {
        card.style.order = 9999;
    });
    
    // Check empty state
    showEmptyStateIfNeeded(grid, visibleCards, filters, emptyIcon, emptyMessage, emptyLink);
}

/**
 * Show empty state if no cards are visible
 */
function showEmptyStateIfNeeded(grid, visibleCards, filters, emptyIcon, emptyMessage, emptyLink) {
    // Remove existing empty state
    const existingEmptyState = grid.querySelector('.empty-state-message');
    if (existingEmptyState) {
        existingEmptyState.remove();
    }
    
    if (visibleCards.length === 0) {
        const hasFilters = filters.muscles.length > 0 || filters.equipment.length > 0;
        const message = hasFilters 
            ? emptyMessage.replace('found', 'match your filters. Try adjusting your selection.')
            : emptyMessage;
        
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-message w-full flex flex-col items-center justify-center text-center py-12';
        emptyState.innerHTML = `
            <div class="max-w-md mx-auto">
                <i class="fas ${emptyIcon} text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">${message}</h3>
                ${!hasFilters && emptyLink ? `
                    <p class="text-sm text-gray-500 mt-4">
                        ${emptyLink}
                    </p>
                ` : ''}
            </div>
        `;
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
                grid.innerHTML = `
                    <div class="w-full flex flex-col items-center justify-center text-center py-12">
                        <div class="max-w-md mx-auto">
                            <i class="fas ${emptyIcon} text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">${emptyMessage}</h3>
                            ${emptyLink ? `
                                <p class="text-sm text-gray-500 mt-4">
                                    ${emptyLink}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                `;
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
