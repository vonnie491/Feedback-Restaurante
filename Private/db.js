const {Sequelize} = require("sequelize");

const sequelize = new Sequelize("Feedback Restaurante", "postgres", "pabd", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

sequelize   .authenticate()
    .then(() => console.log("Conectado ao banco de dados"))
    .catch((err) => console.error("Erro ao conectar ao banco de dados"))

module.exports = sequelize;