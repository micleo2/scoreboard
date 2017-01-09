var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var asciitable = require('ascii-table')
var fs = require("fs");
var port = process.env.PORT || 3000;
var scores = require("./data.json");
var curTable = buildTable(scores.mScore, scores.gScore);
console.log(curTable.toString());
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  io.emit('view-update', curTable.toString());

  socket.on('mInc', function(amt){
    console.log("michael updated");
    scores.mScore += amt;
    curTable = buildTable(scores.mScore, scores.gScore);
    io.emit('view-update', curTable.toString());
    writeData();
  });
  socket.on('gInc', function(amt){
    console.log("Gaby updated");
    scores.gScore += amt;
    curTable = buildTable(scores.mScore, scores.gScore);
    io.emit('view-update', curTable.toString());
    writeData();
  });
});

function writeData(){
  fs.truncate("./data.json", 0, function(){
    fs.writeFile("./data.json", JSON.stringify(scores), function(err){
      if (err){
        console.log("Error writing file: " + err);
      }
    })
  });
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
