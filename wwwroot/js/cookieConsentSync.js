(function () {

    function getStatusFromCookiebot() {
        if (!window.Cookiebot || !Cookiebot.consent) {
            return null;
        }

        var c = Cookiebot.consent;

        if (!c.given) {
            return 0; 
        }

        if (c.statistics || c.preferences || c.marketing) {
            return 1; 
        }

        return 2; 
    }

    function syncCookieConsentToMember(event) {
        var status = null;

        if (event && event.type === 'CookiebotOnAccept') {
            status = 1; 
        } else if (event && event.type === 'CookiebotOnDecline') {
            status = 2; 
        } else {
            status = getStatusFromCookiebot();
        }

        if (status === null || status === undefined) {
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
