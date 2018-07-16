import React, { Component } from 'react';
import GraphSimilarity from "./GraphSim.js"
import data from "./data/l-true-cheat"


class App extends Component {
  render() {
    return (
      <GraphSimilarity graphL={data.graphL} graphR={data.graphR} graphSim={data.sim} alignments={data.alignments}/>
  );
  }
}
export default App;
