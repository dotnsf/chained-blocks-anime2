// app.js

var cfenv = require( 'cfenv' );
var express = require( 'express' );
var app = express();

var appEnv = cfenv.getAppEnv();

app.use( express.static( __dirname + '/public' ) );

var items = [];
app.get( '/check', function( req, res ){
  res.contentType( 'application/json' );

  var dt = new Date();
  var ms = dt.getMilliseconds();
  if( ms % 2 == 0 ){
    var id = dt.getTime();
    var body = '' + dt;
    var item = { id: id, body: body };
    items.push( item );
  }

  res.write( JSON.stringify( { status: true, items: items }, 2, null ) );
  res.end();
});

app.get( '/item/:id', function( req, res ){
  res.contentType( 'application/json' );

  var id = req.params.id;
  if( id ){
    var item0 = null;
    items.forEach( function( item ){
      if( item.id == id ){
        item0 = item;
      }
    });
    if( item0 ){
      res.write( JSON.stringify( { status: true, item: item0 }, 2, null ) );
      res.end();
    }else{
      res.status( 404 );
      res.write( JSON.stringify( { status: false, message: 'Not found for id: ' + id }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'Parameter id required.' }, 2, null ) );
    res.end();
  }
});

var port = appEnv.port || 3000;
app.listen( port );
console.log( 'server started on ' + port );
