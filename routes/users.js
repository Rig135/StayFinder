const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const User = require('../models/user');

const {storeReturnTo} = require('../Middleware');

router.get('/register',(req,res)=>{
    res.render('users/register');
});

router.post('/register',catchAsync(async (req,res, next)=>{
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        //loging in the registered user
        req.login(registeredUser, err =>{
            if(err) return next(err);

            req.flash('success', 'Welcome to StayFinder');
            res.redirect('/listings');
        })
    }catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
    
}));

router.get('/login', (req,res)=>{
    res.render('users/login');
})

router.post('/login',storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req,res)=>{
    req.flash('success', 'Welcome Back');
    //using res.locals.returnTo to redirect the user to the original Url they were requesting before login page
    const redirectUrl = res.locals.returnTo || '/listings';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/listings');
    });
}); 

module.exports = router;