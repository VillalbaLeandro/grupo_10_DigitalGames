# 🚀 Deployment en Render - DigitalGames

Guía paso a paso para deployar DigitalGames en Render con PostgreSQL gratuita.

## 📋 Pre-requisitos

- Cuenta en [Render](https://render.com) (puedes usar tu cuenta de GitHub)
- Repositorio de GitHub con el código actualizado
- Las dependencias ya están configuradas en el proyecto

---

## ✅ Cambios Ya Realizados en el Proyecto

Los siguientes cambios ya fueron aplicados al proyecto:

1. ✅ Agregadas dependencias: `pg`, `pg-hstore`, `dotenv`
2. ✅ Configuración de variables de entorno (`.env` y `.env.example`)
3. ✅ Actualizado `.gitignore` para proteger credenciales
4. ✅ Configuración de Sequelize para PostgreSQL en producción
5. ✅ Archivo `render.yaml` creado para autodeploy
6. ✅ Script `npm run migrate` para correr migraciones

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Commit y Push de los cambios

```bash
# Asegúrate de estar en el directorio del proyecto
git add .
git commit -m "feat: Preparar proyecto para deployment en Render con PostgreSQL"
git push origin main
```

> [!WARNING]
> **Verifica tu .gitignore**: Asegúrate de que `.env` y `src/controllers/config.js` estén en el `.gitignore` para NO subir credenciales al repositorio.

---

## 🌐 Paso 2: Crear Web Service en Render

### 2.1 Ir a Render Dashboard
1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**

### 2.2 Conectar Repositorio
1. Selecciona **"Build and deploy from a Git repository"**
2. Click en **"Connect GitHub"** (si no lo has hecho)
3. Busca y selecciona tu repositorio: `VillalbaLeandro/grupo_10_DigitalGame`

### 2.3 Configurar Web Service
Completa el formulario con estos datos:

| Campo | Valor |
|-------|-------|
| **Name** | `digitalgames` (o el nombre que prefieras) |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | (dejar vacío) |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 2.4 Variables de Entorno
Antes de crear el servicio, ve a la sección **"Environment Variables"** y agrega:

```
NODE_ENV=production
SESSION_SECRET=TuSecretoSuperSeguroAquí123!
```

> [!NOTE]
> NO agregues `DATABASE_URL` todavía. La agregaremos automáticamente cuando conectemos la base de datos.

### 2.5 Crear el servicio
- Click en **"Create Web Service"**
- Render comenzará a hacer el build (tomará unos minutos)
- **NO te preocupes si falla**, es porque aún no tenemos la base de datos

---

## 🗄️ Paso 3: Crear PostgreSQL Database

### 3.1 Crear Base de Datos
1. En el Dashboard de Render, click en **"New +"** → **"PostgreSQL"**
2. Completa el formulario:

| Campo | Valor |
|-------|-------|
| **Name** | `digitalgames-db` |
| **Database** | `digitalgames` |
| **User** | `digitalgames` |
| **Region** | Oregon (US West) - **misma región que tu web service** |
| **PostgreSQL Version** | 16 (la más reciente) |
| **Plan Type** | **Free** |

3. Click en **"Create Database"**
4. Espera a que la base de datos se active (1-2 minutos)

### 3.2 Copiar Credenciales
Una vez creada, verás información de conexión:
- Internal Database URL
- External Database URL
- PSQL Command

> [!IMPORTANT]
> Usa la **Internal Database URL** para tu web service en Render (es más rápida y gratuita).

---

## 🔗 Paso 4: Conectar Database al Web Service

### 4.1 Agregar DATABASE_URL
1. Ve a tu **Web Service** (`digitalgames`)
2. Click en **"Environment"** en el menú lateral
3. Click en **"Add Environment Variable"**
4. Agrega:
   - **Key**: `DATABASE_URL`
   - **Value**: Pega la **Internal Database URL** que copiaste

### 4.2 Redeploy
- Render automáticamente hará redeploy con la nueva variable
- Espera a que el build complete (2-3 minutos)

---

## 🏗️ Paso 5: Correr Migraciones

Ahora necesitas crear las tablas en PostgreSQL.

### 5.1 Abrir Render Shell
1. En tu Web Service, ve a **"Shell"** en el menú lateral
2. Click en **"Launch Shell"**
3. Espera a que se conecte

### 5.2 Correr Migraciones
En la shell de Render, ejecuta:

```bash
NODE_ENV=production npm run migrate
```

> [!TIP]
> Si las migraciones fallan, verifica que:
> - `DATABASE_URL` esté correctamente configurada
> - La base de datos esté activa en el Dashboard

### 5.3 (Opcional) Seeders
Si tienes seeders para poblar datos iniciales:

```bash
NODE_ENV=production npx sequelize-cli db:seed:all
```

---

## ✅ Paso 6: Verificar Deployment

### 6.1 Verificar que la App esté Running
1. Ve a tu Web Service en Render
2. En la parte superior verás el status: **"Live"** ✅
3. Click en la URL de tu app (algo como `https://digitalgames.onrender.com`)

### 6.2 Pruebas Básicas
Verifica que funcione:
- ✅ La página principal carga
- ✅ Endpoints de API responden (`/api/products`, `/api/users`)
- ✅ Puedes ver productos si tienes seeders
- ✅ Login/registro funcionan (si los tienes implementados)

---

## 🔧 Configuración Adicional (Opcional)

### Auto-Deploy desde GitHub
Render ya tiene auto-deploy activado por defecto. Cada vez que hagas push a `main`, se redeploya automáticamente.

### Logs en Tiempo Real
Para ver logs:
1. Ve a tu Web Service
2. Click en **"Logs"** en el menú lateral
3. Verás logs en tiempo real de tu aplicación

### Variables de Entorno Adicionales
Si necesitas agregar más variables (API keys, etc.):
1. Ve a **"Environment"**
2. Click en **"Add Environment Variable"**
3. Agrega las que necesites

---

## 🐛 Troubleshooting

### La app se duerme
**Problema**: Después de 15 minutos de inactividad, la app gratis se duerme.

**Solución**: Es normal en el plan gratuito. El primer request la despertará (30-50 segundos).

**Alternativa**: Puedes usar servicios como [UptimeRobot](https://uptimerobot.com) para hacer ping cada 5 minutos y mantenerla despierta.

### Error de conexión a la base de datos
**Verificar**:
1. `DATABASE_URL` está configurada en Environment
2. La base de datos PostgreSQL está activa (status "Available")
3. Ambos servicios están en la **misma región**

### Migraciones fallan
**Solución**:
```bash
# En Render Shell, verificar que Sequelize detecta el ambiente correcto
echo $NODE_ENV  # Debe mostrar "production"
echo $DATABASE_URL  # Debe mostrar la URL de PostgreSQL

# Correr migraciones manualmente
NODE_ENV=production npx sequelize-cli db:migrate --debug
```

### Build falla
**Verificar** en los logs:
1. Que todas las dependencias se instalen correctamente
2. Que no haya errores de sintaxis en el código
3. Que `package.json` tenga todas las dependencias necesarias

---

## 📊 Recursos y Límites del Plan Gratuito

### Web Service (Free)
- ✅ 750 horas/mes (suficiente para un proyecto)
- ✅ 512 MB RAM
- ✅ Se duerme después de 15 min de inactividad
- ✅ SSL automático (HTTPS)
- ✅ Auto-deploy desde GitHub

### PostgreSQL (Free)
- ✅ 256 MB RAM
- ✅ 1 GB de almacenamiento
- ✅ Expira a los **90 días** (pero puedes crear una nueva)
- ✅ 97 horas uptime/mes

---

## 🎉 ¡Listo!

Tu aplicación está ahora deployed en:
- 🌐 **URL**: `https://digitalgames.onrender.com` (o tu nombre personalizado)
- 🗄️ **Base de Datos**: PostgreSQL gratuita en Render

### Próximos Pasos
1. Comparte la URL con tu equipo
2. Agrega el link a tu README.md
3. Configura un custom domain si tienes uno (en Render Settings)

---

## 📚 Enlaces Útiles

- [Render Documentation](https://render.com/docs)
- [Sequelize PostgreSQL Guide](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)
- [GitHub Repository](https://github.com/VillalbaLeandro/grupo_10_DigitalGame)
