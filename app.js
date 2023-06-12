const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();
const expressValidator = require('express-validator');
const PORT = process.env.PORT || 5000;



//mysql connection
require('./connections/database');

//passport config
require('./config/passport')(passport);

app.use(express.static("public"));
//view engine
app.set('view engine', 'pug');

//middleware
app.use(express.urlencoded({extended: false}));


app.use(session({
    secret: 'watermelonsugar',
    resave: true,
    saveUninitialized: true,
  }));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.body = req.body;
    res.locals.flashes = req.flash();
    //console.log(res.locals.flashes);
    next();
});
//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/vehicle', require('./routes/vehicle'));
app.use('/tollPlaza', require('./routes/tollPlaza'));
app.use('/employee', require('./routes/employee'));
app.use('/manager', require('./routes/manager'));
app.use('/tollBooth', require('./routes/tollBooth'));
app.listen(PORT, console.log(`Server on ${PORT}`));