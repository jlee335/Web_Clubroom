/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 * 
 * // I will use this example to understand how this game engine works!
 */

var Game = {};

var DebugText;

var Terrain_Layer;
var Building_Layer;
var UI_Layer;

var myID = -1;

//var game 은 game.js 안에 있다.

//client.js, game.js, main.js 셋다 index.html 에서 묶어준다

// Player 클래스를 대충 정의. Client.js로 플레이어 정보를 보낼 때 여기서 포장해서 보냄
// 게임에 기능을 추가할 경우, Class 의 Entries 를 추가해보자 
// 만약 게임이 복잡해지면 따로 classes.js 만들어서 html 어 먼저 loading 시키자..?
//-----------------------------------------------------------------
// x,y 맵상 좌표
// List of Items (예정) (아이템 ID 의 리스트로 만들면 어떨까)
// Current Action (예정) (이동중, 대화중, 뭐뭐중....)
// Clothing (예정)
//-----------------------------------------------------------------

 
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

// 게임의 Asset 들을 로드시키는 함수.
Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png');
};

//게임 실행하는 함수
Game.create = function(){
    Game.playerMap = {};

    //아직은 의미없는 테스트 함수------------------------------------
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    testKey.onDown.add(Client.sendTest, this);
    //-------------------------------------------------------------

    //Phaser 안에 tilemap 이라는 방법을 이용해서 게임 배경을 만들어준다.
    var map = game.add.tilemap('map');
    var Terrain_Layer = map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;

    //Phaser 안에 layer 도 알아볼 것
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }

    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer

    layer.events.onInputUp.add(Game.getCoordinates, this); // Phaser 에서 "클릭" 했을 때에 행동!!!!!

    //Phaser 에서 텍스트 아웃풋 만드는 과정
    DebugText = game.add.text(15, 15, "hii", {
        font: "15px Arial",
        fill: "#ff0044",
        align: "center"
    });
    //DebugText.setDepth(1);

    /*
    client.js 안에 askNewPlayer 함수가 존재하고, 이거는 서버에 새 플레이어 정보를 보냄.
    
    서버에서 이를 처리해서 다른 Client 한테도 업데이트가 적용되는 구조다.
    */
    //game --> client ---> server
    Client.askNewPlayer(); 
};

Game.setID = function(id){
    myID = id;
};

//client 가 game 한테서 호출하는 함수임.
Game.myPlayer = function(){
    var thisplayer = new Player(Game.playerMap[myID].x,Game.playerMap[myID].y);
    
    if(myID != -1){
        return thisplayer;
    }else{
        return null;
    }
}

//game --> client --> server(destination) --> other_clients
Game.getCoordinates = function(layer,pointer){
    Client.sendClick(pointer.worldX,pointer.worldY);
};

//game <-- client <-- server(from here)
Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    DebugText.setText('AddSprite ' + id);
};

//game <-- client <-- server(from here)
Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

//game <-- client <-- server(from here)
Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};
