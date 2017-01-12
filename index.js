var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var asciitable = require('ascii-table')
var fs = require("fs");
var port = process.env.PORT || 3000;
var redis = require("redis");
var client = redis.createClient();//var client = redis.createClient(process.env.REDIS_URL);
var scores = {mScore: "loading...", gScore: "loading..."};
client.get("mScore", function(err, reply){
  scores.mScore = parseInt(reply);
  updateTable();
});
client.get("gScore", function(err, reply){
  scores.gScore = parseInt(reply);
  updateTable();
});

var curTable = buildTable(scores.mScore, scores.gScore);
client.on("error", function (err) {
    console.log("Error " + err);
});

console.log(curTable.toString());
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  io.emit('view-update', curTable.toString());

  socket.on('mInc', function(amt){
    scores.mScore += amt;
    updateTable();
    io.emit('view-update', curTable.toString());
    writeData();
  });
  socket.on('gInc', function(amt){
    scores.gScore += amt;
    updateTable();
    io.emit('view-update', curTable.toString());
    writeData();
  });
});

function writeData(){
  client.set("mScore", scores.mScore, redis.print);
  client.set("gScore", scores.gScore, redis.print);
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
