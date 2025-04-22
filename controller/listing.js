const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res) => {
    const allListings= await Listing.find({});
         res.render("listings/index.ejs", { allListings });
  };

module.exports.renderNewForm = (req,res) =>{
  
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) =>{
    let {id}= req.params;
    const listing= await Listing.findById(id)
    .populate({path:"reviews", 
      populate:{ path:"author",},
    })
    .populate("owner");
    if (!listing) {
      req.flash("error","Listing you requested for does not existed!");
      // throw new ExpressError(404, "Listing not found");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {

// app.post("/listings",validateListing,wrapAsync(async(req,res,next) =>{
//     // for gettieng one by on// let{title, description, image, price, country, location}= req.body;
//     // let listing = req.body.listing;
//     // console.log("req.body:", req.body);
//     // console.log("Form Data:", req.body);
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
    
// })
// );
let response = await geocodingClient
.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    if (req.file) {
      listing.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
    }
    listing.geometry = response.body.features[0].geometry;
    let savedListing = await listing.save();

    console.log(savedListing);
    req.flash("success","New listing Created!");
    res.redirect('/listings');
  };

module.exports.renderEditForm = async(req,res) =>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    if (!listing) {
      req.flash("error","Listing you requested for does not existed!");
      res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
// app.put("/listings/:id",upload.single('image'),validateListing, wrapAsync(async(req,res) =>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
  
//     if (!req.body.listing.image || !req.body.listing.image.url || req.body.listing.image.url.trim() === "") {
//         req.body.listing.image = listing.image;
//     }

//     await Listing.findByIdAndUpdate(id, req.body.listing);
//     res.redirect(`/listings/${id}`);
// }));
    let { id } = req.params;
    let  listing =  await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    if (req.file) {
      listing.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
    }
   
    await listing.save();
    req.flash("success","Listing Updated !");
    res.redirect(`/listings/${listing._id}`);
  };

module.exports.deleteListing = async(req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted !");
    res.redirect("/listings");
};
