exports.isUser = (req, res, next) => {
    if (req.isAuthenticated())
        next();
    else {
        req.flash('danger', 'You must login.');
        res.redirect('/users/login');
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && res.locals.user.admin)
        next();
    else {
        req.flash('danger', 'You must login as admin.');
        res.redirect('/users/login');
    }
}