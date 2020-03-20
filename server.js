var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.lastPlayderID = 0;

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

let players = new Map(); //Key-Value map of all players and their IDs.

var DEBUG = true;


io.on('connection',function(socket){

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };
        socket.emit('allplayers',getAllPlayers(),socket.player.id); //returns full list of players and your Unique ID
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('click',function(data){
            console.log('CLICK '+ socket.player.id + '  {'+data.x+', '+data.y+'}');
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);

        });

        //Server periodically collects player STATE and POSITION

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });

    socket.on('update',function(update_id,player_updated){
        if(DEBUG) console.log('update:'+update_id + " {x: " + player_updated.x + " y: "+player_updated.y+"}");
        if(player_updated) players.set(player_updated.id,player_updated); // update the existing map of server.
    });
});



function update_Player(){
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.set(player.id,player);
        if(player && DEBUG) console.log("updated: "+player.id);
    });
}

function getAllPlayers(){
    update_Player();
    // returns a list. I should 
    var playersList = [];

    for (let [key,value] of players.entries()){
        playersList.push(value); //Extract all players from server data map
    }
    if(DEBUG) console.log("GAPGAP: "+playersList.length + " pl len:" + players.size)
    return playersList;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
