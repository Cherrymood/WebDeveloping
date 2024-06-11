import express from "express";
const router = express.Router();

//Routes

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/views/index.ejs");
  });

router.get("/myBlog", (req, res) =>
{
    res.render("index.ejs");
});

router.get("/contact", (req, res) =>
{
    res.render("contact.ejs")
});

router.get("/about", (req, res) =>
{
    res.render("about.ejs");
});

router.get("/ContinueReading", (req, res) =>
{
    res.render("JavaScriptinCS.ejs");
});

router.get("/ContinueWorld", (req, res) =>
{
    res.render("world.ejs");
});

router.get("/ContinueDesign", (req, res) =>
{
    res.render("design.ejs");
});

router.post("/submitPost", (req, res) =>
{
    console.log(app.json(req.body));
});