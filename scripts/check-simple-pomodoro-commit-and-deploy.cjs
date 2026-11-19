const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const configPath = path.join(
    __dirname,
    '..',
    'projects',
    'simple-pomodoro',
    'src',
    'app',
    'config',
    'timer.config.production.ts',
);
const sourceText = fs.readFileSync(configPath, 'utf8');
const sourceFile = ts.createSourceFile(
    configPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
);

const configDeclaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => statement.declarationList.declarations)
    .find(
        (declaration) =>
            ts.isIdentifier(declaration.name) && declaration.name.text === 'TIMER_CONFIG',
    );

if (
    !configDeclaration ||
    !configDeclaration.initializer ||
    !ts.isObjectLiteralExpression(configDeclaration.initializer)
) {
    console.error(
        '⛔ Commit/deployment blocked: could not read TIMER_CONFIG from timer.config.production.ts.',
    );
    process.exit(1);
}

const durationProperty = configDeclaration.initializer.properties.find(
    (property) =>
        ts.isPropertyAssignment(property) &&
        ts.isIdentifier(property.name) &&
        property.name.text === 'defautlTimerDurationInMin',
);

if (!durationProperty || !ts.isNumericLiteral(durationProperty.initializer)) {
    console.error('⛔ Commit/deployment blocked: could not read TIMER_CONFIG.defautlTimerDurationInMin.');
    process.exit(1);
}

const durationInMinutes = Number(durationProperty.initializer.text);

if (durationInMinutes < 25) {
    console.error(
        `⛔ Commit/deployment blocked: TIMER_CONFIG.defautlTimerDurationInMin is ${durationInMinutes} minutes; it must be at least 25.`,
    );
    process.exit(1);
}

console.log(`Timer config check passed: default duration is ${durationInMinutes} minutes.`);
