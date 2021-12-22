exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) { //nếu đã đăng nhập thì next nếu không thì thông báo như please login
        next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/user/login');
    }
}
//làm cái này để đề phòng bê phía admin thôi
exports.isAdmin = function(req, res, next) {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {  //nếu đã đăng nhập mà cái admin trong database == 1 thì next ko thì như dưới
        next();
    } else {
        req.flash('danger', 'Please login as admin');
        res.redirect('/user/login');
    }
}