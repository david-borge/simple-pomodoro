(() => {
    try {
        const savedState = JSON.parse(
            localStorage.getItem('simplePomodoro.initialBackgroundState') || 'null',
        );

        if (
            !savedState ||
            savedState.status === 'cancelled' ||
            !Array.isArray(savedState.sessions)
        ) {
            return;
        }

        let remainingSeconds =
            savedState.status === 'running'
                ? Math.max(0, Math.ceil((savedState.endsAtMs - Date.now()) / 1000))
                : savedState.remainingSeconds;

        if (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0) {
            return;
        }

        for (let index = savedState.sessions.length - 1; index >= 0; index--) {
            const session = savedState.sessions[index];

            if (!Number.isFinite(session.durationInSec) || session.durationInSec <= 0) {
                return;
            }

            if (remainingSeconds <= session.durationInSec) {
                if (session.type === 'short-rest' || session.type === 'long-rest') {
                    document.documentElement.classList.add('starts-in-rest-session');
                }

                return;
            }

            remainingSeconds -= session.durationInSec;
        }
    } catch {
        // Preferences may not have a cached startup hint yet.
    }
})();
