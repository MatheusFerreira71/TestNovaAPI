var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const RouterTags = require('./src/routes/tags');
const RouterPosts = require('./src/routes/posts');
const RouterUsuarios = require('./src/routes/usuarios');

var app = express();

// Importamos o código do módulo database e usamos a função connection para conectar ao banco de dados.
const database = require('./src/config/database');
database('mongodb://localhost:27017/BlogGMRelacional');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tags', RouterTags);
app.use('/posts', RouterPosts);
app.use('/usuarios', RouterUsuarios);

module.exports = app;
