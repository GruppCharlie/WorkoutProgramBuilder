/**
 * Filter Helper Utilities
 * Reusable filter and tag functions
 * Create filter tag element
 * {string} value - Filter value
 * {string} type - Filter type (muscle, equipment, etc)
 * {string} label - Display label (optional, defaults to value)
 * returns {HTMLElement} Filter tag element
 */
function createFilterTag(value, type, label = null) {
  const tag = document.createElement("span");
  tag.className =
    "inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primaryText rounded-full text-sm";
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

  // Toggle current dropdown
  dropdown.classList.toggle("hidden");

  // Close other dropdowns
  otherDropdownIds.forEach((id) => {
    const otherDropdown = document.getElementById(id);
    if (otherDropdown) otherDropdown.classList.add("hidden");
  });
}

/**
 * Close all dropdowns when clicking outside
 * {string[]} dropdownIds - IDs of dropdowns to close
 */
let dropdownCloseListenerAdded = false;
function setupDropdownCloseOnClickOutside(dropdownIds) {
  // Only add listener once to avoid multiple listeners
  if (dropdownCloseListenerAdded) return;
  dropdownCloseListenerAdded = true;

  document.addEventListener("click", (e) => {
    // Check if click is outside all dropdowns and their buttons
    const isOutside =
      !e.target.closest('[id$="Btn"]') && !e.target.closest('[id$="Dropdown"]');

    if (isOutside) {
      dropdownIds.forEach((id) => {
        const dropdown = document.getElementById(id);
        if (dropdown) dropdown.classList.add("hidden");
      });
    }
  });
}

/**
 * Initialize workout filters (reusable for any page)
 * {Object} config - Configuration object
 * {string} config.gridId - ID of the workout grid
 * {string} config.emptyIcon - Icon class for empty state
 * {string} config.emptyMessage - Message for empty state
 * {string} config.emptySubtext - Subtext for empty state (optional)
 * returns {Object} - Object with activeFilters and applyFilters function
 */
function initializeWorkoutFilters(config) {
  const { gridId, emptyIcon, emptyMessage, emptySubtext } = config;

  const activeFilters = {
    muscles: [],
    equipment: [],
    sort: "recent",
  };

  const dropdownIds = ["sortDropdown", "musclesDropdown", "equipmentDropdown"];

  // Sort dropdown
  const sortBtn = document.getElementById("sortBtn");
  if (sortBtn) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown("sortDropdown", ["musclesDropdown", "equipmentDropdown"]);
    });
  }

  // Muscles dropdown
  const musclesBtn = document.getElementById("musclesBtn");
  if (musclesBtn) {
    musclesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown("musclesDropdown", ["sortDropdown", "equipmentDropdown"]);
    });
  }

  // Equipment dropdown
  const equipmentBtn = document.getElementById("equipmentBtn");
  if (equipmentBtn) {
    equipmentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown("equipmentDropdown", ["sortDropdown", "musclesDropdown"]);
    });
  }

  // Close dropdowns when clicking outside
  setupDropdownCloseOnClickOutside(dropdownIds);

  // Apply filters function
  function applyFilters() {
    applyWorkoutFilters(
      gridId,
      activeFilters,
      emptyIcon,
      emptyMessage,
      emptySubtext
    );
    updateActiveFilterTags(activeFilters);
  }

  // Sort options
  document.querySelectorAll(".sort-option").forEach((option) => {
    option.addEventListener("click", () => {
      activeFilters.sort = option.dataset.value;
      document.getElementById("sortDropdown")?.classList.add("hidden");
      applyFilters();
    });
  });

  // Muscle checkboxes
  document
    .querySelectorAll(".muscle-checkbox, .muscle-filter")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const muscle = e.target.value;
        if (e.target.checked) {
          activeFilters.muscles.push(muscle);
        } else {
          activeFilters.muscles = activeFilters.muscles.filter(
            (m) => m !== muscle
          );
        }
        applyFilters();
      });
    });

  // Equipment checkboxes
  document
    .querySelectorAll(".equipment-checkbox, .equipment-filter")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const equipment = e.target.value;
        if (e.target.checked) {
          activeFilters.equipment.push(equipment);
        } else {
          activeFilters.equipment = activeFilters.equipment.filter(
            (eq) => eq !== equipment
          );
        }
        applyFilters();
      });
    });

  // Remove filter function (global)
  window.removeFilter = function (type, value) {
    if (type === "muscle") {
      activeFilters.muscles = activeFilters.muscles.filter((m) => m !== value);
      const checkbox = document.querySelector(
        `.muscle-filter[value="${value}"], .muscle-checkbox[value="${value}"]`
      );
      if (checkbox) checkbox.checked = false;
    } else if (type === "equipment") {
      activeFilters.equipment = activeFilters.equipment.filter(
        (e) => e !== value
      );
      const checkbox = document.querySelector(
        `.equipment-filter[value="${value}"], .equipment-checkbox[value="${value}"]`
      );
      if (checkbox) checkbox.checked = false;
    }
    applyFilters();
  };

  return { activeFilters, applyFilters };
}

/**
 * Update active filter tags
 * {Object} activeFilters - Active filters object
 */
function updateActiveFilterTags(activeFilters) {
  const tagsContainer = document.getElementById("activeFilterTags");
  if (!tagsContainer) return;

  tagsContainer.innerHTML = "";

  // Muscle tags
  activeFilters.muscles.forEach((muscle) => {
    const tag = createFilterTag(muscle, "muscle");
    tagsContainer.appendChild(tag);
  });

  // Equipment tags
  activeFilters.equipment.forEach((eq) => {
    const tag = createFilterTag(eq, "equipment");
    tagsContainer.appendChild(tag);
  });
}
