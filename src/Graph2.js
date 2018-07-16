/**
 * Created by duncan on 5/7/18.
 */


import React, {Component} from 'react';
import {ReactSVGPanZoom}  from 'react-svg-pan-zoom';
import {AutoSizer} from 'react-virtualized';

export function Graph(props){
    const {nodes, edges} = props
    const hc = ()=>{}
    // You have to do a rect svg in the background so you can get an off click
    // event, otherwise you can't distinguish from clicking not on a node.
    // seems like that shouldn't be the case.
    return (
        <AutoSizer>
            {(({width, height}) => width === 0 || height === 0 ? null : (

                    <svg width={width} height={height}>
                        <rect width={width+250} height={height+250} fill={'#030603'} onClick={props.offClick}/>
                         {edges.map((e, i) => {
                            return <Edge key={i} node1x={nodes[e.node1].x} node1y={nodes[e.node1].y} node2x={nodes[e.node2].x} node2y={nodes[e.node2].y}/>
                        })}
                        {nodes.map((n,i)=>{
                            return <Node key={i} text={n.name} x={n.x} y={n.y} size={n.size} color={n.color} onHighLightClick={hc} onNodeClick={n.onClick} highlight={n.highlight} onMouseDown={n.onMouseDown} onMouseUp={n.onMouseUp}/>
                        })}
                    </svg>
            ))}
        </AutoSizer>
    )
}


class Node extends React.Component {
    constructor(props) {
        super(props)
    }

    shouldComponentUpdate(nextProps) {
        const {x, y, highlight} = this.props,
         hasMoved = x !== nextProps.x || y !== nextProps.y,
         highlightChange = highlight !== nextProps.highlight

        return hasMoved || highlightChange;
    }
    render() {
        const {
            highlight,
            x,
            y,
            text,
            color,
            onMouseDown,
            onMouseUp,
            onNodeClick,
            size
        } = this.props;

        return (
            highlight ?
                <g>
                    <circle cx={x} cy={y} fill="none" strokeWidth="3" stroke="#b01a15" r={size + 8} onClick={onNodeClick} onMouseDown={onMouseDown} onMouseUp={onMouseUp}/>
                    <circle cx={x} cy={y} fill="none" strokeWidth="3" stroke="#33a12d" r={size} onClick={onNodeClick} onMouseOver={()=>{}} onMouseDown={onMouseDown} onMouseUp={onMouseUp} pointerEvents="visible"/>
                    <text x={x} y={y} fill="#f1f1f1" textAnchor="middle" dy="0.3em" pointerEvents="none"> {text} </text>
                </g>
                :
                <g>
                    <circle cx={x} cy={y} fill={color} strokeWidth="3" stroke="#33a12d" r={size} onClick={onNodeClick} onMouseOver={()=>{}} onMouseDown={onMouseDown} onMouseUp={onMouseUp}/>
                    <text x={x} y={y} fill="#f1f1f1" textAnchor="middle" dy="0.3em" pointerEvents="none"> {text} </text>
                </g>

        )
    }
}

class Edge extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render () {
        const {
            node1x,
            node1y,
            node2x,
            node2y
        } = this.props
        return (
            <g>
                <line x1={node1x} y1={node1y}
                      x2={node2x} y2={node2y}
                      stroke="#2e5e2c" strokeWidth="2"
                />
                <line x1={node1x} y1={node1y}
                      x2={0} y2={node1y}
                      stroke="#2e5e2c" strokeWidth="2"
                />
            </g>
        )
    }
}


