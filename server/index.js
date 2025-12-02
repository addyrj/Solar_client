


const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const express = require('express');
const db = require("./DB/config.js");
const bodyParser = require('body-parser');
var useragent = require('express-useragent');


////      raw json Request

const app = express();

app.use(cors());
app.use(express.json());
app.use(useragent.express());


////      Form Data Request

app.use(bodyParser.urlencoded({ extended: true }));

////  port

const port = process.env.PORT || 5000;

//// Api routes

const router = require("./Resources/Router/Routes.js");
app.use(process.env.ROOT_ROUTES, router);

/////  server listining

app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});
