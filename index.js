var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
// To use sessions
var session = require('express-session');
var FileStore = require('session-file-store')(session);

//Set-up Sessions
app.use(session({
  secret: 'Pigsfly1',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

app.use(require('morgan')('dev'));

// Post values: middleware
app.use(express.json() );       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(logRequest);

// Setup our routes
app.post('/login', handleLogin);
app.post('/logout', handleLogout);

// Middleware function: "verifyLogin" will be called first
app.get('/getServerTime', verifyLogin, getServerTime);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// We have html and js in the public directory that need to be accessed
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  var host = http.address().address;
  var port = http.address().port;
  //console.log('Example app listening at http://%s:%s', host, port);
  console.log('listening on *:3000');
});

// connection and disconnect events
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// chat message events
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

// broadcasting
io.emit('some event', { for: 'everyone' });

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

// Checks if the username and password match a hardcoded set
// If they do, put the username on the session
function handleLogin(request, response) {
	var result = {success: false};

	if (request.body.username == "admin" && request.body.password == "password") {
		request.session.user = request.body.username;
		result = {success: true};
	}

	response.json(result);
}

// Removes any user currently stored on the server
function handleLogout(request, response) {
	var result = {success: false};

	// We should do better error checking here to make sure the parameters are present
	if (request.session.user) {
		request.session.destroy();
		result = {success: true};
	}

	response.json(result);
}

// Returns current server time
function getServerTime(request, response) {
	var time = new Date();
	var result = {success: true, time: time};

	response.json(result); 
}

// Middleware function: we can use with any request
// to make sure the user is logged in.
function verifyLogin(request, response, next) {

	if (request.session.user) {
		// They are logged in!
		// pass things along to the next function
		next();
	} else {
		// They are not logged in
		// Send back an unauthorized status
		var result = {success:false, message: "Access Denied"};
		response.status(401).json(result);
	}
}

// Middleware function: logs the current request to the server
function logRequest(request, response, next) {

	console.log("Received a request for: " + request.url);

	// don't forget to call next() to allow the next parts of the pipeline to function
	next();
}

// Event listener: render page divs by hashtag
/*window.onhashchange = function() {
	// render function is called every hash change
	render(window.location.hash);
}; 

// SPA Navigation
function render(hashkey) {
	// hide all divs
	let pages = document.querySelectorAll(".page");
	for (let i=0; i < pages.length; ++i) {
		pages[i].style.display = 'none';
	}
	
	// hide all lis -------------- possibly ignore
	let navLi = document.querySelectorAll(".navLi");
	for (let i = 0; i < navLi.length; ++i) {
		navLi[i].classList.remove("active");
	}
	
	// unhide the user selected page information
	console.log(hashkey);
	switch(hashkey) {
		case "":
			pages[0].style.display = 'block';
			document.getElementById("li_chat").classList.add("active");
			break;
		case "#chat":
			pages[0].style.display = 'block';
			document.getElementById("li_chat").classList.add("active");
			break;
		case "#contact":
			pages[1].style.display = 'block';
			document.getElementById("li_contact").classList.add("active");
			break;
		case "#about":
			pages[2].style.display = 'block';
			document.getElementById("li_about").classList.add("active");
			break;
		case "#logout":
			pages[3].style.display = 'block';
			document.getElementById("li_logout").classList.add("active");
			break;
		default:
			pages[0].style.display = 'block';
			document.getElementById("li_chat").classList.add("active");
			break;
	}
};
*/