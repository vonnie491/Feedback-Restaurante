const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Cliente = require("./usuario");
const Prato = require("./prato");

const Avaliacao = sequelize.define('avaliacao', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome_cliente: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    prato_nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
},
{
    tableName: 'avaliacoes',
    timestamps: false,
});

Avaliacao.belongsTo(Cliente, { foreignKey: 'nome_cliente', targetKey: 'nome' });
Avaliacao.belongsTo(Prato, { foreignKey: 'prato_nome', targetKey: 'nome' });

module.exports = Avaliacao;
