const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const passport = require("passport");
const session = require("express-session");

dotenv.config();

const app = express();
app.use(express.json());
app.use(session({
    secret: 'Test1234567890',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  }
};

connectDB().then(() => {
  app.use("/v1/api/", routes);
  
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch(error => {
  console.error("Failed to start server:", error);
});


process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});