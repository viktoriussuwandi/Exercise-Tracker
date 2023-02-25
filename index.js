const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const router = express.Router();

require('dotenv').config()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))
app.use('/api', router)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/*-----------------------------------------------------------------------------------------*/
/*---------------------------------------MY CODE-------------------------------------------*/
/*-----------------------------------------------------------------------------------------*/

function dataManagement(action, input) {
  let filePath = './public/data.json';
  
  //create file if nor exist, then read the file
  if (!fs.existsSync(filePath)) { fs.closeSync(fs.openSync(filePath, 'w')); }
  let file = fs.readFileSync(filePath);

  //screnario for save input into data
  if (action == 'save data' && input != null) {
      //check if file is empty
    if (file.length == 0) {
      //add new data to json file
      fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else {
      //append input to data.json file
      let data = JSON.parse(file.toString());
      //check if input.username already exist
      let inputExist = [];
      nameExist  = data.map(d => d.username);
      let check_input = nameExist.includes(input.username);     
      if (check_input === false) {
        //add input element to existing data json object
        data.push(input);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }
    }
  }
  //screnario for load the data
  else if (action == 'load data' && input == null) {
    if (file.length == 0) { return; }
    else {
      let dataArray = JSON.parse(file);
      return dataArray;
    }
  }
}

app.post('/api/users',
  [
    check('username', 'username: Path `username` is required').isLength({ min: 1 })
  ],
  (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.json(errors) }
    else {
      username = req.body.username;
      id = uuid.v4().replace(/-/g, "").slice(0,24);
      user = { username : username, _id : id }
      dataManagement("save data", user)
      res.json(user);
    }
  }
);

app.get('/api/users', (req,res) => {
  let data = dataManagement("load data");
  if (data === undefined) { res.json({data : 'no data'}); }
  else {
    res.json(data);
  }
});

app.post('/api/users/:_id/exercises', 
  [
    check('uid'),
    check('desc'),
    check('dur'),
    check('date')
  ], 
  (req,res) => {
    
});

/*=========================================================================================*/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})