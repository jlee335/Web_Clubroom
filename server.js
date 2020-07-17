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

/*
    서버 여는것. Port 에서 요청들이 들어오면 그것을 처리하는 방식
*/
server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

let players = new Map(); //Key-Value map of all players and their IDs.

var DEBUG = true;

/*
Socket.io 사용한다

플레이어가 서버랑 접촉을 하면, 그 connection 을 socket 이라는 구조로 저장한다.
즉, 1 플레이어 1 socket 구조를 가지고 있다.

*/


io.on('connection',function(socket){ //socket.io 통해서 연결이 되었을때 event 다. 1플레이어 접속이라는 뜻.

/*
client 가 서버에게 새 플레이어가 로그인 (게임 접속) 했다고 알림
1 socket, 1 player 이므로, 
*/
    socket.on('newplayer',function(){

        //socket 에다가 player class 만들어주자
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };
        
        socket.emit('allplayers',getAllPlayers(),socket.player.id); //returns full list of players and your Unique ID
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('click',function(data,player,time){ // 서버에서 "클릭" 요청을 받았을 때 플레이어 위치 업데이트 **FIXME
            console.log('CLICK '+ socket.player.id + '  {'+data.x+', '+data.y+'}');

            //클라이언트가 보낸 현 위치로 서버 현 위치 업데이트 (의미 있을지는 모르겠다)
            socket.player.x = player.x; 
            socket.player.y = player.y;
            

            io.emit('move',socket.player,time);

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




/*
    players 라는 Map<id,player class> 가 존재한다.
    
    모든 플레이어 정보를 한번에 업데이트하는 함수다
*/
function update_Player(){
    Object.keys(io.sockets.connected).forEach(function(socketID){ //socket 들을 for loop 해서 socket 정보 player 에게 준다.
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
    if(DEBUG) console.log("getAllPlayers() : playerlist_length: "+playersList.length + " players.length:" + players.size)
    return playersList;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
