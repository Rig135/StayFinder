if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config({ quiet: true});
}

// console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const User = require('./models/user');
const helmet = require('helmet');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const usersRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/stay-finder';

mongoose.connect(dbUrl);
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
app.use(mongoSanitize({
    replaceWith: '_',
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
});

//Setting up session
const sessionConfig = {
    store: store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,       //Date is in milliseconds so we are adding a week to it in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];

const fontSrcUrls = [
    "https://fonts.gstatic.com/",
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/enrlyidw/",
                "https://api.maptiler.com/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
)

app.use(passport.initialize());
app.use(passport.session());    //for persistent login sessions, app,use(session()) should be before app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); //authenticate() => generates a function used in passport's localstrategy

passport.serializeUser(User.serializeUser()); // generates a function used by passport to serialize user into the session
passport.deserializeUser(User.deserializeUser()); //generates a function used by passport to deserialize user out of session


//Setting up middleware for Flash messages, storing it in res.locals
app.use((req,res,next)=>{
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');      // success message is now  accessible in every template of every view
    res.locals.error = req.flash('error');
    next();
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

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Serving on port ${port}`);
});