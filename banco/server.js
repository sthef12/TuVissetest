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
        const nomeProduto = req.body.nome.replace(/\s+/g, '_').toLowerCase();
        const dir = path.join(__dirname, `../img/produtos_imagens/${nomeProduto}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
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
app.post("/produtos", verificarToken, upload.fields([{ name: 'imagem' }, { name: 'imagem_medidas' }, { name: 'imagens_cores' }]), (req, res) => {
    const produtos = lerProdutos();
    const novoProduto = req.body;
    novoProduto.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
    const nomeProduto = req.body.nome.replace(/\s+/g, '_').toLowerCase();
    if (req.files['imagem']) {
        novoProduto.imagem = `../img/produtos_imagens/${nomeProduto}/${req.files['imagem'][0].filename}`;
    }
    if (req.files['imagem_medidas']) {
        novoProduto.medidasimagem = `../img/produtos_imagens/${nomeProduto}/${req.files['imagem_medidas'][0].filename}`;
    }
    if (req.files['imagens_cores']) {
        novoProduto.imagens_cores = Array.from(req.files['imagens_cores']).map(file => ({
            cor: file.originalname.split('.')[0], // Assuming the color is part of the filename
            caminho: `../img/produtos_imagens/${nomeProduto}/${file.filename}`
        }));
    }
    novoProduto.cores = Array.isArray(novoProduto.cores) ? novoProduto.cores : novoProduto.cores.split(',').map(c => c.trim());
    novoProduto.tamanhos = Array.isArray(novoProduto.tamanhos) ? novoProduto.tamanhos : novoProduto.tamanhos.split(',').map(t => t.trim());
    novoProduto.medidas = Array.isArray(novoProduto.medidas) ? novoProduto.medidas : novoProduto.medidas.split(',').map(m => {
        const [tamanho, medida] = m.split(':').map(part => part.trim());
        return { tamanho, medida };
    });
    novoProduto.preco = parseFloat(novoProduto.preco);
    novoProduto.estoque = parseInt(novoProduto.estoque, 10);
    produtos.push(novoProduto);
    fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
    res.json({ message: "Produto adicionado!" });
});

// Atualizar um produto (apenas admin)
app.put("/produtos/:id", verificarToken, upload.fields([{ name: 'imagem' }, { name: 'imagem_medidas' }, { name: 'imagens_cores' }]), (req, res) => {
    const produtos = lerProdutos();
    const id = parseInt(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index !== -1) {
        const produtoAtualizado = { ...produtos[index], ...req.body };
        const nomeProduto = req.body.nome.replace(/\s+/g, '_').toLowerCase();
        if (req.files['imagem']) {
            produtoAtualizado.imagem = `../img/produtos_imagens/${nomeProduto}/${req.files['imagem'][0].filename}`;
        }
        if (req.files['imagem_medidas']) {
            produtoAtualizado.medidasimagem = `../img/produtos_imagens/${nomeProduto}/${req.files['imagem_medidas'][0].filename}`;
        }
        if (req.files['imagens_cores']) {
            produtoAtualizado.imagens_cores = Array.from(req.files['imagens_cores']).map(file => ({
                cor: file.originalname.split('.')[0], // Assuming the color is part of the filename
                caminho: `../img/produtos_imagens/${nomeProduto}/${file.filename}`
            }));
        }
        produtoAtualizado.cores = Array.isArray(produtoAtualizado.cores) ? produtoAtualizado.cores : produtoAtualizado.cores.split(',').map(c => c.trim());
        produtoAtualizado.tamanhos = Array.isArray(produtoAtualizado.tamanhos) ? produtoAtualizado.tamanhos : produtoAtualizado.tamanhos.split(',').map(t => t.trim());
        produtoAtualizado.medidas = Array.isArray(produtoAtualizado.medidas) ? produtoAtualizado.medidas : produtoAtualizado.medidas.split(',').map(m => {
            const [tamanho, medida] = m.split(':').map(part => part.trim());
            return { tamanho, medida };
        });
        produtoAtualizado.preco = parseFloat(produtoAtualizado.preco);
        produtoAtualizado.estoque = parseInt(produtoAtualizado.estoque, 10);
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
