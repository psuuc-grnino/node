const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./db/connectDB');

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    secret: 'meow',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.userId ? true : false;
  next();
});

connectDB();
app.use(authRoutes);

app.listen(3000, () => {
  console.log('Server running on port http://localhost:3000/');
});
