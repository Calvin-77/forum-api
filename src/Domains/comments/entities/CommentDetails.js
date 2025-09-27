class CommentDetails {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, username, date, content, isDeleted } = payload;

        this.id = id;
        this.username = username;
        this.date = date;
        this.content = (isDeleted === true) ? '**komentar telah dihapus**' : content;
    }

    _verifyPayload({ id, username, date, content, isDeleted }) {
        if (!id || !username || !date || content === undefined) {
            throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string') {
            throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }

        if (isDeleted !== undefined && typeof isDeleted !== 'boolean') {
            throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = CommentDetails;