const Listing = require("../Models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res, next) => {
  try {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  } catch (err) {
    next(err); // Added error handling
  }
};

module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err); // Added error handling
  }
};

module.exports.createListing = async (req, res, next) => {
  try {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();
    // Check if file upload exists
    if (!req.file) {
      throw new ExpressError("Image upload failed", 400);
    }
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // Check if geometry exists in the response
    if (!response.body.features.length) {
      throw new ExpressError("Location not found", 400);
    }
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!!");
    res.redirect("/listings");
  } catch (err) {
    next(err); // Passes the error to the error handling middleware
  }
};

module.exports.renderEditForm = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!!");
      res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace(
      "/upload",
      "/upload/h_300,w_250/"
    );
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (err) {
    next(err); // Added error handling
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;
    // Find the listing and update its fields
    let listing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true }
    );
    // Check if the location has been updated
    if (req.body.listing.location) {
      let response = await geocodingClient
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();
      // Update the geometry field with new coordinates
      listing.geometry = response.body.features[0].geometry;
    }
    // Check if a new image has been uploaded
    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }
    // Save the updated listing
    await listing.save();
    // Flash message and redirect
    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not update the listing.");
    res.redirect(`/listings/${id}`);
  }
};

module.exports.destoryListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!!");
  res.redirect("/listings");
};
