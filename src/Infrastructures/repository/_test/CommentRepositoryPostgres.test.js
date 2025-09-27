const CommentsTableTestHelper = require('../../../../tests/CommentsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableHelper');
const PostComment = require('../../../Domains/comments/entities/PostComment');
const PostedComment = require('../../../Domains/comments/entities/PostedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addComment function', () => {
        beforeEach(async () => {
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
        });

        it('should persist add comment', async () => {
            // Arrange
            const postComment = new PostComment({
                thread_id: 'thread-123',
                content: 'sebuah teks',
                owner: 'user-123',
            });
            const fakeIdGenerator = () => '123';
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await commentRepositoryPostgres.addComment(postComment);

            // Assert
            const comments = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(comments).toHaveLength(1);
        });

        it('should return posted comment correctly', async () => {
            // Arrange
            const postComment = new PostComment({
                thread_id: 'thread-123',
                content: 'sebuah teks',
                owner: 'user-123',
            });
            const fakeIdGenerator = () => '123';
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const postedComment = await commentRepositoryPostgres.addComment(postComment);

            // Assert
            expect(postedComment).toStrictEqual(new PostedComment({
                id: 'comment-123',
                content: 'sebuah teks',
                owner: 'user-123',
            }));
        });
    });

    describe('deleteComment function', () => {
        it('should soft delete comment from database', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            await commentRepositoryPostgres.deleteComment('comment-123');

            // Assert
            const comments = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(comments).toHaveLength(1);
            expect(comments[0].is_deleted).toEqual(true);
        });
    });

    describe('verifyComment function', () => {
        it('should throw error when comment not found', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyComment('comment-123'))
                .rejects.toThrowError(NotFoundError);
        });

        it('should not throw error when comment exists', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyComment('comment-123'))
                .resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('verifyCommentOwner function', () => {
        beforeEach(async () => {
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
        });

        it('should throw error when comment owner is not the real owner', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
            const wrongOwner = 'user-456';

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', wrongOwner))
                .rejects.toThrowError(AuthorizationError);
        });

        it('should throw error when comment not found', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-999', 'user-123'))
                .rejects.toThrowError(NotFoundError);
        });

        it('should not throw error when comment owner is the real owner', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
            const correctOwner = 'user-123';

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', correctOwner))
                .resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('getCommentsByThreadId function', () => {
        beforeEach(async () => {
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
        });

        it('should return comments correctly', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: 'comment-123',
                thread_id: 'thread-123',
                content: 'sebuah komentar',
                owner: 'user-123',
            });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

            // Assert
            expect(comments).toHaveLength(1);
            expect(comments[0]).toStrictEqual({
                id: 'comment-123',
                username: 'dicoding',
                content: 'sebuah komentar',
                is_deleted: false,
            });
        });

        it('should return empty array when no comments found', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

            // Assert
            expect(comments).toHaveLength(0);
        });
    });
});