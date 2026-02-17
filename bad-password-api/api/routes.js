// route.js - Add endpoints to the API

//////////////////////////////////////
////////////// INIT //////////////////
//////////////////////////////////////

// import express, create router
import express from 'express';
const router = express.Router();

// import data for the API
import { data, functions } from "./data.js";
// console.log("data.pets", data.pets);


//////////////////////////////////////
////////////// ROUTES ////////////////
//////////////////////////////////////

// static route
router.get('/api', (req, res) => {
    res.json({ message: "Hello from the API" });
});

// dynamic route - generates bad passwords
router.get('/api/custom', (req, res) => {
    const password = returnPassword(req.query.params);
    res.json({ message: password });
});

export default router;



function returnPassword(params) {
    let str = "";
    // group 1
    if (params.includes("endearments")) {
        str += randomFromArray(data.endearments);
    }
    if (params.includes("pets")) {
        str += randomFromArray(data.pets);
    }
    if (params.includes("cities")) {
        str += randomFromArray(data.cities);
    }
    // group 2
    if (params.includes("colors")) {
        str += randomFromArray(data.colors);
    }
    if (params.includes("dates")) {
        str += functions.randomYear();
    }
    if (params.includes("patterns")) {
        str += randomFromArray(data.patterns);
    }
    return str;
}

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
