module.exports = (sequelize, type) => {

    const Blog = sequelize.define('blog', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        text: type.STRING
    });


    Blog.prototype.format = function() {
        return {
            id: this.id,
            msg: this.text,
            userId: this.userId,
            tag: this.tags.map(t => { return { id: t.id, name: t.name }})
        };
    };

    return Blog;
};