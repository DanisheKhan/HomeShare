const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;

    // Provide context-specific messages based on the requested URL
    let message = "You must be signed in first!";
    if (req.originalUrl === "/listings/new") {
      message = "Please login first to host your home!";
    } else if (req.originalUrl.includes("/edit")) {
      message = "Please login first to edit your listing!";
    } else if (req.originalUrl.includes("/reviews")) {
      message = "Please login first to leave a review!";
    }

    req.flash("error", message);
    return res.redirect("/login");
  }
  next();
};

// Middleware to save redirect url
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Middleware to check if user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// joi validation for listing
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// joi validation for review
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to delete this r eview");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
