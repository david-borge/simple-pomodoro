import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(
    scriptDirectory,
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
        '⛔ Commit/build/deployment blocked: could not read TIMER_CONFIG from timer.config.production.ts.\n',
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
    console.error(
        '⛔ Commit/build/deployment blocked: could not read TIMER_CONFIG.defautlTimerDurationInMin.\n',
    );
    process.exit(1);
}

const durationInMinutes = Number(durationProperty.initializer.text);

if (durationInMinutes < 25) {
    console.error(
        `⛔ Commit/build/deployment blocked: TIMER_CONFIG.defautlTimerDurationInMin is ${durationInMinutes} minutes; it must be at least 25.\n`,
    );
    process.exit(1);
}

console.log(`☑️  Timer config check passed: default duration is ${durationInMinutes} minutes.\n`);
