const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { isAuthenticated } = require("../auth/auth");
const User = require("../models/user");
const passport = require('passport');


router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      const user = new User({
        email,  
        password
      });
      
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!user) {
      // This will send the error message from the LocalStrategy
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      return res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

router.get('/logout', async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.logout((err) => {
                if (err) reject(err);
                resolve();
            });
        });
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
    }
});

router.get("/products", isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new product basic
router.post("/products", async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a product
router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a product
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
