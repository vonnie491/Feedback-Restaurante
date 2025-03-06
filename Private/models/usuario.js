const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Usuario = sequelize.define("usuario", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
},
{
    tableName: "usuario", 
    timestamps: false,
}
);

module.exports = Usuario;