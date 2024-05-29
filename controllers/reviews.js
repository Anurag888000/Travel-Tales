const Listing = require("../Models/listing");
const Review = require("../Models/review");

module.exports.createReview = async (req, res) => {
  console.log(req.params.id);
  let listing = await Listing.findById(req.params.id);
  if (!listing.reviews) {
    listing.reviews = [];
  }
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created!!");
  res.redirect(`/listings/${listing._id}`);
  console.log("Review saved successfully");
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  // listing ke array me delete krna
  //  [Pull] moongose ka function h operator remove from existing array all instance ith matched condition
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findById(reviewId);
  req.flash("success", "Review Deleted!!");
  res.redirect(`/listings/${id}`);
};
