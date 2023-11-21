const Review = require("../models/reviews");
const Listing = require("../models/listing");

module.exports.newReview=async (req, res) => {
  
    let listing = await Listing.findById(req.params.id);
    console.log("Listing found:", listing); // Add this line for debugging
    let review = new Review(req.body.reviews);
    console.log("Listing found:",review );
    review.author= req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    console.log("Listing saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview=async (req,res)=>{
    let {id,reviewid} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull :{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
  
    res.redirect(`/listings/${id}`);
  };