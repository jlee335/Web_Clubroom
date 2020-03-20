/**
 * Created by Jerome on 03-03-17.
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

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y}); //data from server denotes this map {x:x y:y}
};

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data,myid){
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
    Game.setID(myid);

    Client.socket.on('move',function(data){
        //Client may get delayed response if player not active.
        Game.movePlayer(data.id,data.x,data.y);
    });

    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });


    //Periodic Update Function to synchronize with Server
    setInterval(function(){
        //1. Recieve current info about player
        
        //2. Organize and send info to server
        Client.socket.emit('update',myid); 
    }, 1000);

});


