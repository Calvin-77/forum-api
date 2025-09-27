const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const PostedThread = require('../../Domains/threads/entities/PostedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread(postThread) {
        const { title, body, owner } = postThread;
        const id = `thread-${this._idGenerator()}`;

        const query = {
            text: 'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
            values: [id, title, body, owner],
        };

        const result = await this._pool.query(query);

        return new PostedThread({ ...result.rows[0] });
    }

    async verifyThread(threadId) {
        const query = {
            text: 'SELECT id FROM threads WHERE id = $1',
            values: [threadId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount === 0) {
            throw new NotFoundError('thread tidak ditemukan');
        }
    }

    async getThreadDetails(threadId) {
        try {
            const query = {
                text: 'SELECT t.id, t.title, t.body, t.date, u.username FROM threads t JOIN users u ON t.owner = u.id WHERE t.id = $1',
                values: [threadId],
            };

            const result = await this._pool.query(query);

            if (!result.rowCount) {
                throw new NotFoundError('thread tidak ditemukan');
            }

            return result.rows[0];
        } catch (error) {
            console.error('ThreadRepo Error:', error);
            throw error;
        }
    }
}

module.exports = ThreadRepositoryPostgres;