import React, { Component } from 'react';
import { ReactMic } from 'react-mic';
import "./Realtime.css";

class Realtime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blobURL: null,
      isRecording: false,
      isPaused: false,
      blobObj: null,
      blobObjs: [],
      blobNumber: 0,
    }
    this.startOrPauseRecording = this.startOrPauseRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.onStop = this.onStop.bind(this);
    this.uploadBlob = this.uploadBlob.bind(this);
    this.onData = this.onData.bind(this);
  }

  startOrPauseRecording() {
    const { isPaused, isRecording } = this.state;

    if (isPaused) {
      this.setState({ isPaused: false })
    } else if(isRecording) {
      this.setState({ isPaused: true })
    } else {
      this.setState({ isRecording: true })
    }
  }

  stopRecording() {
    this.setState({ isRecording: false });
  }
  //
  // onSave=(blobObject) => {
  // }

  // onStart=() => {
  //   console.log('You can tap into the onStart callback');
  // }

  onData(recordedBlob) {
    const blobInterval = 100;
    console.log(recordedBlob);
    this.setState(prevState => ({
      blobNumber: prevState.blobNumber + 1,
      blobObjs: prevState.blobObjs.concat(recordedBlob),
    }));
    if (this.state.blobNumber % blobInterval === 0) {
      console.log(this.state.blobObjs);
      this.uploadBlob(this.state.blobNumber, blobInterval);
    }
  }

  onStop(blobObject) {
    this.setState({
      blobURL: blobObject.blobURL,
      blobObj: blobObject.blob,
     });
  }

  uploadBlob(currBlobNum, blobInterval) {
    const req = new XMLHttpRequest();
    const formData = new FormData();
    console.log("Uploading the blob ending at: " + currBlobNum);

    // first blob is a header blob that must be prepended for the Blob slice to be recognized as valid
    var combinedBlob = (currBlobNum === blobInterval) ?
                        new Blob(this.state.blobObjs.slice(0, currBlobNum), {type:"audio/webm;codecs=opus"}) :
                        new Blob([this.state.blobObjs[0]].concat(this.state.blobObjs.slice(currBlobNum - blobInterval, currBlobNum)), {type: "audio/webm;codecs=opus"}
                      );
    console.log(combinedBlob);
    formData.append("file", combinedBlob, "streaming_audio.wav");
    req.open("POST", "http://localhost:5000/convert_and_parse");
    req.send(formData);
    this.props.startLoading();
    req.onload = () => this.props.handleUpload("streaming_audio.wav", JSON.parse(req.response)["text"]);
  }

  render() {
    return (
      <div className="record">
        <br />
        <br />
        <ReactMic
          className="oscilloscope"
          record={this.state.isRecording}
          pause={this.state.isPaused}
          backgroundColor="white"
          visualSetting="sinewave"
          audioBitsPerSecond= {128000}
          onStop={this.onStop}
          onStart={this.onStart}
          onSave={this.onSave}
          onData={this.onData}
          width="300"
          strokeColor="#000000" />

        <br />
        <button
          className="btn btn-info"
          onClick={this.startOrPauseRecording}>
          { (this.state.isRecording && !this.state.isPaused )?
            <img alt="Pause" className="Icon" src="baseline-pause-24px.svg" /> :
              <img alt="Record" className="Icon" src="baseline-mic-24px.svg" /> }
        </button>
        <button
          className="btn btn-info"
          disabled={!this.state.isRecording}
          onClick={this.stopRecording}>
          <img
            alt="Stop recording"
            className="Icon"
            src="baseline-stop-24px.svg"
          />
        </button>
        <a href={this.state.blobURL} download="audio.wav">
          <button className="btn btn-info" disabled={!this.state.blobURL}>
            <img
              alt="Download"
              className="Icon"
              src="baseline-save-24px.svg"
            />
          </button>
        </a>
      </div>
    );
  }
}

export default Realtime
