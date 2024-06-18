import express from "express";
import fileupload from "express-fileupload";
import path from 'path';
import fs from 'fs';
import http from "http";

const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));

app.use(express.static("./public"));
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

let dataExp = fs.readFileSync('./modules/data.json', 'utf8');
let data = JSON.parse(dataExp);
let users = data.users;
let posts = data.blogs;
console.log(posts);

app.get('/', (req, res) => 
{
    res.render('../views/pages/home', { isAuthenticated, posts });
});

app.get('/edit_last_post', (req, res) => {

    res.render('../views/pages/edit_last_post', { isAuthenticated });
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

        if(!dataExp) {
          console.log('no data available');
          data = {};
          data.blogs = [];
    
          let newBlog = {
            title: req.body.title,
            article: req.body.article,
            date: date.getDate() + date.getTime(),
            image: imagename,
          };
    
        data.blogs.push(newBlog);
    
        let dataToFile = JSON.stringify(data);
    
        fs.writeFile('./modules/data.json', dataToFile, function(err) {

            if (err) {
                res.redirect('../views/pages/error');
              }});
    
        } else {
    
          if (!data.blogs) {
            console.log('no blog are available');
            data.blogs = [];
    
            let newBlog = {
                title: req.body.title,
                article: req.body.article,
                date: date.getDate() + date.getTime(),
                image: imagename,
            }
    
          data.blogs.push(newBlog);
    
          let dataToFile = JSON.stringify(data);
    
            fs.writeFile('./modules/data.json', dataToFile, function(err) {
              if (err) {
                res.redirect('../views/pages/error');
              }});
    
          } else {
            console.log('blogs are available');
    
            var newBlog = {
                title: req.body.title,
                article: req.body.article,
                date: date.getDate() + date.getTime(),
                image: imagename,
            };
    
          data.blogs.push(newBlog);
    
          let dataToFile = JSON.stringify(data);
    
          fs.writeFile('./modules/data.json', dataToFile, function(err) {
            if (err) {
                res.redirect('../views/pages/error');
              }});
          };
      };

    imagename = "";

    res.redirect('/'); 
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

app.post('/comment/:id', (req, res) => {
    const postId = req.params.id;

    const post = data.blogs.find((post) => post[id] === postId);

    if(post)
        {
            const comment = req.body.comment;

            post.comments.push(comment);
            
            if(comment)
            {
                post.comments.push(comment);
            }
            return res.redirect(`../views/pages/${postId}`);
        }
    else
        {
            return res.redirect('../views/pages/error');
        }
});
    
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});