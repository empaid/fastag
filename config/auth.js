module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            return next();
        }
        else{
            req.flash('danger', ['You should be logged In']);
            res.redirect('/users/login');
        }
    },
    ensureAdminAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            if(req.user.account_type == 'admin')
                return next();
            else{
                req.flash('danger', ['You are not allowed to view this resource']);
                res.redirect('/dashboard');
            }
        }
        else{
            req.flash('danger', ['You should be logged In']);
            res.redirect('/users/login');
        } 
    },
    ensureManagerAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            if(req.user.account_type == 'manager' || req.user.account_type == 'admin')
                return next();
            else{
                req.flash('danger', ['You are not allowed to view this resource']);
                res.redirect('/dashboard');
            }
        }
        else{
            req.flash('danger', ['You should be logged In']);
            res.redirect('/users/login');
        } 
    },
    forwardAuthenticated: (req, res, next) => {
        if (!req.isAuthenticated()) {
          return next()
        }
        res.redirect('/dashboard');  
    }
}