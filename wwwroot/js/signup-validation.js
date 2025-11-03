(function () {
    function init(form) {
        if (!form) return;

        // --- Hjälpare: visa/dölj fel i en grupp ---
        function showOrHideError(group) {
            const input = group.querySelector('input,textarea,select');
            if (!input) return;

            const requiredError = group.querySelector('[data-error="required"]');
            const formatError = group.querySelector('[data-error="format"]');    // email
            const patternError = group.querySelector('[data-error="pattern"]');   // password regex
            const mismatchError = group.querySelector('[data-error="mismatch"]');  // confirm password

            const v = input.validity;
            const invalidRequired = !!v.valueMissing;
            const invalidFormat = !!v.typeMismatch;
            const invalidPattern = !!v.patternMismatch;

            // confirm-jämförelse
            let invalidMismatch = false;
            const matchTargetName = group.getAttribute('data-match');
            if (matchTargetName) {
                // target = primär-lösenordet
                const target = form.querySelector(`[name="${matchTargetName}"]`);
                if (target) invalidMismatch = input.value !== target.value;
            }

            const shouldShow = group.dataset.touched === 'true' || form.dataset.submitted === 'true';

            if (requiredError) requiredError.hidden = !(shouldShow && invalidRequired);
            if (formatError) formatError.hidden = !(shouldShow && !invalidRequired && invalidFormat);
            if (patternError) patternError.hidden = !(shouldShow && !invalidRequired && invalidPattern);
            if (mismatchError) mismatchError.hidden = !(shouldShow && !invalidRequired && !invalidPattern && invalidMismatch);
        }

        // Markera touched på blur
        form.addEventListener('blur', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            group.dataset.touched = 'true';
            showOrHideError(group);

            // Om primär-lösenordet ändras, revalidera confirm
            if (group.hasAttribute('data-password-primary')) {
                const confirmGroup = form.querySelector('[data-validate][data-match]');
                if (confirmGroup) showOrHideError(confirmGroup);
            }
        }, true);

        // Live-validering vid input
        form.addEventListener('input', (e) => {
            const group = e.target.closest('[data-validate]');
            if (!group) return;
            showOrHideError(group);

            if (group.hasAttribute('data-password-primary')) {
                const confirmGroup = form.querySelector('[data-validate][data-match]');
                if (confirmGroup) showOrHideError(confirmGroup);
            }
        });

        // SUBMIT – stoppa alltid nativ submit och visa fel
        form.addEventListener('submit', (e) => {
            // Förhindra reload oavsett
            e.preventDefault();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            else e.stopPropagation();

            form.dataset.submitted = 'true';

            // Markera alla fält och visa fel
            const groups = form.querySelectorAll('[data-validate]');
            groups.forEach(g => {
                g.dataset.touched = 'true';
                showOrHideError(g);
            });

            // Egen giltighetskontroll
            let ok = form.checkValidity();

            // Confirm password – extra koll
            const confirmGroup = form.querySelector('[data-validate][data-match]');
            if (confirmGroup) {
                const input = confirmGroup.querySelector('input');
                const target = form.querySelector(`[name="${confirmGroup.getAttribute('data-match')}"]`);
                if (input && target && input.value !== target.value) {
                    ok = false;
                    showOrHideError(confirmGroup);
                }
            }

            // Här har du resultatet:
            // ok === true  -> alla fält giltiga & matchar
            // ok === false -> visa fel (redan gjort ovan)

            // Om du vill POSTA via fetch (utan reload), gör det här:
            // if (ok) {
            //   const fd = new FormData(form);
            //   fetch('/signup', { method: 'POST', body: fd })
            //     .then(r => r.ok ? ... : ...)
            //     .catch(console.error);
            // }
        });

        // (valfritt) Om din “Register”-knapp är type="button" i stället:
        // const submitBtn = form.querySelector('button[type="button"].js-register');
        // if (submitBtn) {
        //   submitBtn.addEventListener('click', () => {
        //     form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        //   });
        // }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('signupForm');
        if (!form) return;
        form.setAttribute('autocomplete', 'off');
        form.setAttribute('novalidate', 'novalidate');
        init(form);
    });
})();