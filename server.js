// Imports
const express = require('express');
const webRoutes = require('./routes/web');

// Session imports
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('express-flash');
let passport = require('passport');

// Express app creation
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
    extname: extNameHbs,
    helpers: multihelpers
});
app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Session configurations
let sessionStore = new session.MemoryStore;
app.use(cookieParser());
app.use(session({
    cookie: { maxAge: 60000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: appConfig.secret
}));
app.use(flash());

// Passport configurations
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }));

// Route for static files
app.use('/', express.static(__dirname + '/public'));

// Routes
app.use('/', webRoutes);

const {
    joinUser,
    userCanStart,
    startGame,
    getGame,
    setAnswer,
    getResults,
    restart
} = require('./utils/game')

io.on('connection', (socket) => {
    // Recibe la conexión del cliente
    console.log('Client connected...');

    // Ususario se coencta
    socket.on('joinGame', (data) => {
        console.log('user joined: ', data.username);

        const room = joinUser(socket.id, data.username);
        socket.join(room);
        socket.emit('canStart', userCanStart(socket.id))

        const [gameState, users, waitingUsers] = getGame();
        if (!gameState.active && users.length + waitingUsers.length >= 2) {
            io.to("waiting").emit('canStart', true)
            io.to("active").emit('canStart', true)
        }
    });

    socket.on('startGame', () => {
        io.to("waiting").emit('subscribeToActive', true);
        let game = startGame();
        io.to("active").emit('gameStarted', game);
    })

    socket.on('restartGame', () => {
        restart();
        const [gameState, users, waitingUsers] = getGame();
        if (!gameState.active && users.length + waitingUsers.length >= 2) {
            io.to("waiting").emit('canStart', true)
            io.to("active").emit('canStart', true)
            io.to("waiting").emit('subscribeToActive', true);
        }
    })

    socket.on('subscribeToActive', () => {
        socket.join("active");
    })

    socket.on('sendAnswer', answer => {
        const [game, , ] = getGame();
        if (!game.firstAnswer) {
            io.to("active").emit("countdown", 10);
            let i = 9;
            let interval = setInterval(() => {
                io.to("active").emit('remainingTime', i);
                i--;
                if (i < 0) {
                    clearInterval(interval);
                }
            }, 1000);
        }
        setAnswer(answer, socket.id);
    })

    socket.on('askResults', letter => {
        let res = getResults(letter);
        socket.emit("results", res);
    })
});

// App init
server.listen(appConfig.expressPort, () => {
    console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});