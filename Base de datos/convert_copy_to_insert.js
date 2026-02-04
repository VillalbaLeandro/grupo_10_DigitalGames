const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'data.sql');
const outputFile = path.join(__dirname, 'data_insert_format.sql');

console.log('Leyendo archivo:', inputFile);
const content = fs.readFileSync(inputFile, 'utf8');

// Patrón para encontrar bloques COPY
const copyPattern = /COPY ([^\(]+)\s*\(([^)]+)\)\s+FROM\s+stdin;([\s\S]*?)\\\\\./gm;

let converted = content;
let match;
let replacements = [];

// Encontrar todos los matches primero
copyPattern.lastIndex = 0;
while ((match = copyPattern.exec(content)) !== null) {
    const tableName = match[1].trim();
    const columns = match[2].trim();
    const dataBlock = match[3].trim();

    if (!dataBlock) {
        replacements.push({
            original: match[0],
            replacement: `-- No data for ${tableName}\n`
        });
        continue;
    }

    const lines = dataBlock.split('\n');
    const insertStatements = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Separar por tabs
        const values = trimmedLine.split('\t');

        // Escapar valores
        const escapedValues = values.map(val => {
            if (val === '\\N' || val === '') {
                return 'NULL';
            } else {
                // Escapar comillas simples
                const escaped = val.replace(/'/g, "''");
                return `'${escaped}'`;
            }
        });

        const valuesStr = escapedValues.join(', ');
        insertStatements.push(`INSERT INTO ${tableName} (${columns}) VALUES (${valuesStr});`);
    }

    replacements.push({
        original: match[0],
        replacement: insertStatements.join('\n') + '\n'
    });
}

// Aplicar reemplazos
for (const { original, replacement } of replacements) {
    converted = converted.replace(original, replacement);
}

fs.writeFileSync(outputFile, converted, 'utf8');
console.log('✅ Conversión completada:', outputFile);
console.log('📝 Total de bloques COPY convertidos:', replacements.length);
