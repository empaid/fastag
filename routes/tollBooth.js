const express = require('express');
const { render } = require('pug');
const router = express.Router();
const {ensureManagerAuthenticated} = require('../config/auth');
const mysql = require('../connections/database.js');

router.get('/', ensureManagerAuthenticated, async (req, res) =>{
    employees = await mysql.query(
        `select * from user_account 
        where 
        account_id in (select employee_id from employee where plaza_id = ?) 
        and 
        account_id not in (select manager_id from plaza_manager where plaza_id = ?)
        and
        account_id not in (select operator_id from toll_booth);`, 
        [req.user.plaza.plaza_id, req.user.plaza.plaza_id]);

    res.render('addTollBooth', {
        user: req.user,
        employees: employees
    });
});

router.post('/', ensureManagerAuthenticated, async (req, res) =>{
    const {plaza_id, serial_no, operator_id} = req.body;
    console.log(req.body);
    if(!plaza_id || !serial_no || operator_id == 0){
        employees = await mysql.query(
            `select * from user_account 
            where 
            account_id in (select employee_id from employee where plaza_id = ?) 
            and 
            account_id not in (select manager_id from plaza_manager where plaza_id = ?)
            and
            account_id not in (select operator_id from toll_booth);`, 
            [req.user.plaza.plaza_id, req.user.plaza.plaza_id]);
    
        req.flash('danger', ['Please fill required details']);
        
        return res.render('addTollBooth', {
            body: req.body, 
            flashes: req.flash(),
            user: req.user,
            employees: employees
        });
    }


    toll_booth = await mysql.query('select * from toll_booth where serial_no = ? and plaza_id = ?', [serial_no, plaza_id]);
    if(toll_booth.length !=0 ){
        req.flash('danger', ['Serial Number Already Taken']);
        return res.render('addTollBooth', {
            body: req.body, 
            flashes: req.flash(),
            user: req.user,
            employees: employees
        });
    }
    await mysql.query('INSERT INTO toll_booth values(uuid_short(), ?, ?, ?)', [serial_no, plaza_id, operator_id]);
    req.flash('success', ['Toll Booth Added Successfully']);
    res.redirect('/dashboard');
});

router.get('/operator/list', ensureManagerAuthenticated, async (req, res) =>{
    operators = await mysql.query(
        `select serial_no, booth_id,first_name, last_name, email 
        from user_account t1
        inner join toll_booth t2
        on t1.account_id = t2.operator_id
        where plaza_id = ?;`,
        [req.user.plaza.plaza_id])

    res.render('operatorTollBooth', {
        list: operators
    });
});




module.exports = router;