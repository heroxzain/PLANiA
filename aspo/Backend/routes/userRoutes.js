const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser
} = require("../controllers/userController");

// TEST
router.get("/test", (req, res) => {
  res.json({ message: "User route working ✅" });
});

const protect = require("../middleware/authMiddleware");
//register
router.post("/register", registerUser);

//login
router.post("/login", loginUser);

//  PROTECTED ROUTE
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Welcome to profile 👋",
    user: req.user
  });
});

module.exports = router;