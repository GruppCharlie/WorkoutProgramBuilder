function toggleFavorite(event, button) {
    event.preventDefault();

    const exerciseData = {
        ExerciseId: button.getAttribute("data-id"),
        Name: button.getAttribute("data-title"),
        BodyParts: button.getAttribute("data-bodyparts").split(","),
        TargetMuscles: button.getAttribute("data-targetmuscles").split(","),
        Equipments: button.getAttribute("data-equipments").split(","),
        SecondaryMuscles: button.getAttribute("data-secondarymuscles").split(","),
        GifUrl: button.getAttribute("data-gifurl")
    };

    fetch('/favorites/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exerciseData)
    })
        .then(response => {
            if (response.ok) {
                const heartIcon = button.querySelector('i');
                heartIcon.classList.toggle('text-red-500');
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
    document.querySelectorAll('button[data-id]').forEach(button => {
        button.addEventListener('click', function (event) {
            toggleFavorite(event, this);
        });
    });
});
