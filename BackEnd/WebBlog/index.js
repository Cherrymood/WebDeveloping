import express from "express";

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
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
        res.render(`pages/post${post.id}`, { post, isAuthenticated })
    }
    else
    {
        res.render(404).render('pages/404');
    }
});

app.post('/comment/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

    if(!isAuthenticated)
    {
        return res.redirect('/pages/404');
    }

    if(post)
        {
            const comment = req.body.comment;
            if(comment)
            {
                post.comments.push(comment);
            }
            return res.redirect(`/pages/${postId}`);
        }
    else
        {
            return res.redirect('/pages/404');
        }
});

app.get('/login', (req, res) => 
{
    res.render('pages/login');
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
        res.redirect('/pagest/fail');
    }
});

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});