import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const port = 8100;

function getAngularProjects() {
    const angularConfigPath = path.join(projectRoot, 'angular.json');
    const angularConfig = JSON.parse(fs.readFileSync(angularConfigPath, 'utf8'));

    return Object.entries(angularConfig.projects ?? {})
        .filter(([, project]) => {
            const targets = project.architect ?? project.targets;
            return project.projectType === 'application' && targets?.serve;
        })
        .map(([projectName]) => projectName);
}

function findAdb() {
    const sdkRoots = [process.env.ANDROID_SDK_ROOT, process.env.ANDROID_HOME];

    if (process.env.HOME) {
        sdkRoots.push(path.join(process.env.HOME, 'Library', 'Android', 'sdk'));
    }

    for (const sdkRoot of sdkRoots) {
        if (!sdkRoot) continue;

        const adbPath = path.join(sdkRoot, 'platform-tools', 'adb');
        if (fs.existsSync(adbPath)) return adbPath;
    }

    return 'adb';
}

const adbPath = findAdb();

function runAdb(args) {
    try {
        return execFileSync(adbPath, args, {
            cwd: projectRoot,
            encoding: 'utf8',
            stdio: 'pipe',
        });
    } catch (error) {
        const output = [error.stdout, error.stderr].filter(Boolean).join(os.EOL).trim();
        const details = output ? `${os.EOL}${output}` : '';
        throw new Error(`❗ adb ${args.join(' ')} failed.${details}`, { cause: error });
    }
}

function getPhysicalDevices() {
    const output = runAdb(['devices', '-l']);

    return output
        .split(/\r?\n/)
        .slice(1)
        .flatMap((line) => {
            const match = line.match(/^(\S+)\s+device(?:\s|$)/);
            if (!match || match[1].startsWith('emulator-')) return [];

            return [{ serial: match[1], details: line }];
        });
}

async function chooseDevice(devices) {
    if (devices.length === 0) {
        const output = runAdb(['devices', '-l']);
        throw new Error(
            `❗ No authorized physical Android phone found. Connect it over USB and accept the USB debugging prompt.${os.EOL}${output}`,
        );
    }

    if (devices.length === 1) return devices[0].serial;

    console.log('Multiple physical Android devices are connected:');
    devices.forEach(({ serial, details }, index) => {
        console.log(`  ${index + 1}. ${serial} (${details})`);
    });

    if (!process.stdin.isTTY) {
        throw new Error('❗ Run this script in a terminal to choose the device serial number.');
    }

    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        const answer = (await prompt.question('Enter the serial number to use: ')).trim();
        if (!devices.some(({ serial }) => serial === answer)) {
            throw new Error(`❗ '${answer}' is not one of the connected device serial numbers.`);
        }
        return answer;
    } finally {
        prompt.close();
    }
}

async function chooseAngularProject(angularProjects) {
    if (angularProjects.length === 0) {
        throw new Error(
            '❗ No Angular application projects with a serve target were found in angular.json.',
        );
    }
    if (angularProjects.length === 1) return angularProjects[0];

    if (!process.stdin.isTTY) {
        throw new Error('❗ Run this script in a terminal to choose the Angular project.');
    }

    console.log('\nWhich Angular project do you want to use?');
    angularProjects.forEach((project, index) => {
        console.log('  ' + (index + 1) + '. ' + project);
    });

    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        while (true) {
            const answer = (await prompt.question('Enter a number or project name: '))
                .trim()
                .toLowerCase();
            const projectIndex = Number(answer) - 1;
            const project = angularProjects[projectIndex];

            if (project && /^\d+$/.test(answer)) return project;
            if (angularProjects.includes(answer)) return answer;

            console.log(
                '➡️ Choose a number from 1 to ' +
                    angularProjects.length +
                    ', or enter a project name.',
            );
        }
    } finally {
        prompt.close();
    }
}

function isPortInUse() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (error) => {
            if (error.code === 'EADDRINUSE') return resolve(true);
            reject(error);
        });
        server.listen(port, '127.0.0.1', () => {
            server.close(() => resolve(false));
        });
    });
}

function canConnectToServer() {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host: '127.0.0.1', port });
        let settled = false;

        const finish = (connected) => {
            if (settled) return;
            settled = true;
            socket.destroy();
            resolve(connected);
        };

        socket.once('connect', () => finish(true));
        socket.once('error', () => finish(false));
        socket.setTimeout(500, () => finish(false));
    });
}

async function waitForServer(timeoutMs = 60_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (await canConnectToServer()) return;
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`❗ The Ionic dev server did not start on port ${port} within 60 seconds.`);
}

function runIonic(args) {
    return new Promise((resolve, reject) => {
        const child = spawn('ionic', args, {
            cwd: projectRoot,
            stdio: 'inherit',
        });

        child.once('error', reject);
        child.once('exit', (code, signal) => {
            if (signal) {
                console.error(`Ionic exited after receiving ${signal}.`);
                resolve(1);
                return;
            }
            resolve(code ?? 1);
        });
    });
}

function quoteForShell(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

function escapeForAppleScript(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function openMacOSTerminal(serial, angularProject) {
    const serverCommand = `printf '\\033]0;Ionic Angular server\\007'; cd ${quoteForShell(projectRoot)} && ionic serve --project=${quoteForShell(angularProject)} --host=127.0.0.1 --port=${port} --no-open`;
    const androidCommand = `printf '\\033]0;Ionic Android app\\007'; cd ${quoteForShell(projectRoot)} && ${quoteForShell(process.execPath)} ${quoteForShell(path.join(__dirname, 'capacitor-android-live-from-macos.js'))} --android-tab ${quoteForShell(serial)}`;

    const scriptLines = [
        'tell application "Terminal"',
        'activate',
        'if not (exists front window) then',
        `do script "${escapeForAppleScript(serverCommand)}"`,
        'else',
        `do script "${escapeForAppleScript(serverCommand)}" in selected tab of front window`,
        'end if',
        'delay 0.2',
        'tell application "System Events" to keystroke "t" using command down',
        'delay 0.2',
        `do script "${escapeForAppleScript(androidCommand)}" in selected tab of front window`,
        'end tell',
    ];

    return new Promise((resolve, reject) => {
        const child = spawn(
            'osascript',
            scriptLines.flatMap((line) => ['-e', line]),
            {
                cwd: projectRoot,
                detached: true,
                stdio: 'ignore',
            },
        );

        child.once('error', (error) => {
            reject(
                new Error(`❗ Could not open macOS Terminal with osascript. ${error.message}`, {
                    cause: error,
                }),
            );
        });
        child.once('spawn', () => {
            child.unref();
            resolve();
        });
    });
}

async function runAndroidTab(serial) {
    if (!/^[A-Za-z0-9._:-]+$/.test(serial)) {
        throw new Error(`❗ The device serial contains unsupported characters: ${serial}`);
    }

    console.log(`\n⌚ Waiting for the Ionic dev server on port ${port}...\n`);
    await waitForServer();

    console.log('🚀 Starting the Android build and app launch...\n');
    process.exitCode = await runIonic([
        'capacitor',
        'run',
        'android',
        `--target=${serial}`,
        `--livereload-url=http://127.0.0.1:${port}`,
    ]);
}

async function launchLiveReload() {
    if (process.platform !== 'darwin') {
        throw new Error('🍎 Run capacitor-android-live-from-macos on macOS, not Windows.');
    }

    const serial = await chooseDevice(getPhysicalDevices());
    const angularProject = await chooseAngularProject(getAngularProjects());
    if (!/^[A-Za-z0-9._:-]+$/.test(serial)) {
        throw new Error(`❗ The device serial contains unsupported characters: ${serial}`);
    }

    if (await isPortInUse()) {
        throw new Error(
            `❗ Port ${port} is already in use. Stop the existing server before running this script.`,
        );
    }

    console.log(`📲 Setting up USB reverse forwarding for device ${serial}...`);
    process.stdout.write(runAdb(['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`]));
    process.stdout.write(runAdb(['-s', serial, 'reverse', '--list']));

    console.log('🚀 Opening one Terminal window with two tabs (Angular server and Android app)...');

    console.log(`\n🐞 You can go to chrome://inspect/#devices to debug the Angular app.\n`);
    await openMacOSTerminal(serial, angularProject);
}

const androidTabSerial = process.argv[2] === '--android-tab' ? process.argv[3] : undefined;
const run = androidTabSerial ? runAndroidTab(androidTabSerial) : launchLiveReload();

run.catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
