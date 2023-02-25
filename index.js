const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const fs = require('fs');

require('dotenv').config()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))
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
      input.count = 0; input.log = []; 
      fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else {
      let Alldata = JSON.parse(file.toString());
      
      //check if input.id already exist
      let id_Exist    = Alldata.map(d => d.id);
      let check_input = id_Exist.includes(input._id);
      
      //append input to data.json file
      //update count, and log to existing user
      if (check_input == false && input.index != undefined) {
        console.log(input);
      }
      else if (check_input == false && input.index == undefined) {
        //add input element to existing data json object
        input.count = 0; input.log = []; Alldata.push( input );
        fs.writeFileSync(filePath, JSON.stringify(Alldata, null, 2));
      }
    }
  }
  //screnario for load All data
  else if (action == 'load data' && input == null) {
    if (file.length == 0) { return; }
    else {
      let dataArray = JSON.parse(file);
      return dataArray;
    }
  }
}

function gen_id() {
  let Alldata  = dataManagement("load data");
  let id       = uuid.v4().replace(/-/g, "").slice(0,24);
  if (Alldata == undefined) { return id; }
  else {
    let id_Exist = Alldata.map(d => d.id);
    let check_id = id_Exist.includes(id);
    if (check_id == false) { return id; } else { gen_id(); }
  }
}

app.post('/api/users',
  [ check('username', 'username: Path `username` is required').isLength({ min: 1 }) ],
  (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.json(errors) }
    else {
      username = req.body.username; id = gen_id();
      user = { username : username, _id : id }
      dataManagement("save data", user)
      res.json({ username : username, _id : id });
    }
  }
);

app.get('/api/users', (req,res) => {
  let Alldata = dataManagement("load data");
  if (Alldata === undefined) { res.json({data : 'no data'}); }
  else {
    //load All data (only id and username)
    let data = Alldata.map( (d) => { return {username : d.username, _id : d._id} } );
    res.json(data);
  }
});

app.post('/api/users/:_id/exercises',
  [
    check('description','desc: Path `description` is required').isLength({ min: 1 }),
    check('duration','duration: Path `duration` is required').isLength({ min: 1 }),
    check('date','date: Path `date` is required').isLength({ min: 1 })
  ],
  (req,res) => {
    let id    = req.params._id;
    let desc  = req.body.description; let dur = req.body.duration; let date = req.body.date;
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.json(errors) }
    else {
      Alldata = dataManagement('load data');
      if (Alldata === undefined) { return; }
      else {
        let id_Exist   = Alldata.map(d => d.id);
        let found_user = Alldata[ id_Exist.indexOf(id) ];
        res.json({input : found_user, data : Alldata});
      }
    }
    
});

/*=========================================================================================*/

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})