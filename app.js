if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
// const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
const dbURL=process.env.MONGO_ATLAS;
const WrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./SchemaVal.js");
const Review = require("./models/reviews.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
// const { Session } = require("inspector");
const flash = require("connect-flash");
const {isloggedin} = require("../wanderlust-main/middlewares.js");
const {savedURL,isOwner,isReviewAuthor} = require("../wanderlust-main/middlewares.js");

const passport = require("passport");
const LocalStrategy=require("passport-local");
const User= require("./models/users.js");

//IMPLEMENTING MVC
const Listingobject=require("./controllers/listings.js");
const ReviewListing=require("./controllers/reviewlistings.js");
const UserListing=require("./controllers/UsersListing.js");
const Router=require("Router");
// IMPLEMENTING MULTER
const {storage}=require("./cloudConfig.js");
const multer  = require('multer')
const upload = multer({ storage })
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/Public")));

app.engine('ejs',ejsMate);
const store=MongoStore.create({
  mongoUrl:dbURL,
  crypto:{
    secret:process.env.SECERTCODE,

  },
  touchAfter: 24*3600,
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION");
});

const sessionOptions={
  store,
  secret:process.env.SECERTCODE,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: new Date() + 7*24*60*60*1000 ,
    maxAge: 7*24*60*60*1000,
    http: true
  }
  
}
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new  LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash('success');
  res.locals.failure=req.flash('failure');
  res.locals.currUser=req.user;
  next();
});




const validatelisting=(req,res,next)=>{
  let {result}=listingSchema.validate(req.body);
  if(result) {
    let errormsg=result.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errormsg);
  }
  else{
    next();
  }
}
const validateReview=(req,res,next)=>{
  let { result }=reviewSchema.validate(req.body);
  console.log(req.body);
  if(result) {
    let errormsg=result.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errormsg);
  }
  else{
    next();
  }
}
//Index Route
app.route('/listings')
.get(Listingobject.indexRoute )
.post(upload.single('listing[image]') ,isloggedin,validatelisting,WrapAsync(Listingobject.createListing));

//New Route
app.get("/listings/new",isloggedin, (req, res) => {
  res.render("listings/new.ejs");
});

app.route("/listings/:id").get( validatelisting ,WrapAsync(Listingobject.showlistings)).put(validatelisting,upload.single('listing[image]') ,isOwner, WrapAsync( Listingobject.updateListing));

//Create Route


//Edit Route
app.get("/listings/:id/edit",isloggedin,isOwner,validatelisting,WrapAsync(Listingobject.editListing));

//Update Route
app.get("/listings/country",(req,res)=>{
  
})

//Delete Route
app.delete("/listings/:id", validatelisting,isOwner, WrapAsync(Listingobject.destroyListing));


app.post("/listings/:id/reviews",validateReview, WrapAsync(ReviewListing.newReview));

app.delete("/listings/:id/reviews/:reviewid",isloggedin,isReviewAuthor,WrapAsync(ReviewListing.deleteReview));

app.route("/signup").get( UserListing.Signuppage ).post(WrapAsync(UserListing.newUser));


app.route("/login").get( UserListing.login).post(savedURL,passport.authenticate("local",{failureRedirect: "/login", failureFlash:true}), UserListing.newlogin);
//LOGOUT LOGIC
app.get("/logout",UserListing.logout);
app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found"));

});
app.use((err,req,res,next)=>{
  let { StatusCode=500, Message } = err;
  // res.status(StatusCode).send(Message);
  res.status(StatusCode).render("error.ejs",{err});
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
