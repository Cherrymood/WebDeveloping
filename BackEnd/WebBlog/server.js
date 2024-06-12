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

    const {username, password} = req.body;
    if(username === 'john' && password === '123456')
    {
        isAuthenticated = true;
        res.redirect('/');
    }
    else
    {
        res.redirect('../views/pages/error');
    }
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