const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    
    console.log('Attempting to find user with email:', email);
    const user = await User.findOne({ email });
    console.log('Found user:', user);
    if (!user) return done(null, false, { message: 'Incorrect email' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized: Before accessing this route, you must be logged in.' });
  };

module.exports = { passport, isAuthenticated };