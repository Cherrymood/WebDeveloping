require('dotenv').config();
import express from "express";
import { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import bodyParser from "body-parser";
import expressEjsLayouts from "express-ejs-layouts";

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express();
const port = 3000 || process.env.port;

app.use(express.static('public'));

app.use(expressEjsLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
