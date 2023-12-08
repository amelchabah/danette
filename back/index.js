// Importez les modules nécessaires
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require("mysql2");
const uuid = require("uuid");
const argon2 = require("argon2");
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
    origin: "http://localhost:3000",
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  // password: DB_PASSWORD,
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
app.post('/v1/auth/signup', async (req, res) => {
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
  const hashOptions = {
    timeCost: 4, // ajustez selon vos besoins
    memoryCost: 2 ** 16, // ajustez selon vos besoins
    parallelism: 2, // ajustez selon vos besoins
  };

  const user_password = await argon2.hash(password, hashOptions);
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
  //pour eviter les attaques par force brute
  setTimeout(() => {
    if (email === "" || password === "") {
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
          if (argon2.verify(user.user_password, password)) {
            const token = jwt.sign({ user_uuid: user.user_uuid }, user.user_secret, { expiresIn: '1h' });
            res.status(200).json({ token });
          } else {
            res.status(400).json({ error: 'Invalid credentials' });
          }
        }
      }
    });
  }, 500);
});

const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }
  const token = authorizationHeader.split(' ')[1];
  const sql = `SELECT * FROM users WHERE user_uuid = ?`;
  const decodedToken = jwt.decode(token);
  if (!decodedToken) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  db.query(sql, [decodedToken.user_uuid], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const user = result[0];
      try {
        jwt.verify(token, user.user_secret);
        req.user = user;
        next();
      } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
      }
    }
  });
}

app.get('/v1/users/me', verifyToken, (req, res) => {
  const user_uuid = req.user.user_uuid;

  // Récupérer le score depuis la table progressions
  const sqlProgression = `SELECT progression FROM progressions WHERE user_uuid = ?`;
  db.query(sqlProgression, [user_uuid], (errProgression, resultProgression) => {
    if (errProgression) {
      console.error(errProgression);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const progressionScore = resultProgression.length > 0 ? JSON.parse(resultProgression[0].progression).length : 0;

      // Récupérer les autres informations sur l'utilisateur depuis la table users
      const sqlUser = `SELECT * FROM users WHERE user_uuid = ?`;
      db.query(sqlUser, [user_uuid], (errUser, resultUser) => {
        if (errUser) {
          console.error(errUser);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          const user = resultUser[0];
          const response = {
            user: {
              user_uuid: user.user_uuid,
              user_pseudo: user.user_pseudo,
              user_email: user.user_email,
              score: progressionScore // Ajouter le score dans la réponse
            }
          };
          res.status(200).json(response);
        }
      });
    }
  });
});


// #	Name	Type	Collation	Attributes	Null	Default	Comments	Extra	Action
// 1	id Primary	int(11)			No	None		AUTO_INCREMENT	Change Change	Drop Drop	
// 2	progression_uuid	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 3	user_uuid	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	
// 4	progression	varchar(255)	utf8_general_ci		No	None			Change Change	Drop Drop	

app.post('/v1/game/updateprogression', verifyToken, (req, res) => {
  const { progression } = req.body;
  if (progression === "") {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }
  const progression_uuid = uuid.v4();
  const user_uuid = req.user.user_uuid;

  //verfiy if progression already exist
  const sql = `SELECT * FROM progressions WHERE user_uuid = ?`;
  db.query(sql, [user_uuid], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const progressionExist = result[0];
      if (progressionExist) {
        const sql = `UPDATE progressions SET progression = ? WHERE user_uuid = ?`;
        db.query(sql, [progression, user_uuid], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            res.status(201).json({ message: 'Progression updated' });
          }
        });
      } else {
        const sql = `INSERT INTO progressions (progression_uuid, user_uuid, progression) VALUES (?, ?, ?)`;
        db.query(sql, [progression_uuid, user_uuid, progression], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            res.status(201).json({ message: 'Progression created' });
          }
        });
      }
    }
  });
});

app.get('/v1/game/getprogression', verifyToken, (req, res) => {
  const user_uuid = req.user.user_uuid;
  const sql = `SELECT * FROM progressions WHERE user_uuid = ?`;
  db.query(sql, [user_uuid], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const progression = result[0];
      if (!progression) {
        res.status(200).json({ progression: [] });
        return;
      }
      res.status(200).json({ progression: progression.progression });
    }
  });
});

//leaderboard pas besoin de token
app.get('/v1/game/leaderboard', (req, res) => {
  const sql = `
    SELECT u.user_uuid, u.user_pseudo, p.progression
    FROM users u
    INNER JOIN progressions p ON u.user_uuid = p.user_uuid
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Traitement des données côté serveur
      if (result.length === 0) {
        res.status(200).json({ leaderboard: [] });
        return;
      }
      const leaderboard = result.reduce((acc, item) => {
        const userIndex = acc.findIndex((user) => user.user_uuid === item.user_uuid);

        if (userIndex === -1) {
          acc.push({
            user_uuid: item.user_uuid,
            user_pseudo: item.user_pseudo,
            score: JSON.parse(item.progression).length
          });
        } else {
          acc[userIndex].score += JSON.parse(item.progression).length;
        }

        return acc;
      }, []);

      // Trier le leaderboard par score décroissant
      leaderboard.sort((a, b) => b.score - a.score);

      res.status(200).json({ leaderboard: leaderboard });
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