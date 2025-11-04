(function () {
    function init(form) {
        if (!form) return;

        const primaryGroup = form.querySelector('[data-password-primary]');
        const confirmGroup = form.querySelector('[data-password-confirm]');
        const primaryInput = primaryGroup ? primaryGroup.querySelector('input') : null;

        function showOrHideError(group) {
            const input = group.querySelector('input,textarea,select');
            if (!input) return;

            const requiredError = group.querySelector('[data-error="required"]');
            const formatError = group.querySelector('[data-error="format"]');
            const patternError = group.querySelector('[data-error="pattern"]');
            const mismatchError = group.querySelector('[data-error="mismatch"]');

            const v = input.validity;
            const invalidRequired = !!v.valueMissing;
            const invalidFormat = !!v.typeMismatch;
            const invalidPattern = !!v.patternMismatch;

            let invalidMismatch = false;
            if (group.hasAttribute('data-password-confirm') && primaryInput) {
                invalidMismatch = input.value !== primaryInput.value;
            }

            // Visa fel endast om fältet rörts ELLER formuläret skickats
            const shouldShow = group.dataset.touched === 'true' || form.dataset.submitted === 'true';

            if (requiredError) requiredError.hidden = !(shouldShow && invalidRequired);
            if (formatError) formatError.hidden = !(shouldShow && !invalidRequired && invalidFormat);
            if (patternError) patternError.hidden = !(shouldShow && !invalidRequired && invalidPattern);

            // ✅ Visa mismatch-fel enbart EFTER att man försökt skicka formuläret
            if (mismatchError) {
                const showMismatch = form.dataset.submitted === 'true' && invalidMismatch;
                mismatchError.hidden = !showMismatch;
            }
        }

        // blur = markera touched
        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);
        }, true);

        // input = validera live (men visa inte mismatch ännu)
        form.addEventListener('input', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            showOrHideError(group);

            if (group.hasAttribute('data-password-primary') && confirmGroup) {
                showOrHideError(confirmGroup);
            }
        });

        // submit
        form.addEventListener('submit', (e) => {
            form.dataset.submitted = 'true';

            const groups = form.querySelectorAll('[data-validate]');
            groups.forEach(g => {
                g.dataset.touched = 'true';
                showOrHideError(g);
            });

            let ok = form.checkValidity();

            // extra kontroll för mismatch
            if (confirmGroup) {
                const confirmInput = confirmGroup.querySelector('input');
                if (primaryInput && confirmInput && confirmInput.value !== primaryInput.value) {
                    ok = false;
                    showOrHideError(confirmGroup);
                }
            }

            if (!ok) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('signupForm');
        if (form) {
            form.setAttribute('autocomplete', 'off');
            init(form);
        }
    });
})();