import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import pool from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Middleware para proteger rotas
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 🔑 Rota de login
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1",
      [usuario]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ sucesso: false, mensagem: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res
        .status(401)
        .json({ sucesso: false, mensagem: "Senha incorreta" });
    }

    const token = jwt.sign({ id: user.id, usuario: user.usuario }, JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ sucesso: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, mensagem: "Erro no login" });
  }
});

// 🔗 Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// 🔧 Storage com multer + cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "produtos_imagens",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// ✔️ Configuração dos campos aceitos (CORRIGIDO!)
const uploadFields = upload.fields([
  { name: "imagem", maxCount: 1 },
  { name: "imagem_medidas", maxCount: 1 },
  { name: "imagemFrente" },
  { name: "imagemVerso" },
]);

// 🚀 Rota GET (listar produtos)
app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// 🔍 Rota GET por ID (buscar produto específico)
app.get("/produtos/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM produtos WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
});

// ➕ Rota POST (adicionar produto com imagens)
app.post("/produtos", uploadFields, async (req, res) => {
  const {
    nome,
    descricao,
    composicao,
    categoria,
    subcategoria,
    preco,
    estoque,
    tamanhos,
    medidas,
  } = req.body;

  const cores = req.body.cores ? JSON.parse(req.body.cores) : [];

  const imagem = req.files["imagem"] ? req.files["imagem"][0].path : "";
  const imagem_medidas = req.files["imagem_medidas"]
    ? req.files["imagem_medidas"][0].path
    : "";

  // 🔥 Processa imagens de cores (se houver)
  const imagensFrente = req.files["imagemFrente"] || [];
  const imagensVerso = req.files["imagemVerso"] || [];

  cores.forEach((cor, index) => {
    cor.imagemFrente = imagensFrente[index] ? imagensFrente[index].path : "";
    cor.imagemVerso = imagensVerso[index] ? imagensVerso[index].path : "";
  });

  try {
    const result = await pool.query(
      `INSERT INTO produtos 
      (nome, descricao, composicao, categoria, subcategoria, preco, estoque, tamanhos, medidas, imagem, imagem_medidas, cores)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        nome,
        descricao,
        composicao,
        categoria,
        subcategoria,
        preco,
        estoque,
        tamanhos,
        medidas,
        imagem,
        imagem_medidas,
        JSON.stringify(cores),
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar produto" });
  }
});

// ✏️ Rota PUT (atualizar produto)
app.put("/produtos/:id", uploadFields, async (req, res) => {
  const id = req.params.id;

  const {
    nome,
    descricao,
    composicao,
    categoria,
    subcategoria,
    preco,
    estoque,
    tamanhos,
    medidas,
  } = req.body;

  const cores = req.body.cores ? JSON.parse(req.body.cores) : [];

  try {
    // 🔎 Buscar o produto atual no banco para pegar as imagens existentes
    const produtoAtual = await pool.query("SELECT * FROM produtos WHERE id = $1", [id]);

    if (produtoAtual.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const produtoExistente = produtoAtual.rows[0];

    // 🔄 Se não foram enviadas novas imagens, manter as atuais
    const imagem = req.files["imagem"]
      ? req.files["imagem"][0].path
      : produtoExistente.imagem;

    const imagem_medidas = req.files["imagem_medidas"]
      ? req.files["imagem_medidas"][0].path
      : produtoExistente.imagem_medidas;

    const imagensFrente = req.files["imagemFrente"] || [];
    const imagensVerso = req.files["imagemVerso"] || [];

    cores.forEach((cor, index) => {
      cor.imagemFrente =
        imagensFrente[index]?.path || cor.imagemFrente || "";
      cor.imagemVerso =
        imagensVerso[index]?.path || cor.imagemVerso || "";
    });

    // 💾 Atualizar o produto
    const result = await pool.query(
      `UPDATE produtos SET 
        nome=$1, descricao=$2, composicao=$3, categoria=$4, subcategoria=$5, 
        preco=$6, estoque=$7, tamanhos=$8, medidas=$9, imagem=$10, imagem_medidas=$11, cores=$12 
        WHERE id=$13 RETURNING *`,
      [
        nome,
        descricao,
        composicao,
        categoria,
        subcategoria,
        preco,
        estoque,
        tamanhos,
        medidas,
        imagem,
        imagem_medidas,
        JSON.stringify(cores),
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});


// ❌ Rota DELETE (remover produto)
app.delete("/produtos/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
    res.json({ message: "Produto removido com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
