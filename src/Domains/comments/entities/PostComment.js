class PostComment {
  constructor(payload) {
    this._verifyPayload(payload);
 
    const { thread_id, content, owner } = payload;
 
    this.thread_id = thread_id;
    this.content = content;
    this.owner = owner;
  }
 
  _verifyPayload({ thread_id, content, owner }) {
    if (!content || !owner || !thread_id) {
      throw new Error('POST_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
 
    if (typeof content !== 'string' || typeof owner !== 'string' || typeof thread_id !== 'string') {
      throw new Error('POST_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}
 
module.exports = PostComment;