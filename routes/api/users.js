const express = require("express");
const router = express.Router();

const { validateAuth } = require("../../validation/validation");
const userController = require("../../controllers/users");
const guard = require("../../service/guard");
const { HttpCode } = require("../../service/constants");
const uploadAvatar = require("../../service/upload-avatar");

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    return res.status(HttpCode.TOO_MANY_REQUESTS).json({
      status: "error",
      code: HttpCode.TOO_MANY_REQUESTS,
      message: "Too many Requests",
    });
  },
});

router.post("/signup", validateAuth, userController.signup);
router.post("/login", validateAuth, limiter, userController.login);
router.post("/logout", guard, userController.logout);
router.get("/current", guard, userController.currentUser);
router.get("/verify/:verificationToken", userController.verify);
router.post("/verify", userController.repeatEmailVerify);

router.get("/all", guard, userController.findAllEmails);

module.exports = router;
