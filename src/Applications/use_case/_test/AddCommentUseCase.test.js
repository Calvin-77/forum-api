const PostComment = require('../../../Domains/comments/entities/PostComment');
const PostedComment = require('../../../Domains/comments/entities/PostedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
    it('should orchestrating the post comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            thread_id: 'thread-123',
            content: 'sebuah teks',
            owner: 'user-123',
        };

        const mockPostedComment = new PostedComment({
            id: 'comment-123',
            content: useCasePayload.content,
            owner: useCasePayload.owner,
        });

        /** creating dependency of use case */
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockPostedComment));

        /** creating use case instance */
        const postCommentUseCase = new AddCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action
        const postedComment = await postCommentUseCase.execute(useCasePayload);

        // Assert
        expect(mockThreadRepository.verifyThread).toHaveBeenCalledWith(useCasePayload.thread_id);
        expect(postedComment).toStrictEqual(new PostedComment({
            id: 'comment-123',
            content: useCasePayload.content,
            owner: useCasePayload.owner,
        }));
        expect(mockCommentRepository.addComment).toBeCalledWith(new PostComment({
            thread_id: useCasePayload.thread_id,
            content: useCasePayload.content,
            owner: useCasePayload.owner,
            date: useCasePayload.date,
        }));
    });
});