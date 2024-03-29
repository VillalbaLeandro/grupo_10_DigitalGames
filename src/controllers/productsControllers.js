const db = require("../database/models");
const { validationResult } = require("express-validator");

const productosController = {
    list: (req, res) => {

        // res.render("index", { products });

        db.Product.findAll(
            { include: ["compatibilities", "genders"] })
            .then(products => {
                console.log(products)
                res.json (products);

            })
            .catch(err => {
                res.send(err);
            });
    },
    detail: (req, res) => {
        db.Product.findByPk(req.params.id, {
            include: ["genders", "compatibilities", "lenguages", "players"],

        })
            .then(product => {
                res.render("products/productDetail", { product })
            })
            .catch(err => {
                res.send(err);
            });
    },
    crear: (req, res) => {
        res.render("admin/createProduct");
    },
    store: (req, res) => {
        const resultValidation = validationResult(req);

        if (resultValidation.errors.length > 0) {
            return res.render("../views/admin/createProduct.ejs", {
                errors: resultValidation.mapped(),
                oldData: req.body
            });
        }

        const newProduct = {
            name: req.body.name,
            compatibilities: req.body.compatibilities,
            gender: req.body.gender,
            players: req.body.players,
            price: req.body.price,
            lenguage: req.body.language,
            releaseData: req.body.releaseData,
            img: req.body.img,
            fullName: req.body.fullName,
            description: req.body.description,
            capture1: req.body.capture1,
            capture2: req.body.capture2,
            capture3: req.body.capture3,
            capture4: req.body.capture4,
            video: req.body.video,
            discount: req.body.discount,
            freeShipping: req.body.freeShipping,
            categori: "",
        }
        console.log("NEW PRODUCT")
        console.log(newProduct)

        db.Product.create(newProduct)
            .then((data) => {

                //gendres
                let tablaPivotGenre = "";
                if (Array.isArray(req.body.gender)) {
                    tablaPivotGenre = req.body.gender.map(gender => {
                        return {
                            products_id: data.id,
                            genders_id: Number(gender)
                        }
                    });

                } else {
                    tablaPivotGenre = [{
                        products_id: data.id,
                        genders_id: Number(req.body.gender)
                    }]
                }
                db.ProductGender.bulkCreate(tablaPivotGenre)

                // player

                let tablaPivotPLayer = "";
                if (Array.isArray(req.body.players)) {
                    tablaPivotPLayer = req.body.players.map(players => {
                        return {
                            products_id: data.id,
                            players_id: Number(players)
                        }
                    });

                } else {
                    tablaPivotPLayer = [{
                        products_id: data.id,
                        players_id: Number(req.body.players)
                    }]
                }

                db.ProductPlayer.bulkCreate(tablaPivotPLayer)

                //compatibilities

                let tablaPivotCompat = "";
                if (Array.isArray(req.body.compatibilities)) {
                    tablaPivotCompat = req.body.compatibilities.map(compatibilities => {
                        return {
                            products_id: data.id,
                            compatibilities_id: Number(compatibilities)
                        }
                    });

                } else {
                    tablaPivotCompat = [{
                        products_id: data.id,
                        compatibilities_id: Number(req.body.compatibilities)
                    }]
                }
                db.ProductCompatibility.bulkCreate(tablaPivotCompat)



                //lenguages

                let tablaPivotLenguages = "";
                if (Array.isArray(req.body.language)) {
                    tablaPivotLenguages = req.body.language.map(lenguage => {
                        return {
                            products_id: data.id,
                            lenguages_id: Number(lenguage)
                        }
                    });

                } else {
                    tablaPivotLenguages = [{
                        products_id: data.id,
                        lenguages_id: Number(req.body.language)
                    }]
                }
                db.ProductLenguages.bulkCreate(tablaPivotLenguages)
                res.redirect("/home")


            })



            .catch(error => {
                console.log(error)
            })

        // //

        // const tablaPivotPLayer = req.body.players.map(players => {
        //     return  {
        //         products_id: prductCreated.id,
        //         players_id: Number(players)
        //     }
        // });
        // db.ProductGender.bulkCreate(tablaPivotPLayer)

        // //

        // const tablaPivotCompatibilities = req.body.compatibilities.map(compatibilities => {
        //     return  {
        //         products_id: prductCreated.id,
        //         compatibilities_id: Number(compatibilities)
        //     }
        // });
        // db.ProductGender.bulkCreate(tablaPivotCompatibilities)

        // //

        // const tablaPivotLenguages = req.body.language.map(language => {
        //     return  {
        //         products_id: prductCreated.id,
        //         Lenguages_id: Number(language)
        //     }
        // });
        // db.ProductGender.bulkCreate(tablaPivotLenguages)



    },
    editar: (req, res) => {
        db.Product.findByPk(req.params.id)
            .then((product) => {
                res.render("admin/editProduct", { product })
            })
            .catch(error => {
                console.log(error)
            })

    },
    update: (req, res) => {

        db.Product.update({
            name: req.body.name,
            compatibilities: JSON.stringify(req.body.compatibilities),
            gender: JSON.stringify(req.body.gender),
            players: JSON.stringify(req.body.players),
            price: req.body.price,
            language: JSON.stringify(req.body.language),
            releaseData: req.body.releaseData,
            img: req.body.img,
            fullName: req.body.fullName,
            description: req.body.description,
            capture1: req.body.capture1,
            capture2: req.body.capture2,
            capture3: req.body.capture3,
            capture4: req.body.capture4,
            video: req.body.video,
            discount: req.body.discount,
            freeShipping: req.body.freeShipping,
            categori: "",
        },
            {
                where: {
                    id: req.params.id
                }
            })

        res.redirect("/home");

    },
    carrito: (req, res) => {
        res.render("products/productCart");
    },
    delete: (req, res) => {
        let id = req.params.id;

        db.Product.destroy({ where: { id: id } })
            .then((data) => {
                res.redirect("/home")
            })



    },
    filter: (req, res) => {
        db.Product.findAll({ include: ["genders", "compatibilities", "lenguages", "players"] })
            .then((products) => {
                
                let filter = req.params.filter
                filter = filter[0].toUpperCase();
                
                res.render("filters/accionFilter", { products, filter })
            })
            .catch(error => {
                console.log(error)
            })
    },
    consolas: (req, res)=>{
        db.Product.findAll({ include: ["genders", "compatibilities", "lenguages", "players"] })
        .then((products) => {
            
            let filter = req.params.filter
            filter = filter[0].toUpperCase();

            res.render("filters/compatibilityFilter", { products, filter })
        })
        .catch(error => {
            console.log(error)
        })

    },
    news: (req, res) =>{
        db.Product.findAll(
            { include: ["compatibilities", "genders"] })
            .then(products => {
                console.log(products)
                res.render("products/productsNew", { products });

            })
            .catch(err => {
                res.send(err);
            });
    },
    oferts: (req, res) =>{
        db.Product.findAll(
            { include: ["compatibilities", "genders"] })
            .then(products => {
                console.log(products)
                res.render("products/productsOferts", { products });

            })
            .catch(err => {
                res.send(err);
            });
    }


};
module.exports = productosController;