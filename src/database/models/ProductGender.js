module.exports = (sequelize, dataTypes) => {
    const alias = 'ProductGender';

    const cols = {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        products_id: {
            type: dataTypes.INTEGER,
        },

        genders_id: {
            type: dataTypes.INTEGER,
        }


    };

    const config = {
        tableName: 'products_has_genders',
        timestamps: false
    };
    const ProductGender = sequelize.define(alias, cols, config);


    return ProductGender;
}