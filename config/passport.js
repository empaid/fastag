const localStratergy = require('passport-local').Strategy;
const mysql = require('../connections/database.js');
const { createHmac } =  require('crypto');
const secret_key = 'watermelonsugar';

module.exports = function(passport){
    passport.use(
        new localStratergy({usernameField: 'username'}, async (username, password, done) => {
            const password_hash = createHmac('sha256', secret_key).update(password).digest('hex');
            query = `SELECT * FROM user_account WHERE username = '${username}'`;
            accounts = await mysql.query(query);
            if(accounts.length == 0) return done(null, false, {message: 'Username  don\'t exist'});
            if(accounts[0].password_hash == password_hash) return done(null, accounts[0]);
            return done(null, false, {message: 'Password Incorrect'});

        })
    );
    passport.serializeUser((user, done) => {
        done(null, user.account_id);
    });
    passport.deserializeUser(async (account_id, done) => {
        query = `SELECT * FROM user_account WHERE account_id = ${account_id}`;
        accounts = await mysql.query(query);
        if(accounts[0].account_type == 'manager'){
            plaza = await mysql.query('SELECT * FROM toll_plaza WHERE plaza_id = (SELECT plaza_id plaza FROM plaza_manager WHERE manager_id = ?);', [accounts[0].account_id]);
            accounts[0].plaza = plaza[0];
        }
        
        if(accounts[0].account_type == 'employee'){
            plaza = await mysql.query('SELECT * from toll_plaza WHERE plaza_id = (SELECT plaza_id from employee WHERE employee_id = ?);', [accounts[0].account_id]);
            accounts[0].plaza=plaza[0];
            console.log('camehere');
            booth = await mysql.query('SELECT * FROM toll_booth WHERE operator_id = ?', [accounts[0].account_id]);
            if(booth.length != 0 ) accounts[0].booth = booth[0];
        }
        done(null, accounts[0]);
    });
}