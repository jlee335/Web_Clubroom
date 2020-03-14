


//Many parts of the code follows tutorial from https://github.com/Jerenaux/basic-mmo-phaser/blob/master/js/game.js



var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');
var Game = {};

/*
Client orders will be sent to server. Game.function will change server state.
*/

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
	/*
	MAP tilesheet.
	--> map data will be saved in json format!!!
	--> spritesheet brings out texture?

	*/
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
};

Game.create = function(){
	Game.playerList = {}; // 플레이어 리스트 
	var map = game.add.tilemap('map'); // 맵 추가 

    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }//레이어?
    
    layer.inputEnabled = true; // Allows clicking on the map
}

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
};