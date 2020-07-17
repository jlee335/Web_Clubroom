/**
 * Created by Jerome on 03-03-17.
 */


 /*
 Client.js 는 server-client 연결 구조에서 client 를 맡고, 플레이어 컴퓨터에 game.js 와 함께 실행됨.

 game.js 에 client.어쩌구 는 여기서 처리되는 구조.

 socket.emit(...) 를 통해서 서버에 정보를 보내고, 서버가 잘 처리해준다.
 
 */

var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};
    
Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

/*
플레이어가 클릭한 곳을 서버로 보낸다. 서버가 알아서 이를 처리한다.

Data to send::
    -> 명령을 보낸 시간 (timestamp)
    -> 해당 플레이어의 현 위치 
    -> 목적지 
*/
Client.sendClick = function(x,y){
    var time = Date.now();
    var myPlayer = Game.myPlayer();
    Client.socket.emit('click',{x:x,y:y},myPlayer,time); //data from server denotes this map {x:x y:y}
};

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

/*
    서버에 newplayer 를 알렸으면, 서버에서 답장으로 allplayers 를 보낸다.

    이는 client 의 Game 에서 서버의 모든 플레이어들을 로딩해주는 효과이자

    게임 시작을 알림?

*/
Client.socket.on('allplayers',function(data,myid){
    console.log("allplayers:" + myid);

    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y); //게임에 플레이어 정보들을 추가
    }
    Game.setID(myid);//내 UID 를 게임에 알려준다

    Client.socket.on('move',function(player,ordertime){
        //1. Interpolation 실행
        var nowtime = Date.now();
        
        var diff = nowtime - ordertime;
        
        //2. move 명령 실행
        
        Game.movePlayer(player.id,player.x,player.y); // 다른 플레이어가 move 명령을 받을 때 client 에서도 적용
    });

    Client.socket.on('remove',function(id){ //다른 플레이어가 로그아웃 했을 때 적용하자
        Game.removePlayer(id);
    });


    /*
    게임 구동은 Client 의 컴퓨터에서 일어나고, 서버에서 현 게임 상태를 받아내는 형태임.
    
    myid        --> 내 플레이어의 ID
    myPlayer    --> "player" 오브젝트 전체를 서버에 보냄

    socket.emit 는 서버의 socket.on('update',function(update_id,player_updated) 에서 받음

    --------------------------------------------------
    Game.myplayer -> 여기 ------> socket.on('update')
    --------------------------------------------------

    */
    setInterval(function(){
        //1. Recieve current info about player
        var myPlayer = Game.myPlayer();
        //2. Organize and send info to server
        Client.socket.emit('update',myid,myPlayer); //.x .y 
    }, 1000);

});


