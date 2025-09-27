/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableHelper = {
    async addThread({
        id = 'thread-123',
        title = 'sebuah judul thread',
        body = 'ini adalah isi thread',
        owner = 'user-123',
        date = '2025-09-15T15:00:00.000Z',
    }) {
        const query = {
            text: 'INSERT INTO threads(id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
            values: [id, title, body, owner, date],
        };

        await pool.query(query);
    },

    async findThreadById(id) {
        const query = {
            text: 'SELECT * FROM threads WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async cleanTable() {
        await pool.query('DELETE FROM threads WHERE 1=1');
    },
};

module.exports = ThreadsTableHelper;