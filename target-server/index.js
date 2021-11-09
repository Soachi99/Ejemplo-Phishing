const express = require('express');
const session = require('express-session');
const flash = require('connect-flash-plus');
const handlebars = require('express-handlebars');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());
app.set("views", __dirname);
app.engine("hbs", handlebars({
  defaultLayout: 'main',
  layoutsDir: __dirname,
  extname: '.hbs',
}));
app.set("view engine", "hbs");

// Login

const login = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/');
  } else {
    next();
  }
}


// Db

const users = JSON.parse(fs.readFileSync('db.json'));

// Routes

app.get('/home', login, (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  res.send(` <h1> Bienvenido/a  ${user.name} a tu banco BBB </h1> <br> Esta pagina simula la entrada a la plataforma del banco como la pagina de inicio <br> a la cual solo se puede acceder iniciando sesión. `);
});

app.get('/', (req, res) => {
  console.log(req.session);
  res.render('login', { message: req.flash('message') });
});

app.post('/', (req, res) => {
  if (!req.body.email || !req.body.password) {
    req.flash('message', 'Llena todos los campos');
    return res.redirect('/');
  }
  const user = users.find(user => user.email === req.body.email);
  if (!user || user.password !== req.body.password) {
    req.flash('message', 'Credenciales invalidas');
    return res.redirect('/');
  }
  req.session.userId = user.id;
  console.log(req.session);
  res.redirect('/home');
});

app.get('/edit', login, (req, res) => {
  res.render('edit');
});

app.post('/edit', login, (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  user.email = req.body.email;
  user.password = req.body.password;
  console.log(`El usuario ${user.id} ha cambiado su correo a ${user.email} y contraseña`);
  fs.writeFileSync('db.json', JSON.stringify(users));
  res.send(`El usuario ${user.id} ha cambiado su correo a ${user.email} y contraseña <br> <button type="button" onclick="location.href='/logout'" >Aceptar</button>`);
});

app.get('/logout', login, (req, res) => {
  req.session.destroy();
  res.send('Logged out');
})

// Server

app.listen(PORT, () => console.log('Listening on port', PORT));
