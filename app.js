if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const User = require('./models/user');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const usersRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');


mongoose.connect('mongodb://127.0.0.1:27017/stay-finder');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const app = express();


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

//Setting up session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,       //Date is in milliseconds so we are adding a week to it in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());    //for persistent login sessions, app,use(session()) should be before app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); //authenticate() => generates a function used in passport's localstrategy

passport.serializeUser(User.serializeUser()); // generates a function used by passport to serialize user into the session
passport.deserializeUser(User.deserializeUser()); //generates a function used by passport to deserialize user out of session


//Setting up middleware for Flash messages, storing it in res.locals
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');      // success message is now  accessible in every template of every view
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req,res)=>{
    const user = new User({email: 'harshitttt@gmail.com', username: 'harshitttt'});
    const newUser = await User.register(user, 'monkeyPassword');
    res.send(newUser);
})


app.use('/', usersRoutes);
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home');
});



//this * path runs only if nothing matches the above routes first and we didnt respond from any of them, so it comes at the end of our express app
app.all('/{*path}', (req,res,next)=>{
    next(new ExpressError("Page Not Found!", 404));
})


// Custom Error Handler
app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render('error', {err});
})


app.listen(3000, ()=>{
    console.log("Serving on port 3000");
});