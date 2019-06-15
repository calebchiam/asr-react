import React, { Component } from "react";
import "./Interface.css";
import Input from "../input/Input"
import Output from "../output/Output"

class Interface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audio_file: "",
      text: "",
      loading: false,
    };
    this.handleUpload = this.handleUpload.bind(this);
    this.startLoading = this.startLoading.bind(this);
  };

  handleUpload(audio, text) {
    this.setState(prevState => ({
      audio_file: audio,
      text: prevState.text + " " + text,
      loading: false,
    }))
  };

  startLoading() {
    this.setState({
      audio_file: "",
      text: "",
      loading: true,
    })
  }

  render() {
    return (
      <div className="Interface">
        <div className="Card">
          <Input handleUpload={(audio, text) => this.handleUpload(audio, text)} startLoading={() => this.startLoading()}/>
        </div>
        <div className="Card">
          <Output audio_file={this.state.audio_file} text={this.state.text} loading={this.state.loading}/>
        </div>
      </div>
    )
  }
}
export default Interface
