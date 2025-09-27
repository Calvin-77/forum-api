const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
 
describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      owner: 'user-123'
    };
 
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
 
    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());
 
    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
 
    // Action
    await deleteCommentUseCase.execute(useCasePayload);
 
    // Assert
    expect(mockThreadRepository.verifyThread).toHaveBeenCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload.comment_id);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.comment_id, useCasePayload.owner);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCasePayload.comment_id);
  });
});