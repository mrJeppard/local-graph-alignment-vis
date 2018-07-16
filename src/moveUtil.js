/**
 * Created by duncan on 5/9/18.
 */


//function dragNode()

export function moveNodes(
    nodes, toMove, {xDiff, yDiff}
) {
    let movedNodes = Array(Object.keys(nodes).length)
    nodes.map(
        (node, i) => {
            if (toMove[i]) {
                const moved = moveNode(node, {xDiff, yDiff})
                movedNodes[i] = moved
            } else {
                movedNodes[i] = node
            }
        }
    )
    return movedNodes
}

export function moveNode(node, {xDiff, yDiff}){
    let newNode = Object.assign({}, node)
    newNode.x = Number(node.x) - xDiff
    newNode.y = Number(node.y) - yDiff
    return newNode
}

/*
function positionDiff(angle, distToMove, sign){
    const xDiff = Math.cos(angle) * distToMove * sign,
          yDiff =  Math.sin(angle) * distToMove * sign

    return {xDiff, yDiff}
}

function signFlip(grabbedNode, trailingNode){
    return grabbedNode.x > trailingNode.x ? -1 : 1
}

function angle(trailingNode, movedNode) {
    return Math.atan(slope(trailingNode, movedNode))
}

export function eucDist(node1, node2){
    const {x:x1, y:y1} = node1
    const {x:x2, y:y2} = node2
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1-y2, 2))
}

export function slope(node1, node2){
    const {x:x1, y:y1} = node1
    const {x:x2, y:y2} = node2
    return (y1-y2) / (x1-x2)
}

export function getConnectedNodes(nodeId, edges){
    return (edges
            .filter(edge=> edge.node1 === nodeId || edge.node2 === nodeId)
            .map( edge=> edge.node1 !== nodeId ? edge.node1 : edge.node2)
    )
}

export function nodesDifference(newNodes, oldNodes) {
    const newXys = newNodes.map((node)=>[node.x, node.y])
    const oldXys = oldNodes.map((node)=>[node.x, node.y])
    const xyDiffs = oldXys.map( (xys,i)=> [xys[0] - newXys[i][0], xys[0] - newXys[i][0]])
    return xyDiffs
}

function transpose(a) {
    return a[0].map((_, c) => a.map(r => r[c]));
}

/*
export function moveOtherGraph(nodes, nodesDifference, graphXsim){
    /*
    returns array of nodes. moved raph the asme xys justs proportioned by
     graph similarity.
     */
/*
    console.log("moveOther", nodes, nodesDifference, graphXsim)
    let movementX = []
    let movementY = []
    graphXsim = transpose(graphXsim)
    graphXsim.map( (gs, i) => {
        // Go down the x's and see how far each node in the other
        // graph is moving.
        //console.log(i, gs, nodesDifference[i][0])
        movementX.push(gs.map( (sim)=> sim*nodesDifference[i][0]))
        movementY.push(gs.map( (sim)=> sim*nodesDifference[i][1]))
    })

    const reducer = (a, c) => a+c
    movementX = transpose(movementX)
    movementY = transpose(movementY)
    movementX = movementX.map( (t) => t.reduce(reducer))
    movementY = movementY.map( (t) => t.reduce(reducer))

    let newNodes = Array(nodes.length)
    console.log(newNodes)
    nodes.map((node, i) => {
            let newNode = Object.assign({}, node)
            newNode.x = Number(newNode.x) - movementX[i]
            newNode.y = Number(newNode.y) - movementY[i]
            newNodes[i] = newNode
        }
    )
    console.log("from other Moved", newNodes)
    return newNodes
}

/*
 export function moveNodesKeepEdgeLengths(
 grabbedNodeId,
 originalNodes,
 edges,
 xDiff,
 yDiff){
 /*
 Return an array of moved nodes. Move the first node as specified by x-yDiff
 and then adjusting all the other nodes such that the edge lengths are
 maintained.
 */
/*
 const grabbedNode = originalNodes[grabbedNodeId];
 let nodesMovedStack = new NodeStack()
 let movedNodes = Array(originalNodes.length)
 let firstMovedNode = moveNode(grabbedNode, {xDiff, yDiff})
 nodesMovedStack.push(firstMovedNode, grabbedNodeId)
 movedNodes[grabbedNodeId] = firstMovedNode

 while (nodesMovedStack.hasNodes()) {
 const {nodeId: id, node: focusNode} = nodesMovedStack.pop()
 let connectedNodes = getConnectedNodes(id, edges)
 connectedNodes = connectedNodes.filter((nodeId)=> !(nodesMovedStack.hasSeen(nodeId)))

 connectedNodes.map(
 (nodeId)=> {
 const connectedNode = originalNodes[nodeId]
 const oldDist = eucDist(
 originalNodes[nodeId],
 originalNodes[id]
 )
 const movedNode = adjustConnectedNode(
 focusNode,
 connectedNode,
 oldDist
 )
 nodesMovedStack.push(movedNode, nodeId)
 movedNodes[nodeId] = movedNode
 }
 )
 }
 return movedNodes
 }


 export class NodeStack {
 constructor() {
 this.nodes = []
 this.nodeIds = []
 this.poppedNodeIds = []
 }

 push(node, nodeId) {
 this.nodes.push(node)
 this.nodeIds.push(nodeId)
 }

 hasSeen(nodeId) {
 return (this.nodeIds.includes(nodeId) || this.poppedNodeIds.includes(nodeId))
 }

 pop() {
 const node = this.nodes.pop()
 const nodeId = this.nodeIds.pop()
 this.poppedNodeIds.push(nodeId)
 return {node, nodeId}
 }

 hasNodes(){
 return this.nodes.length > 0
 }
 }

 function adjustConnectedNode(movedNode, connectedNode, oldDistance){
 /* Returns a node that is moved over.*/
/*
const sign = movedNode.x > connectedNode.x ? -1 : 1
const angle = Math.atan(slope(connectedNode, movedNode))
const newDistance = eucDist(connectedNode, movedNode)
const distToMove = newDistance - oldDistance
const xDiff = Math.cos(angle) * distToMove * sign
const yDiff = Math.sin(angle) * distToMove * sign
const adjustedNode = moveNode(connectedNode, {xDiff, yDiff})
return adjustedNode
}



export function moveOtherGraphKeepAngles(nodes, movedNodes, edges){
    let newNodes = Array(nodes.length)
    let seenNodes = []
    edges.forEach((e)=>{
        const {node1:nodeId1, node2:nodeId2} = e
        const focusNodeId = seenNodes.includes(nodeId1) ? nodeId1 : nodeId2
        const trailingNodeId = focusNodeId === nodeId1 ? nodeId2 : nodeId1
        const focusNode = seenNodes.includes(focusNodeId) ? newNodes[focusNodeId] : movedNodes[focusNodeId]
        const trailingNode = seenNodes.includes(trailingNodeId) ? newNodes[trailingNodeId] : movedNodes[trailingNodeId]
        const originalDist = eucDist(nodes[nodeId1], nodes[nodeId2])
        newNodes[focusNodeId] = Object.assign({}, focusNode)
        newNodes[trailingNodeId] = adjustConnectedNode(focusNode, trailingNode, originalDist)
        seenNodes.push(...[nodeId1, nodeId2])
    })
    return newNodes
}
*/

