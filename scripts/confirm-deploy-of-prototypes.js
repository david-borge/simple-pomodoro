const readline = require('node:readline/promises');

const project = process.argv[2];

if (!project) {
    console.error('🛑 Deployment cancelled: no project was specified.');
    process.exit(1);
}

if (!process.stdin.isTTY) {
    console.error('🛑 Deployment cancelled: confirmation requires an interactive terminal.');
    process.exit(1);
}

async function confirmDeployment() {
    const terminal = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        const answer = await terminal.question(
            `❓ Are you sure you want to deploy '${project}' to the PRODUCTION URL? [y/N] `,
        );

        if (!['y', 'yes'].includes(answer.trim().toLowerCase())) {
            console.log('\n 🛑 Deployment cancelled.');
            process.exitCode = 1;
            return;
        }

        console.log(`\n☑️  Confirmed. Starting '${project}' deployment...\n`);
    } finally {
        terminal.close();
    }
}

confirmDeployment().catch((error) => {
    console.error('🛑 Deployment cancelled: could not read confirmation.', error);
    process.exitCode = 1;
});
