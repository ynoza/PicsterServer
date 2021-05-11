require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_middleware/error-handler');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ynoza.github.io"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// api routes
app.use('/users', require('./users/users.controller'));
app.use('/', require('./img/img.controller'));

// global error handler
app.use(errorHandler);

app.use('/public', express.static('./public'));

// start server
// process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(PORT);
  console.log(`Server is running on port ${PORT}.`);
});