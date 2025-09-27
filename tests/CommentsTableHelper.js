/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableHelper = {
    async addComment({
        id = 'comment-123',
        thread_id = 'thread-123',
        content = 'ini adalah isi comment',
        owner = 'user-123',
        date = '2025-09-15T15:00:00.000Z',
        isDeleted = false,
    }) {
        const query = {
            text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, thread_id, content, owner, date, isDeleted],
        };

        await pool.query(query);
    },

    async findCommentById(id) {
        const query = {
            text: 'SELECT * FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async cleanTable() {
        await pool.query('DELETE FROM comments WHERE 1=1');
    },
};

module.exports = CommentsTableHelper;