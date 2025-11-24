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

            const shouldShow = group.dataset.touched === 'true' || form.dataset.submitted === 'true';

            if (requiredError) requiredError.hidden = !(shouldShow && invalidRequired);
            if (formatError) formatError.hidden = !(shouldShow && !invalidRequired && invalidFormat);
            if (patternError) patternError.hidden = !(shouldShow && !invalidRequired && invalidPattern);

            if (mismatchError) {
                const showMismatch = form.dataset.submitted === 'true' && invalidMismatch;
                mismatchError.hidden = !showMismatch;
            }
        }

        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);
        }, true);

        form.addEventListener('input', (e) => {
            const group = e.target.closest('[data-validate]');
            if (group) {
                showOrHideError(group);
                if (group.hasAttribute('data-password-primary') && confirmGroup) {
                    showOrHideError(confirmGroup);
                }
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const spinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
            const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

            if (submitBtn && submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
                if (spinner) spinner.classList.add('hidden');
                if (btnText) btnText.classList.remove('invisible');
            }
        });

        form.addEventListener('submit', (e) => {
            form.dataset.submitted = 'true';

            const groups = form.querySelectorAll('[data-validate]');
            groups.forEach(g => {
                g.dataset.touched = 'true';
                showOrHideError(g);
            });

            let ok = form.checkValidity();

            if (confirmGroup) {
                const confirmInput = confirmGroup.querySelector('input');
                if (primaryInput && confirmInput && confirmInput.value !== primaryInput.value) {
                    ok = false;
                    showOrHideError(confirmGroup);
                }
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const spinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
            const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

            if (!ok) {
                e.preventDefault();
                e.stopPropagation();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                }
                if (spinner) spinner.classList.add('hidden');
                if (btnText) btnText.classList.remove('invisible');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.setAttribute('aria-busy', 'true');
            }
            if (spinner) spinner.classList.remove('hidden');
            if (btnText) btnText.classList.add('invisible');
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