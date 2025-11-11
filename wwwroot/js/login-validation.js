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

        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);
        }, true);

        form.addEventListener('input', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            showOrHideError(group);
        });

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

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loginForm');
        if (form) {
            form.setAttribute('autocomplete', 'off');
            init(form);
        }
    });
})();