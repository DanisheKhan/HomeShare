const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let query = {};
  let pageTitle = "All Listings";
  let pageDescription =
    "Browse all available accommodations worldwide on HomeShare.";

  // Check if search parameter exists
  if (req.query.search) {
    const searchTerm = req.query.search.trim();

    if (searchTerm) {
      // Create a case-insensitive search for location or country
      const searchPattern = new RegExp(searchTerm, "i");
      query = {
        $or: [
          { location: searchPattern },
          { country: searchPattern },
          { title: searchPattern },
        ],
      };
      pageTitle = `Search results for "${searchTerm}"`;
      pageDescription = `Find the best accommodations matching "${searchTerm}" on HomeShare.`;
    }
  }

  // Handle filter parameter
  const filterMap = {
    beach: { description: { $regex: /beach|ocean|sea|coast/i } },
    mountain: { description: { $regex: /mountain|hill|peak|trek|hiking/i } },
    city: { description: { $regex: /city|urban|downtown|metropolitan/i } },
    countryside: { description: { $regex: /countryside|rural|farm|village/i } },
    tropical: { description: { $regex: /tropical|palm|island|paradise/i } },
    skiing: { description: { $regex: /ski|snow|winter|slope/i } },
    lake: { description: { $regex: /lake|lakefront|lakeside|water/i } },
    historic: {
      description: { $regex: /historic|heritage|ancient|classic|old/i },
    },
  };

  if (req.query.filter && filterMap[req.query.filter]) {
    // If we already have search criteria, combine them with an $and
    if (Object.keys(query).length > 0) {
      query = { $and: [query, filterMap[req.query.filter]] };
    } else {
      query = filterMap[req.query.filter];
    }
  }
  const allListings = await Listing.find(query);

  // If filter is applied, update page title and description
  if (req.query.filter && req.query.filter !== "all") {
    pageTitle = `${
      req.query.filter.charAt(0).toUpperCase() + req.query.filter.slice(1)
    } Accommodations`;
    pageDescription = `Discover amazing ${req.query.filter} accommodations on HomeShare.`;
  }

  res.render("listings/index", {
    allListings,
    searchQuery: req.query.search || "",
    activeFilter: req.query.filter || "all",
    title: pageTitle,
    description: pageDescription,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", {
    title: "Create New Listing",
    description: "List your property on HomeShare and start earning today.",
  });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", {
    listing,
    title: listing.title,
    description: `${listing.title} in ${listing.location}, ${
      listing.country
    }. ${listing.price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })} per night.`,
  });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("upload", "upload/w_250");

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
    title: `Edit ${listing.title}`,
    description: `Update your listing details for ${listing.title} in ${listing.location}.`,
  });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing updated successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
};
