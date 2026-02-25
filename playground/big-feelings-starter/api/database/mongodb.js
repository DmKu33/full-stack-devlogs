/**
 *  mongodb.js - A simple database connection script and interface for MongoDb (customized for Big Feelings)
 *  MIT Owen Mundy 2025
 */

//////////////////////////////////////
///////////// SETTINGS ///////////////
//////////////////////////////////////

// Mongo Atlas is structured like: cluster > database > collection
const databaseName = "bigFeelings";
const collectionName = "feelings"; // in a relational db a collection == table

// relative path to root - leave empty for production | "../../" to run file directly
let basePath = "";


//////////////////////////////////////
//////////// ENVIRONMENT /////////////
//////////////////////////////////////

// import dotenv utility to load saved password strings
import dotenv from 'dotenv'
try {
    dotenv.config({ path: basePath + '.env' })
    // confirm the .env file contains the MONGODB_URI variable
    if (!process.env.MONGODB_URI)
        throw new Error('MONGODB_URI environment variable is missing!');
} catch (err) {
    throw new Error("Problem getting .env file: ", err)
}
// save your MongoDB connection string
const uri = process.env.MONGODB_URI;


//////////////////////////////////////
////////////// CONNECT ///////////////
//////////////////////////////////////

// import mongo driver
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

// module-scoped variables
let clientPromise, database, collection;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Create remote connection to database server
async function connectToDatabase() {
    try {
        // create MongoDB client, and scoped promise
        clientPromise = await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB!");
        // save database reference
        database = await client.db(databaseName);
        // save collection reference (effectively the table)
        collection = await database.collection(collectionName);
    } catch (err) {
        // an exception should change the flow of control of the application, because something is wrong
        // this error should be addressed before continuing
        throw new Error("Problem connecting to database:", err);
    }
}
await connectToDatabase();




//////////////////////////////////////
/////////// PUBLIC FUNCTIONS /////////
//////////////////////////////////////

let db;
try {
    db = {
        pingDatabase: async () => client.db("admin").command({ ping: 1 }),
        // getDatabaseStats: async () => await database.command({ dbStats: 1 }),
        getDatabaseStats: async () => await database.stats(),
        getIndexes: getIndexes,
        getMaxId: async () => {
            let result = await database.collection(collectionName).find().sort({ _id: -1 }).limit(1).toArray();
            if (result.length == 0) return 0;
            return result[0]._id;
        },
        getOne: getOne,
        getAll: getAll,
        addOne: addOne,
        dberror: async () => new Error('A test error thrown in mongodb.js'),
        // TESTS
        deleteAll: deleteAll,
        deletePastRows: deletePastRows,
        deleteById: deleteById,
        findById: findById,
        addOneTest: addOneTest,
        addManyTest: addManyTest,
        collection: async () => collection
    };
} catch (err) {
    // this error should be addressed before continuing
    throw new Error("Problem creating db:", err);
}
export default db;

//////////////////////////////////////
//////////// DB FUNCTIONS ////////////
//////////////////////////////////////

// db > get list of indexes
async function getIndexes() {
    let result = [];
    try {
        const query = {};
        // https://www.mongodb.com/docs/drivers/node/current/indexes/#list-indexes
        result = await database.collection(collectionName).listIndexes().toArray();
        // console.log(result)
    } catch (err) {
        result = [{ message: "Problem with getIndexes(): " + err }];
        console.error(result);
    }
    return result;
}

// Find by id
async function findById(id) {
    let result = [];
    try {
        // required for seaching using mongodb created id
        // if (!ObjectId.isValid(id)) throw new Error("id is not valid");
        // const _id = new ObjectId(id.trim());
        
        // now using integer
        const query = { _id: Number(id) };
        result = await collection.find(query).toArray();
        console.log(result);
    } catch (err) {
        result = [{ message: "Problem with findById(): " + err }];
        console.error(result);
    }
    return result;
}

// db > get one data (via API)
async function getOne() {
    let result = [];
    try {
        // const query = { feeling: "WTF?" };
        const query = {};
        result = await collection.find(query).limit(1).toArray();
        // console.log(result)
    } catch (err) {
        result = [{ message: "Problem with getOne(): " + err }];
        console.error(result);
    }
    return result;
}
// db > get all data (via API)
async function getAll() {
    let result = [];
    try {
        result = await collection.find({}).toArray();
        // console.log(result)
    } catch (err) {
        result = [{ message: "Problem with getAll(): " + err }];
        console.error(result);
    }
    return result;
}
// db > add data from form (via API)
async function addOne(doc) {
    try {
        let docs = []
        docs.push(doc)
        console.log("✅ addOne() - SUCCESS");
        // Insert the documents into the specified collection        
        return await insertDocuments(docs);
    } catch (err) { console.error("Problem with addOne()", err) }
}
// db > add data
async function insertDocuments(docs) {
    // console.log(docs);
    try {
        // insertMany surely has some bugs - impossible to avoid "MongoBulkWriteError: E11000 duplicate key error collection"
        // // If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver
        // // https://mongodb.github.io/node-mongodb-native/7.0/classes/Collection.html#insertMany
        // // Insert ID (testing) 
        // // for (let i = 0; i < docs.length; i++) {
        // //     if (!docs._id) {
        // //         docs[i]._id = randomStrTotal();
        // //         console.log("XXX added id " + docs[i]._id);
        // //     }
        // // }
        // // true = prevents additional documents from being inserted if one fails
        // const options = { ordered: false };
        // // Insert the documents into the specified collection      
        // // https://www.mongodb.com/docs/drivers/node/current/crud/insert/#insert-multiple-documents  
        // const result = await database.collection(collectionName).insertMany(docs, options);

        // this is kind of a hack - replacing mongodb's built in index with integer, but it works!
        let maxId = await db.getMaxId();
        console.log(maxId)
        let results = [];
        for (let i = 0; i < docs.length; i++) {
            // docs[i]._id = randomStrTotal();
            docs[i]._id = i + maxId + 1;
            // https://www.mongodb.com/docs/drivers/node/current/crud/insert/#insert-a-single-document
            let result = await database.collection(collectionName).insertOne(docs[i]);
            // console.log(`A document was inserted: _id=${result.insertedId}`);
            results.push(result);
        }
        return `${results.length} documents inserted`;
    } catch (err) {
        throw new Error("Problem with insertDocuments()" + err)
    }
}


//////////////////////////////////////
////////////// TESTING ///////////////
//////////////////////////////////////

// db > add random data 
async function addOneTest() {
    try {
        let docs = [];
        docs.push(creatTestDocument());
        let result = await insertDocuments(docs);
        console.log("✅ addOneTest() - SUCCESS");
        return result;
    } catch (err) { console.error("Problem with addOneTest()", err) }
}

// db > add multiple random data 
async function addManyTest(count = 1) {
    try {
        let docs = [];
        // Create new documents   
        for (let i = 0; i < count; i++) {
            docs.push(await creatTestDocument());
        }
        let result = await insertDocuments(docs);
        console.log("✅ addManyTest() - SUCCESS");
        return result;
    } catch (err) {
        let msg = "Problem with addManyTest(): " + err;
        console.error(msg);
        return msg;
    }
}

// Deletes all data in the table
async function deleteAll() {
    let msg = `✅ Table is empty`;
    try {
        database.collection(collectionName).deleteMany({ test: true })
        console.log(msg);
    } catch (err) {
        msg = "Problem with deleteAll(): " + err;
        console.error(msg);
    }
    return msg;
}
// Delete N rows
async function deletePastRows(limit = 1) {
    let msg = `✅ ${limit} have been deleted`;
    try {
        database.collection(collectionName).find({}).limit(limit).forEach(function (doc) {
            database.collection(collectionName).deleteOne({ _id: doc._id, test: true });
        })
        console.log(msg);
    } catch (err) {
        msg = "Problem with deletePastRows(): " + err;
        console.error(msg);
    }
    return msg;
}
// Delete by id
async function deleteById(id) {
    let msg = `✅ ${id} has been deleted`;
    try {
        // if (!ObjectId.isValid(id)) throw new Error("id is not valid");
        // const _id = new ObjectId(id.trim());
        database.collection(collectionName).deleteOne({ "_id": Number(id), test: true });
        console.log(msg);
    } catch (err) {
        msg = "Problem with deleteById(): " + err;
        console.error(msg);
    }
    return msg;
}



//////////////////////////////////////
/////////////// HELPERS //////////////
//////////////////////////////////////

import colors from "../data/colors.js";
import testGeo from "../data/test-geo.js";

// just for reference
const example = {
    "feeling": "Totz Bored",
    "color": "#FF2E24",
    "lat": 32.0676,
    "lng": 34.7763,
    "datetime": new Date(2025, 5, 7),  // May 7, 2025
    "test": true
};

// creates data for a row
function creatTestDocument() {
    let data = colors[Math.floor(Math.random() * colors.length)];
    let testGeo = randomLatLng() || "";
    data.lat = Number(testGeo.latitude || ""); // convert to number
    data.lng = Number(testGeo.longitude || "");
    data.datetime = new Date();
    data.test = true;
    // console.log("creatTestDocument()", data);
    return data;
}
const randomStr = () => Math.random().toString(36).slice(-5);
const randomStrTotal = () => randomStr() + randomStr() + randomStr() + randomStr();
const randomLatLng = () => testGeo[Math.floor(Math.random() * testGeo.length)];

// these numbers are too random
function randomLatLngNumbers() {
    data.lat = randomNumber(-60, 60);
    data.lng = randomNumber(-140, 150);
}

function randomNumber(min, max) {
    min = Number(min);
    max = Number(max);
    return Math.random() * (max - min) + min;
}
