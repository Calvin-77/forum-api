const pool = require('../../database/postgres/pool');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');

describe('/threads endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await CommentsTableHelper.cleanTable();
        await ThreadsTableHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    describe('when POST /threads', () => {
        it('should response 201 and persisted thread', async () => {
            // Arrange
            const requestPayload = {
                title: 'sebuah judul',
                body: 'sebuah teks',
            };

            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: 'user-123' });

            // eslint-disable-next-line no-undef
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedThread).toBeDefined();
        });

        it('should response 400 when request payload not contain needed property', async () => {
            // Arrange
            const requestPayload = {
                title: 'sebuah judul',
            };

            const server = await createServer(container);

            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
        });

        it('should response 400 when request payload not meet data type specification', async () => {
            // Arrange
            const requestPayload = {
                title: { title: 'sebuah judul' },
                body: ['sebuah teks'],
            };

            const server = await createServer(container);

            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
        });
    });

    describe('when GET /threads/{threadId}', () => {
        it('should response 404 when thread is not found', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-xxx',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 200 and return thread details with comments', async () => {
            // Arrange
            const server = await createServer(container);
            const threadPayload = {
                id: 'thread-123',
                title: 'sebuah judul',
                body: 'sebuah teks',
                owner: 'user-123',
            };
            const userPayload = { id: 'user-123', username: 'dicoding' };
            const commentPayload = {
                id: 'comment-123',
                content: 'sebuah teks',
                owner: 'user-123',
                thread_id: 'thread-123',
            };

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableHelper.addThread(threadPayload);
            await CommentsTableHelper.addComment(commentPayload);

            // Action
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-123',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.thread).toBeDefined();
            expect(responseJson.data.thread.id).toEqual(threadPayload.id);
            expect(responseJson.data.thread.title).toEqual(threadPayload.title);
            expect(responseJson.data.thread.body).toEqual(threadPayload.body);
            expect(responseJson.data.thread.username).toEqual(userPayload.username);
            expect(responseJson.data.thread.comments).toBeInstanceOf(Array);
            expect(responseJson.data.thread.comments).toHaveLength(1);
            expect(responseJson.data.thread.comments[0].id).toEqual(commentPayload.id);
            expect(responseJson.data.thread.comments[0].content).toEqual(commentPayload.content);
        });
    });
});
