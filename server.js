var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(server);


// list of all the current games
// TODO: empty this from time to time...
let games = [];

// SOCKET
io.on('connection', function(socket) {
    // a user logs in
    socket.on('new user', function(data) {
        // control that the game exists
        let game = games.find(g => g.id === data.game);
        if (!game) return;

        // add the user to the game and inform other players
        game.users.forEach(user => {
            socket.broadcast.to(user).emit('new user', user);
        })
        game.users.push(socket.id);
    });

    // a user disconnect
    socket.on('disconnect', function() {
        // if the user was in a game
        let game = games.find(g => g.users.includes(socket.id));
        if (!game) return;
        // remove him from the game
        let i = game.users.indexOf(socket.id);
        game.users.splice(i, 1);
        // inform other players
        game.users.forEach(user => {
            socket.broadcast.to(user).emit('user disconnected', user);
        })
    });
});


// BASIC EXPRESS APP

// TODO do not leave the whole app in static
app.use(express.static('./'));

// create a new game
app.get('/createGame', function(req, res) {
    console.log("Request to create a new game");
    // create a unique id
    let gameId = guid(50);
    console.log("GUID: " + gameId);
    res.redirect('/game?id=' + gameId);
    games.push({
        id: gameId,
        date: Date.now(),
        users: []
    });
});

// join an existing game
app.get('/game', function(req, res) {
    let gameId = req.query.id;
    // control that the game exists
    let game = games.find(g => g.id === gameId);
    if (!game) {
        res.send("The specified game does not exist.");
    } else {
        // send the game html page
        res.sendFile(path.join(__dirname + '/index.html'));
    }
});

// get stats about every current game
app.get('/stats', function(req, res) {
    console.log("Requested stats");
    res.send(JSON.stringify(games));
});

// start server
server.listen(9000, () => {
    console.log("Listening on port 9000")
});



/**
 * guid - Create a unique ID of n characters
 *
 * @param  {number} n nb of characters
 * @return {string}   guid
 */
function guid(n) {
    return 'x'.repeat(n).replace(/x/g, () => Math.floor(Math.random() * 36).toString(36))
}
