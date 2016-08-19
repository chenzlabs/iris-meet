import AppDispatcher from '../dispatcher/app-dispatcher';
import MessageConstants from '../constants/message-constants';

class MessageActions {
  roomReady(token, userName, roomName, routingId, rootNodeId, rootChildNodeId) {
    AppDispatcher.dispatch({
      actionType: MessageConstants.GET_ROOM,
      data: {
        token,
        userName,
        roomName,
        routingId,
        rootNodeId,
        rootChildNodeId,
      }
    })
  }

  sendMessage(userName, routingId, roomName, messageText) {
    console.log('sendMessage');
    AppDispatcher.dispatch({
      actionType: MessageConstants.MESSAGE_SEND,
      data: {
        userName,
        routingId,
        roomName,
        messageText,
      }
    });
  }

  receiveMessages() {
    AppDispatcher.dispatch({
      actionType: MessageConstants.RECEIVE_MESSAGES,
    });
  }

  resetNewMessageCount() {
    AppDispatcher.dispatch({
      actionType: MessageConstants.RESET_MESSAGE_COUNT,
    });
  }
}

export default new MessageActions();