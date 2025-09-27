const DeleteComment = require('../../Domains/comments/entities/DeleteComment');
 
class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }
 
  async execute(useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload);

    await this._threadRepository.verifyThread(deleteComment.thread_id);
    await this._commentRepository.verifyComment(deleteComment.comment_id);
    await this._commentRepository.verifyCommentOwner(deleteComment.comment_id, deleteComment.owner);
    await this._commentRepository.deleteComment(deleteComment.comment_id);
  }
}
 
module.exports = DeleteCommentUseCase;