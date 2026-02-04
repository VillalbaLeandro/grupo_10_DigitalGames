# 🔧 Generar Migraciones Manualmente

Ya que tu proyecto no tiene migraciones (solo modelos), necesitas crearlas para que Sequelize pueda crear las tablas en PostgreSQL.

---

## 🎯 Estrategia Simplificada

La forma más fácil es usar **Sequelize sync** en lugar de migraciones:

### Opción Rápida: Usar `sync()` (Solo para desarrollo/primera vez)

**En Render Shell**, después de deployar:

```javascript
// Conectar a la base de datos y crear todas las tablas automáticamente
node -e "const db = require('./src/database/models'); db.sequelize.sync({ force: false }).then(() => { console.log('✅ Tablas creadas'); process.exit(0); });"
```

> [!WARNING]
> `sync()` NO es recomendado para producción en el largo plazo, pero funciona perfectamente para una primera migración.

---

## 📝 Opción Profesional: Crear Migraciones

Si quieres hacerlo profesionalmente, aquí están las migraciones completas basadas en tus modelos:

### 1. Crear directorio de migraciones

```bash
mkdir -p src/database/migrations
```

### 2. Crear migración para Products

**Archivo: `src/database/migrations/20260204000001-create-products.js`**

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      releaseData: {
        type: Sequelize.STRING,
        allowNull: true
      },
      img: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      freeShipping: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      capture1: {
        type: Sequelize.STRING,
        allowNull: true
      },
      capture2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      capture3: {
        type: Sequelize.STRING,
        allowNull: true
      },
      capture4: {
        type: Sequelize.STRING,
        allowNull: true
      },
      video: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};
```

### 3. Script automatizado

He creado un script que genera las bases de las migraciones:

```bash
node generate-migrations.js
```

Luego edita cada archivo en `src/database/migrations/` siguiendo el ejemplo anterior.

---

## 🚀 Recomendación Final: Método Más Simple

Para tu caso, te recomiendo usar **pgloader** + los datos existentes:

### Pasos Resumidos:

1. **Instalar pgloader** (en tu máquina local o WSL)
   ```bash
   # Windows (WSL)
   sudo apt-get install pgloader
   
   # macOS
   brew install pgloader
   ```

2. **Crear archivo de configuración** `migrate.load`:
   ```
   LOAD DATABASE
     FROM mysql://uuwdyns0qtehmspe:M38d2q2VrZsq9RfPGASC@bq7qyrfagcvxzvngubmv-mysql.services.clever-cloud.com:3306/bq7qyrfagcvxzvngubmv
     INTO postgresql://[PEGA_AQUI_TU_EXTERNAL_DATABASE_URL_DE_RENDER]
   
   WITH include drop, create tables, create indexes, reset sequences
   
   CAST type datetime to timestamptz
        drop default drop not null using zero-dates-to-null;
   ```

3. **Ejecutar migración**:
   ```bash
   pgloader migrate.load
   ```

✅ Esto copiará **estructura Y datos** automáticamente de MySQL a PostgreSQL.

---

## 🆘 ¿Cuál método prefieres?

**Opción A: pgloader** → Copia todo automáticamente (estructura + datos)
- ✅ Más rápido
- ✅ Mantiene tus datos actuales
- ⚠️ Requiere instalar pgloader

**Opción B: Sequelize sync()** → Crea estructura desde modelos
- ✅ No requiere herramientas externas
- ✅ Simple
- ⚠️ Pierdes datos actuales (necesitas recrearlos)

**Opción C: Migraciones manuales** → Más profesional
- ✅ Mejor práctica
- ✅ Versionado
- ⚠️ Más trabajo manual

Déjame saber cuál prefieres y te ayudo a ejecutarlo paso a paso. 🚀
