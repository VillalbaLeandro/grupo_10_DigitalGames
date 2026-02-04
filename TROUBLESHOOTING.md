# 🔧 Troubleshooting - Deployment en Render

Soluciones a problemas comunes al deployar en Render.

---

## ❌ Error: `DATABASE_URL` is undefined

### Síntoma
```
TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string. Received undefined
```

### Causa
La variable de entorno `DATABASE_URL` no está configurada en Render.

### Solución

#### Opción 1: Conectar PostgreSQL Database Automáticamente (Recomendado)

1. Ve a tu **Web Service** en Render Dashboard
2. Haz scroll hasta la sección **"Environment"**
3. Click en **"Add Environment Variable"**
4. En "Key", escribe: `DATABASE_URL`
5. En "Value", pega la **Internal Database URL** de tu PostgreSQL

**¿Cómo obtener la Internal Database URL?**

1. Ve a tu **PostgreSQL Database** en el Dashboard
2. En la sección **"Connections"**, busca **"Internal Database URL"**
3. Copia la URL completa (ejemplo: `postgresql://user:password@hostname/database`)
4. Pégala en el valor de `DATABASE_URL`

#### Opción 2: Usar render.yaml (si lo tienes configurado)

Si usas `render.yaml`, asegúrate de que esté correctamente conectado:

```yaml
services:
  - type: web
    name: digitalgames
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: digitalgames-db  # ← Debe coincidir con el nombre de tu database
          property: connectionString

databases:
  - name: digitalgames-db  # ← Mismo nombre aquí
    plan: free
```

**Pasos:**
1. Verifica que el nombre de la database coincida
2. Redeploy desde el Dashboard

---

## ❌ Error: relation "products" does not exist (42P01)

### Síntoma
```
SequelizeDatabaseError: relation "products" does not exist
code: "42P01"
```

### Causa
La base de datos PostgreSQL está conectada pero **las tablas no existen** todavía.

### Solución

#### Opción 1: Crear tablas automáticamente con Sequelize sync() (Rápido)

**En Render Shell:**

1. Ve a tu Web Service → **Shell** en el menú lateral
2. Click en **"Launch Shell"**
3. Ejecuta:

```bash
node -e "const db = require('./src/database/models'); db.sequelize.sync({ force: false }).then(() => { console.log('✅ Tablas creadas'); process.exit(0); }).catch(err => { console.error('❌ Error:', err); process.exit(1); });"
```

Espera a que termine (puede tardar 10-30 segundos).

#### Opción 2: Migrar datos desde MySQL con pgloader

Si tienes datos importantes en MySQL que quieres copiar:

**En tu máquina local (WSL/Linux/Mac):**

1. Instala pgloader:
   ```bash
   # WSL/Ubuntu/Debian
   sudo apt-get install pgloader
   
   # macOS
   brew install pgloader
   ```

2. Obtén la **External Database URL** desde Render:
   - PostgreSQL Database → Connections → **External Database URL**

3. Crea archivo `migrate.load`:
   ```
   LOAD DATABASE
     FROM mysql://uuwdyns0qtehmspe:M38d2q2VrZsq9RfPGASC@bq7qyrfagcvxzvngubmv-mysql.services.clever-cloud.com:3306/bq7qyrfagcvxzvngubmv
     INTO postgresql://[PEGA_AQUI_TU_EXTERNAL_DATABASE_URL]
   
   WITH include drop, create tables, create indexes, reset sequences
   
   CAST type datetime to timestamptz
        drop default drop not null using zero-dates-to-null;
   ```

4. Ejecuta:
   ```bash
   pgloader migrate.load
   ```

Esto copiará **estructura + datos** automáticamente de MySQL a PostgreSQL.

#### Verificar que las tablas fueron creadas

**En Render Shell (PostgreSQL):**

```bash
psql $DATABASE_URL -c "\dt"
```

Deberías ver todas tus tablas listadas.

---

## ⚠️ Warning: MemoryStore not designed for production

### Síntoma
```
Warning: connect.session() MemoryStore is not designed for a production environment
```

### Causa
Express Session está usando MemoryStore (almacenamiento en memoria) para las sesiones.

### Solución

Cambiar a un store persistente como **connect-pg-simple** (para PostgreSQL):

#### 1. Instalar dependencia
```bash
npm install connect-pg-simple
```

#### 2. Actualizar src/app.js

Reemplaza:
```javascript
app.use(session({
  secret: "Shhh, It's a secret",
  resave: false,
  saveUninitialized: false,
}));
```

Por:
```javascript
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

app.use(session({
  store: new pgSession({
    conString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    tableName: 'session'  // tabla donde se guardarán las sesiones
  }),
  secret: process.env.SESSION_SECRET || "Shhh, It's a secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 días
}));
```

#### 3. Crear migración para tabla de sesiones

Sequelize no maneja esta tabla automáticamente, créala manualmente:

```bash
npx sequelize-cli migration:generate --name create-session-table
```

En el archivo de migración:
```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('session');
  }
};
```

Luego corre la migración en producción.

**Nota:** Este cambio es opcional. El warning no impide que la app funcione, pero MemoryStore no es ideal para producción ya que:
- Las sesiones se pierden al reiniciar el servicio
- No escala a múltiples instancias

---

## 🔄 La app se duerme después de 15 minutos

### Síntoma
Después de ~15 minutos sin actividad, el primer request tarda 30-50 segundos.

### Causa
Plan gratuito de Render duerme los servicios inactivos.

### Solución

#### Opción 1: Usar un Keep-Alive Service (Gratis)

**UptimeRobot** - Hace ping cada 5 minutos:

1. Crea cuenta en [https://uptimerobot.com](https://uptimerobot.com)
2. Crea un "New Monitor":
   - Type: HTTP(s)
   - URL: Tu URL de Render (ej: `https://digitalgames.onrender.com`)
   - Monitoring Interval: 5 minutes
3. ✅ Listo! Tu app se mantendrá despierta

#### Opción 2: Upgrade a plan pago ($7/mes)

Los planes pagos de Render no se duermen.

---

## 🗄️ Database expira a los 90 días

### Síntoma
Después de 90 días, la PostgreSQL gratuita expira.

### Solución

#### Antes de que expire:

1. **Exportar datos** (desde Render Shell o pgAdmin):
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Crear nueva database gratuita** en Render

3. **Importar datos**:
   ```bash
   psql $NEW_DATABASE_URL < backup.sql
   ```

4. **Actualizar `DATABASE_URL`** en tu Web Service

#### Alternativas:
- **Neon.tech**: PostgreSQL gratis sin expiración (pero con límites)
- **Supabase**: PostgreSQL gratis (500 MB, 2 proyectos)
- Plan pago de Render ($7/mes, sin expiración)

---

## 🚨 Build falla con errores de dependencias

### Síntoma
```
npm ERR! Cannot find module 'X'
```

### Solución

1. Verifica que todas las dependencias estén en `package.json` (no solo en `devDependencies`)
2. Limpia cache y reinstala:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "fix: Update package-lock"
   git push
   ```

---

## 🔐 SSL/HTTPS no funciona

### Síntoma
La app carga pero el navegador muestra advertencia de seguridad.

### Solución

Render proporciona **SSL automático y gratuito**. Si tienes problemas:

1. Espera 10-15 minutos después del primer deploy (el certificado tarda en generarse)
2. Verifica que tu dominio apunte correctamente a Render (si usas custom domain)
3. En Render Settings → Custom Domain, verifica que el status sea "Live"

---

## 📞 ¿Necesitas más ayuda?

- 📚 [Documentación de Render](https://render.com/docs)
- 💬 [Render Community](https://community.render.com)
- 📖 [Sequelize Docs](https://sequelize.org/docs/v6/)
- 🐛 [Repositorio del proyecto](https://github.com/VillalbaLeandro/grupo_10_DigitalGame/issues)
