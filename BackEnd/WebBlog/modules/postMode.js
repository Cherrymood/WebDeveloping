const fileName = '../data/post.json';
let posts = require(fileName);
const helper = require('../helper.js');

//return the data array of objects, if array exists.
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

//return the data objects
function getPost(id) {

    return new Promise((resolve, reject) => {

        helper.mustBeInArray(posts, id)

        .then(post => resolve(post))

        .catch(err => reject(err));
    });
};

//We will insert a new row.
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

//Like adding a post, we have some content from the client. 
//Then we find the index of the row via the native function findIndex.
// In this row, we add the id, the updated date and the content.
function updatePost(id, newPost) {
    return new Promise((resolve, reject) => {
        helper.mustBeInArray(posts, id)
        .then(post => {
            const index = posts.findIndex(p => p.id == post.id)
            id = { id: post.id }
            const date = {
                createdAt: post.createdAt,
                updatedAt: helper.newDate()
            } 
            posts[index] = { ...id, ...date, ...newPost };
            helper.writeJSONFile(filename, posts)
            resolve(posts[index])
        })
        .catch(err => reject(err))
    })
}

function deletePost(id) {

    return new Promise((resolve, reject) => {

        helper.mustBeInArray(posts, id)

        .then(() => {
            posts = posts.filter(p => p.id !== id)
            helper.writeJSONFile(filename, posts)
            resolve()
        })
        .catch(err => reject(err))
    });
};

module.exports = {
    insertPost,
    getPosts,
    getPost, 
    updatePost,
    deletePost
}