import express from "express";
import fileupload from "express-fileupload";
import fs from 'fs';
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static("./public"));
app.use(express.static('./uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileupload());
app.use((req, res, next) => {
    res.locals.isAuthenticated = isAuthenticated;
    res.locals.posts = posts;
    next();
});
app.set('view engine', 'ejs');

let imagename = "";
let isAuthenticated = false;
let yourkey = 'Zny6MhpNg3lYlhqE3Xv7AMZjuZG1i1nv';

let dataExp = fs.readFileSync('./modules/data.json', 'utf8');
let data = JSON.parse(dataExp);
let users = data.users || [];
let posts = data.blogs || [];

app.get('/', async(req, res) => 
{ 
    res.render("../views/pages/home.ejs");
});
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

app.get('/search_post', (req, res) => {

    res.render('../views/pages/search_post', { isAuthenticated });
});

app.get('/error', (req, res) => 
{
    res.render('../views/pages/error');
});

app.get('/login', (req, res) => 
{
    res.render('../views/pages/login');
});

app.get('/logout', (req, res) => 
{
    isAuthenticated = false;
    res.redirect('/'); 
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
    res.render('../views/pages/post', { post: post, isAuthenticated });
});

app.get('/editor', (req, res) =>
{
    if(isAuthenticated)
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
    console.log(year_month[1]);

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

app.post('/login', (req, res) => {     

    if(!dataExp)
        { 
            console.log('No users regestred');
            res.redirect('/register');
        }
    else {

    isAuthenticated = false;

    const {email, password} = req.body;

    data.users.forEach((user) => {
        
        if(user.email === email && user.password === password)
        {
            isAuthenticated = true;
        }
        });
    }

    if (isAuthenticated) {

        res.redirect('/');

    } else {

        res.status(401).render('pages/error', { message: 'Invalid email or password' });
    }
});

app.post('/register', (req, res) => {
    //read the data from json file
    let dataExp = fs.readFileSync('./modules/data.json', 'utf8');

    if(!dataExp)
    {
        console.log('no data availiable');
        let data = {};
        data.users = [];

        let newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            id: 1
          };

        data.users.push(newUser);

        let dataToFile = JSON.stringify(data);

        fs.writeFile('./modules/data.json', dataToFile, function(err) {
            if (err) {
                res.redirect('../views/pages/error');
              }});

    } else {
      // As we have seen we store a JSON string in the data file. So when we read the file and store the data into the variable dataExp we have JSON string data in that variable.
      //  To process these data in our JavaScript code we must parse this JSON so that a JavaScript object is created from the JSON string.
      //  This is what we do with the JSON.parse() function.
      
      let data = JSON.parse(dataExp);

      if(!data.users) {
        console.log('no users are available')
        data.users = []

        let newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            id: 1
          };

      data.users.push(newUser);

      // With JSON.stringify() we take the JavaScript data object, create a JSON string out of it and store this string into the dataToFile variable.
      //  With fs.writeFile we write the json string into the so far empty data.json file.
      // note: If you use JavaScript to develop applications, JavaScript objects have to be converted into strings if the data is to be stored in a database or a data file.
      //  The same applies if you want to send data to an API or to a webserver. 
      // The JSON.stringify() function does this for us.

      let dataToFile = JSON.stringify(data);

        fs.writeFile('./modules/data.json', dataToFile, function(err) {

            if (err) {

                res.redirect('../views/pages/error');
                
              }});

      } else {
        console.log('users are available');

        var newID = data.users[data.users.length -1].id + 1;

        users.forEach((user) => {

            if(user.email == req.body.email || req.body.password.length < 6)
            {
                res.redirect('../views/pages/error');
            }
            else{

            let newUser = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                id: newID
              };

              data.users.push(newUser);}
        });

      let dataToFile = JSON.stringify(data);

      fs.writeFile('./modules/data.json', dataToFile, function(err) {
        if (err) {
            res.redirect('../views/pages/error');
          }});
      };
  };

isAuthenticated = true;

res.redirect('/'); 
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
    
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});