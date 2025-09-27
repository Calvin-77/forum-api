const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');

class GetThreadDetailsUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.getThreadDetails(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const mappedComments = comments.map((row) => {
      const { is_deleted, ...otherFields } = row;
      return new CommentDetails({
        ...otherFields,
        date: new Date().toISOString(),
        isDeleted: is_deleted || false,
      });
    });

    return new ThreadDetails({
      ...thread,
      comments: mappedComments,
    });
  }
}

module.exports = GetThreadDetailsUseCase;