var http = require('http'),
    express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	CollectionDriver = require('./collectionDriver').CollectionDriver;
 
var app = express();
app.set('port', process.env.PORT || 3000); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
 
var collectionDriver;
 
var url = 'mongodb://localhost:27017/mongo-server';
MongoClient.connect(url, function(error, db) {
	if (error) {
		console.error("Unable to connect to MongoDB. Please make sure mongod is running on %s.", url);
		process.exit(1);
	}
	console.log("Connected to MongoDB successfully.");
	collectionDriver = new CollectionDriver(db);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:collection', function(req, res) {
   var params = req.params;
   collectionDriver.findAll(req.params.collection, function(error, objs) {
    	  if (error) { res.send(400, error); }
	      else { 
	          if (req.accepts('html')) {
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','application/json');
                  res.send(200, objs);
              }
         }
   	});
});

app.get('/:collection/:entity', function(req, res) {
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
