const GetThreadDetailsUseCase = require('../../../../Applications/use_case/GetThreadDetailsUseCase');
const PostThreadUseCase = require('../../../../Applications/use_case/PostThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailsHandler = this.getThreadDetailsHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;

    const useCasePayload = {
      ...request.payload,
      owner,
    };

    const postThreadUseCase = this._container.getInstance(PostThreadUseCase.name);
    const postedThread = await postThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread: postedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailsHandler(request, h) {
    try {
      const { threadId } = request.params;

      const getThreadDetailsUseCase = this._container.getInstance(GetThreadDetailsUseCase.name);
      const threadDetails = await getThreadDetailsUseCase.execute({ threadId });

      return h.response({
        status: 'success',
        data: {
          thread: threadDetails,
        },
      });
    } catch (error) {
      console.error('Handler Error:', error);
      throw error;
    }
  }
}

module.exports = ThreadsHandler;