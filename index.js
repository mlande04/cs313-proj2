const app = require('express')();
const path = require('path')
const PORT = process.env.PORT || 5000
const io = require('socket.io')(PORT);

/*
const http = require('http')(PORT);
http.createServer(function(req, res){
	res.writeHead(200, {"Content-type": "text/plain"})
	res.end("Hello World\n")
}).listen(PORT)
*/

//app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

// Heroku setting for long polling - for using Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.on('connection', function(socket) {
   console.log('a user connected');
   socket.on('disconnect', function() {
	   console.log('a user disconnected');
   });
});

io.on('connection', function(socket) {
	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
		console.log('message: ' + msg);
	});
});