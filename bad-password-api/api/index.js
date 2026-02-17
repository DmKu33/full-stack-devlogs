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

// allow access to all 
import cors from 'cors';
app.use(cors());

// add a separate file for routes
import router from './routes.js';
app.use('/', router);

// start server
app.listen(port, () => console.log(`Your app is listening at: http://localhost:${port}.`));

// export app for vercel
export default app;