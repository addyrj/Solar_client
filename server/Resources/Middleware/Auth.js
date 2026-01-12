// Middleware/Auth.js
const jwt = require('jsonwebtoken');
const db = require("../../DB/config");
const Admin = db.bFootLogin;

// Middleware/Auth.js
const AdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 401,
        code: "NO_TOKEN",
        message: "Authorization token missing"
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    jwt.verify(token, process.env.SECRET_KEY_ADMIN_AUTH_TOKEN, async (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            status: 401,
            code: "TOKEN_EXPIRED",
            message: "Session expired. Please login again."
          });
        }

        return res.status(401).json({
          status: 401,
          code: "INVALID_TOKEN",
          message: "Invalid authentication token"
        });
      }

      const adminInfo = await Admin.findOne({
        where: { username: decoded.userId }
      });

      if (!adminInfo) {
        return res.status(401).json({
          status: 401,
          code: "USER_NOT_FOUND",
          message: "Admin not found"
        });
      }

      req.admin = adminInfo;
      next();
    });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error"
    });
  }
};


module.exports = { AdminAuth };


// const jwt = require('jsonwebtoken');
// const db = require("../../DB/config");
// const moment = require('moment'); // require

// const Admin = db.bFootLogin;


// const AdminAuth = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization;

//         const verifyToken = jwt.verify(token, process.env.SECRET_KEY_ADMIN_AUTH_TOKEN, ((error, decode) => {
//             if (error) {
//                 return error;
//             }
//             else {
//                 return decode;
//             }
//         }));

//         if (verifyToken.userId !== undefined) {
//             console.log("user id si      ", verifyToken.userId)
//             const adminInfo = await Admin.findOne({ where: { username: verifyToken.userId } });
//             req.token = token;
//             req.admin = adminInfo;
//         }
//         else {
//             return res.status(302).send({
//                 status: 302,
//                 name: verifyToken.name,
//                 message: verifyToken.message
//             });
//         }

//     } catch (error) {
//         res.status(500).send(error);
//     }
//     next();
// }

// module.exports = { AdminAuth }




// ---------------------------------------------------------

// const jwt = require('jsonwebtoken');
// const db = require("../../DB/config");
// const moment = require('moment');

// const Admin = db.bFootLogin;

// const AdminAuth = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({ status: 401, message: "Authorization header missing or malformed" });
//         }

//         const token = authHeader.split(' ')[1];

//         const verifyToken = jwt.verify(token, process.env.SECRET_KEY_ADMIN_AUTH_TOKEN);

//         if (verifyToken?.userId) {
//             console.log("User ID is:", verifyToken.userId);

//             const adminInfo = await Admin.findOne({ where: { username: verifyToken.userId } });

//             if (!adminInfo) {
//                 return res.status(404).json({ status: 404, message: "Admin not found" });
//             }

//             req.token = token;
//             req.admin = adminInfo;

//             next(); 
//         } else {
//             return res.status(401).json({
//                 status: 401,
//                 name: "Unauthorized",
//                 message: "Token decoded but userId is missing"
//             });
//         }

//     } catch (error) {
//         console.error("JWT Verification Error:", error);
//         return res.status(401).json({
//             status: 401,
//             name: error.name || "JsonWebTokenError",
//             message: error.message || "Invalid token"
//         });
//     }
// };

// module.exports = { AdminAuth };







