const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');

describe('GetThreadDetailsUseCase', () => {
  it('should orchestrate the get thread details action correctly and map comments properly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2025-09-16T15:00:00.000Z',
      username: 'dicoding',
    };

    const mockCommentsFromRepo = [
      {
        id: 'comment-123',
        username: 'johndoe',
        content: 'sebuah komentar',
        is_deleted: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        content: 'komentar ini telah dihapus',
        is_deleted: true,
      },
    ];

    const expectedThreadDetails = new ThreadDetails({
      ...mockThread,
      comments: [
        new CommentDetails({
          id: 'comment-123',
          username: 'johndoe',
          content: 'sebuah komentar',
          date: expect.any(String),
          isDeleted: false,
        }),
        new CommentDetails({
          id: 'comment-456',
          username: 'dicoding',
          content: 'komentar ini telah dihapus',
          date: expect.any(String),
          isDeleted: true,
        }),
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadDetails = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentsFromRepo));

    /** creating use case instance */
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const actualThreadDetails = await getThreadDetailsUseCase.execute(useCasePayload);

    // Assert
    expect(actualThreadDetails).toEqual(expectedThreadDetails);
    expect(actualThreadDetails.comments[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(actualThreadDetails.comments[1].date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    
    expect(mockThreadRepository.getThreadDetails).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);
  });
});