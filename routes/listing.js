const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }); // Save uploaded files to /uploads
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controller/listing.js");

router.route("/")
.get( wrapAsync(listingController.index))
.post( isLoggedIn,  upload.single('image'), validateListing, wrapAsync(listingController.createListing));

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm );


router.get("/category/:category", listingController.CategoryListing); 

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(listingController.updateListing))
.delete( isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));





//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( listingController.renderEditForm));



module.exports = router;

