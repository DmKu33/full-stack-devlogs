// routes.js - Add endpoints to the API

//////////////////////////////////////
////////////// INIT //////////////////
//////////////////////////////////////

// import express, create router
import express from 'express';
var router = express.Router();

// 👉 import database reference here (Chapter 10 wiki) ...
import db from "./database/mongodb.js";
// 👈

//////////////////////////////////////
//////////// GET ROUTES //////////////
//////////////////////////////////////

router.get("/api", async (req, res) => {
    res.send({ message: "hello" });
});


// 👉 add endpoint to get all the rows in the database (Chapter 10 wiki) ...
router.get("/api/feelings", async function (req, res) {
    let result = await db.getAll();
    res.json(result);
});
// 👈


// 👉 add endpoint to insert test data (Chapter 10 wiki) ...
router.get("/api/addOneTest", async function (req, res) {
    let result = await db.addOneTest();
    res.send({ message: result });
});
// 👈




//////////////////////////////////////
//////////// POST ROUTES /////////////
//////////////////////////////////////

// endpoint > post a row to the database
router.post("/api/feeling", async function (req, res) {
    let result = [];
    let data = [];
    try {
        // console.log("POST -> /api/feeling", req.body);
        let doc = {
            "feeling": req.body.feeling,
            "color": req.body.color,
            "lat": req.body.lat || "",
            "lng": req.body.lng || "",
            "datetime": new Date()
        }
        result = await db.addOne(doc);
        data = await db.getAll();
    } catch (err) {
        result = { message: err }
    }
    res.json(data);
});


export default router;