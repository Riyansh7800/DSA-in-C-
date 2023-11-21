const User= require("../models/users");

module.exports.Signuppage=(req, res) => {
    res.render("listings/signup.ejs");
  };

  module.exports.newUser=async (req, res) => {
    let { username, email, password } = req.body; // Use req.body, not req.params
    console.log(req.body);
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","Welcome to Wanderlust!");
  
      res.redirect('/listings');
    })
   
  };

  module.exports.login=(req,res)=>{
    res.render("listings/login.ejs")
  }

  module.exports.newlogin=(req,res)=>{
    req.flash("success","Hello Welcome Back!");
    let redirectURL= res.locals.savedURL || "/listings";
    res.redirect(redirectURL);
  }
  module.exports.logout=(req,res)=>{
    req.logout((err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","You have been logged out");
      res.redirect("/listings");
      
    });
  };