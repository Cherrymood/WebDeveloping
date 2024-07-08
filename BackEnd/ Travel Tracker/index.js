import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "qiwinewpass",
  port: "5432",
})

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {

  let result = await db.query("SELECT * FROM visited_countries")
  console.log(result);
  let countries = [];

  result.rows.forEach((elem) => {
    countries.push(elem.country_code)
  });

  res.render("index.ejs", {countries: countries, total: countries.length});
  db.end();
});

// app.post("/add", async (req, res) => {

//   db.connect();

//   db.query(`INSERT INTO country VALUES ${req.body.country}`, (err, res) => {

//   if(err)
//   {
//     console.log("Error execuring query", err.stack)
//   }
//   else
//   {
//     countries = res.rows;
//   }
//   db.end();
//   })

//   res.redirect("index.ejs", {countries: countries, total: countries.length});

// });


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
