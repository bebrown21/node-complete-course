const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5be62c683530464238750b71')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://Brandon:123@cluster0-wdjil.mongodb.net/node-complete-course?retryWrites=true', { useNewUrlParser: true })
  .then(result => {
    console.log('Connected to Database!!!')

    User.findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            name: 'Bob',
            email: 'test@email.com',
            cart: {
              items: []
            }
          });
          user.save();
        }
      })
    app.listen(3000);
  }) 
  .catch(err => console.log(err));
