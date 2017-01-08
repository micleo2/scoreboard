var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var asciitable = require('ascii-table')
var port = process.env.PORT || 3000;
var mScore = 1;
var gScore = 1;
var curTable = buildTable(mScore, gScore);
console.log(curTable.toString());
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  io.emit('view-update', curTable.toString());

  socket.on('mInc', function(amt){
    console.log("michael updated");
    mScore += amt;
    curTable = buildTable(mScore, gScore);
    io.emit('view-update', curTable.toString());
  });
  socket.on('gInc', function(amt){
    console.log("Gaby updated");
    gScore += amt;
    curTable = buildTable(mScore, gScore);
    io.emit('view-update', curTable.toString());
  });
});

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
