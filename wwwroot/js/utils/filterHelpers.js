/**
 * Filter Helper Utilities
 * Reusable filter and tag functions
 */

/**
 * Create filter tag element
 * {string} value - Filter value
 * {string} type - Filter type (muscle, equipment, etc)
 * {string} label - Display label (optional, defaults to value)
 * returns {HTMLElement} Filter tag element
 */
function createFilterTag(value, type, label = null) {
    const tag = document.createElement('span');
    tag.className = 'inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm';
    tag.innerHTML = `
        ${label || value}
        <button onclick="removeFilter('${type}', '${value}')" class="hover:text-primary-dark">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    return tag;
}

/**
 * Toggle dropdown visibility
 * {string} dropdownId - ID of dropdown to toggle
 * {string[]} otherDropdownIds - IDs of other dropdowns to close
 */
function toggleDropdown(dropdownId, otherDropdownIds = []) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    // Close other dropdowns
    otherDropdownIds.forEach(id => {
        const other = document.getElementById(id);
        if (other) other.classList.add('hidden');
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('hidden');
}

/**
 * Close all dropdowns when clicking outside
 * {string[]} dropdownIds - IDs of dropdowns to close
 */
function setupDropdownCloseOnClickOutside(dropdownIds) {
    document.addEventListener('click', (e) => {
        // Check if click is outside all dropdowns and their buttons
        const isOutside = !e.target.closest('[id$="Btn"]') && !e.target.closest('[id$="Dropdown"]');
        
        if (isOutside) {
            dropdownIds.forEach(id => {
                const dropdown = document.getElementById(id);
                if (dropdown) dropdown.classList.add('hidden');
            });
        }
    });
}
