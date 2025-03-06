const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Prato = require("./prato");

const Imagem = sequelize.define("imagem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prato_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: Prato,
            key: "id"
        },
        onDelete: "CASCADE"
    },
    caminho: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "imagens",
    timestamps: false
});

Prato.hasOne(Imagem, { foreignKey: "prato_id", onDelete: "CASCADE" });
Imagem.belongsTo(Prato, { foreignKey: "prato_id" });

module.exports = Imagem;
