(function () {
    function init(form) {
        if (!form) return;

        function showOrHideError(group) {
            const input = group.querySelector('input,textarea,select');
            if (!input) return;

            const requiredError = group.querySelector('[data-error="required"]');
            const formatError = group.querySelector('[data-error="format"]');
            const patternError = group.querySelector('[data-error="pattern"]');

            const v = input.validity;
            const invalidRequired = !!v.valueMissing;
            const invalidFormat = !!v.typeMismatch;
            const invalidPattern = !!v.patternMismatch;

            const shouldShow = group.dataset.touched === 'true' || form.dataset.submitted === 'true';

            if (requiredError) requiredError.hidden = !(shouldShow && invalidRequired);
            if (formatError) formatError.hidden = !(shouldShow && !invalidRequired && invalidFormat);
            if (patternError) patternError.hidden = !(shouldShow && !invalidRequired && invalidPattern);
        }

        function getBtnParts() {
            const submitBtn = form.querySelector('[data-submit-btn]');
            return {
                submitBtn,
                spinner: submitBtn ? submitBtn.querySelector('.btn-spinner') : null,
                btnText: submitBtn ? submitBtn.querySelector('.btn-text') : null
            };
        }

        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);
        }, true);

        form.addEventListener('input', () => {
            form.querySelectorAll('[data-validate]').forEach(showOrHideError);

            const { submitBtn, spinner, btnText } = getBtnParts();
            if (submitBtn && submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
                if (spinner) spinner.classList.add('hidden');
                if (btnText) btnText.classList.remove('invisible');
            }
        });

        form.addEventListener('submit', (e) => {
            form.dataset.submitted = 'true';
            form.querySelectorAll('[data-validate]').forEach(g => {
                g.dataset.touched = 'true';
                showOrHideError(g);
            });

            const { submitBtn, spinner, btnText } = getBtnParts();

            const ok = form.checkValidity();
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
        const form = document.getElementById('loginForm');
        if (form) {
            form.setAttribute('autocomplete', 'off');
            init(form);
        }
    });
})();