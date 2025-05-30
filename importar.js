import pkg from 'pg';
import fs from 'fs';
const { Pool } = pkg;

// 🔗 Conexão com o banco PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:RxvlOmTsEZFOeIcYsJiPhBUpZrRrkGPE@caboose.proxy.rlwy.net:18052/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

// 🔥 Ler o arquivo produtos.json
const produtos = JSON.parse(fs.readFileSync('produtos.json', 'utf8'));

async function importarProdutos() {
  for (const produto of produtos) {
    try {
      await pool.query(
        `INSERT INTO produtos 
        (nome, descricao, composicao, categoria, subcategoria, preco, estoque, tamanhos, medidas, imagem, imagem_medidas, cores)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          produto.nome,
          produto.descricao,
          produto.composicao,
          produto.categoria,
          produto.subcategoria,
          produto.preco,
          produto.estoque,
          JSON.stringify(produto.tamanhos),
          JSON.stringify(produto.medidas),
          produto.imagem,
          produto.imagem_medidas,
          JSON.stringify(produto.cores)
        ]
      );
      console.log(`✔️ Produto "${produto.nome}" importado com sucesso!`);
    } catch (err) {
      console.error(`❌ Erro ao importar "${produto.nome}":`, err.message);
    }
  }

  console.log("🎉 Todos os produtos foram importados.");
  pool.end();
}

importarProdutos();
