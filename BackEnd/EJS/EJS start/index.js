import express from "express";

const app = express();
const port = 3000;

const day = new Date().getDay();
console.log(day);

let wDay = "a weekday";
let adviceForDay = "it`s time to work hard";

if(day === 0 || day === 7)
{
    wDay = "a weekend";
    adviceForDay = "let's have rest";
}

app.get("/", (req, res) =>
{
    res.render("index.ejs", 
    {
        dayType: wDay, 
        advice: adviceForDay
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
  