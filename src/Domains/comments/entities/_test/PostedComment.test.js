const PostedComment = require('../PostedComment');

describe('a PostedComment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            owner: 'user-123',
        };

        // Action and Assert
        expect(() => new PostedComment(payload)).toThrow('POSTED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: {},
            content: ['sebuah teks'],
            owner: true,
        };

        // Action and Assert
        expect(() => new PostedComment(payload)).toThrow('POSTED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create postedComment object correctly', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sebuah teks',
            owner: 'orang',
        };

        // Action
        const postedComment = new PostedComment(payload);

        // Assert
        expect(postedComment.id).toEqual(payload.id);
        expect(postedComment.content).toEqual(payload.content);    
        expect(postedComment.owner).toEqual(payload.owner);
    });
});