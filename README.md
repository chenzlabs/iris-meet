# iris-meet
Video conferencing reference client for Iris Platform

## Install
* git clone git@github.com:robjsliwa/iris-meet.git
* cd iris-meet
* npm install
* download Iris JS WebRTC SDK 3.0.2.18 or later to separate folder
* copy iris-rtc-js-sdk.js from the folder where you downloaded Iris JS WebRTC to iris-meet/public
* copy sample.config.json to config.json and provide appropriate URLs.  
* open another terminal and run 'gulp sass buildonce'
* to start the web server run: npm start

## Test on local system
To test on local system open Chrome to http://localhost:8080 and once you get local video
open another browser tab and copy paste url from the first tab.  It should have
the following format: http://localhost:8080/<roomname>

At this point you should have video connection between two tabs.

## Usage
Enter user name and conference room name.  Once the conference is created
copy the url and send it with your invite.  Other participants can simply click
on provided url to join the meeting.
