const Listing = require("../models/listing");
const Review = require("../models/reviews");


module.exports.createReview = async (req,res) =>{
    let listing= await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    // listing.reviews.push(newReview._id);

    await newReview.save();
    // await listing.save();
    await Listing.findByIdAndUpdate(req.params.id, { $push: { reviews: newReview._id } });
    req.flash("success","New review Created!");

    // console.log("new review saved");
    // res.send("new review saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async(req,res) =>{
    let{ id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");

    res.redirect(`/listings/${id}`);
};