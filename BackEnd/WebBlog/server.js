import express from "express";
import fileupload from "express-fileupload";

const app = express();
const port = 3000;

app.use(express.static("./public"));

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(fileupload());
app.use((req, res, next) => {
    res.locals.isAuthenticated = isAuthenticated;
    next();
});

const blogPosts = [
    { id: 1, title: 'Learning JavaScript', comments: []},
    { id: 2, title: 'Using MERN Stack', comments: []}
];

let isAuthenticated = false;

const users = [
    { email: 'user1@gmail.com', username: 'John', password: '123456'},
    { email: 'user2@gmail.com', username: 'Andy', password: '123456'},
    { email: 'user3@gmail.com', username: 'Mike', password: '123456'}
];

app.get('/', (req, res) => 
{
    res.render('../views/pages/home', { blogPosts, isAuthenticated});
});

app.get('/pages/:id', (req, res) =>
{
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

    if(post)
    {
        res.render(`../views/pages/post${post.id}`, { post, isAuthenticated })
    }
    else
    {
        res.redirect('../views/pages/error');
    }
});

app.get('/editor', (req, res) =>
{
    res.render('../views/pages/editor');
});

app.post('/comment/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

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

app.get('/login', (req, res) => 
{
    res.render('../views/pages/login');
});

app.post('/login', (req, res) => {
    
    isAuthenticated = false;
    const {email, password} = req.body;

    users.forEach((user) => {
        
        if(user.email === email && user.password === password)
        {
            isAuthenticated = true;
        }
    });

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


//upload link 
app.post('/upload', (req, res) => {
    let file = req.files.image;
    let date = new Date();
    //image name
    let imagename = date.getDate() + date.getTime() + file.name;
    //image upload path
    let path = 'public/uploads/'+ imagename;

    //create upload
    file.mv(path, (err, result) => {
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

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});