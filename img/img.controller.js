const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mobilenet = require('@tensorflow-models/mobilenet');
const tfnode = require('@tensorflow/tfjs-node');


const localServerLink='http://localhost:4000/public/uploads/';
const herokuServerLink='https://picsterserver.herokuapp.com/public/uploads/';

const serverInUse=herokuServerLink;

// let classficationToImagesMap = new Map();
// initialAddClassificationDataToMap();

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.originalname);
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage
  });


router.post('/getUploads', function(req, res){
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


// handles the addition of new images
router.post('/upload', upload.single('myImage'), async (req, res, next) => {
    const file = req.file;
    // intermediateClassificationDataToMap(file.originalname);
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    res.send(file)
  })

// handles the deletion of images
router.post('/delete', (req, res, next) => {

    let str = req.body.fileName;     
    for (var i = str.length - 1; i >= 0; i--){    
        if (str[i]===('/')) {
            str=str.slice(i+1,str.length)
            break;   
        }
    }
    // try {
    //   removeClassificationDataToMap(str);
    // }
    // catch {
    //   console.log("unable to remove Image from Map")
    // }


    // part that connects to local storage and removes the file
    const pathToFile = './public/uploads/' + str;
    fs.unlink(pathToFile, (err) => {
        if (err) console.log(err);
    })
})

router.get('/imagesAndMapPair', function(req, res){
  lst=[];
  const folder = './public/uploads/';
    fs.readdir(folder, (err, files) => {
      files.forEach(file => {  
        //   if (classficationToImagesMap.has(file)){
            var url = encodeURI(serverInUse+file);
            // let imageDesc = classficationToImagesMap.get(file);
            let imageDesc = [file.originalname];
            console.log(file)
            const obj = { imageURL: url, desc: imageDesc}
            lst.push(obj);
        //   }
      });
      res.send(lst);
    });
})



// // Reading an Image for Image Classification
// const readImage = path => {
//   const imageBuffer = fs.readFileSync(path);
//   const tfimage = tfnode.node.decodeImage(imageBuffer);
//   return tfimage;
// }

// // Actually doing the classfication for Image Classification
// const imageClassification = async path => {
//   const image = readImage(path);
//   // Load the model.
//   const mobilenetModel = await mobilenet.load();
//   // Classify the image.
//   let newPredictions=[];
//   try {
//     const predictions = await mobilenetModel.classify(image);
//     newPredictions = getClassNames(predictions);
//   }
//   catch(err) {
//     console.log(err);
//     newPredictions = 'Cannot classify this image because of its size or its format';
//   }
//   // console.log('Classification Results:', predictions);
//   return newPredictions;
// }

// const getClassNames =  (predictions) => {
//   // console.log(predictions);
//   let newPredictions=[];
//   predictions.forEach( (pair) => {
//     pair['className'].split(',').forEach( (potentialDesc) => {
//         if (potentialDesc.length > 0){
//           newPredictions.push(potentialDesc);
//         }
//     })
//   })
//   // console.log(newPredictions);
//   return newPredictions;
// }


// function initialAddClassificationDataToMap(){
//     const folder = './public/uploads/';
//     fs.readdir(folder, (err, files) => {
//       files.forEach(async file => {
//         intermediateClassificationDataToMap(file);
//       })
//     })
//     console.log(classficationToImagesMap);
// }

// async function intermediateClassificationDataToMap(file) {
//   return new Promise(function (resolve, reject) {
//     const newPredictions = imageClassification('./public/uploads/' + file); 
//     console.log(classficationToImagesMap);
//     newPredictions.then( function(result) {
//       classficationToImagesMap.set(file, result);    
//       resolve(file);
//     })
//     // when you do a log here it doesnt wait for the result of newPredictions so it will redturn a pending Promise
//     // console.log(newPredictions);
//   })
// }

//   function removeClassificationDataToMap(file){
//     if (classficationToImagesMap.has(file)){
//       classficationToImagesMap.delete(file);
//     }
//     console.log(classficationToImagesMap);
//   }


  module.exports = router;