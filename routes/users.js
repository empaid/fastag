const express = require('express');
const router = express.Router();
const { createHmac } =  require('crypto');
const passport = require('passport');
const secret_key = 'watermelonsugar';
const mysql = require('../connections/database.js');
// async function work(){
// await mysql.query('insert into toll_plaza(plaza_id, name, city, state) values (uuid_short(), ?, ?, ?);', ["Mother Teresa Toll Plaza", "Pune", "Maharashtra"]);
// }
// work();
router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/register', async (req, res) => {
    const {username, first_name, last_name, email, password, password2, driving_license_no} = req.body;
    const errors = [];
    //Validate Required Fields
    if(!username || !first_name || !last_name || !email || !password || !password2 || !driving_license_no){
        errors.push({msg: 'Please fill required details'});
    }

    if(password != password2){
        errors.push({msg: `Passwords don't match`});
    }

    //Check if username already taken
    query = `SELECT username FROM user_account WHERE username = '${username}'`;
    users = await mysql.query(query);
    if(users.length != 0 ){
        errors.push({msg: 'Username Already Taken'});
        req.body.username = "";        
    } 
    
    //Check email already taken
    query = `SELECT username FROM user_account WHERE email = '${email}'`;
    users = await mysql.query(query);
    if(users.length != 0 ){
        errors.push({msg: 'Email Already Taken'});
        req.body.email = "";
    }

    if(errors.length > 0){
        req.flash('danger', errors.map(err => err.msg));
        res.render('register', {
            body: req.body,
            flashes: req.flash()
        });
    }
    else{
    const password_hash = createHmac('sha256', secret_key).update(password).digest('hex');
    query = 'INSERT INTO user_account(first_name, last_name, username, password_hash, email) VALUES ( ?, ?, ?, ?, ?);'
    await mysql.query(query, [first_name, last_name, username, password_hash, email]);
    accounts = await mysql.query('SELECT * FROM user_account WHERE username=?;', [username]);
    account_id = accounts[0].account_id;
    query = 'INSERT INTO customer VALUES (?, ?);'
    await mysql.query(query , [account_id, driving_license_no]);
    // req.flash('success', ['You are now registered and can login']);
    // res.render('login', {flashes: req.flash()});
    req.flash('success', ['You are now registered and can login']);
    res.redirect('/users/login');
    // res.redirect('login');
    }

    // console.log(req.body);
});

//login
router.post('/login', async (req, res, next)=> {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    // console.log(req.body.username);
    // query = `SELECT * FROM user_account WHERE username = '${req.body.username}'`;
    // accounts = await mysql.query(query);
    // console.log(accounts);
    // res.send('login');
});

//logout
router.get('/logout', (req, res)=>{
    req.logOut();
    req.flash('success', ['You are logged out Successfully!!!']);
    res.redirect('/');
});


module.exports = router;
