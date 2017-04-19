import BaseStore from './base-store';
import UserStoreConstants from '../constants/user-store-constants';
import { AuthManager } from 'iris-auth-js-sdk';
import Config from '../../config.json';

const authUrl = Config.authUrl;
const appKey = Config.appKey;

class UserStore extends BaseStore {
  constructor() {
    super();
    this.registerActions(() => this._actionsHandler.bind(this));

    this.userInfo = {
      userName: null,
      routingId: null,
      roomName: null,
      accessToken: null,
      decodedToken: null,
    }
  }

  addUserListener(name, callback) {
    this.addListener(name, callback);
  }

  removeUserListener(name, callback) {
    this.removeListener(name, callback);
  }

  _actionsHandler(action) {
    switch (action.actionType) {
      case UserStoreConstants.USER_LOGIN:
        if (action.data && action.data.userName && action.data.routingId && action.data.roomName) {
          this._handleUserLogin(action.data.userName, action.data.routingId, action.data.roomName);
        } else {
          console.log('Received USER_LOGIN action with invalid data:');
          console.log(action);
        }
        break;

      case UserStoreConstants.USER_LEAVE_ROOM:
        this._handleUserLeaveRoom();
        break;
    }
  }

  _handleUserLogin(userName, routingId, roomName) {
    this.userInfo.userName = userName;
    this.userInfo.routingId = routingId;
    this.userInfo.roomName = roomName;
    let authApi = new AuthManager({'managementApiUrl': authUrl, 'appKey': appKey});
    authApi.anonymousLogin(this.userName, this._onLoginSuccess.bind(this), this._onLoginFailure.bind(this));
  }

  _handleUserLeaveRoom() {
    this.userInfo = {
      userName: null,
      routingId: null,
      roomName: null,
      accessToken: null,
      decodedToken: null,
    }
    this.emit(UserStoreConstants.USER_LEFT_ROOM_EVENT);
  }

  _onLoginSuccess(data) {
    this.userInfo.accessToken = data.Token;
    let authApi = new AuthManager({'managementApiUrl': authUrl, 'appKey': appKey});
    this.userInfo.decodedToken = authApi.decodeToken(data.Token);
    console.log(this.userInfo);
    this.emit(UserStoreConstants.USER_LOGGED_IN_EVENT);
  }

  _onLoginFailure(error) {
    this.emit(UserStoreConstants.USER_LOGIN_FAILED_EVENT, error);
  }

  get user() {
    return this.userInfo.userName;
  }

  get userRoutingId() {
    return this.userInfo.routingId;
  }

  get room() {
    return this.userInfo.roomName;
  }

  get token() {
    return this.userInfo.accessToken;
  }

  get domain() {
    return this.userInfo.decodedToken.payload['domain'];
  }
}

export default new UserStore();
