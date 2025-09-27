const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const PostThread = require('../../../Domains/threads/entities/PostThread');
const PostedThread = require('../../../Domains/threads/entities/PostedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    afterEach(async () => {
        await ThreadsTableHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addThread function', () => {
        beforeEach(async () => {
            await UsersTableTestHelper.addUser({ id: 'user-123' });
        });

        it('should persist add thread', async () => {
            // Arrange
            const postThread = new PostThread({
                title: 'sebuah judul',
                body: 'sebuah teks',
                owner: 'user-123',
            });
            const fakeIdGenerator = () => '123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await threadRepositoryPostgres.addThread(postThread);

            // Assert
            const threads = await ThreadsTableHelper.findThreadById('thread-123');
            expect(threads).toHaveLength(1);
        });

        it('should return posted thread correctly', async () => {
            // Arrange
            const postThread = new PostThread({
                title: 'sebuah judul',
                body: 'sebuah teks',
                owner: 'user-123',
            });
            const fakeIdGenerator = () => '123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const postedThread = await threadRepositoryPostgres.addThread(postThread);

            // Assert
            expect(postedThread).toStrictEqual(new PostedThread({
                id: 'thread-123',
                title: 'sebuah judul',
                owner: 'user-123',
            }));
        });
    });

    describe('verifyThread function', () => {
        it('should throw NotFoundError when thread not found', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(threadRepositoryPostgres.verifyThread('thread-123'))
                .rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError when thread exists', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(threadRepositoryPostgres.verifyThread('thread-123'))
                .resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('getThreadDetails function', () => {
        it('should return error when thread is not found', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(threadRepositoryPostgres.getThreadDetails('thread-456'))
                .rejects.toThrowError(NotFoundError);
        });

        it('should return thread details correctly when thread is found', async () => {
            // Arrange
            const threadPayload = {
                id: 'thread-123',
                title: 'sebuah judul',
                body: 'sebuah body',
                owner: 'user-123',
            };
            const userPayload = {
                id: 'user-123',
                username: 'dicoding',
            };
            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableHelper.addThread(threadPayload);
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action
            const threadDetails = await threadRepositoryPostgres.getThreadDetails('thread-123');

            // Assert
            expect(threadDetails.id).toEqual(threadPayload.id);
            expect(threadDetails.title).toEqual(threadPayload.title);
            expect(threadDetails.body).toEqual(threadPayload.body);
            expect(threadDetails.username).toEqual(userPayload.username);
            expect(threadDetails.date).toBeInstanceOf(Date);
        });
    });
});