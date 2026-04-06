require("dotenv").config();

module.exports = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    DIALECT: process.env.DB_DIALECT,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};



// require("dotenv").config();

// module.exports = {
//     HOST: process.env.HOST || "127.0.0.1",
//     USER: process.env.DB_USER || "root",
//     PASSWORD: process.env.PASSWORD || "",
//     DB: process.env.DATABASE_NAME,
//     DIALECT: process.env.DIALECT || "mysql",

//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// };


