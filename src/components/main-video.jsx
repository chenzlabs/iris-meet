import React from 'react';

export default class MainVideo extends React.Component {
    constructor(props) {
        super(props)
		this.state = this.state || {};
		this.state.threesixty = true;
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
				this.script.parentElement.removeChild(this.script);
				delete this.script;

				if (this.state.threesixty) {
					// FIXME: only clear texture cache if the video source is actually changing,
					// else it could kill currently playing video
					console.log("******************* clearTextureCache *********************");
					var sceneEl = document.querySelector('a-scene');
					if (sceneEl) { sceneEl.systems.material.clearTextureCache(); }
				}
			}

			if (this.state.threesixty && !this.script) {
			    console.log("******************* create script *********************");
				// now that we know there will be a video,
				// we need to get script injected to grab the reference to the one that will be in <a-assets>
				var script = this.script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.innerHTML = `
console.log('************* SCRIPT ***************');
var video = document.querySelector('a-scene video');
if (video) {
    console.log('************* VIDEO, ADDING PLAYING LISTENER ***************');
	video.addEventListener('playing', (evt) => {
		console.log('************* VIDEO PLAYING ***************');
		document.querySelector('a-scene a-sky').setAttribute('material', 'src', evt.target);
	});
} else {
    console.log('************* NO VIDEO ***************');
}
`;
				this.instance.appendChild(script);
			}

		}});
	    console.log("================ out componentDidUpdate =========================");	
	}

    render() {
      if (!this.state.threesixty)
        return (
			<div className="main-video">
				{this.props.children}
			</div>
		);

        return (
            <div className="main-video" ref={(el) => { this.instance = el; }}>
			  <a-scene embedded debug>
			    <a-assets>
                  {this.props.children}
			    </a-assets>
				<a-sky rotation="0 -90 0"></a-sky>
			  </a-scene>
            </div>
        );

    }
}
