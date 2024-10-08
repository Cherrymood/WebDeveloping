import express from "express";
import fileupload from "express-fileupload";
import fs from 'fs';
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import pkg from 'passport-local';
import env from "dotenv";
import GoogleStrategy from "passport-google-oauth2";


const app = express();
const port = 3000;
env.config();


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, //time while cookie is saved
        },
}));

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE_2,
    password: process.env.PG_DB_PASSWORD,
    port: 5432,
  });
  
db.connect();
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./public"));
app.use(express.static('./uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileupload());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.posts = posts;
    next();
});
app.set('view engine', 'ejs');

let imagename = "";
let yourkey = process.env.NEW_YOURK_TIMES_KEY;

let dataExp = fs.readFileSync('./modules/data.json', 'utf8');
let data = JSON.parse(dataExp);
let posts = data.blogs || [];
const LocalStrategy = pkg.Strategy;

//--------API--------------//

//api archive nytimes
app.get('/nytimes', async(req, res) => 
{ 
    res.render("../views/pages/nytimes.ejs");
});
//weather api
app.get('/weather', async(req, res) => 
{ 
    try {
        const result = await axios.get("http://api.openweathermap.org/geo/1.0/zip?zip=98059,US&appid=6a6e3894f2949202a2a0daacdf7f9832");

        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${result.data.lat}&lon=${result.data.lon}&appid=6a6e3894f2949202a2a0daacdf7f9832&units=metric`);

        res.render("../views/pages/weather.ejs", {
            icon: `https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`,
            temperature: weather.data.main.temp,
            weatherDescription: weather.data.weather[0].main,
            windSpeed: weather.data.wind.speed,
            humidity: weather.data.main.humidity,
        });
    }
    catch (error) {
        console.log(error.response.data);
        res.status(500);
    }
});
//joke api
app.get('/joke', async (req, res) => {

    try {
        const result = await axios.get("https://v2.jokeapi.dev/joke/Programming?blacklistFlags=religious,political,racist,sexist");

        res.render("../views/pages/joke.ejs", {

          setup: result.data.setup,

          delivery: result.data.delivery,

        });
      } catch (error) {
        console.log(error.response.data);
        res.status(500);
      }
});

//--------Leetcode--------------//

app.get('/stat', async (req, res) => {

    try {
        const result = await db.query(
            "SELECT * FROM leetcode_stat " +
            "ORDER BY leetcode_stat.ranking;"
        );

        if (!result.rows || result.rows.length === 0) {
            return res.render('../views/pages/stat', { users: {}});
        }

        res.render('../views/pages/stat', { users: result.rows });

    } catch (error) {
        console.error('Error fetching LeetCode statistics:', error);
        res.status(500).send('An error occurred while fetching LeetCode statistics.');
    }
});

app.post('/add_name', async (req, res) => {
    
    if(!req.body.userName)
    {
        res.redirect('/stat');
    }

    const user = req.body.userName;

    try {
        // Fetch data from external API
        const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${user}`);

        if (response.data.status !== 'error') {
            // Insert the user into leetcode_stat if not already exists
            await db.query(
                "INSERT INTO leetcode_stat (name, total_solved, total_medium, total_hard, acceptance_rate, ranking) " +
                "VALUES ($1, $2, $3, $4, $5, $6) " +
                "ON CONFLICT (name) DO UPDATE " +
                "SET total_solved = EXCLUDED.total_solved, " +
                "    total_medium = EXCLUDED.total_medium, " +
                "    total_hard = EXCLUDED.total_hard, " +
                "    acceptance_rate = EXCLUDED.acceptance_rate, " +
                "    ranking = EXCLUDED.ranking;",
                [user, response.data.totalSolved, response.data.mediumSolved, response.data.hardSolved, response.data.acceptanceRate, response.data.ranking]
            );
        } else {
            return res.status(400).send('Error fetching user data from the external API.');
        }

        res.redirect('/stat');
    } catch (error) {
        console.error('Error updating LeetCode statistics:', error);
        res.status(500).send('An error occurred while updating LeetCode statistics.');
    }
});

app.post('/edit', async (req, res) => {

    const edit_name = req.body.update_user;
    const name = req.body.updatedItem;

    const ans = await db.query("SELECT id FROM leetcode_stat WHERE name = $1;", [edit_name])

    await db.query(`UPDATE leetcode_stat SET name = $1 WHERE id = $2;`, [name, ans.rows[0].id]);

    res.redirect('/stat');

});

app.post('/deleteUser', async(req, res) => {

    const name = req.body.deleteUser;
    
    await db.query("DELETE FROM leetcode_stat WHERE name = $1;",
    [name]);

    res.redirect('/stat');
});
//-----------------------------//

app.get('/', (req, res) => {
    res.render('pages/home', { isAuthenticated: req.isAuthenticated()});
});

app.get('/search_post', (req, res) => {

    res.render('pages/search_post', { isAuthenticated: req.isAuthenticated()});
});

app.get('/error', (req, res) => 
{
    res.render('../views/pages/error');
});

app.get('/login', (req, res) => {

    res.render('pages/login', { isAuthenticated: req.isAuthenticated()});
});

app.get('/logout', (req, res) => 
{
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
      });
});

app.get('/register', (req, res) =>
{
    res.render('../views/pages/register');
});

app.get('/post/:date', (req, res) => {

    const newData = fs.readFileSync('./modules/data.json', 'utf8');
    const jsonData = JSON.parse(newData);

    const postDate = req.params.date;
    
    // Find the blog post by date
    const post = jsonData.blogs.find(p => p.date == postDate);

    if (!post) {
        res.status(404).send('Post not found');
        return;
    }
    res.render('../views/pages/post', { post: post, isAuthenticated: req.isAuthenticated() });
});

app.get('/editor', (req, res) =>
{
    if(req.isAuthenticated())
    {
        res.render('../views/pages/editor');
    }
    else {
        res.redirect('/login'); // Redirect to login page if not authenticated
    }
});

app.post('/get-articles', async (req, res) => { 

    const date = req.body.date;
    const year_month = date.split('-');

    try {
        const response = await axios.get(`https://api.nytimes.com/svc/archive/v1/${year_month[0]}/${Number(year_month[1])}.json?api-key=${yourkey}`);
        // console.log(response.data.response.docs);

        res.render("../views/pages/nytimes_titles.ejs", {
            response: response.data.response.docs,
        });
    } catch (error) {
        console.log(error.response.data);
        res.status(500).send('An error occurred while fetching articles.');
    }
});

//upload img 
app.post('/upload', (req, res) => {
    let file = req.files.image;
    let date = new Date();
    //image name
    imagename = date.getDate() + date.getTime() + file.name;
    //image upload path
    let imagepath = 'public/uploads/'+ imagename;

    //create upload
    file.mv(imagepath, (err, result) => {
        if(err)
        {
            res.redirect('../views/pages/error');
        }
        else
        {
            // our image upload path
            res.json(`uploads/${imagename}`);
        }
    });
})
//publish post to json
app.post('/publish', (req, res) => {
    
    let date = new Date();

    let newBlog = {
        title: req.body.title,
        article: req.body.article,
        date: date.getTime(), // Using getTime() to get timestamp in milliseconds
        image: imagename,
        comments: [],
    };

    // Check if data exists or initialize it
    if (!data) {
        console.log('No data available');
        data = {
            blogs: []
        };
    }

    // Check if blogs array exists or initialize it
    if (!data.blogs) {
        console.log('No blogs are available');
        data.blogs = [];
    }

    // Push new blog into data.blogs array
    data.blogs.push(newBlog);

    // Convert data to JSON string
    let dataToFile = JSON.stringify(data);

    // Write data to data.json file
    fs.writeFile('./modules/data.json', dataToFile, function(err) {
        if (err) {
            console.error('Error writing to data.json:', err);
            res.redirect('../views/pages/error');
        } else {
            console.log('New blog added successfully');
  
            imagename = "";
            
            posts.push(newBlog);
      
            res.redirect('/');
        }
    });
});

app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

app.get("/auth/google/editor",
    passport.authenticate("google", {
    successRedirect: '/editor',
    failureRedirect: '/login',
    failureFlash: true // If using connect-flash for flash messages
    })
)

app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/editor',
      failureRedirect: '/login',
    })
  );

app.post('/register', (req, res) => {

    const { name, email, password } = req.body;
    const saltRounds = 10;

    try {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.redirect("/error");
            }

            try {
                const result = await db.query(
                    `INSERT INTO registration (name, email, password)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (email) 
                    DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password 
                    RETURNING *`,
                    [name, email, hash]
                );

                const user = result.rows[0];
                
                req.logIn(user, (err) => {
                    console.log(err);
                    res.redirect("/");
                })

                res.redirect("/login");

            } catch (dbError) {
                console.error('Error during registration:', dbError);
                res.redirect("/error");
            }
        });
    } catch (error) {
        console.error('Unexpected error during registration:', error);
        res.redirect("/error");
    }
});

app.post('/search', (req, res) => {

    let search = req.body.search.toLowerCase();

    posts.forEach((post) => {

        if (post.title.toLowerCase() === search) {

            res.render('../views/pages/post', { post: post, isAuthenticated });
        }
    });
        res.send('No posts found with that title.');
});

app.post('/comment/:date', (req, res) => {

    if (!isAuthenticated) {
        return res.redirect('/login');
    }

    // Read the current data from the file
    const newData = fs.readFileSync('./modules/data.json', 'utf8');
    const jsonData = JSON.parse(newData);
    jsonData.blogs = jsonData.blogs.map(blog => {
        blog.comments = blog.comments || [];
        return blog;
    });

    const postDate = req.params.date;

    const comment = req.body.comment;

    if (!comment) {
        return res.status(400).send('No comment provided');
    }
    // Find the blog post by date
    const blogIndex = jsonData.blogs.findIndex(p => p.date == postDate);

    if (blogIndex !== -1) {
        
        jsonData.blogs[blogIndex].comments.push(comment);
        posts.comments = posts.comments || [];
        posts.comments.push(comment);
        console.log(posts);

        // Write the updated data back to the file
        try {
            fs.writeFileSync('./modules/data.json', JSON.stringify(jsonData, null, 2), 'utf8');
            console.log('File successfully updated.');
        } catch (err) {
            console.error('Error writing the file:', err);
        }

        res.redirect(`/post/${postDate}`);

    } else {
        console.error('Blog post not found');
        return res.status(404).send('Blog post not found');
    }
});

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/editor",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async (accessToken, refreshToken, profile, cb) => {
  
    try {
        const email = profile.email;
        const name = profile.displayName;

        const result = await db.query("SELECT * FROM registration WHERE email=$1", [email]);

        if (result.rows.length === 0) {
            const newUser = await db.query("INSERT INTO registration (name, email, password) VALUES ($1, $2, $3)", 
            [name, email, "google"]);
            
            cb(null, newUser.rows[0]);

        } else {
            cb(null, result.rows[0]);
        }
    } catch (err) {
        cb(err);
    }
}));

passport.use(
    "local",
    new LocalStrategy(

      async (email, password, done) => {
        try {
          // Fetch user with the given email from the database
          const result = await db.query("SELECT * FROM registration WHERE email = $1", [email]);
          if (result.rows.length === 0) {
            // Email doesn't exist
            return done(null, false, { message: "Incorrect email." });
          }
  
          const user = result.rows[0];
          // Compare the password using bcrypt
          const match = await bcrypt.compare(password, user.password);
  
          if (match) {
            // If the passwords match, return the user
            return done(null, user);
          } else {
            // Incorrect password
            return done(null, false, { message: "Incorrect password." });
          }
        } catch (err) {
          // Handle any errors
          return done(err);
        }
      }
    )
  );  
  
passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
})

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});