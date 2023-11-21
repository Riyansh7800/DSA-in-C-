const Listing = require("../models/listing");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const AccesToken=process.env.MAP_API;

const baseClient = mbxGeoCoding({ accessToken: AccesToken });

module.exports.indexRoute=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }

  module.exports.showlistings=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews" ,populate : { path: "author"}}).populate("Owner");
    res.render("listings/show.ejs", { listing });
  }

  module.exports.createListing=async (req, res) => {
    let coordinates= await baseClient.forwardGeocode({
      query : req.body.listing.location,
      limit:1
    }).send();
    const newListing = new Listing(req.body.listing);
    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url,"      ",filename);
   
    newListing.Owner=req.user._id;
    newListing.image={url,filename}; 
    newListing.geometry= coordinates.body.features[0].geometry;
    await newListing.save();
    req.flash("success","Successfully created");
    res.redirect("/listings");
  };

  module.exports.editListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    let originalURL=listing.image.url;
    originalURL=originalURL.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing ,  originalURL});
  };

  module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !=="undefined") {
      let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};

    await listing.save();
    }
    res.redirect(`/listings/${id}`);
  }
  module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  };