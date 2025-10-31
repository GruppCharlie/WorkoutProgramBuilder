(function () {
    function init(form) {
        if (!form) return;

        // Hanterar visning/döljning av felmeddelanden
        function showOrHideError(group) {
            const input = group.querySelector('input,textarea,select');
            if (!input) return;

            const requiredError = group.querySelector('[data-error="required"]');
            const formatError = group.querySelector('[data-error="format"]');   // e-post
            const patternError = group.querySelector('[data-error="pattern"]');  // lösenord (minst 6 tecken)

            const v = input.validity;
            const invalidRequired = !!v.valueMissing;
            const invalidFormat = !!v.typeMismatch;     // HTML5 e-postvalidering
            const invalidPattern = !!v.patternMismatch;  // Regex pattern (lösenord)

            const shouldShow = group.dataset.touched === 'true' || form.dataset.submitted === 'true';

            if (requiredError) requiredError.hidden = !(shouldShow && invalidRequired);
            if (formatError) formatError.hidden = !(shouldShow && !invalidRequired && invalidFormat);
            if (patternError) patternError.hidden = !(shouldShow && !invalidRequired && invalidPattern);
        }

        // Markera fält som "touched" när man lämnar det
        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);
        }, true);

        // Validera live när användaren skriver
        form.addEventListener('input', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            showOrHideError(group);
        });

        // Vid submit — markera alla fält och visa ev. fel
        form.addEventListener('submit', (e) => {
            form.dataset.submitted = 'true';
            const groups = form.querySelectorAll('[data-validate]');
            groups.forEach(g => {
                g.dataset.touched = 'true';
                showOrHideError(g);
            });

            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    // Initiera på DOM-laddning
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loginForm');
        if (form) {
            form.setAttribute('autocomplete', 'off');
            init(form);
        }
    });
})();