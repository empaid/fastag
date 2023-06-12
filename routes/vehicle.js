const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const mysql = require('../connections/database.js');
vehicle_types = ['LMV', 'LCV', 'HCV'];
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('addVehicle');
});

router.post('/', ensureAuthenticated, async (req, res) => {
    const {vehicle_no, brand, model, colour, vehicle_type} = req.body;
    if(!vehicle_no || !brand || !model || !colour || !vehicle_types.includes(vehicle_type)){
        req.flash('danger', ['Please fill required details']);
        return res.render('addVehicle', {
            body:req.body,
            flashes: req.flash()
        });  
    }
    const query = 'INSERT INTO vehicle(owner_id, vehicle_type, vehicle_no, brand, model, colour) VALUES (?,?,?,?,?,?)';
    await mysql.query(query, [req.user.account_id, vehicle_type, vehicle_no, brand, model, colour]);
    req.flash('success', ['Vehicle Added Successfully']);
    res.redirect('/dashboard');
});

router.get('/history', ensureAuthenticated, async (req, res)=>{
    vehicles = await mysql.query('SELECT * FROM vehicle WHERE vehicle_id=?', [req.query.vehicle_id]);
    if(vehicles.length == 0) {
        req.flash('danger', ['Invalid Vehicle Id']);
        return res.redirect('/dashboard');
    }
    vehicle = vehicles[0];
    
    query = 
    `SELECT visit_time, city, payment_type, total_amount, fine_amount  FROM visits_at
    LEFT JOIN toll_booth
    using(booth_id)
    LEFT JOIN toll_plaza
    using(plaza_id)
    WHERE vehicle_id = ?
    ORDER BY visit_time desc;`;
    travel_list = await mysql.query(query, [vehicle.vehicle_id]);
    return res.render('travelHistory',{
        vehicle : vehicle,
        travel_list: travel_list
    });
});


//eiot


router.get('/details', async (req, res)=>{
    vehicles = await mysql.query('SELECT * FROM vehicle WHERE vehicle_id=?', [req.query.vehicle_id]);
    if(vehicles.length == 0) {
        return res.send('no Vehicle');
    }
    res.send(vehicles[0]);
})

router.get('/arrived', async (req, res) =>{
    console.log(req.query.type);
    vehicles = await mysql.query('SELECT * FROM vehicle WHERE vehicle_id=?', [req.query.vehicle_id]);
    if(req.query.type=='automated'){
        console.log('automated')
        await mysql.query('call vehicle_visited_payment_automated(?, ?)', [req.query.booth_id, req.query.vehicle_id]);
     } 
     else{
         console.log('cash');
        await mysql.query('call vehicle_visited_payment_cash(?, ?)', [req.query.booth_id, req.query.vehicle_id]);
     }
        vehicles = await mysql.query('SELECT * FROM vehicle WHERE vehicle_id=?', [req.query.vehicle_id]);
    vehicles[0].status = 'success';
    res.send(vehicles[0]);
});


router.get('/topup', ensureAuthenticated, async (req, res)=>{
    vehicles = await mysql.query('SELECT * FROM vehicle WHERE vehicle_id=?', [req.query.vehicle_id]);
    if(vehicles.length == 0) {
        req.flash('danger', ['Invalid Vehicle Id']);
        return res.redirect('/dashboard');
    }
    vehicle = vehicles[0];
    res.render('topup', {
        vehicle: vehicle
    });

});

router.post('/topup', ensureAuthenticated, async (req, res)=>{
    vehicles = await mysql.query('SELECT * FROM vehicle WHERE vehicle_id=?', [req.body.vehicle_id]);
    if(vehicles.length == 0) {
        req.flash('danger', ['Invalid Vehicle Id']);
        return res.redirect('/dashboard');
    }
    await mysql.query('UPDATE vehicle SET balance = balance + ? WHERE vehicle_id = ?', [req.body.amount, req.body.vehicle_id]);
    req.flash('success', ['Balance Added Successfully']);
    res.redirect('/dashboard');

});

module.exports = router;