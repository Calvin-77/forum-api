const CommentDetails = require('../CommentDetails');

describe('a CommentDetails entity', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'dicoding',
            date: '2025-09-16T15:00:00.000Z',
        };

        // Action and Assert
        expect(() => new CommentDetails(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'dicoding',
            date: '2025-09-16T15:00:00.000Z',
            content: 'sebuah komentar',
            isDeleted: 'false',
        };

        // Action and Assert
        expect(() => new CommentDetails(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when content is not string', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'dicoding',
            date: '2025-09-16T15:00:00.000Z',
            content: 123,
            isDeleted: false,
        };

        // Action and Assert
        expect(() => new CommentDetails(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create CommentDetails object correctly when comment is not deleted', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'dicoding',
            date: '2025-09-16T15:00:00.000Z',
            content: 'ini adalah komentar asli',
            isDeleted: false,
        };

        // Action
        const detailComment = new CommentDetails(payload);

        // Assert
        expect(detailComment.id).toEqual(payload.id);
        expect(detailComment.username).toEqual(payload.username);
        expect(detailComment.date).toEqual(payload.date);
        expect(detailComment.content).toEqual('ini adalah komentar asli');
    });

    it('should create CommentDetails object with replaced content when comment is deleted', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            username: 'dicoding',
            date: '2025-09-16T15:00:00.000Z',
            content: 'komentar ini seharusnya tidak terlihat',
            isDeleted: true,
        };

        // Action
        const detailComment = new CommentDetails(payload);

        // Assert
        expect(detailComment.id).toEqual(payload.id);
        expect(detailComment.username).toEqual(payload.username);
        expect(detailComment.date).toEqual(payload.date);
        expect(detailComment.content).toEqual('**komentar telah dihapus**');
    });
});