const express = require('express')
const bodyParser = require('body-parser')
const { User, Blog, Comment, Tag, db } = require('./sequelize')

const app = express()
app.use(bodyParser.json())


// create a user
app.post('/api/users', (req, res) => {
    console.log(req.body)
    User.create(req.body)
        .then(user => res.json(user))
})
// get all users
app.get('/api/users', (req, res) => {
    User.findAll().then(users => res.json(users))
})

// create a blog post
app.post('/api/blogs', (req, res) => {
    const body = req.body
    // SQLITE BUG when we have more then 1 tag -  BEGIN DEFERRED TRANSACTION
 //   const tags = body.tags.map( tag => Tag.findOrCreate({ where: { name: tag.name }, defaults: { name: tag.name }}).spread((tag, created) => tag) )

	// FIX
	const tags = db.transaction(t => {
		return Promise.all( body.tags.map( tag => Tag.findOrCreate({ where: { name: tag.name }, defaults: { name: tag.name }, transaction: t}).spread((tag, created) => tag) ));
	});

    User.findById(body.userId)
        .then(() => Blog.create(body))
        .then(blog => tags.then(storedTags => blog.addTags(storedTags)).then(() => blog))
        .then(blog => Blog.findOne({ where: {id: blog.id}, include: [User, Tag]}))
        .then(blogWithAssociations => res.json(blogWithAssociations))
        .catch(err => res.status(400).json({ err: err}))
        // .catch(err => res.status(400).json({ err: `User with id = [${body.userId}] doesn\'t exist.`}))
})

// create a comment
app.post('/api/comment', (req, res) => {
    const body = req.body

	const tags = db.transaction(t => {
		return Promise.all( body.tags.map( tag => Tag.findOrCreate({ where: { name: tag.name }, defaults: { name: tag.name }, transaction: t}).spread((tag, created) => tag) ));
	});

    User.findById(body.userId)
        .then(() => Comment.create(body))
        .then(comment => tags.then(storedTags => comment.addTags(storedTags)).then(() => comment))
        .then(comment => Comment.findOne({ where: {id: comment.id}, include: [User, Tag]}))
        .then(commentWithAssociations => res.json(commentWithAssociations))
        .catch(err => res.status(400).json({ err: err}))
        // .catch(err => res.status(400).json({ err: `User with id = [${body.userId}] doesn\'t exist.`}))
})

// find blogs belonging to one user or all blogs
app.get('/api/blogs/:userId?', (req, res) => {
    let query;
    if(req.params.userId) {
        query = Blog.findAll({ include: [
            { model: User, where: { id: req.params.userId } },
            { model: Tag }
        ]})
    } else {
        query = Blog.findAll({ include: [Tag, User]})
    }
    return query.then(blogs => res.json(blogs))
})

// find blogs by tag
app.get('/api/blogs/:tag/tag', (req, res) => {
    Blog.findAll({
        include: [
            { model: Tag, where: { name: req.params.tag } }
        ]
    })
    .then(blogs => res.json(blogs))
})

// find comments by tag
app.get('/api/comment/:tag/tag', (req, res) => {
    Comment.findAll({
        include: [
            { model: Tag, where: { name: req.params.tag } }
        ]
    })
    .then(blogs => res.json(blogs))
})

// find blogs or comments by tag
app.get('/api/search/:tag?', (req, res) => {
    let tag = req.params.tag;

    return Promise.all([
            Blog.findAll({ include: [
                    // { model: User },
                    { model: Tag, where: { name: tag } }
                ]}),
            Comment.findAll({ include: [
                    // { model: User },
                    { model: Tag, where: { name: tag } }
                ]})
        ])
        .then(r => r[0].concat(r[1]) )
        .then(response => {
            let formatted = response.map(r => r.format() );
            return res.json(formatted);
        })
});






db.sync({force: false})
    .then(() => {
        console.log(`Database & tables created!`)

        const port = 3000
        app.listen(port, () => {
            console.log(`Running on http://localhost:${port}`)
        })
    })
    .catch( err => console.log('DB ERROR', err) );

