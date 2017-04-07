import React from 'react';

export default class MainVideo extends React.Component {
    constructor(props) {
        super(props)
    }

/*
<video autoPlay="1" src="assets/SampleVideo_1280x720_1mb.mp4"></video>
*/

    componentDidUpdate() {
        console.log("================ in componentDidUpdate =========================");
        this.props.children.forEach(c => { if (c && c.props.video) {
            console.log("******************* VIDEO *********************");

            if (this.script) {
                if (this.script.parentElement) { this.script.parentElement.removeChild(this.script); }
                delete this.script;
            }

            if (!this.script) {
                // now that we know there will be a video,
                // we need to get script injected to grab the reference to the one that will be in <a-assets>
                var script = this.script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                if (this.props.threeSixty) {
                    script.innerHTML = `
console.log('************* SCRIPT threeSixty ***************');
var sceneEl = document.querySelector('a-scene');
sceneEl.play();

function setMaterialSrc(target) {
    // FIXME: only clear texture cache if the video source is actually changing,
    // else it could kill currently playing video
    sceneEl.systems.material.clearTextureCache(); 
    document.querySelector('a-scene a-sky').setAttribute('material', 'src', target);
}

function id2selector(id) { return ('1234567890'.indexOf(id.substring(0,1)) >= 0 ? '#\\3' : '#') + id; }

var video = document.querySelector('.main-video video');
if (video) {
    if (!video.paused) { setMaterialSrc(id2selector(video.id)); }
    video.addEventListener('playing', (evt) => { setMaterialSrc(id2selector(evt.target.id)); });
}
`;
                } else {
                    script.innerHTML = `
console.log('************* SCRIPT not threeSixty ***************');
var sceneEl = document.querySelector('a-scene');
sceneEl.pause();
`;
                }

                if (this.instance) { this.instance.appendChild(script); }
            }
        }});
        console.log("================ out componentDidUpdate =========================");
    }

    render() {
        return (
            <div className="main-video" ref={(el) => { this.instance = el; }}>
			  <a-scene embedded style={this.props.threeSixty ? {zIndex: 1} : {zIndex: 0}}>
				<a-sky rotation="0 -90 0"></a-sky>
			  </a-scene>
                  {this.props.children}
            </div>
        );

    }
}
