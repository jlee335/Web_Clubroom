
/*

TODO::

*/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//Socket.io will be used!!!

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));


//GET request for initial website, we send client file of the game
app.get('/',function(req,res){
    res.sendFile(__dirname+'/game.html');
});


server.listen(8081,function(){ // Listens to port 8081
    console.log('Listening on '+ server.address().port);
});

server.lastPlayerID = 0;
speed = 0.01;

io.on('connection',function(socket){
	// 새로운 플레이어가 들어올 때 socket connection 별로...
	/*
	Login 기능 및 이름 정하기, 외모 정하기, etc 는 여기서 구현....
	*/


	//	완전 새로운 플레이어로 접속할 떄
	socket.on('newPlayer',function(){
		//TODO: 위에서 정한 이름, 외모, etc 특성들을 가지고 있는 Player Object 를 구현할 것!

		// 1. Recieve Player parameters (TODO)

		// 2. Generate Player Object
		socket.player = {
			id: 	server.lastPlayerID++,
			name:   "이현재",
			x: 		randomInt(100,100),
			y: 		randomInt(100,100)  
		};

		// 3. Update Every Client of new player
		socket.emit('allPlayers',getAllPlayers()); 			// Update Self
		socket.broadcast.emit('newPlayer',socket.player); 	// Update Everyone Else
	});

	// 	기존 플레이어가 게임에 다시 들어올 떄, Player Object 를 맏아 한다!
	socket.on('newLogin',function(player){
		socket.emit('allPlayers',getAllPlayers());
		socket.broadcast.emit('newPlayer',player);
	})


	//	플레이어가 키를 누를 떄
	//  Q: key Press 를 이렇게 보내는게 최선일까? Map Update 주기와 Server-Client Sync 를 고민해야 한다ㅠㅠ 
	socket.on('keyPress',function(key)){
		if(key == 'w')
		{
			socket.player.y += speed;
		}
		else if(key == 'a')
		{
			socket.player.x -= speed;
		}
		else if(key == 's')
		{
			socket.player.y -= speed;
		}
		else if(key == 'd')
		{
			socket.player.x += speed;
		}
		else
		{

		}
	}


});




/*
Necessary Auxiliary Functions
*/

function getAllPlayers(){
	// getAllPlayers returns a List of all Player Objects!!!
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

//Random number generation function
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}