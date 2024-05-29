import express from "express"; 

const app = express();
const port = 3000;

//get is function from express  package "/" - means path in this example-  home page on localhost:3000
app.get("/", (req, res) => {
    console.log(req.rawHeaders);
    res.send("<h1> Hello World </h1>");
});

app.get("/about", (req, res) => { //localhost:300/about
    console.log(req.rawHeaders);
    res.send("<h1> About page </h1>");
});

app.get("/contacts", (req, res) => { //localhost:300/about
    console.log(req.rawHeaders);
    res.send("<h1>Contact page </h1>");
});


app.listen(port, () =>{
    console.log(`Server running on port ${port}.`) // callback function
});