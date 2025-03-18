import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
app.use(express.json()); 
app.use(cors());

async function criarEPopularTabelaUsuarios(nome, sobrenome) {
    const db = await open({
        filename: './banco.db',
        driver: sqlite3.Database,
    });

    db.run('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY, nome TEXT, sobrenome TEXT)');

    db.run('INSERT INTO usuarios (nome, sobrenome) VALUES (?, ?)', nome, sobrenome,);
}


// Rota para receber dados do frontend e salvar no banco
app.post('/salvar', async (req, res) => {
    const { nome, sobrenome } = req.body;
    if (!nome || !sobrenome) {
        return res.status(400).json({ erro: "Nome e sobrenome são obrigatórios!" });
    }

    await criarEPopularTabelaUsuarios(nome, sobrenome);
    res.json({ mensagem: "Usuário salvo com sucesso!" });
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => console.log("✅ Servidor rodando em http://localhost:3000"));