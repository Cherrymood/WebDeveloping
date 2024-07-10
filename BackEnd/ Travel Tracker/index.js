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
  let countries = [];

  result.rows.forEach((elem) => {
    countries.push(elem.country_code)
  });

  res.render("index.ejs", {countries: countries, total: countries.length});

});

app.post("/add", async (req, res) => {

  let name = req.body.country;
  name.toLower();

  let result = await db.query(
    'SELECT country_code FROM countries WHERE LOWER(country_name) = $1', 
    [name]);

    if(result.rows.length !== 0)
    {
      const data = result.rows[0];
      const countryCode = data.country_code;

      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
      [countryCode,]);
    };

  res.redirect("/");
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
