const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

/* Defines our templating engine and views dir */
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);
app.use((req, res, next) => {
  res.status(404).render('page-not-found', { pageTitle: 'Page Not Found', path: '' });
});
  
app.listen(3000);
