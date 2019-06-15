import React, { Component } from 'react';
import { ReactMic } from 'react-mic';
import "./Record.css";

class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blobURL: null,
      isRecording: false,
      isPaused: false,
      blobObj: null,
    }
    this.startOrPauseRecording = this.startOrPauseRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.onStop = this.onStop.bind(this);
    this.uploadBlob = this.uploadBlob.bind(this);
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
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  onStop(blobObject) {
    this.setState({
      blobURL : blobObject.blobURL,
      blobObj: blobObject.blob,
     });
  }

  uploadBlob() {
    const req = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", this.state.blobObj, "recorded_audio.wav");
    req.open("POST", "http://localhost:5000/convert_and_parse");
    req.send(formData);
    this.props.startLoading();
    req.onload = () => this.props.handleUpload("recorded_audio.wav", JSON.parse(req.response)["text"]);
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
        <div>
            {(this.state.blobURL) ? <audio ref="audioSource" controls="controls" controlsList="nodownload"
              src={this.state.blobURL} /> : ""}
        </div>

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
        <br />
        <a href={this.state.blobURL} download="audio.wav">
          <button className="btn btn-info" disabled={!this.state.blobURL}>
            <img
              alt="Download"
              className="Icon"
              src="baseline-save-24px.svg"
            />
          </button>
        </a>

        <button className="btn btn-info" disabled={!this.state.blobURL} onClick={this.uploadBlob}>
          <img
            alt="Upload"
            className="Icon"
            src="baseline-done-24px.svg"
          />
        </button>
      </div>
    );
  }
}

export default Record
