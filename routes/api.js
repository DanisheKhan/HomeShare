const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");

// Get all unique locations and countries for search suggestions
router.get(
  "/locations",
  wrapAsync(async (req, res) => {
    // Aggregate all unique locations
    const locations = await Listing.distinct("location");
    const countries = await Listing.distinct("country");

    // Combine and deduplicate
    const allLocations = [...new Set([...locations, ...countries])];

    res.json({ locations: allLocations });
  })
);

module.exports = router;
