var blocks = [];

var r;
var g;
var b;

var color_index = -1;
var select_index = -1;
var deleted_lines = 0;

var init_blocks_num = 0;
var draw_status = 0;
var latest_id = null;

function setup() {
  createCanvas(1000, 500);
  init_blocks_num = Math.floor( random( 36, 40 ) );

  newBlock( ( new Date() ).getTime() ); //. スタート
}

/*
function keyTyped(){
  if( draw_status == 1 ){
    if( key === 'b' ){
      newBlock( ( new Date() ).getTime() );
    }
  }

  return false;
}
*/

function mouseClicked(){
  if( color_index == -1 ){
    //newBlock( ( new Date() ).getTime() ); //. スタート
  }else{
    //console.log( '[' + mouseX + ',' + mouseY + ']')
    var idx_x = Math.floor( mouseX / 100 );
    var idx_y = Math.floor( mouseY / 100 );
    idx_x = ( ( idx_y + deleted_lines ) % 2 ? 9 - idx_x : idx_x );
    idx_y = 4 - idx_y;
    var idx = 10 * idx_y + idx_x;
    if( color_index >= idx && blocks[idx] ){
      select_index = blocks[idx].index;
      //console.log( '(' + idx + ')' + blocks[idx].id + ': ' + blocks[idx].index );

      $.ajax({
        type: 'GET',
        url: '/item/' + blocks[idx].id,
        success: function( result ){
          console.log( result );
        },
        error: function(){
          console.log( 'ajax error.' );
        }
      });
    }else{
      select_index = -1;
    }
  }

  return false;
}

function draw() {
  background(245);

  for (var i = 0; i < blocks.length; i++) {
  	blocks[i].draw();
  	blocks[i].update();
  	blocks[i].checkEdges();
  }
}

function Block(x, y, id, m, r, g, b){
  this.index = color_index;
  this.x = x;
  this.y = y;
  this.id = id;
  this.m = m;

  // start position
  this.pos = createVector(this.x, 0/*this.y*/);

  this.r = r;
  this.g = g;
  this.b = b;

  this.draw = function(){
    // Draw the block
    noStroke();
    fill(this.r, this.g, this.b);
    rect(this.pos.x, this.pos.y, 100, 100 );

    stroke( 255, 255, 255 );
    strokeWeight( 5 );
    line(this.pos.x, this.pos.y+50, this.pos.x+99, this.pos.y+50);
    line(this.pos.x, this.pos.y+99, this.pos.x+99, this.pos.y+99);
    strokeWeight( 3 );
    line(this.pos.x+25, this.pos.y, this.pos.x+25, this.pos.y+50);
    line(this.pos.x+75, this.pos.y+50, this.pos.x+75, this.pos.y+99);

    if( select_index > -1 && this.index == select_index ){
      //. 選択したブロックを強調表示
      stroke( 255, 0, 0 );
      strokeWeight( 5 );
      noFill();
      rect(this.pos.x, this.pos.y, 100, 100 );
    }
  };

  this.update = function(){
    this.pos.y += 10;
    //console.log( 'y = ' + this.y + ', pos.y = ' + this.pos.y ); //. 110 -> -90
  };

  this.checkEdges = function() {
    if (this.pos.y + 100 > this.y) {
      this.pos.y = this.y - 100;
      if( this.index == color_index ){
        if( blocks.length > 30 && color_index >= 39 && color_index % 10 == 9 ){
          //. ブロックを縦に一段ずらす
          for( var i = blocks.length - 1; i >= 10; i -- ){
            blocks[i].y = blocks[i-10].y;
          }

          blocks.splice(0, 10);
          deleted_lines ++;
        }

        if( draw_status == 0 ){
          if( blocks.length < init_blocks_num ){
            newBlock( ( new Date() ).getTime() );
          }else{
            draw_status = 1;
          }
        }
      }
    }
  };
}

function newBlock(id){
  latest_id = id;
  color_index ++;

  var block_x = color_index % 10;
  var block_y = Math.floor( color_index / 10 );

  block_x = ( block_y % 2 ? 9 - block_x : block_x );
  block_y = ( color_index < 40 ? 5 - block_y : 2 );

  r = ( color_index % 4 ) * 64;
  g = ( Math.floor( color_index / 4 ) % 4 ) * 64;
  b = ( Math.floor( color_index / 16 ) % 4 ) * 64;

  blocks.push(new Block(block_x * 100, block_y * 100, id, '#' + color_index, r, g, b));

  if( color_index + 1 == init_blocks_num ){
    setInterval( checkNewBlock, 3000 );
  }
}

function checkNewBlock(){
  $.ajax({
    type: 'GET',
    url: '/check',
    success: function( result ){
      if( result.items && result.items.length ){
        var latest_item = result.items[result.items.length-1];
        if( latest_item.id != latest_id ){
          newBlock( latest_item.id );
        }
      }
    },
    error: function(){
      console.log( 'ajax error.' );
    }
  });
}
