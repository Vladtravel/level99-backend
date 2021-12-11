const jwt = require("jsonwebtoken");
const Users = require("../model/userModel");
const EmailService = require("../service/email");
const { HttpCode } = require("../service/constants");
const jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});

const uploadToCloud = promisify(cloudinary.uploader.upload);

const signup = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: "conflict",
        code: HttpCode.CONFLICT,
        message: "Email in use",
      });
    }

    const newUser = await Users.create(req.body);
    const { id, avatarURL, verifyToken, email } = newUser;
    try {
      const emailService = new EmailService(process.env.NODE_ENV);
      await emailService.sendVerifyEmail(verifyToken, email);
    } catch (e) {
      console.log(e.message);
    }

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      user: {
        id,
        email,
        avatarURL,
        verifyToken,
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findByEmail(email);

    const isValidPassword = await user?.validPassword(password);

    if (!user || !isValidPassword || !user.verify) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "Error",
        code: HttpCode.UNAUTHORIZED,
        message: "Email or password is wrong",
      });
    }
    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "4h" });
    await Users.updateToken(id, token);
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      token,
      user: {
        id: user.id,
        email: user.email,
        avatarURL: user.avatarURL,
        verifyToken: user.verifyToken,
      },
    });
  } catch (e) {
    if (e.name === "TypeError") {
      return next({
        status: HttpCode.BAD_REQUEST,
        message: "Bad request",
      });
    }
    next(e);
  }
};

const logout = async (req, res, next) => {
  const id = req.user.id;
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({});
};

const currentUser = async (req, res, next) => {
  const id = req.user.id;
  try {
    const user = await Users.findById(id);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      user: {
        email: user.email,
      },
    });
  } catch (e) {
    next(e);
  }
};

const saveAvatarUserToCloud = async (req) => {
  const pathFile = req.file.path;
  const { public_id: idCloudAvatar, secure_url: avatarUrl } =
    await uploadToCloud(pathFile, {
      public_id: req.user.idCloudAvatar?.replace("Avatars/", ""),
      folder: "Avatars",
      transformation: { width: 250, height: 250, crop: "pad" },
    });
  await fs.unlink(pathFile);
  return { idCloudAvatar, avatarUrl };
};

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerifyTokenEmail(
      req.params.verificationToken
    );
    if (user) {
      await Users.updateVerifyToken(user.id, true, null);
      return res.redirect("https://goitapp.netlify.app/login");
    }

    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "Invalid token. Contact to administration",
    });
  } catch (error) {
    next(error);
  }
};

const repeatEmailVerify = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    if (user) {
      const { verifyToken, email } = user;
      const emailService = new EmailService(process.env.NODE_ENV);
      await emailService.sendVerifyEmail(verifyToken, email);
      return res.status(HttpCode.OK).json({
        status: "success",
        code: HttpCode.OK,
        data: { message: "Verification email resubmitted" },
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "User not found",
    });
  } catch (error) {
    next(error);
  }
};

const findAllEmails = async (req, res, next) => {
  try {
    const data = await Users.findAllEmails();

    if (data) {
      return res.json({
        status: "success",
        code: 200,
        data,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  currentUser,
  verify,
  repeatEmailVerify,
  saveAvatarUserToCloud,
  findAllEmails,
};
