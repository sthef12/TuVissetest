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

// Configuração do multer para salvar arquivos na pasta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const produtoNome = req.body.nome.replace(/\s+/g, "_").toLowerCase(); // Substituir espaços por "_" e deixar em minúsculas
        const dir = path.join(__dirname, `../img/produtos_imagens/${produtoNome}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

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

// Função para remover arquivos antigos
const removerArquivo = (caminho) => {
    if (fs.existsSync(caminho)) {
        try {
            fs.unlinkSync(caminho);
        } catch (err) {
            if (err.code === 'EBUSY') {
                setTimeout(() => {
                    try {
                        fs.unlinkSync(caminho);
                    } catch (err) {
                        console.error(`Erro ao remover arquivo: ${err.message}`);
                    }
                }, 100);
            } else {
                console.error(`Erro ao remover arquivo: ${err.message}`);
            }
        }
    }
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
app.post(
    "/produtos",
    upload.any(), // Aceita qualquer campo de arquivo
    (req, res) => {
        try {
            const produto = req.body;

            // Processar imagens principais
            if (req.files) {
                req.files.forEach((file) => {
                    const relativePath = path.relative(__dirname, file.path).replace(/\\/g, "/");
                    if (file.fieldname === "imagem") {
                        produto.imagem = relativePath;
                    } else if (file.fieldname === "imagem_medidas") {
                        produto.imagem_medidas = relativePath;
                    } else if (file.fieldname.startsWith("cores")) {
                        const match = file.fieldname.match(/cores\[(\d+)\]\[(.+)\]/);
                        if (match) {
                            const index = parseInt(match[1], 10);
                            const field = match[2];
                            produto.cores = produto.cores || [];
                            produto.cores[index] = produto.cores[index] || {};
                            produto.cores[index][field] = relativePath;
                        }
                    }
                });
            }

            // Salvar o produto
            const produtos = lerProdutos();
            produto.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
            produtos.push(produto);
            fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));

            res.json({ message: "Produto salvo com sucesso!", produto });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao salvar o produto." });
        }
    }
);

// Atualizar um produto (apenas admin)
app.put("/produtos/:id", verificarToken, upload.any(), (req, res) => {
    const produtos = lerProdutos();
    const id = parseInt(req.params.id);
    const index = produtos.findIndex((p) => p.id === id);

    if (index !== -1) {
        const produtoAtualizado = { ...produtos[index], ...req.body };

        // Processar imagens
        if (req.files) {
            req.files.forEach((file) => {
                if (file.fieldname === "imagem") {
                    removerArquivo(produtos[index].imagem);
                    produtoAtualizado.imagem = file.path;
                } else if (file.fieldname === "imagem_medidas") {
                    removerArquivo(produtos[index].medidasimagem);
                    produtoAtualizado.medidasimagem = file.path;
                } else if (file.fieldname.startsWith("cores")) {
                    const match = file.fieldname.match(/cores\[(\d+)\]\[(.+)\]/);
                    if (match) {
                        const corIndex = parseInt(match[1], 10);
                        const field = match[2];
                        produtoAtualizado.cores = produtoAtualizado.cores || [];
                        produtoAtualizado.cores[corIndex] = produtoAtualizado.cores[corIndex] || {};
                        produtoAtualizado.cores[corIndex][field] = file.path;
                    }
                }
            });
        }

        produtos[index] = produtoAtualizado;
        fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
        res.json({ message: "Produto atualizado com sucesso!" });
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
