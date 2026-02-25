//////////////////////////////////////
/////////////// SERVER ///////////////
//////////////////////////////////////

// create express server
import express from "express";
const app = express();
const port = 3000;

// make all files inside /public available using static
import path from "path";
import { URL } from "url";
const __filename = new URL("", import.meta.url).pathname;
const __dirname = new URL(".", import.meta.url).pathname;
app.use(express.static(path.join(__dirname, '../public')));


//////////////////////////////////////
//////////// DATA PARSING ////////////
//////////////////////////////////////

// enable built-in middleware to parse incoming JSON payloads from client requests
app.use(express.json());

// enable parsing of body in request headers
import bodyParser from "body-parser";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true // support hierarchical data
}));


//////////////////////////////////////
///////// LOGGING MIDDLEWARE /////////
//////////////////////////////////////

// call morganBody after registering body-parser, but before registering routers
// https://www.npmjs.com/package/morgan-body
import morganBody from 'morgan-body';
morganBody(app, {
    logAllReqHeader: false, // log all request headers
    logResponseBody: false, // log response body
    maxBodyLength: 100
});

app.use(function (error, req, res, next) {
    // console.log(req)
    next();
});


//////////////////////////////////////
/////////////// CORS /////////////////
//////////////////////////////////////

// allow access to all 
import cors from 'cors';
app.use(cors());


//////////////////////////////////////
/////////////// ROUTES ///////////////
//////////////////////////////////////

// add a separate file for routes
import router from './routes.js';
app.use('/', router);

// start server
app.listen(port, () => console.log(`Your app is listening at: http://localhost:${port}.`));

// export app for vercel
export default app;
