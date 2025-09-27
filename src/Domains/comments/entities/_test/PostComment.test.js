const PostComment = require('../PostComment');

describe('a PostComment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            owner: 'user-123',
        };

        // Action and Assert
        expect(() => new PostComment(payload)).toThrow('POST_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            thread_id: 'abc',
            content: true,
            owner: 'abc',
        };
        // Action and Assert
        expect(() => new PostComment(payload)).toThrowError('POST_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create PostComment object correctly', () => {
        // Arrange
        const payload = {
            thread_id: 'thread-123',
            content: 'sebuah komentar',
            owner: 'user-123',
        };

        // Action
        const postComment = new PostComment(payload);

        // Assert
        expect(postComment.thread_id).toEqual(payload.thread_id);
        expect(postComment.content).toEqual(payload.content);
        expect(postComment.owner).toEqual(payload.owner);
    });
});