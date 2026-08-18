const User = require('../models/user');

module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
};

module.exports.register = async (req,res, next)=>{
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
    
};

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
};

module.exports.login = (req,res)=>{
    req.flash('success', 'Welcome Back');
    //using res.locals.returnTo to redirect the user to the original Url they were requesting before login page
    const redirectUrl = res.locals.returnTo || '/listings';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/listings');
    });
};