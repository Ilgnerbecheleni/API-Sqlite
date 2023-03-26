const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Cria um novo banco de dados SQLite e tabela de usuários
const db = new sqlite3.Database('users.db');
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT)');

// Middleware para permitir o uso de JSON no corpo da solicitação
app.use(express.json());

// Rota para cadastrar um novo usuário
app.post('/users', (req, res) => {
  const { nome, email } = req.body;

  // Verifica se o email já existe no banco de dados
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Erro ao cadastrar usuário' });
    }
    if (row) {
      return res.status(400).send({ error: 'Email já cadastrado' });
    }

    // Insere o novo usuário no banco de dados
    db.run('INSERT INTO users(nome, email) VALUES (?, ?)', [nome, email], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send({ error: 'Erro ao cadastrar usuário' });
      }
      console.log(`Novo usuário com o ID ${this.lastID} cadastrado com sucesso`);
      return res.status(201).send({ message: `Novo usuário com o ID ${this.lastID} cadastrado com sucesso` });
    });
  });
});

app.get('/users', (req, res) => {
  // Seleciona todos os usuários do banco de dados
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Erro ao buscar usuários' });
    }
    return res.status(200).send(rows);
  });
});

app.get('/users/:id', (req, res) => {
  const id = req.params.id;

  // Seleciona um usuário específico do banco de dados pelo id
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Erro ao buscar usuário' });
    }
    if (!row) {
      return res.status(404).send({ error: 'Usuário não encontrado' });
    }
    return res.status(200).send(row);
  });
});


  app.delete('/users/:id', (req, res) => {
    const id = req.params.id;

    // Deleta o usuário do banco de dados pelo id
    try {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          console.error(err.message);
          res.status(500).send('Erro ao deletar usuário');
        } else if (this.changes === 0) {
          res.status(404).send('Usuário não encontrado');
        } else {
          console.log(`Usuário com o ID ${id} deletado com sucesso`);
          res.status(200).send(`Usuário com o ID ${id} deletado com sucesso`);
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao deletar usuário');
    }
  });

  app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const { nome, email } = req.body;

    // Atualiza o usuário no banco de dados pelo id
    try {
      db.run('UPDATE users SET nome = ?, email = ? WHERE id = ?', [nome, email, id], function(err) {
        if (err) {
          console.error(err.message);
          res.status(500).send('Erro ao atualizar usuário');
        } else if (this.changes === 0) {
          res.status(404).send('Usuário não encontrado');
        } else {
          console.log(`Usuário com o ID ${id} atualizado com sucesso`);
          res.status(200).send(`Usuário com o ID ${id} atualizado com sucesso`);
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao atualizar usuário');
    }
  });



app.get('/', (req, res) => {
    res.send('Bem-vindo à API de clientes. Acesse /clientes para ver a lista de clientes.');
  });
  // Inicia o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });



