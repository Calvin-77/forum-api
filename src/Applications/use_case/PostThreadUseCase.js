const PostThread = require('../../Domains/threads/entities/PostThread');
 
class PostThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }
 
  async execute(useCasePayload) {
    const postThread = new PostThread(useCasePayload);
    return this._threadRepository.addThread(postThread);
  }
}
 
module.exports = PostThreadUseCase;