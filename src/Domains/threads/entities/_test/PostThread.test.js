const PostThread = require('../PostThread');

describe('a PostThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            title: 'sebuah judul',
            body: 'sebuah teks',
        };

        // Action and Assert
        expect(() => new PostThread(payload)).toThrow('POST_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            title: 123,
            body: true,
            owner: 'abc',
        };
        // Action and Assert
        expect(() => new PostThread(payload)).toThrowError('POST_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create PostThread object correctly', () => {
        // Arrange
        const payload = {
            title: 'sebuah judul',
            body: 'sebuah body',
            owner: 'user-123',
        };

        // Action
        const postThread = new PostThread(payload);

        // Assert
        expect(postThread.title).toEqual(payload.title);
        expect(postThread.body).toEqual(payload.body);
        expect(postThread.owner).toEqual(payload.owner);
    });
});