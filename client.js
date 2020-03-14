/*
<Client interface>

What will this do::

	-> Send essential Key press info (WASD)

	<- Get status of other players
	<- Get status of MY player (client-server coordination)

	Recieved info will be applied to game... (html?)



*/

var Client = {};
Client.socket  = io.connect();

Client.registerPlayer = function(){
	Client.socket.emit('newPlayer');
}

Client.socket.on('newplayer',function(data){
	//Client Updates Game :: add player to game
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
	//Client Updates Game :: add ALL players to game
    console.log(data);
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});
//Socket 이 여기 있음,, Socket.io 로 서버와 통신

