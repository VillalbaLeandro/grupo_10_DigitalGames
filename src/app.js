
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const cookies = require("cookie-parser");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.resolve(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({
	secret: "Shhh, It's a secret",
	resave: false,
	saveUninitialized: false,
}));
const userLoggedMiddleware = require("./middlewares/userLoggedMiddleware");


app.use(cookies());

app.use(userLoggedMiddleware);


/****************REQUIRE MODULES************************** */
const rutasProductos = require("./routes/products.js");
const mainRoutes = require("./routes/main.js");
const apiProductsRoutes = require("./routes/api/apiProductsRoutes")
const apiUsersRoutes = require("./routes/api/apiUsersRoutes")

/* MIDDLEWARE */
/******************RUTAS********************/
app.use("/products", rutasProductos);
app.use("/api/products", apiProductsRoutes);
app.use("/api/users", apiUsersRoutes);
app.use("/", mainRoutes);

// /=== api routes =====/



/******************FIN RUTAS********************/

// ************ERROR 404 NOTFOUND ******************* //
app.use((req, res, next) => {
	res.status(404).render("not-found");
	next()
});
// ************************************************** //

// Sincronizar base de datos en producción (crear tablas si no existen)
const db = require("./database/models");

const port = process.env.PORT || 4040;

async function startServer() {
	try {
		// En producción (PostgreSQL), sincronizar la base de datos
		if (process.env.NODE_ENV === 'production') {
			console.log('🔄 Sincronizando base de datos PostgreSQL...');
			await db.sequelize.sync({ force: false }); // force: false = no elimina datos existentes
			console.log('✅ Base de datos sincronizada');
		}

		app.listen(port, () => {
			console.log(`✅ Servidor iniciado en: ${port}`);
			console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
		});
	} catch (error) {
		console.error('❌ Error al iniciar el servidor:', error);
		process.exit(1);
	}
}

startServer();
