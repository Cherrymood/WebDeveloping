import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const port = 3000;
const app = express();

app.use(express.static("./public"));

// 4. When the user goes to the home page it should render the index.ejs file.
app.get("/", async (req, res) => {
    try {
        const result = await axios.get("https://secrets-api.appbrewery.com/random");
        res.render("index.ejs", {
          secret: result.data.secret,
          user: result.data.username,
        });
      } catch (error) {
        console.log(error.response.data);
        res.status(500);
      }
    });
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });


// 5. Use axios to get a random secret and pass it to index.ejs to display the
// secret and the username of the secret.

// 6. Listen on your predefined port and start the server.
