const ThreadDetails = require('../ThreadDetails');

describe('a ThreadDetails entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
    };

    // Action and Assert
    expect(() => new ThreadDetails(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2025-09-16T15:00:00.000Z',
      username: 'dicoding',
      comments: 'ini bukan array',
    };
    // Action and Assert
    expect(() => new ThreadDetails(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when body is not string', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 123,
      date: '2025-09-16T15:00:00.000Z',
      username: 'dicoding',
      comments: [],
    };
    // Action and Assert
    expect(() => new ThreadDetails(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2025-09-16T15:00:00.000Z',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const detailThread = new ThreadDetails(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });

  it('should create ThreadDetails object with empty comments when comments is undefined', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: '2025-09-16T15:00:00.000Z',
      username: 'dicoding',
    };

    // Action
    const detailThread = new ThreadDetails(payload);

    // Assert
    expect(detailThread.comments).toEqual([]);
  });
});