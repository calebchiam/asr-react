import React, { Component } from 'react';
import { ReactMic } from 'react-mic';

class Realtime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blobURL: null,
      isRecording: false,
      isPaused: false,
      blobObj: null,
      count: 0,
      intermediate: true,
      firstBlob: true,
    }
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.uploadBlob = this.uploadBlob.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onData = this.onData.bind(this);
    this.stopAndContinueRecording = this.stopAndContinueRecording.bind(this);
  }

  startRecording() {
    this.setState({
      isRecording: true,
    });
    if (!this.state.intermediate) {
      this.setState({
        intermediate: true,
      })
    }
  }

  stopRecording() {
    this.setState({
      isRecording: false,
      intermediate: false,
    });
  }

  stopAndContinueRecording() {
    this.setState({ isRecording: false });
  }

  onData(recordedBlob) {
    // console.log('chunk of real-time data is: ', recordedBlob);
    // console.log('curr blob no. is: ', this.state.count);
    this.setState(prevState => ({
      count: prevState.count + 1,
    }), ()=>{
      if (this.state.count % 60 === 0) {
        console.log(this.state.count);
        this.stopAndContinueRecording();
      }
    });
  }

  onStop(blobObject) {
    console.log("stopping recording");
    this.setState({
      blobURL : blobObject.blobURL,
      blobObj: blobObject.blob,
    }, () => {
      console.log("Proceed to upload");
      this.uploadBlob();
      if (this.state.intermediate) {
        console.log("Proceed to resume recording");
        this.startRecording();
      }
    });
  }

  uploadBlob() {
    const req = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", this.state.blobObj, "recorded_audio.wav");
    req.open("POST", "http://localhost:5000/convert_and_parse");
    req.send(formData);
    if (this.state.firstBlob) {
      this.props.startLoading();
      this.setState({
        firstBlob: false,
      })
    }
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
          backgroundColor="white"
          visualSetting="sinewave"
          audioBitsPerSecond= {128000}
          onStop={this.onStop}
          onSave={this.onSave}
          onData={this.onData}
          width="300"
          strokeColor="#000000" />

        <br />
        <button
          className="btn btn-info"
          disabled={this.state.isRecording}
          onClick={this.startRecording}
          >
            <img alt="Record" className="Icon" src="baseline-mic-24px.svg" />
        </button>
        <button
          className="btn btn-info"
          disabled={!this.state.isRecording}
          onClick={this.stopRecording}
          >
          <img
            alt="Stop recording"
            className="Icon"
            src="baseline-stop-24px.svg"
          />
        </button>
        <button className="btn btn-info"
                disabled={!this.state.blobURL}
                onClick={this.props.clearText}>
          <img
            alt="Refresh"
            className="Icon"
            src="baseline-refresh-24px.svg"
          />
        </button>
      </div>
    );
  }
}

export default Realtime
