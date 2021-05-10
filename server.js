require('rootpath')();
const express = require('express');
const app = express();
// const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_middleware/error-handler');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const tfnode = require('@tensorflow/tfjs-node');

let localServerLink='https://localhost:4000/public/uploads/';
let herokuServerLink='https://mighty-falls-84757.herokuapp.com/https://picsterserver.herokuapp.com/public/uploads/';

const serverInUse=herokuServerLink;

let classficationToImagesMap = new Map()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors());

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.originalname);
    //   cb(null,file.originalname +'-' +  Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage
  });
    
  // const serveIndex = require('serve-index');
  app.use('/public', express.static('./public'));
//   app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true})); 

  // Get all the Images uploaded according to the user
app.post('/getUploads', function(req, res){
    // method to send a single file,: ineffcient for multiple images though
    // res.sendFile(path.resolve(path.resolve(__dirname,'./public')));

    // lst of filenames of images according to the user
    let lst=[];
    const username = req.body.username;
    const folder = './public/uploads/';
    fs.readdir(folder, (err, files) => {
        files.forEach(file => {  
          if (file.startsWith(username+"-")){
            var url = encodeURI(serverInUse+file);
            lst.push(url);
          }
        });
        res.send(lst);
      });
  });

// tag of images being sent are myImage
var type = upload.single('myImage');

// handles the addition of new images
app.post('/upload', type, async (req, res, next) => {
    const file = req.file;
    intermediateClassificationDataToMap(file.originalname);
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    res.send(file)
  })

// handles the deletion of images
app.post('/delete', (req, res, next) => {

    let str = req.body.fileName;     
    for (var i = str.length - 1; i >= 0; i--){    
        if (str[i]===('/')) {
            str=str.slice(i+1,str.length)
            break;   
        }
    }
    try {
      removeClassificationDataToMap(str);
    }
    catch {
      console.log("unable to remove Image from Map")
    }
    // part that connects to local storage and removes the file
    const pathToFile = './public/uploads/' + str;
    fs.unlink(pathToFile, (err) => {
        if (err) console.log(err);
    })
})

app.get('/imagesAndMapPair', function(req, res){
  lst=[];
  const folder = './public/uploads/';
    fs.readdir(folder, (err, files) => {
      files.forEach(file => {  
          if (classficationToImagesMap.has(file)){
            var url = encodeURI(serverInUse+file);
            let imageDesc = classficationToImagesMap.get(file);
            // console.log(imageDesc)
            const obj = { imageURL: url, desc: imageDesc}
            lst.push(obj);
          }
      });
      res.send(lst);
    });
})



// Reading an Image for Image Classification
const readImage = path => {

  const imageBuffer = fs.readFileSync(path);

  const tfimage = tfnode.node.decodeImage(imageBuffer);
  return tfimage;
}

// Actually doing the classfication for Image Classification
const imageClassification = async path => {
  const image = readImage(path);
  // Load the model.
  const mobilenetModel = await mobilenet.load();
  // Classify the image.
  let newPredictions=[];
  try {
    const predictions = await mobilenetModel.classify(image);
    newPredictions = getClassNames(predictions);
  }
  catch(err) {
    console.log(err);
    newPredictions = 'Cannot classify this image because of its size or its format';
  }
  // console.log('Classification Results:', predictions);
  return newPredictions;
}

const getClassNames =  (predictions) => {
  // console.log(predictions);
  let newPredictions=[];
  predictions.forEach( (pair) => {
    pair['className'].split(',').forEach( (potentialDesc) => {
        if (potentialDesc.length > 0){
          newPredictions.push(potentialDesc);
        }
    })
  })
  // console.log(newPredictions);
  return newPredictions;
}


async function initialAddClassificationDataToMap(){
  return new Promise(function (resolve, reject) {
    const folder = './public/uploads/';
    fs.readdir(folder, (err, files) => {
      files.forEach(async file => {
        var useless = await intermediateClassificationDataToMap(file);
      })
      resolve(folder);
    })
  })
}

async function intermediateClassificationDataToMap(file) {
  return new Promise(function (resolve, reject) {
    const newPredictions = imageClassification('./public/uploads/' + file);    
    newPredictions.then( function(result) {
      classficationToImagesMap.set(file, result);   
      // console.log(classficationToImagesMap);  
      resolve(file);
    })
    // when you do a log here it doesnt wait for the result of newPredictions so it will redturn a pending Promise
    // console.log(newPredictions);
  })
}

  function removeClassificationDataToMap(file){
    if (classficationToImagesMap.has(file)){
      classficationToImagesMap.delete(file);
    }
    // console.log(classficationToImagesMap);
  }

// imageClassification('./public/uploads/admin-dolphin.png');
// removeClassificationDataToMap('./public/uploads/admin-cat.png')

// start server
// process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const useless = initialAddClassificationDataToMap();
useless.then( () => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(PORT);
    console.log(`Server is running on port ${PORT}.`);
  });
});