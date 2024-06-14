//check before to continue if the id is an integer. Using when we need to get the id
function mustBeInteger(req, res, next) {
    const id = req.params.id;

    if (!Number.isInteger(parseInt(id))) {
        res.status(400).json({ message: 'ID must be an integer' })
    } else {
        next();
    };
};

//check before to continue if data

function checkFieldsPost(req, res, next) {
    const { title, content, tags } = req.body;
    if (title && content && tags) {
        next();
    } else {
        res.status(400).json({ message: 'fields are not good' });
    };
};

module.exports = {
    mustBeInteger,
    checkFieldsPost
}
