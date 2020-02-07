const Render = {};

Render.Redirect = (req, res) => res.redirect('/');
Render.Index = (req, res) => res.render('index');
Render.Register = (req, res) => res.render('register');
Render.Login = (req, res) => res.render('login');
Render.Logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
};

module.exports = Render;