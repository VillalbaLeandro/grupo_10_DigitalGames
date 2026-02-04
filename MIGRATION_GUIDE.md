# 🔄 Migración de MySQL a PostgreSQL

Guía completa para migrar tus datos desde MySQL (Clever Cloud) a PostgreSQL (Render).

---

## 📋 Antes de Empezar

### ✅ Pre-requisitos
- Base de datos PostgreSQL creada en Render
- Acceso a tu base de datos MySQL en Clever Cloud
- Node.js instalado localmente

### ⚠️ Importante
- Esta migración **NO afecta** tu desarrollo local
- Puedes seguir usando MySQL localmente
- Solo la producción en Render usará PostgreSQL

---

## 🎯 Estrategia de Migración

Tienes **dos opciones**:

### Opción 1: Usar Migraciones de Sequelize (Recomendado) ⭐
- ✅ Más limpio y profesional
- ✅ Reproducible y versionado
- ✅ No requiere herramientas externas
- ⚠️ Pierdes los datos actuales (necesitas seeders)

### Opción 2: Exportar/Importar Datos
- ✅ Mantiene los datos actuales
- ⚠️ Requiere herramientas adicionales
- ⚠️ Puede tener problemas de compatibilidad

---

## 🌟 **Opción 1: Migraciones de Sequelize** (Recomendado)

Esta es la forma más limpia si tu base de datos actual es solo de desarrollo/prueba.

### Paso 1: Verificar que tienes migraciones

```bash
ls src/database/migrations
```

Si no tienes migraciones, necesitas generarlas desde tus modelos actuales.

### Paso 2: Correr migraciones en Render

Una vez que tu app esté deployed en Render:

1. Ve a tu Web Service → **Shell**
2. Ejecuta:
   ```bash
   NODE_ENV=production npm run migrate
   ```

### Paso 3: (Opcional) Crear y correr seeders

Si necesitas datos iniciales, crea seeders:

**Localmente:**
```bash
npx sequelize-cli seed:generate --name demo-data
```

Edita el archivo en `src/database/seeders/` con tus datos:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ejemplo: Insertar productos
    await queryInterface.bulkInsert('Products', [
      {
        name: 'Producto 1',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // ... más datos
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
```

**En Render Shell:**
```bash
NODE_ENV=production npx sequelize-cli db:seed:all
```

---

## 🔧 **Opción 2: Exportar/Importar Datos Existentes**

Si tienes datos importantes en MySQL que necesitas migrar.

### Paso 1: Exportar desde MySQL

#### Opción A: Usar phpMyAdmin (Clever Cloud)

1. Ve al dashboard de Clever Cloud
2. Abre phpMyAdmin para tu base de datos
3. Selecciona todas las tablas
4. Click en **"Export"**
5. Formato: **SQL**
6. Descarga el archivo `database.sql`

#### Opción B: Usar mysqldump (línea de comandos)

```bash
mysqldump -h bq7qyrfagcvxzvngubmv-mysql.services.clever-cloud.com \
  -u uuwdyns0qtehmspe \
  -p \
  bq7qyrfagcvxzvngubmv > mysql_backup.sql
# Password: M38d2q2VrZsq9RfPGASC
```

### Paso 2: Convertir SQL de MySQL a PostgreSQL

MySQL y PostgreSQL tienen diferencias de sintaxis. Necesitas convertir el dump.

#### Usar pgloader (Herramienta automática)

**Instalar pgloader:**

**Windows:**
```bash
# Descargar desde: https://github.com/dimitri/pgloader/releases
# O usar WSL/Docker
```

**macOS:**
```bash
brew install pgloader
```

**Linux:**
```bash
sudo apt-get install pgloader
```

**Crear archivo de configuración `migration.load`:**

```
LOAD DATABASE
  FROM mysql://uuwdyns0qtehmspe:M38d2q2VrZsq9RfPGASC@bq7qyrfagcvxzvngubmv-mysql.services.clever-cloud.com:3306/bq7qyrfagcvxzvngubmv
  INTO postgresql://[TU_DATABASE_URL_DE_RENDER]

WITH include drop, create tables, create indexes, reset sequences

SET maintenance_work_mem to '128MB',
    work_mem to '12MB',
    search_path to 'public'

CAST type datetime to timestamptz
     drop default drop not null using zero-dates-to-null;
```

**Ejecutar migración:**
```bash
pgloader migration.load
```

### Paso 3: Ajustar el dump manualmente (Alternativa)

Si no puedes usar pgloader, edita el archivo SQL:

**Cambios comunes:**

1. **AUTO_INCREMENT → SERIAL**
   ```sql
   -- MySQL:
   id INT AUTO_INCREMENT PRIMARY KEY
   
   -- PostgreSQL:
   id SERIAL PRIMARY KEY
   ```

2. **Backticks → Comillas dobles**
   ```sql
   -- MySQL:
   `table_name`
   
   -- PostgreSQL:
   "table_name"
   ```

3. **ENGINE=InnoDB → Eliminar**
   ```sql
   -- MySQL:
   ) ENGINE=InnoDB;
   
   -- PostgreSQL:
   );
   ```

4. **DATETIME → TIMESTAMP**
   ```sql
   -- MySQL:
   created_at DATETIME
   
   -- PostgreSQL:
   created_at TIMESTAMP
   ```

5. **Valores booleanos**
   ```sql
   -- MySQL:
   active TINYINT(1)
   
   -- PostgreSQL:
   active BOOLEAN
   ```

### Paso 4: Importar a PostgreSQL (Render)

#### Opción A: Desde Render Shell

1. Ve a tu PostgreSQL Database en Render
2. Click en **"Shell"**
3. Sube tu archivo SQL o pégalo directamente

```bash
# Si el archivo está disponible en tu repo o servidor
psql $DATABASE_URL < converted_database.sql
```

#### Opción B: Usando psql localmente

**Obtener External Database URL de Render:**
- PostgreSQL Database → Connections → **External Database URL**

**Conectar y importar:**
```bash
psql "postgresql://user:password@hostname/database" < converted_database.sql
```

---

## 🧪 **Opción 3: Script de Migración Personalizado (Node.js)**

Si prefieres más control, puedes crear un script que lea de MySQL y escriba en PostgreSQL.

### Crear archivo `migrate-data.js`:

```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');

async function migrate() {
  // Conexión a MySQL (origen)
  const mysqlConnection = await mysql.createConnection({
    host: 'bq7qyrfagcvxzvngubmv-mysql.services.clever-cloud.com',
    user: 'uuwdyns0qtehmspe',
    password: 'M38d2q2VrZsq9RfPGASC',
    database: 'bq7qyrfagcvxzvngubmv'
  });

  // Conexión a PostgreSQL (destino)
  const pgClient = new Client({
    connectionString: process.env.POSTGRES_URL // Agrega esto en .env
  });
  await pgClient.connect();

  try {
    // Ejemplo: Migrar tabla Products
    const [products] = await mysqlConnection.execute('SELECT * FROM Products');
    
    for (const product of products) {
      await pgClient.query(
        'INSERT INTO "Products" (id, name, price, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
        [product.id, product.name, product.price, product.description, product.createdAt, product.updatedAt]
      );
    }

    console.log(`✅ Migrados ${products.length} productos`);

    // Repite para otras tablas...

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await mysqlConnection.end();
    await pgClient.end();
  }
}

migrate();
```

**Ejecutar:**
```bash
node migrate-data.js
```

---

## ✅ Verificación Post-Migración

### 1. Verificar tablas creadas

**En Render Shell (PostgreSQL):**
```sql
\dt  -- Listar todas las tablas
```

### 2. Verificar conteo de registros

```sql
SELECT COUNT(*) FROM "Products";
SELECT COUNT(*) FROM "Users";
-- etc.
```

### 3. Probar la aplicación

1. Ve a tu URL de Render
2. Prueba funcionalidades principales:
   - Login/Registro
   - Ver productos
   - API endpoints
   - Relaciones entre tablas

---

## 🎯 Recomendación Final

Para tu caso específico, recomiendo:

### Si tu MySQL tiene solo datos de prueba:
→ **Opción 1: Usar migraciones de Sequelize**
- Más limpio y profesional
- Corre las migraciones en Render
- Crea seeders con tus datos de prueba

### Si tienes datos importantes en producción:
→ **Opción 2 o 3: Exportar/Importar**
- Usa pgloader si puedes instalarlo
- O el script Node.js para más control

---

## 📚 Recursos Útiles

- [pgloader Documentation](https://pgloader.readthedocs.io/)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL COPY Command](https://www.postgresql.org/docs/current/sql-copy.html)
- [MySQL to PostgreSQL Conversion Guide](https://wiki.postgresql.org/wiki/Converting_from_other_Databases_to_PostgreSQL)

---

## ❓ ¿Necesitas Ayuda?

Déjame saber:
1. ¿Tienes datos importantes en MySQL que necesitas migrar?
2. ¿O son solo datos de prueba que puedes recrear con seeders?

Según tu respuesta, te ayudo con el método más apropiado. 🚀
