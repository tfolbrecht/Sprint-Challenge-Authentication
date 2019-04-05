const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig')
const jwt = require('jsonwebtoken');
const {authenticate} = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function generateToken(username)    {
  const payload   =   { username }
  const options   =   {
      expiresIn: '1h',
      jwtid: '1234'
  }
  const secret = process.env.JWT_SECRET
  const token = jwt.sign(payload, secret, options);
  return token;
}

function register(req, res) {
  // implement user registration
  const creds = req.body;
  creds.username = creds.username.toUpperCase();
  creds.password = bcrypt.hashSync(creds.password);
  db('users').insert(creds)
    .then(id => {
      const token = generateToken(creds.username)
      res.status(201).json({
        id: id[0],
        token: token
      })
    })
    .catch(err => {
      res.status(500).json({
        message: "Please provide a username and password"
      })
    })
}

function login(req, res) {
  const creds = req.body;
  creds.username = creds.username.toUpperCase();
  generateToken(creds.username);
  db('users').where('username', creds.username)
    .then(users => {
      if (users.length && bcrypt.compareSync(creds.password, users[0].password)) {
        const token = generateToken(creds.username);
        res.status(200).json({
          token
        })
      } else {
        res.status(500).json({
          message: "Incorrect username or password"
        })
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "Incorrect username or password"
      })
    })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: {
      accept: 'application/json'
    },
  };
  db('users').where('username', req.decoded.username)
    .then(response => {
      console.log("success");
      axios
        .get('https://icanhazdadjoke.com/search', requestOptions)
        .then(response => {
          res.status(200).json(response.data.results);
        })
        .catch(err => {
          res.status(500).json({
            message: 'Error Fetching Jokes',
            error: err
          });
        });
    })
    .catch(err => {
      res.status(500).json({
        err
      })
    })
}