import React, { Component } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Upload from "../upload/Upload";
import Record from "../record/Record";
import Realtime from "../realtime/Realtime"
import "./Input.css";

class Input extends Component {
  render() {
    return(
      <HashRouter>
        <div className="cardWrapper">
          <ul className="header">
            <li><NavLink exact to="/">Upload</NavLink></li>
            <li><NavLink to="/record">Record</NavLink></li>
            <li><NavLink to="/realtime">Realtime</NavLink></li>
          </ul>
          <div className="content">
            <Route
              exact path="/"
              render={() => <Upload {...this.props} /> }
            />
            <Route
              path="/record"
              render={() => <Record {...this.props} /> }
            />
            <Route
              path="/realtime"
              render={() => <Realtime {...this.props} /> }
            />
          </div>
        </div>


      </HashRouter>
    )
  }
}

export default Input;
