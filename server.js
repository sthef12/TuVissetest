import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const FILE_PATH = "produtos.json";
const USERS_FILE_PATH = "users.json";
const SECRET_KEY = "segredo_admin"; // Use variável de ambiente em produção

// ✔️ Cloudinary Configuração
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ✔️ Multer configurado para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "produtos_imagens",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✔️ Garantir que arquivos JSON existam
if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, "[]");
if (!fs.existsSync(USERS_FILE_PATH)) fs.writeFileSync(USERS_FILE_PATH, "[]");

// Funções auxiliares
const lerProdutos = () => JSON.parse(fs.readFileSync(FILE_PATH));
const lerUsuarios = () => JSON.parse(fs.readFileSync(USERS_FILE_PATH));

// Middleware JWT
const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Token necessário" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.admin = decoded;
    next();
  });
};

// ✔️ Rota de upload simples (para teste)
app.post("/upload", upload.single("imagem"), (req, res) => {
  res.json({ url: req.file.path });
});

// ✔️ Rota de login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  const usuarios = lerUsuarios();
  const usuarioEncontrado = usuarios.find(
    (u) => u.usuario === usuario && u.senha === senha
  );

  if (usuarioEncontrado) {
    const token = jwt.sign({ usuario }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ sucesso: true, token });
  } else {
    res
      .status(401)
      .json({ sucesso: false, message: "Usuário ou senha incorretos" });
  }
});

// ✔️ Listar produtos
app.get("/produtos", (req, res) => {
  res.json(lerProdutos());
});

// ✔️ Adicionar produto (com imagens no Cloudinary)
app.post("/produtos", upload.any(), (req, res) => {
  const produto = req.body;
  produto.cores = JSON.parse(req.body.cores || "[]");

  // ✔️ Processar imagens
  if (req.files) {
    req.files.forEach((file) => {
      if (file.fieldname.startsWith("cores")) {
        const match = file.fieldname.match(/cores\[(\d+)\]\[(.+)\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          const field = match[2];
          produto.cores[index] = produto.cores[index] || {};
          produto.cores[index][field] = file.path; // ✔️ URL da imagem no Cloudinary
        }
      } else if (file.fieldname === "imagem") {
        produto.imagem = file.path;
      } else if (file.fieldname === "imagem_medidas") {
        produto.imagem_medidas = file.path;
      }
    });
  }

  // ✔️ Processar outros campos de cores
  Object.keys(req.body).forEach((key) => {
    if (key.startsWith("cores[")) {
      const parts = key.split(/\[|\]/).filter(Boolean);
      const index = parseInt(parts[1], 10);
      const field = parts[2];
      produto.cores[index] = produto.cores[index] || {};
      produto.cores[index][field] = req.body[key];
    } else {
      produto[key] = req.body[key];
    }
  });

  // ✔️ Salvar produto no JSON
  const produtos = lerProdutos();
  produto.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
  produtos.push(produto);
  fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));

  res.json({ message: "Produto salvo com sucesso!", produto });
});

// ✔️ Atualizar produto
app.put("/produtos/:id", verificarToken, upload.any(), (req, res) => {
  const produtos = lerProdutos();
  const id = parseInt(req.params.id);
  const index = produtos.findIndex((p) => p.id === id);

  if (index !== -1) {
    const produtoAtualizado = { ...produtos[index], ...req.body };
    produtoAtualizado.cores = JSON.parse(req.body.cores || "[]");

    // ✔️ Processar imagens
    if (req.files) {
      req.files.forEach((file) => {
        if (file.fieldname === "imagem") {
          produtoAtualizado.imagem = file.path;
        } else if (file.fieldname === "imagem_medidas") {
          produtoAtualizado.imagem_medidas = file.path;
        } else if (file.fieldname.startsWith("cores")) {
          const match = file.fieldname.match(/cores\[(\d+)\]\[(.+)\]/);
          if (match) {
            const corIndex = parseInt(match[1], 10);
            const field = match[2];
            produtoAtualizado.cores[corIndex] =
              produtoAtualizado.cores[corIndex] || {};
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

// ✔️ Remover produto
app.delete("/produtos/:id", verificarToken, (req, res) => {
  let produtos = lerProdutos();
  const id = parseInt(req.params.id);
  produtos = produtos.filter((p) => p.id !== id);
  fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
  res.json({ message: "Produto removido!" });
});

// ✔️ Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
