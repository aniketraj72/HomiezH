import Listing from "../models/listing.model.js";
import errorHandler from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) return next(errorHandler(404, "Listing not found!"));

  // console.log("req.params.id : " + req.params.id);
  // console.log("req.user.id: " + req.user.id);
  if (req.user.id !== listing.userRef) {
    // console.log("in if bliock");
    return next(errorHandler(401, "You can delete your own listings!"));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    // console.log("in try block");
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  // console.log("listing: " + listing);
  if (!listing) {
    console.log("listing not found: " + listing);
    return next(errorHandler(404, "Listing not found!"));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, "You can only update your own listings!"));
  }
  // console.log("req params: " + req.params.id);
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    // console.log("in try block");
    res.status(200).json(updatedListing);
  } catch (error) {
    // console.log("error:" + error);
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    console.log("in erro");
    console.log(error);
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";

    // console.log('searchTerm: ' + JSON.stringify(searchTerm))
    // console.log('type: ' + JSON.stringify(type))
    // console.log('parking ' + JSON.stringify(parking))
    // console.log('furnished: ' + JSON.stringify(furnished))

    const order = req.query.order || "desc";

    // console.log('order:' + order)

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({
        [sort]: order,
      })
      .limit(limit)
      .skip(startIndex);

    // console.log("Listings:-")
    // console.log(JSON.stringify(listings))
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
