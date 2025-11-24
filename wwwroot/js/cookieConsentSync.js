(function () {

    function getStatusFromCookiebot() {
        if (!window.Cookiebot || !Cookiebot.consent) {
            return null;
        }

        if (Cookiebot.consent.declined) {
            return 2;
        }

        if (Cookiebot.consent.consented) {
            return 1;
        }

        return 0;
    }

    function syncCookieConsentToMember() {
        var status = getStatusFromCookiebot();
        if (status === null) {
            return;
        }

        fetch('/api/cookie-consent/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                date: new Date().toISOString()
            })
        }).catch(function (err) {
            console.error('Failed to sync cookie consent to member', err);
        });
    }

    window.addEventListener('CookiebotOnConsentReady', syncCookieConsentToMember);
    window.addEventListener('CookiebotOnAccept', syncCookieConsentToMember);
    window.addEventListener('CookiebotOnDecline', syncCookieConsentToMember);

})();
