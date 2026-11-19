import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.ionic.starter',
    appName: 'simple-pomodoro-prototypes',
    webDir: 'www',
    plugins: {
        SystemBars: {
            insetsHandling: 'css',
            initialViewportFitValueHint: 'cover',
        },
    },
};

export default config;
