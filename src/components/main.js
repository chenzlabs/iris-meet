import React from 'react';
import MainVideo from './main-video';
import MeetToolbar from '../containers/meet-toolbar';
import HorizontalWrapper from './horizontal-wrapper';
import HorizontalBox from '../containers/horizontal-box';
import LoginPanel from '../containers/login-panel';
import UserActions from '../actions/user-actions';
import UserStore from '../stores/user-store';
import UserStoreConstants from '../constants/user-store-constants';
import VideoControlStore from '../stores/video-control-store';
import VideoControlStoreConstants from '../constants/video-control-store-constants';
import VideoControlActions from '../actions/video-control-actions';
import { withRouter } from 'react-router';
import withWebRTC, { LocalVideo, RemoteVideo, WebRTCConstants } from 'iris-react-webrtc';
import Config from '../../config.json';
import getQueryParameter from '../utils/query-params';
import validResolution from '../utils/verify-resolution';
import { getRoomId } from '../api/RoomId';
import './style.css'

const SeparateID = (props) => { return (<div>id {props.id}</div>); }
const SeparateVideo = (props) => { return (<video id={props.id} src={props.src} poster={props.poster} crossOrigin='anonymous' playsInline loop></video>); }
const SeparateImg = (props) => { return (<img id={props.id} src={props.src} crossOrigin='anonymous'></img>); }

export default withWebRTC(withRouter(class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showRoom: false,
            showUser: false,
            mainVideoConnection: {
                connection: null,
                type: '',
            },
            isVideoMuted: false,
            isVideoBarHidden: false,
            isToolbarHidden: false,
        }

        this.loginCallback = this._userLoggedIn.bind(this);
        this.loginFailedCallback = this._userFailedLogin.bind(this);
        this.mainVideoChangeCallback = this._onMainVideoChange.bind(this);
        this.onDominantSpeakerChanged = this._onDominantSpeakerChanged.bind(this);
        this.onLocalVideo = this._onLocalVideo.bind(this);
        this.onRemoteVideo = this._onRemoteVideo.bind(this);
        this.onParticipantLeft = this._onParticipantLeft.bind(this);


        this.timer = setTimeout(() => {
            console.log('inside setTimeOut(), constructor')
            this.setState({
                isToolbarHidden: true,
            });
        }, 10000);
    }

    componentDidMount() {
        UserStore.addUserListener(UserStoreConstants.USER_LOGGED_IN_EVENT, this.loginCallback);
        UserStore.addUserListener(UserStoreConstants.USER_LOGIN_FAILED_EVENT, this.loginFailedCallback);
        VideoControlStore.addVideoControlListener(VideoControlStoreConstants.VIDEO_CONTROL_MAIN_VIEW_UPDATED_EVENT, this.mainVideoChangeCallback);
        this.props.addWebRTCListener(WebRTCConstants.WEB_RTC_ON_DOMINANT_SPEAKER_CHANGED, this.onDominantSpeakerChanged);
        this.props.addWebRTCListener(WebRTCConstants.WEB_RTC_ON_LOCAL_VIDEO, this.onLocalVideo);
        this.props.addWebRTCListener(WebRTCConstants.WEB_RTC_ON_REMOTE_VIDEO, this.onRemoteVideo);
        this.props.addWebRTCListener(WebRTCConstants.WEB_RTC_ON_REMOTE_PARTICIPANT_LEFT, this.onParticipantLeft);
        const requestedResolution = getQueryParameter('resolution');
        console.log(requestedResolution);
        console.log('roomName: ' + this.props.params.roomname);
        let showRoom = false;
        let showUser = false;
        if (this.props.params.roomname === undefined) {
            // no room name specified in URL so show dialog
            // to ask for room name
            showRoom = true;
        }

        //Remove later:
        /*
        this.timer = setTimeout(() => {
          console.log('inside setTimeOut()');
          this.setState({
            isToolbarHidden: true,
          });
        }, 10000);
        */


        const userName = localStorage.getItem('irisMeet.userName');
        if (userName === null) {
            // we do not have user name stored so ask for user name
            showUser = true;
        }

        if (showRoom || showUser) {
            this.setState({
                showRoom,
                showUser,
            });
        } else {
            // we have both userName and roomName so login
            // we should also have routingId but just in case
            // we don't create one
            let routingId = null; //localStorage.getItem('irisMeet.routingId');
            if (routingId === null) {
                routingId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==='x'?r:(r&0x3)|0x8;return v.toString(16);});
                localStorage.setItem('irisMeet.routingId', routingId);
            }
            UserActions.loginUser(userName, routingId, this.props.params.roomname);
        }
    }

    componentWillUnmount() {
        this.props.removeWebRTCListener(WebRTCConstants.WEB_RTC_ON_DOMINANT_SPEAKER_CHANGED, this.onDominantSpeakerChanged);
        this.props.removeWebRTCListener(WebRTCConstants.WEB_RTC_ON_LOCAL_VIDEO, this.onLocalVideo);
        this.props.removeWebRTCListener(WebRTCConstants.WEB_RTC_ON_REMOTE_VIDEO, this.onRemoteVideo);
        this.props.removeWebRTCListener(WebRTCConstants.WEB_RTC_ON_REMOTE_PARTICIPANT_LEFT, this.onParticipantLeft);
        UserStore.removeUserListener(UserStoreConstants.USER_LOGGED_IN_EVENT, this.loginCallback);
        UserStore.removeUserListener(UserStoreConstants.USER_LOGIN_FAILED_EVENT, this.loginFailedCallback);
        VideoControlStore.addVideoControlListener(VideoControlStoreConstants.VIDEO_CONTROL_MAIN_VIEW_UPDATED_EVENT, this.mainVideoChangeCallback);
        this.setState({
            showRoom: false,
            showUser: false,
        }, () => {
            UserActions.leaveRoom();
            //this.endSession();
        });
    }

    _onLocalVideo(videoInfo) {
        console.log('NUMBER OF LOCAL VIDEOS: ' + this.props.localVideos.length);
        if (this.props.localVideos.length > 0) {
            VideoControlActions.changeMainView('local', this.props.localVideos[0].video.index);
        }
    }

    _onRemoteVideo(videoInfo) {
        console.log('NUMBER OF REMOTE VIDEOS: ' + this.props.remoteVideos.length);
        if (this.props.remoteVideos.length === 1) {
            VideoControlActions.changeMainView('remote', this.props.remoteVideos[0].video.index);
        }
    }

    _onParticipantLeft(id) {
        console.log('Remote participant left: ' + id);
        if (this.props.remoteVideos.length === 0) {
            if (this.props.localVideos.length > 0) {
                // no participants so go back to local video
                console.log('Remote participant back to local');
                VideoControlActions.changeMainView('local', this.props.localVideos[0].video.index);
            }
        }

        if (this.state.mainVideoConnection.connection &&
            this.state.mainVideoConnection.connection.track &&
            this.state.mainVideoConnection.connection.track.getParticipantId() === id) {
            if (this.props.localVideos.length > 0) {
                // if the participant who left was on main screen replace it with local
                // video
                VideoControlActions.changeMainView('local', this.props.localVideos[0].video.index);
            }
        }
    }

    _onDominantSpeakerChanged(dominantSpeakerEndpoint) {
        console.log('DOMINANT_SPEAKER_CHANGED: ' + dominantSpeakerEndpoint);
        //let participant = track.getParticipantId();
        //let baseId = participant.replace(/(-.*$)|(@.*$)/,'');
        const matchedConnection = this.props.remoteVideos.find((connection) => {
            const participantId = connection.track.getParticipantId();
            console.log('participantId: ' + participantId);
            const endPoint = participantId.substring(participantId.lastIndexOf("/") + 1);
            return endPoint === dominantSpeakerEndpoint;
        });

        console.log('FOUND DOMINANT SPEAKER: ');
        console.log(matchedConnection);
        if (matchedConnection) {
            VideoControlActions.changeMainView('remote', matchedConnection.video.index);
        } else if (this.props.localVideos.length > 0) {
            // no remote participants found so assume it is local speaker
            VideoControlActions.changeMainView('local', this.props.localVideos[0].video.index);
        }
    }

    _onMainVideoChange() {
        console.log('Video type: ' + VideoControlStore.videoType);
        console.log('Video index: ' + VideoControlStore.videoIndex);

        if (VideoControlStore.videoType === 'local') {
            const mainConnection = this.props.localVideos.find((connection) => {
                return connection.video.index === VideoControlStore.videoIndex;
            });
            this.setState({
                threeSixty: false,
                mainVideoConnection: {
                    connection: mainConnection,
                    type: 'local',
                }}, () => {
                    console.log('MainVideo: local');
                });
        } else 
        if (VideoControlStore.videoType === 'separate') {
            var id = VideoControlStore.videoIndex;
            this.setState({
                threeSixty: true,
                mainVideoConnection: {
                    id: id,
                    type: 'separate',
                }}, () => {
                    console.log('MainVideo: separate:' + id);
                });
        } else {
            const mainConnection = this.props.remoteVideos.find((connection) => {
                return connection.video.index === VideoControlStore.videoIndex;
            });
            this.setState({
                threeSixty: false,
                mainVideoConnection: {
                    connection: mainConnection,
                    type: 'remote',
                }}, () => {
                    console.log('MainVideo: remote:' + mainConnection.baseId);
                });
        }
    }

    _userLoggedIn() {
        this.setState({
            showRoom: false,
            showUser: false,
        }, () => {
            let requestedResolution = getQueryParameter('resolution');
            console.log(requestedResolution);
            if (!validResolution(requestedResolution)) {
                console.log('Requested resolution is not valid.  Switching to default hd.');
                requestedResolution = 'hd';
            }
            getRoomId(UserStore.room, UserStore.token)
            .then((response) => {
                console.log(response);
                const roomId = response.room_id;
                this.props.initializeWebRTC(UserStore.user, UserStore.userRoutingId,
                  roomId, UserStore.domain.toLowerCase(),
                  {
                      eventManagerUrl: Config.eventManagerUrl,
                      notificationServer: Config.notificationServer },
                    UserStore.token,
                    requestedResolution,
                    true,
                    true
                  );
            })
        });
    }

    _userFailedLogin(error) {
        // TODO: login error handler
        console.log('Login failure: ');
        console.log(error);
    }

    _onLoginPanelComplete(e) {
        e.preventDefault();
        //e.stopPropagation();
        let routingId = null; //localStorage.getItem('irisMeet.routingId');
        if (routingId === null) {
            routingId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==='x'?r:(r&0x3)|0x8;return v.toString(16);});
            localStorage.setItem('irisMeet.routingId', routingId);
        }
        const userName = this.refs.loginpanel.userName ? this.refs.loginpanel.userName : localStorage.getItem('irisMeet.userName');
        const roomName = this.refs.loginpanel.roomName ? this.refs.loginpanel.roomName : this.props.params.roomname;
        localStorage.setItem('irisMeet.userName', userName);
        const hostname = window.location.origin;
        window.location.assign(hostname + '/' + roomName);
    }

    _onLocalAudioMute(isMuted) {
        this.props.onAudioMute();
    }

    _onLocalVideoMute(isMuted) {
        console.log('video muted: ' + isMuted);
        this.setState({
            isVideoMuted: isMuted,
        }, () => {
            this.props.onVideoMute();
        });
    }

    _onExpandHide() {
        this.setState({
            isVideoBarHidden: !this.state.isVideoBarHidden,
        });
    }

    _onThreeSixty() {
        this.setState({
            threeSixty: !this.state.threeSixty,
        });
    }

    _onMouseMove() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.state.isToolbarHidden === false) {
            this.timer = setTimeout(() => {
                this.setState({
                    isToolbarHidden: true,
                });
            }, 10000);
        } else {
            this.setState({
                isToolbarHidden: false,
            }, () => {
                this.timer = setTimeout(() => {
                    this.setState({
                        isToolbarHidden: true,
                    });
                }, 10000);
            });
        }
    }

    _onHangup() {
        this.props.endSession();
        const hostname = window.location.href;
        const urlString = hostname.substring(0, hostname.lastIndexOf("/"));
        window.location.assign(urlString);
    }

    render() {
        return (
          <div onMouseMove={this._onMouseMove.bind(this)}>
          <a-scene>
          <a-camera wasd-controls-enabled="false">
  <a-entity cursor="fuse: true; fuseTimeout: 2000"
            position="0 0 -1"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: blue; shader: flat">
        <a-animation begin="mouseleave" easing="ease-in" attribute="scale" dur="100"
               fill="forwards" from="0.2 0.2 0.2" to="1 1 1"></a-animation>
        <a-animation begin="click" easing="ease-in" attribute="scale" dur="100"
               fill="forwards" from="1 1 1" to="0.2 0.2 0.2"></a-animation>
        <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale" dur="2000"
               fill="forwards" from="1 1 1" to="0.2 0.2 0.2"></a-animation>
  </a-entity>
          </a-camera>
          <a-entity id="right-controller" controller-cursor-if-present
            oculus-touch-controls="hand:right"
            vive-controls="hand:right"
            daydream-controls="hand:right"
            gearvr-controls="hand:right"></a-entity>
          <a-entity id="left-controller" controller-cursor-if-present
            oculus-touch-controls="hand:left"
            vive-controls="hand:left"
            daydream-controls="hand:left"
            gearvr-controls="hand:left"></a-entity>
          {this.props.localVideos.length > 0 ?
            <MeetToolbar
              isHidden={this.state.isToolbarHidden}
              onMicrophoneMute={this._onLocalAudioMute.bind(this)}
              onCameraMute={this._onLocalVideoMute.bind(this)}
              onExpandHide={this._onExpandHide.bind(this)}
              onHangup={this._onHangup.bind(this)}
              onThreeSixty={this._onThreeSixty.bind(this)}
        /> : null}
      <MainVideo threeSixty={this.state.threeSixty}>
        { this.state.mainVideoConnection.type === 'remote' ?
          <RemoteVideo
            video={this.state.mainVideoConnection.connection.video}
            audio={this.state.mainVideoConnection.connection.audio}
          />
        : null}
	{ this.state.mainVideoConnection.type === 'local' ?
          <LocalVideo
            video={this.state.mainVideoConnection.connection.video}
            audio={this.state.mainVideoConnection.connection.audio}
          />
        : null }
	{ this.state.mainVideoConnection.type === 'separate' ?
          <SeparateID id={this.state.mainVideoConnection.id} />
        : null }
      </MainVideo>
      <HorizontalWrapper isHidden={this.state.isVideoBarHidden}>
          {this.props.localVideos.map((connection) => {
            console.log('LOCAL CONNECTION');
            console.log(connection);
            return (
              <HorizontalBox
                key={connection.video.index}
                type='local'
                id={connection.video.index}
              >
                <LocalVideo key={connection.video.index} video={connection.video} audio={connection.audio} />
              </HorizontalBox>
            );
          })}
          {this.props.remoteVideos.map((connection) => {
            console.log('REMOTE CONNECTION');
            console.log(connection);
            console.log(connection.track.getParticipantId());
            return connection.video ? (
                <HorizontalBox
                  key={connection.video.index}
                  type='remote'
                  id={connection.video.index}
                >
                  <RemoteVideo key={connection.video.index} video={connection.video} audio={connection.audio} />
                </HorizontalBox>
              ) : null;
          })}
	  <HorizontalBox key='panoVideo' type='separate' id='panoVideo'>
	    <SeparateVideo
              src='https://videos.littlstar.com/e0ce24f3-f6e4-46ef-8c9b-f82b439c531f/web.mp4'
              poster='https://chenz.org/mc-aframe360player/magicians-brakebills-vlcsnap-2017-01-31-14h44m31s535.png'
              id='panoVideo' />
          </HorizontalBox>
          <HorizontalBox key='panoImage' type='separate' id='panoImage'>
            <SeparateImg src='https://chenz.org/R0010070.JPG' id='panoImage' />
          </HorizontalBox>
      </HorizontalWrapper>
      {this.state.showUser || this.state.showRoom ?
        <LoginPanel
          ref='loginpanel'
          showRoom={this.state.showRoom}
          showUser={this.state.showUser}
          onAction={this._onLoginPanelComplete.bind(this)}
        /> : null}
      </a-scene>
      </div>
    );
  }
}));
