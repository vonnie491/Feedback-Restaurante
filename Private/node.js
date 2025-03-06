const express = require('express');
const multer = require('multer');
const sequelize = require('./db');
const Usuario = require("./models/usuario");
const Prato = require("./models/prato");
const Imagem = require("./models/imagem");
const Avaliacao = require("./models/avaliacao");
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

//Registrar usuário
app.post("/registrar", async (req, res) => {
    try {
        const {nome, senha} = req.body;

        const verificar = await Usuario.findOne({where: {nome}});

        if (verificar) {
            return res.status(400).json({ error: "Esse nome já está em uso." });
        }

        const usuario = await Usuario.create({nome, senha});
        res.status(201).json({message: "Usuário registrado", usuario});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: "Erro ao registrar"});
    }
});

//Login
app.post("/login", async (req, res) => {
    try {
        const {nome, senha} = req.body;

        const usuario = await Usuario.findOne({where: {nome}});

        if(!usuario){
            return res.status(401).json({error: "Usuário não encontrado"});
        }

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
        const usuarios = await Usuario.findAll({where: {tipo: 0}, attributes: ["id", "nome", "senha"]});

        res.json(usuarios)
    }
    catch (error){
        console.error(error);
        res.status(500).json({error: "Erro na busca de usuários"})
    }
});

//Deletar usuário
app.delete("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Usuario.destroy({
            where: { id: id }
        });

        if (result === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json({ message: `Usuário ${id} deletado com sucesso!` });
    }
    catch (err) {
        console.error("Erro ao deletar usuário:", err);
        res.status(500).json({ error: "Erro ao deletar usuário" });
    }
});


//Atualizar usuário
app.put("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, senha } = req.body;

        console.log(`Tentando atualizar usuário com ID: ${id}`);
        console.log("Dados recebidos:", { nome, senha });

        const [updated] = await Usuario.update(
            { nome, senha },
            { where: { id: Number(id) } }
        );

        if (updated === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json({ message: `Usuário ${id} atualizado com sucesso!` });
    }
    catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

//Criar pratos
app.post("/pratos", upload.single("imagem"), async (req, res) => {
    try {
        const { nome, preco, descricao } = req.body;
        const imagemPath = req.file ? req.file.filename : null;

        if (!imagemPath) {
            return res.status(400).json({ error: "Imagem é obrigatória" });
        }

        const novoPrato = await Prato.create({ nome, preco, descricao });

        await Imagem.create({
            prato_id: novoPrato.id,
            caminho: imagemPath
        });

        res.status(201).json({ message: "Prato criado com sucesso!", prato: novoPrato });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar prato" });
    }
});

//Exibir pratos
app.get("/pratos", async (req, res) => {
    try {
        console.log('Rota /pratos foi chamada');
        const pratos = await Prato.findAll({
            include: [{ model: Imagem, as: 'imagem' }]
        });

        console.log('Pratos encontrados:', pratos);
        res.status(200).json(pratos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar pratos" });
    }
});

//Deletar prato
app.delete("/pratos/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await Avaliacao.destroy({
            where: { prato_nome: id }
        });

        const result = await Prato.destroy({
            where: { id: id }
        });

        if (result === 0) {
            return res.status(404).json({ error: "Prato não encontrado" });
        }

        res.status(200).json({ message: `Prato ${id} e suas avaliações deletados com sucesso!` });
    }
    catch (err) {
        console.error("Erro ao deletar prato:", err);
        res.status(500).json({ error: "Erro ao deletar prato" });
    }
});

//Atualizar prato
app.put("/pratos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, descricao } = req.body;

        const [updated] = await Prato.update(
            { nome, preco, descricao },
            { where: { id: id } }
        );

        if (updated === 0) {
            return res.status(404).json({ error: "Prato não encontrado" });
        }

        res.status(200).json({ message: `Prato ${id} atualizado com sucesso!` });
    }
    catch (err) {
        console.error("Erro ao atualizar prato:", err);
        res.status(500).json({ error: "Erro ao atualizar prato" });
    }
});

//Criar avaliação
app.post("/avaliacoes", async (req, res) => {
    try {
        const { nome_cliente, prato_nome, nota, comentario } = req.body;

        if (!nome_cliente || !prato_nome || !comentario) {
            return res.status(400).json({ error: "Nome do cliente, prato e comentário são obrigatórios." });
        }

        const avaliacaoExistente = await Avaliacao.findOne({
            where: { nome_cliente, prato_nome }
        });

        if (avaliacaoExistente) {
            await Avaliacao.update(
                { nota, comentario },
                { where: { nome_cliente, prato_nome } }
            );

            return res.status(200).json({ message: "Avaliação atualizada com sucesso!" });
        }
        else{
            const avaliacao = await Avaliacao.create({ nome_cliente, prato_nome, nota, comentario });
            return res.status(201).json(avaliacao);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao salvar avaliação" });
    }
});

//Exibir avaliações
app.get("/avaliacoes", async (req, res) => {
    try {
        const pratoNome = req.query.prato;
        if (!pratoNome) {
            return res.status(400).json({ error: "Nome do prato é necessário" });
        }

        const avaliacoes = await Avaliacao.findAll({
            where: { prato_nome: pratoNome }
        });

        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar avaliações" });
    }
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/login.html'));
});

app.listen(80, async () => {
    await sequelize.sync();
    console.log('Servidor rodando em http://localhost:80');
});