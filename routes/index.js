const express = require('express');
const router = express.Router();
const {ensureAuthenticated, forwardAuthenticated} = require('../config/auth');
const mysql = require('../connections/database.js');

router.get('/', forwardAuthenticated, (req, res) => {
    res.render('homepage');
    // req.flash('success_msg', ['You are now registered and can login']);
    // res.redirect('/users/login');
});

router.get('/tollBooth/details', async (req, res) =>{
    toll_plaza = await mysql.query('SELECT * FROM toll_plaza WHERE plaza_id = (SELECT plaza_id FROM toll_booth WHERE booth_id=?);', [req.query.booth_id]);
    toll_charges = await mysql.query('SELECT * FROM toll_charges WHERE plaza_id = ?;', [toll_plaza[0].plaza_id])
    res.send({plaza:toll_plaza[0], charges: toll_charges});

} );



router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    if(req.user.account_type == 'customer'){
        customers = await mysql.query('SELECT * FROM customer WHERE customer_id=?', [req.user.account_id]);
        if(customers.length == 0) return res.send('Error');
        customer = customers[0];
        req.user.driving_license_no = customer.driving_license_no;
        vehicles = await mysql.query('SELECT * FROM vehicle WHERE owner_id=?', [req.user.account_id]);
        req.user.vehicles = vehicles;
        res.render('dashboard', {
            user: req.user
        });
    }
    if(req.user.account_type == 'admin'){
        res.render('adminDashboard', {
            user: req.user
        });
    }
    if(req.user.account_type == 'employee'){
        res.render('employeeDashboard', {
            user: req.user
        });
    }
    if(req.user.account_type == 'manager'){
        res.render('managerDashboard', {
            user: req.user
        });
    }
});
module.exports = router;
