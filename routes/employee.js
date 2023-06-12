const express = require('express');
const router = express.Router();
const { createHmac } =  require('crypto');
const secret_key = 'watermelonsugar';
const {ensureManagerAuthenticated} = require('../config/auth');
const mysql = require('../connections/database.js');
const { response } = require('express');
router.get('/', ensureManagerAuthenticated, async (req, res) => {
    toll_plazas = await mysql.query('SELECT * FROM toll_plaza;');
    if(toll_plazas.length == 0){
        req.flash('danger', ['No Toll Plaza Present. Please Add Toll Plaza First!!!']);
        return res.redirect('/dashboard');
    }
    res.render('registerEmployee', {
        user: req.user
    });
});

router.post('/', ensureManagerAuthenticated, async (req, res) => {
    const {username, first_name, last_name, email, password, password2, salary, toll_plaza_id} = req.body;
    const errors = [];
    //Validate Required Fields
    if(!username || !first_name || !last_name || !email || !password || !password2 || !salary ){
        errors.push({msg: 'Please fill required details'});
    }
    console.log(toll_plaza_id);

    if(password != password2){
        errors.push({msg: `Passwords don't match`});
    }

    //Check if username already taken
    query = `SELECT username FROM user_account WHERE username = '${username}';`;
    users = await mysql.query(query);
    if(users.length != 0 ){
        errors.push({msg: 'Username Already Taken'});
        req.body.username = "";        
    } 
    
    //Check email already taken
    query = `SELECT username FROM user_account WHERE email = '${email}';`;
    users = await mysql.query(query);
    if(users.length != 0 ){
        errors.push({msg: 'Email Already Taken'});
        req.body.email = "";
    }
    //Check toll plaza presense already taken
    query = `SELECT * FROM toll_plaza WHERE plaza_id = '${toll_plaza_id}';`;
    users = await mysql.query(query);
    if(users.length == 0 ){
        errors.push({msg: 'Invalid Toll Plaza'});
    }

    if(errors.length > 0){
        toll_plazas = await mysql.query('SELECT * FROM toll_plaza;');
        if(toll_plazas.length == 0){
            return res.redirect('/dashboard');
        }
        req.flash('danger', errors.map(err => err.msg));
        res.render('registerEmployee',{
            body: req.body,
            user: req.user,
            flashes: req.flash(),
            toll_plazas: toll_plazas
        });
    }
    else{
    const password_hash = createHmac('sha256', secret_key).update(password).digest('hex');
    query = 'INSERT INTO user_account(account_id, account_type, first_name, last_name, username, password_hash, email) VALUES ( uuid_short(), "employee", ?, ?, ?, ?, ?);'
    await mysql.query(query, [first_name, last_name, username, password_hash, email]);
    accounts = await mysql.query('SELECT * FROM user_account WHERE username=?;', [username]);
    account_id = accounts[0].account_id;
    query = 'INSERT INTO employee(employee_id, plaza_id, salary, holded_cash) VALUES (?, ?, ?, ?);';
    await mysql.query(query , [account_id, toll_plaza_id, salary, 0]);
    req.flash('success', ['Employee Added Successfully']);
    res.redirect('/dashboard');
    }
});

router.get('/getList',ensureManagerAuthenticated, async (req, res) => {
    plaza_id = req.query.plaza_id;
    plaza_manager = await mysql.query('SELECT * FROM plaza_manager WHERE plaza_id=?;', [plaza_id]);
    let response = {}
    if(plaza_manager.length == 0){
        response.code = 0;
        response.msg = 'No Manager Present';
    }
    else{
        response.code = 1;
        await mysql.query('SELECT * FROM user_account WHERE  account_id = ?;', [plaza_manager[0].manager_id]);
    }
    let employees = await mysql.query('SELECT account_id,username, first_name, last_name FROM user_account WHERE account_id in (SELECT employee_id FROM employee WHERE plaza_id=?);', [plaza_id]);
    if(response.code == 1)
        employees = employees.filter((employee) => {return employee.account_id != plaza_manager[0].manager_id});
    response.employees = employees;
    res.send(response);
});

module.exports = router;