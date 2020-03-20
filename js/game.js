/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

var Game = {};

var DebugText;

var Terrain_Layer;
var Building_Layer;
var UI_Layer;

var myID = -1;

// Player 클래스를 대충 정의. Client.js로 플레이어 정보를 보낼 때 여기서 포장해서 보냄
// 게임에 기능을 추가할 경우, Class 의 Entries 를 추가해보자 
// 만약 게임이 복잡해지면 따로 classes.js 만들어서 html 어 먼저 loading 시키자..?
//-----------------------------------------------------------------
// x,y 맵상 좌표
// List of Items (예정) (아이템 ID 의 리스트로 만들면 어떨까)
// Current Action (예정) (이동중, 대화중, 뭐뭐중....)
// Clothing (예정)
 
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png');
};

Game.create = function(){
    Game.playerMap = {};
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    testKey.onDown.add(Client.sendTest, this);

    var map = game.add.tilemap('map');
    var Terrain_Layer = map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }

    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    layer.events.onInputUp.add(Game.getCoordinates, this);

    DebugText = game.add.text(15, 15, "hii", {
        font: "15px Arial",
        fill: "#ff0044",
        align: "center"
    });
    //DebugText.setDepth(1);

    Client.askNewPlayer();
};

Game.setID = function(id){
    myID = id;
    //DebugText.setText('your id is: ' + myID);
};

Game.myPlayer = function(){
    var thisplayer = new Player(Game.playerMap[myID].x,Game.playerMap[myID].y);
    //var thisplayer = new Player(10,10);

    if(myID != -1){
        return thisplayer;
    }else{
        return null;
    }
}

Game.getCoordinates = function(layer,pointer){
    Client.sendClick(pointer.worldX,pointer.worldY);
};

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    DebugText.setText('AddSprite ' + id);
};

Game.movePlayer = function(id,x,y){
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var tween = game.add.tween(player);
    var duration = distance*10;
    tween.to({x:x,y:y}, duration);
    tween.start();
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};