import express from "express";
import fileupload from "express-fileupload";
import fs from 'fs';

const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));

app.use(express.static("./public"));
app.use(express.static('./uploads'));
app.use(express.json());
app.use(fileupload());
app.use((req, res, next) => {
    res.locals.isAuthenticated = isAuthenticated;
    res.locals.posts = posts;
    res.locals.search_post = search_post;
    next();
});
app.set('view engine', 'ejs');

let imagename = "";

let isAuthenticated = false;

let dataExp = fs.readFileSync('./modules/data.json', 'utf8');
let data = JSON.parse(dataExp);
let users = [];
let posts = [];

if(data.blogs)
{
    posts = data.blogs;
}

if(data.users)
{
    users = data.users;
}

let search_post = null;

console.log(posts);


app.get('/', (req, res) => 
{
    res.render('../views/pages/home', { isAuthenticated, posts });
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

app.get('/editor', (req, res) =>
{
    res.render('../views/pages/editor');
});

app.get('/register', (req, res) =>
{
    res.render('../views/pages/register');
});

app.get('/post/:date', (req, res) => {

    const postDate = req.params.date; 

    const post = posts.find(p => p.date == postDate); 
  
    if (!post) {
      res.status(404).send('Post not found');
      return;
    }

    // Render the post page (post.ejs) with post data
    res.render('../views/pages/post', { post: post, isAuthenticated });
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
    
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});