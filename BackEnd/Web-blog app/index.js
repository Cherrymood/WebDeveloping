import express from "express";
import { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import bodyParser from "body-parser";

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express();
const port = 3000;

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let post = [];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/views/index.ejs");
  });

app.get("/myBlog", (req, res) =>
{
    res.render("index.ejs");
});

app.get("/contact", (req, res) =>
{
    res.render("contact.ejs")
});

app.get("/about", (req, res) =>
{
    res.render("about.ejs");
});

app.get("/ContinueReading", (req, res) =>
{
    res.render("JavaScriptinCS.ejs");
});

app.get("/ContinueWorld", (req, res) =>
{
    res.render("world.ejs");
});

app.get("/ContinueDesign", (req, res) =>
{
    res.render("design.ejs");
});

app.post("/submitPost", (req, res) =>
{
    console.log(app.json(req.body));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
