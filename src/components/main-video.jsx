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
			    console.log("******************* delete script *********************");
				if (this.script.parentElement) { this.script.parentElement.removeChild(this.script); }
				delete this.script;
			}

			if (!this.script) {
			    console.log("******************* create script *********************");
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

var video = document.querySelector('.main-video video');
if (video) {
    console.log('************* VIDEO, ADDING PLAYING LISTENER ***************');
	function setMaterialSrc(target) {

				// FIXME: only clear texture cache if the video source is actually changing,
				// else it could kill currently playing video
				console.log("******************* clearTextureCache *********************");
				sceneEl.systems.material.clearTextureCache(); 

		console.log('************* setMaterialSrc ***************');
		document.querySelector('a-scene a-sky').setAttribute('material', 'src', '#' + document.querySelector('.main-video video').id);
	}

	if (!video.paused) { 
		console.log('************* VIDEO NOT PAUSED ***************');
	    setMaterialSrc('#' + video.id); 
	}

	video.addEventListener('playing', (evt) => {
		console.log('************* VIDEO PLAYING ***************');
		setMaterialSrc('#' + evt.target.id);
	});
} else {
    console.log('************* NO VIDEO ***************');
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
