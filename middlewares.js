const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
module.exports.isloggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.savedURL=req.originalUrl;
        req.flash('error',"You must be logged in"   );
        res.redirect("/login")
    }
    next();
}

module.exports.savedURL = (req, res,next) =>{
    if(req.session.savedURL){
        res.locals.savedURL=req.session.savedURL;
    }
    next();

}

module.exports.isOwner= async(req, res, next) =>{
    let {id}= req.params;
    let listing= await Listing.findById(id);
    if(!listing.Owner.equals(res.locals.currUser._id)){
        req.flash('success',"You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);

    }
    next();
}

module.exports.isReviewAuthor= async(req, res, next) =>{
    let {id, reviewid}= req.params;
    let review= await Review.findById(reviewid);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash('success',"You are not the author of this Review");
        return res.redirect(`/listings/${id}`);

    }
    next();
}