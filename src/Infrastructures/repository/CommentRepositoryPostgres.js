const PostedComment = require('../../Domains/comments/entities/PostedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addComment(postComment) {
        const { thread_id, content, owner } = postComment;
        const id = `comment-${this._idGenerator()}`;

        const query = {
            text: 'INSERT INTO comments(id, thread_id, content, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
            values: [id, thread_id, content, owner],
        };

        const result = await this._pool.query(query);

        return new PostedComment({ ...result.rows[0] });
    }

    async deleteComment(id) {
        const query = {
            text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1',
            values: [id],
        };
        await this._pool.query(query);
    }

    async verifyComment(id) {
        const query = {
            text: 'SELECT * FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('COMMENT_REPOSITORY.COMMENT_NOT_FOUND');
        }
    }

    async verifyCommentOwner(comment_id, owner) {
        const query = {
            text: 'SELECT owner FROM comments WHERE id = $1',
            values: [comment_id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('komentar tidak ditemukan');
        }

        const comment = result.rows[0];
        if (comment.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }
    
    async getCommentsByThreadId(id) {
        const query = {
            text: 'SELECT comments.id, users.username, comments.content, comments.is_deleted FROM comments JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY comments.id ASC',
            values: [id],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = CommentRepositoryPostgres;