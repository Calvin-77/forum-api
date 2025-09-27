const PostThread = require('../../../Domains/threads/entities/PostThread');
const PostedThread = require('../../../Domains/threads/entities/PostedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const PostThreadUseCase = require('../PostThreadUseCase');

describe('PostThreadUseCase', () => {
    it('should orchestrating the post thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            title: 'sebuah judul',
            body: 'sebuah teks',
            date: '2025-09-15T15:14:39.000Z',
            owner: 'user-123',
        };

        const mockPostedThread = new PostedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            owner: useCasePayload.owner,
        });

        /** creating dependency of use case */
        const mockThreadRepository = new ThreadRepository();

        /** mocking needed function */
        mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockPostedThread));

        /** creating use case instance */
        const postThreadUseCase = new PostThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const postedThread = await postThreadUseCase.execute(useCasePayload);

        // Assert
        expect(postedThread).toStrictEqual(new PostedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            owner: useCasePayload.owner,
        }));
        expect(mockThreadRepository.addThread).toBeCalledWith(new PostThread({
            title: useCasePayload.title,
            body: useCasePayload.body,
            date: useCasePayload.date,
            owner: useCasePayload.owner,
        }));
    });
});