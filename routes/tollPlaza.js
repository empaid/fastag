const express = require('express');
const { render } = require('pug');
const router = express.Router();
const {ensureAdminAuthenticated} = require('../config/auth');
const mysql = require('../connections/database.js');

router.get('/', ensureAdminAuthenticated, async (req, res) =>{
    res.render('addTollPlaza');
});

router.post('/', ensureAdminAuthenticated, async (req, res) =>{
    const {plaza_name, city, state} = req.body;
    if(!plaza_name || !city || !state){
        req.flash('danger', ['Please fill required details']);
        return res.render('addTollPlaza', {
            body: req.body, 
            flashes: req.flash()
        });
    }
    const query = 'INSERT INTO toll_plaza(plaza_id, name, city, state) VALUES (uuid_short(),?,?,?)';
    await mysql.query(query, [plaza_name, city, state]);
    req.flash('success', ['Toll Plaza Added Successfully']);
    res.redirect('/dashboard');
});

router.get('/managers', ensureAdminAuthenticated, async (req, res) =>{
    list = [];
    toll_plazas = await mysql.query('SELECT plaza_id, name, city from toll_plaza');
    managers = await mysql.query('SELECT first_name, last_name, username, email, plaza_id from user_account t1 inner join plaza_manager t2 on t1.account_id = t2.manager_id;');
    toll_plazas.forEach(toll_plaza => {
        obj = {plaza : toll_plaza}
        managers.forEach(async(manager) => {
            if(manager.plaza_id == toll_plaza.plaza_id){
                obj.manager = manager;
            }
        });
        list.push(obj);
    });
    console.log(list);
    return res.render('plazaManager', {
        manager_list: list
    });
});

router.get('/funds', ensureAdminAuthenticated, async (req, res) =>{
    list = await mysql.query('SELECT name, city, online_funds, cash_holded from toll_plaza');
    return res.render('plazaFunds', {
        list: list
    });
});

module.exports = router;