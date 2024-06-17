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
    next();
});

let imagename = "";
let imagepath = "";

app.set('view engine', 'ejs');

let isAuthenticated = false;

app.get('/', (req, res) => 
{
    res.render('../views/pages/home', { isAuthenticated });
});

app.get('/pages/:id', (req, res) =>
{
    const postId = req.params.id;

    let dataExp = fs.readFileSync('./modules/data.json', 'utf8');

    const post = data.blogs.find((post) => post[id] === postId);

    if(post)
    {
        res.render(`../views/pages/post${post.id}`, { post, isAuthenticated })
    }
    else
    {
        res.redirect('../views/pages/error');
    }
});

app.post('/comment/:id', (req, res) => {
    const postId = req.params.id;

    let dataExp = fs.readFileSync('./modules/data.json', 'utf8');

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
            if (err) throw err;
            console.log('Intial User created');
            });
    
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
              if (err) throw err;
              console.log('Intial User created');
              });
    
          } else {
            console.log('users are available');
            var newID = data.users[data.users.length -1].id + 1;
    
            let newUser = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                id: newID
              };
    
          data.users.push(newUser);
    
          let dataToFile = JSON.stringify(data);
    
          fs.writeFile('./modules/data.json', dataToFile, function(err) {
            if (err) throw err;
            console.log('User added');
            });
          };
      };
 
    isAuthenticated = true;

    res.redirect('/'); 
  });


app.get('/login', (req, res) => 
{
    res.render('../views/pages/login');
});

app.post('/login', (req, res) => {     
    
    let dataExp = fs.readFileSync('./modules/data.json', 'utf8');

    if(!dataExp)
        { 
            console.log('No users regestred');
            res.redirect('/register');
        }
    else {

    let data = JSON.parse(dataExp);

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
    imagepath = 'public/uploads/'+ imagename;

    //create upload
    file.mv(imagepath, (err, result) => {
        if(err)
        {
            throw err;
        }
        else
        {
            // our image upload path
            res.json(`uploads/${imagename}`);
        }
    });
})

app.post('/publish', (req, res) => {

    let dataExp = fs.readFileSync('./modules/data.json', 'utf8');
    let date = new Date();

        if(!dataExp) {
          console.log('no data available');
          data = {};
          data.blogs = [];
    
          let newBlog = {
            title: req.body.title,
            author: req.body.article,
            date: date.getDate() + date.getTime(),
            image: imagename,
            image_path: imagepath
          };
    
        data.blogs.push(newBlog);
    
        let dataToFile = JSON.stringify(data);
    
        fs.writeFile('./modules/data.json', dataToFile, function(err) {
            if (err) throw err;
            console.log('Intial Blog created');
            });
    
        } else {
          var data = JSON.parse(dataExp)
    
          if (!data.blogs) {
            console.log('no blog are available');
            data.blogs = [];
    
            let newBlog = {
                title: req.body.title,
                author: req.body.article,
                date: date.getDate() + date.getTime(),
                image: imagename,
                image_path: imagepath
            }
    
          data.blogs.push(newBlog);
    
          let dataToFile = JSON.stringify(data);
    
            fs.writeFile('./modules/data.json', dataToFile, function(err) {
              if (err) throw err;
              console.log('Intial blog created');
              });
    
          } else {
            console.log('blogs are available');
    
            var newBlog = {
                title: req.body.title,
                author: req.body.article,
                date: date.getDate() + date.getTime(),
                image: imagename,
                image_path: imagepath
            };
    
          data.blogs.push(newBlog);
    
          let dataToFile = JSON.stringify(data);
    
          fs.writeFile('./modules/data.json', dataToFile, function(err) {
            if (err) throw err;
            console.log('blog added');
            });
          };
      };

    imagename = "";
    imagepath = "";

    res.redirect('/'); 
});
    

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});