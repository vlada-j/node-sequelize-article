module.exports = (sequelize, type) => {

	const Comment = sequelize.define('comment', {
		id: {
			type: type.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		comment: type.STRING
	});


	Comment.prototype.format = function() {
		return {
			id: this.id,
			msg: this.comment,
			userId: this.userId,
			tag: this.tags.map(t => { return { id: t.id, name: t.name }})
		};
	};

	return Comment;
};