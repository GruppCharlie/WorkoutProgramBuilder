/**
 * Exercise Card Interactions
 * Handles favorite button clicks for exercise cards
 * Depends on: favoriteUtils.js, modalUtils.js
 */
document.querySelectorAll('button[data-id][data-title][data-gifurl]').forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        void toggleFavorite(event, button);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".gif-wrapper").forEach(wrapper => {
        const img = wrapper.querySelector(".gif-image");
        const skeleton = wrapper.querySelector(".gif-skeleton");

        const showGif = () => {
            skeleton.style.display = "none";
            img.style.opacity = 1;
        };

        if (img.complete) {
            showGif();
        } else {
            img.addEventListener("load", showGif);
            img.addEventListener("error", () => {
                skeleton.style.display = "none";
            });
        }
    });
});
