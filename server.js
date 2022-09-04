const express = require('express');
const bodyParser = require('body-parser');
const http = require('http')
const passport = require('passport');

require('dotenv').config();

const port = 3000 || process.env.PORT

const app = express();
const server = http.createServer(app);

const flash = require('connect-flash')
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')

const io = require('socket.io')(server)
io.sockets.setMaxListeners(Infinity);

const { ExpressPeerServer } = require('peer');
ExpressPeerServer(server, { 
  debug: true,
})

app.use('/peerjs', ExpressPeerServer)
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.urlencoded({ extended : false }))
app.use(flash())
app.use(session({
    secret : process.env.SESSION_KEY || 'KityKatonForFree!',
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000
    }),
    resave: true,
    saveUninitialized: true,
}))
app.use(methodOverride('_method'))
app.use(passport.initialize())
app.use(passport.session()) 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('public', __dirname + '/public');
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

const routes = require('./routes/user');
app.use('/', routes);

require('events').EventEmitter.setMaxListeners(100000)

server.listen(port, () => console.log(`listening on port ${port}`))