/**
 * Created by duncan on 5/8/18.
 */

import React, {Component} from 'react';
import {Graph} from "./Graph.js"
import {moveNode, moveNodes} from "./moveUtil"
import {toSVG} from "transformation-matrix"
import {AutoSizer} from 'react-virtualized';

class GraphSimilarity extends React.Component {

    constructor(props) {
        super(props)
        const {graphL, graphR, graphSim, alignments} = props
        const nNodesL = graphL.nodes.length
        const nNodesR = graphR.nodes.length
        const graphLHighlight = Array(nNodesL).fill(0)
        const graphRHighlight = Array(nNodesR).fill(0)
        this.unHighLight = this.unHighLight.bind(this)
        this.toggleLinking = this.toggleLinking.bind(this)
        const bad = 6
        const alignmentview = 0
        console.log("ali", alignments[alignmentview])
        let alignment = alignments[alignmentview].alignment
        const score = alignments[alignmentview].score
        console.log(graphL["nodes"], graphR["nodes"])

        const emptyalignment = {
            score:1,
            alignment:[]
        }

        alignment = this.alignmentSort(alignment, graphL["nodes"], graphR["nodes"])
        this.alignments = alignments
        this.aligniter = alignmentview
        this.state = {
            nNodesL: nNodesL,
            nNodesR: nNodesR,
            graphLHighlight: graphLHighlight,
            graphRHighlight: graphRHighlight,
            graphLNodes: graphL["nodes"],
            graphRNodes: graphR["nodes"],
            graphLEdges: graphL["edges"],
            graphREdges: graphR["edges"],
            graphSim: graphSim,
            graphActionLinked: true,
            zoomable: true,
            moverKey: 0,
            absolutepos: 1,
            zoomL: {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0},
            zoomR: {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0},
            sizeL: {height:0, width:0},
            sizeR: {height:0, width:0},
            alignment : {
                score: score,
                alignment:  alignment
                /*
                alignment: [
                    {nodeIdL: 0, nodeIdR:0},
                    {nodeIdL: 0, nodeIdR:1},
                    {nodeIdL: 0, nodeIdR:2},
                    {nodeIdL: 1, nodeIdR:2},
                    {nodeIdL: 1, nodeIdR:3},
                    {nodeIdL: 2, nodeIdR:4},
                    {nodeIdL: 2, nodeIdR:5},
                    {nodeIdL: 3, nodeIdR:3}
                ]
                */
            }
        }


        this.waysToMove = [this.moveIndependent];
        this.zoomFactorL = 1
        this.zoomFactorR = 1
        this.node = {x:graphL["nodes"][0].x, y: graphL["nodes"][0].y}
        this.nodeTrans = {x:graphL["nodes"][0].x, y: graphL["nodes"][0].y}
        this.prevPoint = {x:0, y:0}

    }

    nextAlignment = ()=>{
        this.aligniter +=1
        const newAl = this.alignments[this.aligniter % this.alignments.length]
        this.setState({alignment: newAl})
    }

    centroid(nodes){
        let cx = 0,
        cy = 0
        nodes.map( (nodes)=>{
            cx= cx+ Number(nodes.x)
            cy= cy+Number(nodes.y)
        })
        cx = cx/ nodes.length
        cy = cy/ nodes.length
        console.log(cx, cy, nodes.length)
        return {x: cx, y:cy}

    }

    rotate5degree = (LOrR, height, width)=>{
        const radians = 0.261799
        const stateKey = `graph${LOrR}Nodes`
        const nodes = this.state[stateKey].slice()
        const offset = this.centroid(nodes)
        function transform5(x,y){
            const a = Math.cos(radians),
             b = Math.sin(radians),
                c= -Math.sin(radians),
                d= Math.cos(radians),
                e= (offset.x* (d -1)) - (offset.y*(b)) ,
                f= (offset.x*(b)) + offset.y*(d-1)
                return { x: (a*x) + (c*y) + e, y: (b*x) + (d*y) + f}
        }
        const newNodes = nodes.map( (node, i)=> {
            let newNode = Object.assign({}, node)
            const {x, y} = transform5(newNode.x, newNode.y)
            newNode.x = x
            newNode.y = y
            return newNode

        })
        this.setState({[stateKey]: newNodes})

    }

    alignmentSort(alignment, graphLNodes, graphRNodes){
        alignment.sort((n1, n2) => {
                console.log(n2.nodeIdL, graphLNodes[n2.nodeIdL])
                let n = graphLNodes[n1.nodeIdL].y - graphLNodes[n2.nodeIdL].y
                if (n !== 0){
                    return n
                }
                n = graphLNodes[n1.nodeIdL].x - graphLNodes[n2.nodeIdL].x
                if(n !== 0){
                    return n
                }
                n = graphRNodes[n1.nodeIdR].y - graphRNodes[n2.nodeIdR].y
                if (n !== 0){
                    return n
                }
                return graphRNodes[n1.nodeIdR].x - graphRNodes[n2.nodeIdR].x
            }
        )
        return alignment
    }

    handleNodeClick = (nodeId, LOrR) => {

        const {nNodesL, nNodesR, graphSim: gSim, graphRHighlight, graphLHighlight} = this.state
        const    otherHighLight = LOrR === 'R' ? gSim["graphR"][nodeId].slice() : gSim["graphL"][nodeId].slice()

         const highlighted = LOrR === 'L' ? graphLHighlight : graphRHighlight

         const {onGraph: nodes}  = this.dataForMove()
         if (highlighted[nodeId] === 1) {
             !this.moved ? this.unHighLight() : undefined
             this.moved = false
         } else {
             const thisHighlight = LOrR === 'L' ? Array(nNodesL).fill(0) : Array(nNodesR).fill(0)

             thisHighlight[nodeId] = 1
             const state = LOrR === 'L' ? {graphRHighlight: otherHighLight, graphLHighlight: thisHighlight} : {graphLHighlight: otherHighLight, graphRHighlight: thisHighlight}
             !this.moved ? this.setState(state) : undefined
             this.moved = false
         }
    }

    handleMouseDown = (e,i, LOrR) => {
        this.coords = {
            x: e.pageX,
            y: e.pageY
        };
        this.side = LOrR
        this.grabbed = i
        const moveFunc = this.waysToMove[this.state.moverKey]
        document.addEventListener('mousemove', moveFunc)
        this.setState({zoomable: false})
    }

    handleMouseUp = () => {
        this.grabbed=-1
        const moveFunc = this.waysToMove[this.state.moverKey]
        document.removeEventListener('mousemove', moveFunc)
        this.coords = {};
        this.setState({zoomable: true})
    }
    
    onLeft(){
        return (this.side === 'L')
    }
    
    dataForMove(){
        /*
        A get function returning necessary data to move the graph.
        {onGraph: copy of the graph the user is interacting with.
        linkedGraph: reference to the graph adjacent to onGraph.
        graphSim: the graph matrix of }
         */
        const onLeft = this.onLeft(),
            graphsLinked = this.state.graphActionLinked,
            onGraph = onLeft ? this.leftGraphData().slice() : this.rightGraphData().slice(),
            zoomFactor = onLeft ? this[`zoomFactorL`] : this[`zoomFactorR`],
            linkedGraph = onLeft ? this.rightGraphData() : this.leftGraphData(),
            graphSim = graphsLinked ?
                onLeft ? this.state.graphSim.graphL[this.grabbed] : this.state.graphSim.graphR[this.grabbed] :
                undefined,
            onGraphOrig = graphsLinked ?
                onLeft ? this.leftGraphData() : this.rightGraphData() :
                undefined


        return ( {
            onGraph,
            linkedGraph,
            graphSim,
            onGraphOrig,
            zoomFactor
        })
    }

    leftGraphData(){
        const {graphLNodes: nodes} = this.state
        return nodes
    }

    rightGraphData(){
        const {graphRNodes: nodes} = this.state
        return nodes
    }

    moveIndependent = (e) => {
        let {
                onGraph,
                linkedGraph,
                graphSim,
                onGraphOrig,
                zoomFactor,
                toMove
            } = this.dataForMove(),
            grabbedNode = onGraph[this.grabbed]

        const xDiff = (this.coords.x - e.pageX) / zoomFactor,
            yDiff = (this.coords.y - e.pageY) / zoomFactor
        this.coords.x = e.pageX
        this.coords.y = e.pageY

        // If the user hasn't moved a node then we want the interaction to look
        // like a click. Variable is accessed in mouseUp/Down event functions.
        this.moved = this.moved || xDiff || yDiff ? true : false

        const movedNode = moveNode(grabbedNode, {xDiff, yDiff})
        onGraph[this.grabbed] = movedNode

        if (this.state.graphActionLinked) {
            const linkedNodesToMove = graphSim.map(g=>g > .05);
            linkedGraph = moveNodes(
                linkedGraph,
                linkedNodesToMove,
                {xDiff, yDiff}
            )
            
        }

        const state = this.onLeft() ? {
            graphLNodes: onGraph,
            graphRNodes: linkedGraph
        } : {graphLNodes: linkedGraph, graphRNodes: onGraph}

        this.setState(state)
    }

    unHighLight = () => {
        this.setState({
            graphRHighlight: Array(this.state.nNodesR).fill(0),
            graphLHighlight: Array(this.state.nNodesL).fill(0)
        })
    }

    trackValue = (valueEvent, LOrR) => {
        let zoom = {a: valueEvent.a, b: valueEvent.b, c: valueEvent.c, d: valueEvent.d, e:valueEvent.e, f: valueEvent.f}
        this[`zoomFactor${LOrR}`] = zoom.a

        this.setState({[`zoom${LOrR}`] : zoom})
    }

    trackResize(e, LOrR){
        const size = e
        this.setState(
            {[`size${LOrR}`]: size}
        )
    }

    toggleLinking = () =>{
        const graphActionLinked = !this.state.graphActionLinked
        this.setState({graphActionLinked})
    }

    renderDivider() {
        const color = this.state.graphActionLinked ? "#2e5e2c" : "#303830"
        return <Divider color={color} linkMaps={this.toggleLinking}/>
    }

    renderOverlay(LOrR){

        //const x = this.state.absolutepos
        const nodes = this.state[`graph${LOrR}Nodes`]
        const nodesL = this.state[`graphLNodes`]
        const nodesR = this.state[`graphRNodes`]

        let indecies = new Array(nodes.length)
        indecies = indecies.map((a, i)=>i)

        const other = LOrR == 'L' ? "R" : "L"

        const aligned = this.alignmentSort(this.state.alignment.alignment, nodesL, nodesR)

        const zoom = this.state[`zoom${LOrR}`]
        const size = this.state[`size${LOrR}`]
        const {a, b, c, e, d, f} = zoom
        let offset = LOrR == 'L' ? 0 : 21
        const circles = aligned.map((al, i)=>{
            return (
                <circle cx={Number(nodes[al[`nodeId${LOrR}`]].x) + offset} cy={nodes[al[`nodeId${LOrR}`]].y}
                        fill="none" strokeWidth="3" stroke="#FF6347"
                        r={nodes[al[`nodeId${LOrR}`]].size + 5} transform={toSVG(zoom)}
                />
            )
        })
        const side = LOrR == 'L' ? "left" : "right"
        offset = LOrR == 'L' ? 0 : 28
        const xpoint = LOrR == 'L' ? size.width : 0
        const strokeWidth = 5
        const maxScore = 3.5
        const score = this.state.alignment.score
        const spread = size.height * (1-(score/maxScore))//strokeWidth * aligned.length * (maxScore/score)
        const offsetforalignlines = (size.height - (spread))/2
        const inc = Math.abs(spread / aligned.length)
        
        const lines = aligned.map((al, i) => {
            const solvedY = this.solveY(offsetforalignlines+(i*inc), f, b, a, xpoint, e, d)
            return < line x1={nodes[al[`nodeId${LOrR}`]].x} y1={nodes[al[`nodeId${LOrR}`]].y}
                   x2={this.solveX(xpoint, a, e, c, solvedY)} y2={solvedY}
                   stroke="#b01a15" strokeWidth={strokeWidth} transform={toSVG(zoom)}
                    opacity=".2"
            />
            }
        )
        const styly = {
            height: '100%', width: "48.5%", position: "absolute", float:"left", display: "inline-block", pointerEvents:"none",
            [side]: offset
        }
        return (
            <div style={styly}>
                <svg width="100%" height="100%" fillOpacity="0">
                    {circles}
                    {lines}
                </svg>
            </div>
        )
    }
    
    solveY(nodeY, f, b, a, nodeX, e,d){
        const divis = (1/ ((b/a) - d))
        const solved = divis* ((f-nodeY) - ((b/a) * (nodeX+e)))
        return solved
    }
    
    solveX(nodeX,a,e,c,solvedY){
        return (1/a) * (nodeX- e - (solvedY*c))
    }

    renderGraph(LOrR){
        const zoomable = this.state.zoomable,
            prefix = LOrR === 'L' ? `graphL` : `graphR`,
            nodes = this.state[`${prefix}Nodes`],
            edges = this.state[`${prefix}Edges`],
            graphHighlight = this.state[`${prefix}Highlight`]

        let readyNodes
        const hc = this.handleNodeClick;
        const md = this.handleMouseDown;
        const mu = this.handleMouseUp;

        readyNodes = nodes.map( (node, i) => {
            node["onClick"] = ()=>hc(i, LOrR)
            node["highlight"] = graphHighlight[i] > .05
            node["onMouseDown"] = (e)=>md(e, i, LOrR)
            node["onMouseUp"] = (e)=>mu(e)
            return node
        })
        return (

            <div style={{height: '100%', width: "48.5%", float:"left",
                            display: "inline-block"}} >
                <AutoSizer onResize={(e)=>this.trackResize(e, LOrR)}>
                    {(({width, height}) => width === 0 || height === 0 ? null : (
                        <Graph width={width} height={height} 
                               trackZoom={(e)=>this.trackValue(e, LOrR)} 
                               background={'#030603'} nodes={readyNodes} 
                               edges={edges} zoomable={zoomable} 
                               offClick={()=>console.log("off click fired")}/>

                        ))}

                </AutoSizer>
                <button onClick={()=>this.rotate5degree(LOrR, 935, 500)} style={{zIndex: 3, position:"absolute"}}>Rotate</button>
                <button onClick={()=>this.nextAlignment()} style={{zIndex: 3, position:"absolute", left:"120px"}}>Next Alignment</button>
            </div>
        
        )
    }

    render() {
        return (
            <div style={{height: '100%', width: "100%", position: "fixed", display: "flex"}}>
                {this.renderGraph('L')}
                {this.renderDivider()}
                {this.renderGraph('R')}
                {this.renderOverlay('L')}
                {this.renderOverlay('R')}

            </div>
        )
    }
}

class Divider extends React.PureComponent {
    constructor(props) {
        super(props)
    }
    render() {
        const {
            color,
            linkMaps
        } = this.props
        
        return (
            <div style={{
                height: '100%', width: '2em', float: "none",
                background: `linear-gradient(to right, #030603, ${color}, #030603)`,
                display:
                "block", borderWidth: "1em"
            }} onClick={linkMaps}
            >
            </div>
        )

    }
}

export default GraphSimilarity