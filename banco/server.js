import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const FILE_PATH = "produtos.json";
const USERS_FILE_PATH = "users.json";
const SECRET_KEY = "segredo_admin"; // Use uma variável de ambiente em produção

app.use(cors());
app.use(bodyParser.json());
app.use('/produtos_imagens', express.static(path.join(__dirname, '../img/produtos_imagens')));

// Configuração do multer para salvar arquivos na pasta 'produtos_imagens'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../img/produtos_imagens'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Função para ler o arquivo JSON
const lerProdutos = () => JSON.parse(fs.readFileSync(FILE_PATH));

// Função para ler o arquivo de usuários
const lerUsuarios = () => JSON.parse(fs.readFileSync(USERS_FILE_PATH));

// Middleware para verificar o token JWT
const verificarToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Token necessário" });
    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.admin = decoded;
        next();
    });
};

// Rota de login
app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;
    const usuarios = lerUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if (usuarioEncontrado) {
        const token = jwt.sign({ usuario }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ sucesso: true, token });
    } else {
        res.status(401).json({ sucesso: false, message: "Usuário ou senha incorretos" });
    }
});

// Listar todos os produtos
app.get("/produtos", (req, res) => {
    res.json(lerProdutos());
});

// Adicionar um novo produto (apenas admin)
app.post("/produtos", verificarToken, upload.single('imagem'), (req, res) => {
    const produtos = lerProdutos();
    const novoProduto = req.body;
    novoProduto.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
    if (req.file) {
        novoProduto.imagem = `../img/produtos_imagens/${req.file.filename}`;
    }
    produtos.push(novoProduto);
    fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
    res.json({ message: "Produto adicionado!" });
});

// Atualizar um produto (apenas admin)
app.put("/produtos/:id", verificarToken, upload.single('imagem'), (req, res) => {
    const produtos = lerProdutos();
    const id = parseInt(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index !== -1) {
        const produtoAtualizado = { ...produtos[index], ...req.body };
        if (req.file) {
            produtoAtualizado.imagem = `../img/produtos_imagens/${req.file.filename}`;
        }
        produtos[index] = produtoAtualizado;
        fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
        res.json({ message: "Produto atualizado!" });
    } else {
        res.status(404).json({ message: "Produto não encontrado!" });
    }
});

// Remover um produto (apenas admin)
app.delete("/produtos/:id", verificarToken, (req, res) => {
    let produtos = lerProdutos();
    const id = parseInt(req.params.id);
    produtos = produtos.filter(p => p.id !== id);
    fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
    res.json({ message: "Produto removido!" });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
