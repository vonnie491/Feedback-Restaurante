const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

app.use(cors());
app.use(bodyParser.json())
app.use(express.json());

//Conectar com o bando de dados
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Feedback Restaurante",
    password: "pabd",
    port: 5432,
});

//Registrar
app.post("/registrar", async (req, res) => {
    try{
        const {nome, senha} = req.body;

        const verificar = await pool.query("SELECT * FROM usuario WHERE nome = $1", [nome]);

        if (verificar.rows.length > 0) {
            return res.status(400).json({ error: "Esse nome já está em uso." });
        }

        const result = await pool.query(
            "INSERT INTO usuario (nome, senha, tipo) VALUES ($1, $2, 0) RETURNING *",
            [nome, senha]
        );
        res.status(201).json({message: "Usuário registrado", usuario: result.rows[0]});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: "Erro ao registrar"});
    }
});

//Login
app.post("/login", async (req, res) => {
    try{
        const {nome, senha} = req.body;

        const result = await pool.query("SELECT * FROM usuario WHERE nome = $1", [nome]);

        if(result.rows.length === 0){
            return res.status(401).json({error: "Usuário não encontrado"});
        }

        const usuario = result.rows[0];

        if(usuario.senha !== senha){
            return res.status(401).json({error: "Senha incorreta"});
        }
        res.status(200).json({message: "Login bem sucedido", usuario: usuario.nome});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: "Erro ao fazer login"})
    }
});

//Exibir usuários na página Admin
app.get("/usuarios", async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');

        console.log('Rota /usuarios foi chamada');
        const result = await pool.query("SELECT nome, senha FROM usuario WHERE tipo = 0");
        console.log(result.rows);
        res.json(result.rows)
    }
    catch (error){
        console.error(err);
        res.status(500).json({error: "Erro na busca de usuários"})
    }
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
});

app.listen(80, () => {
    console.log('Servidor rodando em http://localhost:80');
});