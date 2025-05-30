import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔗 Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// 🔧 Storage com multer + cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'produtos_imagens',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});
const upload = multer({ storage });

// ✔️ Middleware pra tratar JSON em outras rotas
app.use(express.json());

// 🚀 Rota GET (listar produtos)
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// ➕ Rota POST (adicionar produto com imagens)
app.post('/produtos', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'imagem_medidas', maxCount: 1 }
]), async (req, res) => {
  const {
    nome, descricao, composicao, categoria, subcategoria,
    preco, estoque, tamanhos, medidas
  } = req.body;

  // 🟦 Processar cores (enviadas como JSON string no FormData)
  const cores = req.body.cores ? JSON.parse(req.body.cores) : [];

  // 🟧 Pegar as imagens (se existirem)
  const imagem = req.files['imagem'] ? req.files['imagem'][0].path : '';
  const imagem_medidas = req.files['imagem_medidas'] ? req.files['imagem_medidas'][0].path : '';

  try {
    const result = await pool.query(
      `INSERT INTO produtos 
      (nome, descricao, composicao, categoria, subcategoria, preco, estoque, tamanhos, medidas, imagem, imagem_medidas, cores)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [nome, descricao, composicao, categoria, subcategoria, preco, estoque, tamanhos, medidas, imagem, imagem_medidas, cores]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar produto' });
  }
});

// ✏️ Rota PUT (atualizar produto)
app.put('/produtos/:id', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'imagem_medidas', maxCount: 1 }
]), async (req, res) => {
  const id = req.params.id;
  const {
    nome, descricao, composicao, categoria, subcategoria,
    preco, estoque, tamanhos, medidas
  } = req.body;

  const cores = req.body.cores ? JSON.parse(req.body.cores) : [];

  const imagem = req.files['imagem'] ? req.files['imagem'][0].path : req.body.imagem;
  const imagem_medidas = req.files['imagem_medidas'] ? req.files['imagem_medidas'][0].path : req.body.imagem_medidas;

  try {
    const result = await pool.query(
      `UPDATE produtos SET 
      nome=$1, descricao=$2, composicao=$3, categoria=$4, subcategoria=$5, 
      preco=$6, estoque=$7, tamanhos=$8, medidas=$9, imagem=$10, imagem_medidas=$11, cores=$12 
      WHERE id=$13 RETURNING *`,
      [nome, descricao, composicao, categoria, subcategoria, preco, estoque, tamanhos, medidas, imagem, imagem_medidas, cores, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// ❌ Rota DELETE (remover produto)
app.delete('/produtos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    res.json({ message: 'Produto removido com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
