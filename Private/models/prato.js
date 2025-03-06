const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Prato = sequelize.define("prato", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    preco: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    descricao: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
},
{
    tableName: "pratos",
    timestamps: false
}
);

module.exports = Prato;