const Sequelize = require('sequelize')
const UserModel = require('./models/user')
const BlogModel = require('./models/blog')
const CommentModel = require('./models/comment')
const TagModel = require('./models/tag')
const path = require('path')

const db = new Sequelize('codementor', 'root', 'root', {
  name: 'test_database',
  host: 'localhost',
  dialect: 'sqlite',
  // path: 'dev-database.sqlite3',
  storage: path.join(process.cwd(), 'dev-database.sqlite3'),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
})

const User = UserModel(db, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
const BlogTag = db.define('blog_tag', {})
const Blog = BlogModel(db, Sequelize)
const CommentTag = db.define('comment_tag', {})
const Comment = CommentModel(db, Sequelize)
const Tag = TagModel(db, Sequelize)

Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
Comment.belongsToMany(Tag, { through: CommentTag, unique: false })
Tag.belongsToMany(Comment, { through: CommentTag, unique: false })
Blog.belongsTo(User);
Comment.belongsTo(User);


module.exports = {
  User,
  Blog,
  Comment,
  Tag,
  db
}