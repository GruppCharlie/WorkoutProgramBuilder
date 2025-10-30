(function () {
    function init(form) {
        if (!form) return;

        function showOrHideError(group) {
            const input = group.querySelector('input,textarea,select');
            if (!input) return;

            const requiredError = group.querySelector('[data-error="required"]');
            const formatError = group.querySelector('[data-error="format"]');   // email
            const patternError = group.querySelector('[data-error="pattern"]');  // lösenord
            const mismatchError = group.querySelector('[data-error="mismatch"]'); // confirm password

            const v = input.validity;
            const invalidRequired = !!v.valueMissing;
            const invalidFormat = !!v.typeMismatch;
            const invalidPattern = !!v.patternMismatch;
            let invalidMismatch = false;

            const matchTarget = group.getAttribute('data-match');
            if (matchTarget) {
                const target = form.querySelector('[data-password-primary] input');
                if (target) invalidMismatch = input.value !== target.value;
            }

            const shouldShow = group.dataset.touched === 'true' || form.dataset.submitted === 'true';

            if (requiredError) requiredError.hidden = !(shouldShow && invalidRequired);
            if (formatError) formatError.hidden = !(shouldShow && !invalidRequired && invalidFormat);
            if (patternError) patternError.hidden = !(shouldShow && !invalidRequired && invalidPattern);
            if (mismatchError) mismatchError.hidden = !(shouldShow && !invalidRequired && !invalidPattern && invalidMismatch);
        }

        // blur = markera touched
        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);
        }, true);

        // input = validera live
        form.addEventListener('input', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            showOrHideError(group);

            // Om detta är primär-lösenordet, validera om confirm
            if (group.hasAttribute('data-password-primary')) {
                const confirmGroup = form.querySelector('[data-validate][data-match]');
                if (confirmGroup) showOrHideError(confirmGroup);
            }
        });

        // submit
        form.addEventListener('submit', (e) => {
            // flagga att formuläret har försökt skickas
            form.dataset.submitted = 'true';

            // markera alla fält som "touched" och visa ev. fel
            const groups = form.querySelectorAll('[data-validate]');
            groups.forEach(g => {
                g.dataset.touched = 'true';
                showOrHideError(g);
            });

            // blockera submit om ogiltigt eller confirm mismatch
            let ok = form.checkValidity();

            const confirmGroup = form.querySelector('[data-validate][data-match]');
            if (confirmGroup) {
                const input = confirmGroup.querySelector('input');
                const target = form.querySelector(
                    `[name="${confirmGroup.getAttribute('data-match')}"]`
                );
                if (target && input.value !== target.value) {
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