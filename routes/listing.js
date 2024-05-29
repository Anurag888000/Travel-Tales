const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
// Multer enctype="multipart/form-data" is data ko use krne le require kiya
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

// router.route ye isliye use common path ek me ho jaye
// ************
// INDEX ROUTE
// CREATE ROUTE
// ************
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    // validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

// **********
// NEW ROUTE
// **********
// Agar iske show route ke niche rakhege to id se collide krega
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// ***********
// SHOW ROUTE
// UPDATE ROUTE
// DELETE ROUTE
// ************
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destoryListing));
// ************
// EDIT ROUTE
// ************
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
