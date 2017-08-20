var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var asciitable = require('ascii-table')
var port = process.env.PORT || 3000;
var mongodb = require('mongodb');
var client = mongodb.MongoClient;
var url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/test';
var scores = {mScore: "loading...", gScore: "loading..."};
var database;
var theList;
console.log(url);
client.connect(url, function(err, db){
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to ' + url);
    var scoreData = db.collection('scoreboard');
    var cursor = scoreData.find({name: "michael"});
    cursor.nextObject(function(err, item){
      scores.mScore = item.score;
      updateTable();
    });
    cursor = scoreData.find({name: "gaby"});
    cursor.nextObject(function(err, item){
      scores.gScore = item.score;
      updateTable();
    });
    cursor = scoreData.find({name: "messages"});
    cursor.nextObject(function(err, item){
      theList = item;
    });
    database = db;
  }
});

var curTable = buildTable(scores.mScore, scores.gScore);

console.log(curTable.toString());
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function printMessage(){
  var currentdate = new Date();
  var datetime = "Serving request at " + (currentdate.getMonth()+1) + "/"
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear() + " @ "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
  console.log(datetime);
}

io.on('connection', function(socket){
  printMessage();
  io.emit('view-update', curTable.toString());
  io.emit("render-list", theList.content);
  socket.on('mInc', function(amt){
    scores.mScore += amt;
    updateTable();
    io.emit('view-update', curTable.toString());
    writeTableData();
  });
  socket.on('gInc', function(amt){
    scores.gScore += amt;
    updateTable();
    io.emit('view-update', curTable.toString());
    writeTableData();
  });

  socket.on("new-item", function(item){
    theList.content.push(item);
    io.emit("render-list", theList.content);
    writeListData();
  });
});

function writeTableData(){
  database.collection('scoreboard').update({name: "michael"}, {name: "michael", score: scores.mScore});
  database.collection('scoreboard').update({name: "gaby"}, {name: "gaby", score: scores.gScore});
}

function writeListData(){
  database.collection('scoreboard').update({name: "messages"}, {name: "messages", content: theList.content});
}

function updateTable(){
  curTable = buildTable(scores.mScore, scores.gScore);
}

function buildTable(m, g){
  t = new asciitable('Scoreboard');
  t.setHeading("Michael", "Gaby")
  t.addRow(m, g);
  return t;
}

if (process.env.IP){
  http.listen(port, process.env.IP, function(){
    console.log('listening on *:' + port);
  });
}else{
  http.listen(port, function(){
    console.log('listening on *:' + port);
  });
}
