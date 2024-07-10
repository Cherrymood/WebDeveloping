import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "qiwinewpass",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let items = [];

async function GetItems()
{
    let result = await db.query("SELECT * FROM items");
  
    return result.rows;
};

app.get("/", async (req, res) => {

  items = await GetItems();

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  await db.query("INSERT INTO items(title) VALUES ($1)",
  [item]);

  res.redirect("/");
});

app.post("/edit", async(req, res) => {

  let idEdit = req.body.updatedItemId;
  let update = req.body.updatedItemTitle;

  try{
    await db.query("UPDATE items SET title = $1 WHERE id = $2",
    [update, idEdit]);
  }
  catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/delete", async(req, res) => {

  let deleteId = req.body.deleteItemId;

  try{
    await db.query("DELETE FROM items WHERE id = $1",
    [deleteId]);
  }
  catch(err)
  {
    console.log(err);
  }
  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
