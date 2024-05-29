if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// DATA KIS TRH PARSE HO RAH HAI
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const dbUrl = process.env.ATLASTDB_URL;
main()
  .then(() => {
    console.log("Connected To DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res,next) => {
  res.redirect("/listings");
  next();
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware ko access krne ke liye
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// JAHA PAR LISTINGS AAYE VAHA LISTING USE KRO
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// app.get("/testlisting",async (req,res)=>{
//  let samplelisting = new Listing({
//     title:"My New Vila",
//     description:"By the Beach",
//     price:1200,
//     location:"Ramgrah,Goa",
//     country:"India"
//  })
//  await samplelisting.save();
//  console.log("Sample is save");
//  res.send("Successful testing")
// })

//*************
// CUSTOM ERROR
// ************
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page NO Found!!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something WENT wrong!!" } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
  console.log(err);
  //   res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server listening to port 8080");
});
