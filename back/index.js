// Importez les modules nécessaires
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require("mysql2");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

// Initialisez l'application Express et le serveur HTTP
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to database!");
  }
});

// Utilisez le middleware CORS directement lors de la création de l'objet Server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

// Définissez le dossier des fichiers statiques (client)
app.use(express.static('public'));

// Définissez la route principale
app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// #	Name	Type	Collation	Attributes	Null	Default	Comments	Extra	Action
// 1	id Primary	int(11)			No	None		AUTO_INCREMENT	Change Change	Drop Drop	
// 2	user_uuid Index	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 3	user_pseudo	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 4	user_email Index	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 5	user_password	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 6	user_secret	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 7	user_creation_date	timestamp			No	CURRENT_TIMESTAMP			Change Change

// Définissez la route d'inscription
app.post('/v1/auth/signup', (req, res) => {
  const { pseudo, email, password } = req.body;
  if (!pseudo || !email || !password) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }
  const user_uuid = uuid.v4();
  let user_secret = "";
  const possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+~`|}{[]\:;?><,./-=";
  for (let i = 0; i < 100; i++) {
    user_secret += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  const user_password = bcrypt.hashSync(password, 10);
  const user_creation_date = new Date();

  const sql = `INSERT INTO users (user_uuid, user_pseudo, user_email, user_password, user_secret, user_creation_date) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [user_uuid, pseudo, email, user_password, user_secret, user_creation_date], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const token = jwt.sign({ user_uuid }, user_secret, { expiresIn: '1h' });
      res.status(201).json({ token });
    }
  });
});

app.post('/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }
  const sql = `SELECT * FROM users WHERE user_email = ?`;
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (result.length === 0) {
        res.status(400).json({ error: 'Invalid credentials' });
      } else {
        const user = result[0];
        if (bcrypt.compareSync(password, user.user_password)) {
          const token = jwt.sign({ user_uuid: user.user_uuid }, user.user_secret, { expiresIn: '1h' });
          res.status(200).json({ token });
        } else {
          res.status(400).json({ error: 'Invalid credentials' });
        }
      }
    }
  });
});

const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }
  const token = authorizationHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      req.user = decodedToken;
      next();
    }
  });
}

app.get('/v1/users/me', verifyToken, (req, res) => {
  const sql = `SELECT * FROM users WHERE user_uuid = ?`;
  db.query(sql, [req.user.user_uuid], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const user = result[0];
      res.status(200).json({ user: { user_uuid: user.user_uuid, user_pseudo: user.user_pseudo, user_email: user.user_email } });
    }
  });
});


// Gérez les connexions Socket.io
io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket:', socket.id);

  // Gérez les événements personnalisés ici
  socket.on('chat message', (msg) => {
    console.log('Message reçu:', msg);
    io.emit('chat message', msg);
  });

  // Gérez la déconnexion
  socket.on('disconnect', () => {
    console.log('Déconnexion socket:', socket.id);
  });
});

// Démarrez le serveur sur le port 3000
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});