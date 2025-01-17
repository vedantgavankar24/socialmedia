const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const authRoutes = require('./routes/authRoutes');
const comments = require('./routes/comments');
const flash = require('connect-flash');
const db = require('./config/db');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const postRoutes = require('./routes/posts');
const path = require('path');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const session = require('express-session');
const passport = require('passport');
const app = express();
dotenv.config();

require('./config/passport')(passport);
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/', postRoutes); 

app.use('/trending', postRoutes); 
app.use('/posts', require('./routes/posts'));

const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    json: function (value, options) {
      return JSON.stringify(value);
  },
    formatDate: function (date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  },
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main' }));
// app.set('view engine', 'hbs');

app.use('/', authRoutes);
app.use('/', comments);
//app.use('/allPosts', allPosts);
// //app.use('/', require('./routes/index'));
// app.use('/users', require('./routes/users'));
// app.use('/posts', require('./routes/posts'));

app.use(express.static('public'));

// Define the root route
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/posts/like/:postId/:userId', (req, res) => {
  app.use(postRoutes); 
});
app.get('/unlike/:id', (req, res) => {
  app.use(postRoutes); 
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


