const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
    constructor(container) {
        this._container = container;

        this.postCommentHandler = this.postCommentHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    }

    async postCommentHandler(request, h) {
        const { id: owner } = request.auth.credentials;
        const { content } = request.payload;
        const { threadId: thread_id } = request.params;

        const useCasePayload = {
            thread_id,
            content,
            owner,
        };

        const postCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
        const postedComment = await postCommentUseCase.execute(useCasePayload);

        const response = h.response({
            status: 'success',
            data: {
                addedComment: postedComment,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCommentHandler(request, h) {
        const { id: owner } = request.auth.credentials;
        const { threadId: thread_id, commentId: comment_id } = request.params;

        const useCasePayload = {
            thread_id,
            comment_id,
            owner,
        };

        const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

        await deleteCommentUseCase.execute(useCasePayload);

        return {
            status: 'success',
        };
    }
}

module.exports = CommentsHandler;