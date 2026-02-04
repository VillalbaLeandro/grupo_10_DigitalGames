#!/usr/bin/env node
/**
 * Script para generar migraciones automáticamente desde tus modelos de Sequelize
 * Esto facilita la creación de la estructura de base de datos en PostgreSQL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generando migraciones desde modelos...\n');

// Crear directorio de migraciones si no existe
const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('✅ Creado directorio de migraciones\n');
}

// Lista de migraciones a crear
const migrations = [
    {
        name: 'create-products',
        description: 'Crear tabla products'
    },
    {
        name: 'create-users',
        description: 'Crear tabla users'
    },
    {
        name: 'create-genders',
        description: 'Crear tabla genders'
    },
    {
        name: 'create-compatibilities',
        description: 'Crear tabla compatibilities'
    },
    {
        name: 'create-lenguages',
        description: 'Crear tabla lenguages'
    },
    {
        name: 'create-players',
        description: 'Crear tabla players'
    },
    {
        name: 'create-rolls',
        description: 'Crear tabla rolls'
    },
    {
        name: 'create-shopping-carts',
        description: 'Crear tabla shopping_carts'
    },
    {
        name: 'create-junction-tables',
        description: 'Crear tablas intermedias (many-to-many)'
    }
];

// Generar cada migración
migrations.forEach((migration, index) => {
    const timestamp = new Date().getTime() + index; // Asegurar orden
    const filename = `${timestamp}-${migration.name}.js`;

    console.log(`📝 Generando: ${migration.description}...`);

    try {
        execSync(`npx sequelize-cli migration:generate --name ${migration.name}`, {
            stdio: 'inherit'
        });
    } catch (error) {
        console.error(`❌ Error generando ${migration.name}:`, error.message);
    }
});

console.log('\n✅ Migraciones generadas!');
console.log('\n📋 Próximos pasos:');
console.log('1. Edita cada archivo de migración en src/database/migrations/');
console.log('2. Define la estructura de cada tabla según tus modelos');
console.log('3. Corre: NODE_ENV=production npm run migrate (en Render)');
console.log('\n💡 Tip: Revisa el archivo MIGRATION_MANUAL.md para ejemplos\n');
