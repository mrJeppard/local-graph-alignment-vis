import React, { Component } from 'react';
import GraphSimilarity from "./GraphSim.js"
import data from "./data/t-true-cheat"


class App extends Component {
  render() {
    console.log(data)
    return (
      <GraphSimilarity graphL={data.graphL} graphR={data.graphR} graphSim={data.sim} alignments={data.alignments}/>
  );
  }
}
export default App;
