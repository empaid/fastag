const express = require('express');
const router = express.Router();
const { createHmac } =  require('crypto');
const secret_key = 'watermelonsugar';
const {ensureAdminAuthenticated} = require('../config/auth');
const mysql = require('../connections/database.js');

router.get('/', ensureAdminAuthenticated, async (req, res) => {
    toll_plazas = await mysql.query('SELECT * FROM toll_plaza;');
    if(toll_plazas.length == 0){
        req.flash('danger', ['No Toll Plaza Present. Please Add Toll Plaza First!!!']);
        return res.redirect('/dashboard');
    }
    res.render('changeManager', {
        toll_plazas: toll_plazas
    });
});

router.post('/', ensureAdminAuthenticated, async (req, res) => {
    const {toll_plaza_id, employee_id} = req.body;
    if(toll_plaza_id==0 || employee_id==0 ){
        req.flash('danger', ['Please Enter All Details']);
        return res.redirect('/manager')
    }
    manager = await mysql.query('SELECT * FROM plaza_manager WHERE plaza_id = ?', [toll_plaza_id]);
    if(manager.length == 0 ){  // Assign Manager
        await mysql.query('INSERT INTO plaza_manager(plaza_id, manager_id) VALUES(?, ?);', [toll_plaza_id, employee_id]);
        await mysql.query('UPDATE user_account SET account_type = "manager" WHERE account_id = ?', [employee_id]);
        req.flash('success', ['Manager Assigned Successfully']);
    }
    else{ //Change Manager
        await mysql.query('UPDATE plaza_manager SET manager_id=? WHERE plaza_id=?', [employee_id, toll_plaza_id]);
        await mysql.query('UPDATE user_account SET account_type = "manager" WHERE account_id = ?', [employee_id]);
        await mysql.query('UPDATE user_account SET account_type = "employee" WHERE account_id = ?', [manager[0].manager_id]);
        req.flash('success', ['Manager Changed Successfully']);
    }
    res.redirect('/dashboard');
});


module.exports = router;