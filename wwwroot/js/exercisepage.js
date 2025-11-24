document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".gif-image").forEach(img => {
        const skeleton = img.parentElement.querySelector(".gif-skeleton");

        const showGif = () => {
            skeleton.style.display = "none";
            img.style.opacity = "1";
        };

        if (img.complete) {
            showGif();
        } else {
            img.addEventListener("load", showGif);
            img.addEventListener("error", () => skeleton.style.display = "none");
        }
    });
});