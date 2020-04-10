const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const http = require('http');

const dotenv = require('dotenv');

dotenv.config();
// server port
app.set('port', process.env.PORT || 3000);

const ctrl = require('./estimator');


// setting CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Access, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  next();
});

// parse json encoded body requests
app.use(bodyParser.json());

// parse url encoded body requests
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.post('/api/v1/on-covid-19/:type', ctrl.controller);
// wild post requests
app.post('/api/v1/on-covid-19/*', ctrl.controller);

// start serrver
http.createServer(app).listen(app.get('port'));
