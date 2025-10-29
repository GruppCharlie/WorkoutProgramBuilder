// Muscle Group Visualizer
class MuscleGroupVisualizer {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.muscleGroups = [];
        this.selectedMuscles = [];
        this.color = options.color || '79,70,229'; // RGB format
        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        
        this.showLoading();
        await this.loadMuscleGroups();
        this.render();
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-neutral-600">Loading muscle groups...</p>
                </div>
            `;
        }
    }

    async loadMuscleGroups() {
        try {
            const response = await fetch('/api/musclegroup/groups');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.muscleGroups = await response.json();
        } catch (error) {
            console.error('Failed to load muscle groups:', error);
            this.showError('Failed to load muscle groups. Please try again later.');
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-600">${message}</p>
                </div>
            `;
        }
    }

    toggleMuscle(muscle) {
        const index = this.selectedMuscles.indexOf(muscle);
        if (index > -1) {
            this.selectedMuscles.splice(index, 1);
        } else {
            this.selectedMuscles.push(muscle);
        }
    }

    async updateImage() {
        const imgContainer = this.container.querySelector('.muscle-image-container');
        if (!imgContainer) return;

        // Show combined selected muscles or base image
        let displayImageUrl;
        if (this.selectedMuscles.length === 0) {
            displayImageUrl = `/api/musclegroup/image?muscleGroups=&color=${encodeURIComponent(this.color)}&transparentBackground=true`;
        } else {
            const muscleGroups = this.selectedMuscles.join(',');
            displayImageUrl = `/api/musclegroup/image?muscleGroups=${encodeURIComponent(muscleGroups)}&color=${encodeURIComponent(this.color)}&transparentBackground=true`;
        }
        
        // Find existing image element
        let img = imgContainer.querySelector('img');
        
        if (!img) {
            // First load - create image element
            imgContainer.innerHTML = `
                <div class="flex justify-center">
                    <img alt="Muscle groups visualization" 
                         class="w-full h-auto mx-auto transition-opacity duration-300"
                         style="opacity: 1; max-width: 500px;"  src="${displayImageUrl}"/>
                </div>
            `;
            img = imgContainer.querySelector('img');
        }
        
        // Preload new image before swapping
        const tempImg = new Image();
        tempImg.onload = () => {
            // Fade out current image
            img.style.opacity = '0';
            
            // After fade out, swap source and fade in
            setTimeout(() => {
                img.src = displayImageUrl;
                img.style.opacity = '1';
            }, 150);
        };
        
        tempImg.onerror = () => {
            console.error('Failed to load muscle image');
        };
        
        // Start preloading
        tempImg.src = displayImageUrl;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Muscle Groups Dropdown -->
                <div>
                    <h3 class="text-xl font-bold mb-1">Select Muscle Groups</h3>
                    
                    <!-- Dropdown Button -->
                    <div class="relative">
                        <button type="button" class="dropdown-toggle w-full px-4 py-3 text-left bg-white border-2 border-neutral-300 rounded-lg hover:border-gray-400 focus:outline-none flex items-center justify-between">
                            <span class="selected-count text-neutral-700">No muscles selected</span>
                            <svg class="w-5 h-5 text-neutral-500 transition-transform"  stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        <!-- Dropdown Menu -->
                        <div class="dropdown-menu hidden absolute z-10 w-full mt-2 bg-white border-2 border-neutral-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                            <div class="p-2">
                                ${this.muscleGroups.map(muscle => `
                                    <label class="flex items-center px-3 py-2 hover:bg-blue-50 rounded cursor-pointer">
                                        <input type="checkbox" 
                                               class="muscle-checkbox w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500" 
                                               value="${muscle}"
                                               ${this.selectedMuscles.includes(muscle) ? 'checked' : ''}>
                                        <span class="ml-3 text-neutral-700">${muscle.replace(/_/g, ' ').toUpperCase()}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Selected Muscles Tags -->
                    <div class="selected-tags mt-4 flex flex-wrap gap-2"></div>
                </div>

                <!-- Image Display -->
                <div>
                    <h3 class="text-xl font-bold mb-1">Muscle Visualization</h3>
                    <div class="muscle-image-container">
                        <div class="flex justify-center">
                            <div class="w-full h-96 bg-neutral-100 rounded-lg flex items-center justify-center">
                                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        void this.updateImage(); // Load base image immediately
    }

    attachEventListeners() {
        const dropdownToggle = this.container.querySelector('.dropdown-toggle');
        const dropdownMenu = this.container.querySelector('.dropdown-menu');
        const checkboxes = this.container.querySelectorAll('.muscle-checkbox');

        // Toggle dropdown
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
            const svg = dropdownToggle.querySelector('svg');
            svg.classList.toggle('rotate-180');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                const svg = dropdownToggle.querySelector('svg');
                svg.classList.remove('rotate-180');
            }
        });

        // Handle checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const muscle = e.target.value;
                this.toggleMuscle(muscle);
                this.updateSelectedDisplay();
                void this.updateImage();
            });
        });

        this.updateSelectedDisplay();
    }

    updateSelectedDisplay() {
        const selectedCount = this.container.querySelector('.selected-count');
        const selectedTags = this.container.querySelector('.selected-tags');
        
        // Update count text
        if (this.selectedMuscles.length === 0) {
            selectedCount.textContent = 'No muscles selected';
        } else if (this.selectedMuscles.length === 1) {
            selectedCount.textContent = '1 muscle selected';
        } else {
            selectedCount.textContent = `${this.selectedMuscles.length} muscles selected`;
        }

        // Update tags
        selectedTags.innerHTML = this.selectedMuscles.map(muscle => `
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                ${muscle.replace(/_/g, ' ').toUpperCase()}
                <button type="button" class="remove-tag hover:text-blue-900" data-muscle="${muscle}">
                    <svg class="w-4 h-4"  stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </span>
        `).join('');

        // Add remove tag listeners
        selectedTags.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const muscle = e.currentTarget.dataset.muscle;
                this.toggleMuscle(muscle);
                
                // Update checkbox
                const checkbox = this.container.querySelector(`input[value="${muscle}"]`);
                if (checkbox) checkbox.checked = false;
                
                this.updateSelectedDisplay();
                void this.updateImage();
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = document.querySelector('[data-muscle-visualizer]');
    if (visualizer) {
        new MuscleGroupVisualizer('[data-muscle-visualizer]');
    }
});
