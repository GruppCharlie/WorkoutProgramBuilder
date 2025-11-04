function toggleFavorite(event, button) {
    event.preventDefault();

    const exerciseData = {
        ExerciseId: button.getAttribute("data-id"),
        Name: button.getAttribute("data-title"),
        BodyParts: button.getAttribute("data-bodyparts").split(",").filter(Boolean),
        TargetMuscles: button.getAttribute("data-targetmuscles").split(",").filter(Boolean),
        Equipments: button.getAttribute("data-equipments").split(",").filter(Boolean),
        SecondaryMuscles: button.getAttribute("data-secondarymuscles").split(",").filter(Boolean),
        GifUrl: button.getAttribute("data-gifurl")
    };

    fetch('/favorites/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseData)
    })
        .then(async response => {
            if (response.status === 401) {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.classList.remove('hidden');
                    document.body.classList.add('overflow-hidden');
                }
                return;
            }

            if (response.ok) {
                const heartIcon = button.querySelector('i');
                if (heartIcon) heartIcon.classList.toggle('text-red-500');
            } else {
                alert("Something went wrong. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error saving exercise:", error);
            alert("An error occurred while saving the exercise.");
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('button[data-id]');
    if (favoriteButtons.length) {
        favoriteButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                toggleFavorite(event, this);
            });
        });
    }

    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginModal = document.getElementById('loginModal');

    if (closeLoginModal && loginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                e.target.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }
});
