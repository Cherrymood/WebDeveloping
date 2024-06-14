const fileName = '../data/post.json';
let posts = require(fileName);
const helper = require('../helper.js');

function getPosts() {
    
    return new Promise((resolve, reject) => {

    if (posts.length === 0) {
        reject({
            message: 'no posts available',
            status: 202
        });
    };
    resolve(posts)
    });
};

function getPost(id) {

    return new Promise((resolve, reject) => {

        helper.mustBeInArray(posts, id)

        .then(post => resolve(post))

        .catch(err => reject(err));
    });
};

function insertPost(newPost) {
    return new Promise((resolve, reject) => {
        
        const id = { id: helper.getNewId(posts) };
        const date = { 
            createdAt: helper.newDate(),
            updatedAt: helper.newDate()
        };

        newPost = { ...id, ...date, ...newPost };
        posts.push(newPost);
        helper.writeJSONFile(filename, posts);
        resolve(newPost);
    });
};

function updatePost(id, newPost) {}
function deletePost(id) {}
module.exports = {
    insertPost,
    getPosts,
    getPost, 
    updatePost,
    deletePost
}