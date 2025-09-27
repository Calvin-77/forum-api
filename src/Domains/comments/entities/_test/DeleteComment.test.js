const DeleteComment = require('../DeleteComment');
 
describe('a DeleteComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      comment_id: 'abc',
    };
 
    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      thread_id: 123,
      comment_id: 123,
      owner: 'abc',
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteComment object correctly', () => {
    // Arrange
    const payload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const deleteComment = new DeleteComment(payload);

    // Assert
    expect(deleteComment.thread_id).toEqual(payload.thread_id);
    expect(deleteComment.comment_id).toEqual(payload.comment_id);
    expect(deleteComment.owner).toEqual(payload.owner);
  });
});