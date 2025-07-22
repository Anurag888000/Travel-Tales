const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

// ************
// INDEX ROUTE
// CREATE ROUTE
// ************
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

// **********
// NEW ROUTE
// **********
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// *****************************************
// ✅ ADD THIS SEARCH ROUTE HERE
// *****************************************
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const { query } = req.query;
    try {
      const allListing = await Listing.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { country: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      });
      res.render("listings/index.ejs", { allListing });
    } catch (e) {
      req.flash("error", "Cannot find listings for that search.");
      res.redirect("/listings");
    }
  })
);

// *****************************************

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
