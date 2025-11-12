document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const menuToggle = document.getElementById("menu-toggle");
    const bars = menuToggle.querySelectorAll("span");
    const body = document.body;

    const openMenu = () => {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
        overlay.classList.add("opacity-100");
        body.classList.add("overflow-hidden");

        menuToggle.classList.add("open");
        bars[0].classList.add("rotate-45", "translate-y-2.5");
        bars[1].classList.add("opacity-0");
        bars[2].classList.add("-rotate-45", "-translate-y-2");
    };

    const closeMenu = () => {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
        overlay.classList.remove("opacity-100");
        body.classList.remove("overflow-hidden");

        menuToggle.classList.remove("open");
        bars[0].classList.remove("rotate-45", "translate-y-2.5");
        bars[1].classList.remove("opacity-0");
        bars[2].classList.remove("-rotate-45", "-translate-y-2");
    };

    menuToggle.addEventListener("click", () => {
        menuToggle.classList.contains("open") ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);

    const input = document.querySelector('#navbar-search');
    if (!input) return;

    const searchUrl = input.dataset.searchUrl || '/search';

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = input.value.trim();
            if (query.length > 0) {
                window.location.href = `${searchUrl}?query=${encodeURIComponent(query)}`;
            }
        }
    });
    
    (function () {
        var langToggle = document.getElementById('lang-toggle');
        var langMenu = document.getElementById('lang-menu');

        if (!langToggle || !langMenu) return;


        function openLangMenu() {
            langMenu.classList.remove('hidden');
            langToggle.setAttribute('aria-expanded', 'true');
        }
        function closeLangMen() {
            langMenu.classList.add('hidden');
            langToggle.setAttribute('aria-expanded', 'false');
        }


        langToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (langMenu.classList.contains('hidden')) {
                openLangMenu();
            } else {
                closeLangMen();
            }
        });

        document.addEventListener('click', function (e) {
            if (!langMenu.contains(e.target) && !langToggle.contains(e.target)) {
                closeLangMen();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeLangMen();
            }
        });
    })();
});