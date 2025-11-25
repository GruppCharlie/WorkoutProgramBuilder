(function () {

    function getStatusFromCookiebot() {
        if (!window.Cookiebot || !Cookiebot.consent) {
            console.log('[cookieConsentSync] Cookiebot.consent missing');
            return null;
        }

        var c = Cookiebot.consent;
        console.log('[cookieConsentSync] getStatusFromCookiebot, consent =', c);

        if (!c.preferences && !c.statistics && !c.marketing) {
            return 0;
        }

        return 1;
    }

    function sendStatus(source, status) {
        console.log('[cookieConsentSync] sendStatus from', source, 'status =', status);

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
            console.error('[cookieConsentSync] Failed to sync cookie consent to member', err);
        });
    }

    // --- Event handlers ---

    function onConsentReady(e) {
        var status = getStatusFromCookiebot();
        sendStatus(e && e.type || 'CookiebotOnConsentReady', status);
    }

    function onAccept(e) {
        sendStatus('CookiebotOnAccept', 1); 
    }

    function onDecline(e) {
        sendStatus('CookiebotOnDecline', 2); 
    }

    window.addEventListener('CookiebotOnConsentReady', onConsentReady);
    window.addEventListener('CookiebotOnAccept', onAccept);
    window.addEventListener('CookiebotOnDecline', onDecline);

    console.log('[cookieConsentSync] script loaded');

})();
