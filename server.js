const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const http = require('http');

const dotenv = require('dotenv');

const morgan = require('morgan');

dotenv.config();
// server port
app.set('port', process.env.PORT || 3000);
const writeStream = require('fs').createWriteStream('logs.txt', { flags: 'a' });
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

// set up logger
app.use(morgan(':method    :url    :status    0:total-time[0]ms', { stream: writeStream }));

// routes
app.post('/api/v1/on-covid-19/:type', ctrl.controller);
// logs
app.get('/api/v1/on-covid-19/logs', ctrl.logger);
// wild post requests
app.post('/api/v1/on-covid-19', ctrl.controller);
// wild get requests
app.get('/api/v1/on-covid-19', ctrl.wildGet);
app.get('/api/v1/on-covid-19/*', ctrl.wildGet);

// start serrver
http.createServer(app).listen(app.get('port'));
