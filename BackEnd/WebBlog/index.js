import express from "express";

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const blogPosts = [
    { id: 1, title: 'Learning JavaScript'},
    { id: 2, title: 'Using MERN Stack'}
];

app.get('/', (req, res) => 
{
    res.render('../views/pages/home', { blogPosts });
});

app.get('/pages/:id', (req, res) =>
{
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

    if(post)
    {
        res.render(`pages/post${post.id}`, { post })
    }
    else
    {
        res.render(404).render('pages/404');
    }
});

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});