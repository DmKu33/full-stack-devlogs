//////////////////////////////////////
/////////// DATABASE TEST ////////////
//////////////////////////////////////

// Test a database connection:
// nodemon mongodb-test.js

import db from "./mongodb.js";

async function run() {


    try {
        console.log("\ndb.pingDatabase() => Database is live and connection works!");
        console.log("db.pingDatabase()", await db.pingDatabase());
    } catch (err) {
        console.error("ERROR => db.pingDatabase()", err);
    }


    try {
        console.log("\ndb.getDatabaseStats() => Database stats");
        console.log("db.getDatabaseStats()", await db.getDatabaseStats());
    } catch (err) {
        console.error("ERROR => db.getDatabaseStats()", err);
    }


    try {
        console.log("\ndb.getOne() => Get a single record from database (null = no data yet)");
        console.log("db.getOne()", await db.getOne());
    } catch (err) {
        console.error("ERROR => db.getOne()", err);
    }


    try {
        console.log("\ndb.getAll() => Get all records from database ([] = no data yet)");
        console.log("db.getAll()", await db.getAll());
    } catch (err) {
        console.error("ERROR => db.getAll()", err);
    }


    try {
        console.log("\ndb.addOneTest() => Add a single random TEST record from database");
        console.log("db.addOneTest()", await db.addOneTest());
    } catch (err) {
        console.error("ERROR => db.addOneTest()", err);
    }


    // try {
    //     console.log("\ndb.dberror() => Catch an error thrown from the db connection script");
    //     console.log("db.dberror()", await db.dberror());
    // } catch (err) {
    //     console.error("ERROR => db.dberror()", err);
    // }


}
run();
