const isEmpty = require("lodash.isempty");
const CryptoJS = require("crypto-js");
const db = require("../../DB/config");
const jwt = require("jsonwebtoken");
// const request = require("request");
// const axios = require("axios")
// const fetch = require("node-fetch");

const Login = db.bFootLogin;

const loginAdmin = async (req, res, next) => {
  try {
    const { userId, pass } = req.body;
    if (isEmpty(userId)) {
      return res.status(300).json({
        status: 300,
        message: "Failed! User id is empty",
      });
    } else if (isEmpty(pass)) {
      return res.status(300).json({
        status: 300,
        message: "Failed! Password is empty",
      });
    } else {
      const checkAdmin = await Login.findOne({ where: { username: userId } });
      if (checkAdmin) {
        let bytes = CryptoJS.AES.decrypt(
          checkAdmin.password,
          process.env.SECRET_KEY_ADMIN_PASSWORD
        );
        let originalPassowrd = bytes.toString(CryptoJS.enc.Utf8);
        if (originalPassowrd === pass) {
          let authToken = jwt.sign(
            {
              userId: userId,
              role: checkAdmin.role,
            },
            process.env.SECRET_KEY_ADMIN_AUTH_TOKEN,
            {
              expiresIn: process.env.ADMIN_JWT_EXPIRES_IN,
            }
          );

          return res.status(200).json({
            status: 200,
            message: "Admin Login successfull",
            token: authToken,
          });
        } else {
          return res.status(300).json({
            status: 300,
            message: "Failed! Username and password does not matched",
          });
        }
      } else {
        return res.status(400).json({
          status: 400,
          message: "Failed! Please enter valid credential",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: true,
      message: error.message || error,
    });
  }
  next();
};

const adminProfile = async (req, res, next) => {
  try {
    const admin = req.admin;
    if (admin) {
      return res.status(200).json({
        status: 200,
        message: "Admin profile fetch successfull",
        info: admin,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Failed! Admin not exist",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: true,
      message: error.message || error,
    });
  }
};

const rememberMe = async (req, res, next) => {
  try {
    const admin = req.admin;
    if (admin) {
      const username = admin?.username;
      const password = admin?.password;

      let bytes = CryptoJS.AES.decrypt(
        password,
        process.env.SECRET_KEY_ADMIN_PASSWORD
      );
      let originalPassowrd = bytes.toString(CryptoJS.enc.Utf8);

      return res.status(200).json({
        status: 200,
        message: "Admin profile fetch successfull",
        info: {
          username: username,
          password: originalPassowrd,
        },
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Failed! Admin not exist",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: true,
      message: error.message || error,
    });
  }
};

const checkApi = async (req, res, next) => {
  try {
    const response = await fetch(
      "https://rest.entitysport.com/exchange/matches?token=76317c7e5add2606bd4efaea229c91a2"
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: true,
      message: error.message || error,
    });
  }
};

module.exports = { loginAdmin, adminProfile, rememberMe, checkApi };
