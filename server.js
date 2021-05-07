require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_middleware/error-handler');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);
// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        // console.log(file);
        cb(null,file.originalname);
    //   cb(null,file.originalname +'-' +  Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
  });
  
  
  const serveIndex = require('serve-index');
  app.use('/public', express.static('./public'));
//   app.use(express.static(__dirname + 'public/uploads'));
//   app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));
//   app.use('/images', express.static('images'));   


  
  app.post('/getUploads', function(req, res){;
    // res.sendFile(path.resolve(path.resolve(__dirname,'./public')));
    let lst=[];
    const username = req.body.username;
    console.log(username);
    const folder = './public/uploads/';
    fs.readdir(folder, (err, files) => {
        files.forEach(file => {  
          if (file.startsWith(username+"-")){
            lst.push('http://localhost:4000/public/uploads/'+file);
          }
        });
        res.send(lst);
      });
  });

var type = upload.single('myImage');

  app.post('/upload', type, (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    res.send(file)
  })

app.post('/delete', (req, res, next) => {
    console.log(req.body.fileName);
    let str = req.body.fileName;     
    for (var i = str.length - 1; i >= 0; i--){  
        // console.log(str[i], '/');       
        if (str[i]===('/')) {
            str=str.slice(i+1,str.length)
            break;   
        }
    }

    const pathToFile = './public/uploads/' + str;
    fs.unlink(pathToFile, (err) => {
        console.log(err);
    })
})

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));