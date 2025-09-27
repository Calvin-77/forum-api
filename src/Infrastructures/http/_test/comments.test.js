const pool = require('../../database/postgres/pool');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('/comments endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await CommentsTableHelper.cleanTable();
        await ThreadsTableHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    describe('when POST /comments', () => {
        it('should response 201 and persisted comment', async () => {
            // Arrange
            const requestPayload = {
                thread_id: 'thread-123',
                content: 'sebuah teks',
            };

            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableHelper.addThread({ id: 'thread-123', title: 'sebuah judul', body: 'sebuah teks' });
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: 'user-123' });

            // eslint-disable-next-line no-undef
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/thread-123/comments`,
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedComment).toBeDefined();
        });

        it('should response 400 when request payload not contain needed property', async () => {
            // Arrange
            const requestPayload = {
                title: 'sebuah teks',
            };

            const server = await createServer(container);

            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableHelper.addThread({ id: 'thread-123', title: 'sebuah judul', body: 'sebuah teks' });
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
        });

        it('should response 400 when request payload not meet data type specification', async () => {
            // Arrange
            const requestPayload = {
                thread_id: 'thread-123',
                content: { content: 'sebuah judul' },
            };

            const server = await createServer(container);

            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableHelper.addThread({ id: 'thread-123', title: 'sebuah judul', body: 'sebuah teks' });
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
        });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
        it('should response 200 and delete the comment correctly', async () => {
            // Arrange
            const server = await createServer(container);
            const requestPayload = {
                thread_id: 'thread-123',
                comment_id: 'comment-123',
            }

            // Siapkan user, thread, dan comment
            const ownerId = 'user-123';
            const threadId = 'thread-123';
            const commentId = 'comment-123';

            await UsersTableTestHelper.addUser({ id: ownerId, username: 'dicoding' });
            await ThreadsTableHelper.addThread({ id: threadId, owner: ownerId });
            await CommentsTableHelper.addComment({ id: commentId, threadId, owner: ownerId });

            // Dapatkan access token untuk user pemilik comment
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: ownerId });

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}`,
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');

            // Pastikan komentar sudah di-soft delete dari database
            const comments = await CommentsTableHelper.findCommentById(commentId);
            expect(comments).toHaveLength(1);
            expect(comments[0].is_deleted).toEqual(true);
        });

        it('should response 403 when user is not the owner of the comment', async () => {
            // Arrange
            const server = await createServer(container);

            // Siapkan 2 user: pemilik comment dan penyerang
            const ownerId = 'user-123';
            const attackerId = 'user-456';
            const threadId = 'thread-123';
            const commentId = 'comment-123';

            await UsersTableTestHelper.addUser({ id: ownerId, username: 'owner' });
            await UsersTableTestHelper.addUser({ id: attackerId, username: 'attacker' });
            await ThreadsTableHelper.addThread({ id: threadId, owner: ownerId });
            await CommentsTableHelper.addComment({ id: commentId, threadId, owner: ownerId });

            // Dapatkan access token untuk user penyerang
            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ username: 'attacker', id: attackerId });

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual('fail');
        });

        it('should response 404 when comment is not found', async () => {
            // Arrange
            const server = await createServer(container);
            const ownerId = 'user-123';
            const threadId = 'thread-123';
            const invalidCommentId = 'comment-xxx'; // ID comment yang tidak ada

            await UsersTableTestHelper.addUser({ id: ownerId, username: 'dicoding' });
            await ThreadsTableHelper.addThread({ id: threadId, owner: ownerId });

            const tokenManager = container.getInstance(AuthenticationTokenManager.name);
            const accessToken = await tokenManager.createAccessToken({ username: 'dicoding', id: ownerId });

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${invalidCommentId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
        });
    });
});
