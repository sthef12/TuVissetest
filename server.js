import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const FILE_PATH = "produtos.json";
const USERS_FILE_PATH = "users.json";
const SECRET_KEY = "segredo_admin"; // Use uma variável de ambiente em produção

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/produtos_imagens",
  express.static(path.join(__dirname, "/img/produtos_imagens"))
);

// Configuração do multer para salvar arquivos na pasta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const produtoNome = req.body.nome.replace(/\s+/g, "_").toLowerCase(); // Substituir espaços por "_" e deixar em minúsculas
    const dir = path.join(__dirname, `/img/produtos_imagens/${produtoNome}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
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
  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
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
      if (err.code === "EBUSY") {
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

// Listar todos os produtos
app.get("/produtos", (req, res) => {
  res.json(lerProdutos());
});

// Adicionar um novo produto (apenas admin)
app.post(
  "/produtos",
  upload.any(), // Aceita qualquer campo de arquivo ou texto
  (req, res) => {
    console.log(">>> Campos recebidos em req.body:");
    Object.keys(req.body).forEach((key) => {
      console.log("-", key);
    });

    console.log(">>> Arquivos recebidos:");
    req.files.forEach((file) => {
      console.log("-", file.fieldname);
    });

    const produto = req.body;

    // Inicializa o campo cores como um array vazio
    produto.cores = JSON.parse(req.body.cores || "[]");

    // Processar os arquivos enviados
    if (req.files) {
      req.files.forEach((file) => {
        const relativePath = path
          .relative(__dirname, file.path)
          .replace(/\\/g, "/");

        if (file.fieldname.startsWith("cores")) {
          const match = file.fieldname.match(/cores\[(\d+)\]\[(.+)\]/);
          if (match) {
            const index = parseInt(match[1], 10);
            const field = match[2];

            // Garante que o índice da cor existe no array
            produto.cores[index] = produto.cores[index] || {};

            // Adiciona o campo da imagem sem sobrescrever os campos existentes
            console.log(
              `Adicionando imagem ao campo cores[${index}][${field}]: ${relativePath}`
            );
            produto.cores[index][field] = relativePath;
          }
        } else if (file.fieldname === "imagem") {
          console.log(`Adicionando imagem principal: ${relativePath}`);
          produto.imagem = relativePath;
        } else if (file.fieldname === "imagem_medidas") {
          console.log(`Adicionando imagem de medidas: ${relativePath}`);
          produto.imagem_medidas = relativePath;
        }
      });
    }

    Object.keys(req.body).forEach((key) => {
      console.log(key.startsWith("cores[") ? true : false);
      console.log(key.startsWith("cores = ") ? true : false);
      if (key.startsWith("cores[")) {
        const parts = key.split(/\[|\]/).filter(Boolean); // ["cores", "0", "codigoCor"]
        const index = parseInt(parts[1], 10);
        const field = parts[2];

        produto.cores[index] = produto.cores[index] || {};

        // Evita sobrescrever imagem se já tiver valor
        if (
          (field === "imagemFrente" || field === "imagemVerso") &&
          produto.cores[index][field]
        )
          return;

        produto.cores[index][field] = req.body[key];
        console.log(`Adicionado cores[${index}][${field}] = ${req.body[key]}`);
      } else {
        produto[key] = req.body[key];
        console.log(`Campo geral: ${key} = ${req.body[key]}`);
      }
    });

    // Log do produto final antes de salvar
    console.log(
      "Produto final antes de salvar no JSON:",
      JSON.stringify(produto, null, 2)
    );

    // Salvar o produto no JSON
    const produtos = lerProdutos();
    produto.id = produtos.length ? produtos[produtos.length - 1].id + 1 : 1;
    produtos.push(produto);
    fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
    console.log("Arquivo JSON atualizado com sucesso!");

    res.json({ message: "Produto salvo com sucesso!", produto });
  }
);

// Atualizar um produto (apenas admin)
app.put("/produtos/:id", verificarToken, upload.any(), (req, res) => {
  console.log("Dados recebidos no req.body:", req.body);
  console.log("Arquivos recebidos no req.files:", req.files);

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
          // Verifica se o produto já possui uma imagem_medidas e remove a antiga
          if (produtos[index].imagem_medidas) {
            removerArquivo(produtos[index].imagem_medidas);
          }
          produtoAtualizado.imagem_medidas = file.path;
        } else if (file.fieldname.startsWith("cores")) {
          const match = file.fieldname.match(/cores\[(\d+)\]\[(.+)\]/);
          if (match) {
            const corIndex = parseInt(match[1], 10);
            const field = match[2];
            produtoAtualizado.cores = produtoAtualizado.cores || [];
            produtoAtualizado.cores[corIndex] =
              produtoAtualizado.cores[corIndex] || {};
            produtoAtualizado.cores[corIndex][field] = file.path;
          }
        }
      });
    }

    produtos[index] = produtoAtualizado;
    fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
    console.log("Arquivo JSON atualizado com sucesso!");
    res.json({ message: "Produto atualizado com sucesso!" });
  } else {
    res.status(404).json({ message: "Produto não encontrado!" });
  }
});

// Remover um produto (apenas admin)
app.delete("/produtos/:id", verificarToken, (req, res) => {
  let produtos = lerProdutos();
  const id = parseInt(req.params.id);
  produtos = produtos.filter((p) => p.id !== id);
  fs.writeFileSync(FILE_PATH, JSON.stringify(produtos, null, 2));
  console.log("Arquivo JSON atualizado com sucesso!");
  res.json({ message: "Produto removido!" });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
