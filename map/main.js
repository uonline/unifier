"use strict"

let last_x = NaN, last_y = NaN
let grab_x = NaN, grab_y = NaN
let moved_path_len = 0
let last_press_at = 0
let hoverNode = null
let pressedNode = null
let selectedNode = null
let NODE_R = 5
let writableLocParams = ['name', 'label', 'description', 'picture']


let locById = {}
let locByLabel = {}
for (let area of areas)
	for (let loc of area.locations) {
		locById[loc.id] = loc
		locByLabel[loc.label] = loc
	}

let nodes = []
let nodeById = {}
let copyLocParams = loc => writableLocParams.reduce((l,p) => (l[p]=loc[p]||'', l), {}) // чтоб никто ничего не понял. даже я
for (let area of areas)
	for (let loc of area.locations) {
		let a = Math.random()*2*Math.PI
		let r = 192
		let node = {
			id: loc.id,
			loc: copyLocParams(loc),
			locOriginal: copyLocParams(loc),
			modified: false,
			x: r * Math.cos(a) + canvas.width/2,
			y: r * Math.sin(a) + canvas.height/2,
			nei: []
		}
		nodes.push(node)
		nodeById[loc.id] = node
	}

let edges = []
let edgeByNodesId = {}
for (let node of nodes) {
	for (let label in locById[node.id].actions) {
		let loc = locByLabel[label]
		if (node.id+","+loc.id in edgeByNodesId) continue
		let edge = {
			n1: node,
			n2: nodeById[loc.id]
		}
		edges.push(edge)
		edgeByNodesId[edge.n1.id+","+edge.n2.id] = edge
		edgeByNodesId[edge.n2.id+","+edge.n1.id] = edge
	}
}


function draw(rc) {
	rc.save()
	rc.clearRect(0, 0, rc.canvas.width, rc.canvas.height)
	for (let node of nodes) {
		rc.beginPath()
		rc.arc(node.x, node.y, NODE_R, 0, Math.PI*2)
		if (hoverNode == node) {
			rc.fillStyle = 'blue'
			rc.fill()
		}
		if (node.modified) {
			rc.fillStyle = 'yellow'
			rc.fill()
		}
		rc.fillStyle = 'black'
		if (selectedNode == node) {
			rc.fill()
		}
		rc.stroke()
		rc.fillText(node.loc.name, node.x, node.y)
	}
	rc.beginPath()
	for (let edge of edges) {
		rc.moveTo(edge.n1.x, edge.n1.y)
		rc.lineTo(edge.n2.x, edge.n2.y)
	}
	rc.stroke()
	rc.restore()
	if (automator.checked) auto()
}
let animation_frame_requested = false
function onAnimFrame() {
	animation_frame_requested = false
	draw(rc)
}
function requestRedraw() {
	if (animation_frame_requested) return
	requestAnimationFrame(onAnimFrame, canvas)
	animation_frame_requested = true
}

function resize() {
	let s = devicePixelRatio
	canvas.width = canvas.offsetWidth * s
	canvas.height = canvas.offsetHeight * s
	requestRedraw()
}

function fillNodeInfo(node, mode) {
	let wrap = $('.node-cfg-wrap')
	wrap.dataset.mode = mode
	wrap.$('.node-id').textContent = node.id
	for (let param of writableLocParams) {
		let e = wrap.$(`[name="${param}"]`)
		e.value = node.loc[param]
		e.classList.toggle('modified', node.loc[param] != node.locOriginal[param])
	}
}
function hideNodeInfo() {
	$('.node-cfg-wrap').dataset.mode = "hidden"
}
for (let param of writableLocParams) {
	let elem = $(`.node-cfg-wrap [name="${param}"]`)
	elem.onchange = elem.onkeyup = function() {
		if (!selectedNode) throw new Error('no node is selected') //this must not happen
		selectedNode.loc[param] = elem.value
		elem.classList.toggle('modified', elem.value != selectedNode.locOriginal[param])
	}
}

function updateNodeModifFlag(node) {
	node.modified = false
	for (let param of writableLocParams) {
		if (node.loc[param] == node.locOriginal[param]) continue
		node.modified = true
		break
	}
}


function pointDis(x1,y1, x2,y2) {
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}
function nodeDis(n1,n2) {
	return pointDis(n1.x,n1.y, n2.x,n2.y)
}

function updateHoverNode(x,y) {
	hoverNode = null
	for (let node of nodes) {
		if (pointDis(x, y, node.x, node.y) < NODE_R) {
			hoverNode = node
			break
		}
	}
}

function down(x,y) {
	updateHoverNode(x,y)
	if (hoverNode) {
		grab_x = x-hoverNode.x
		grab_y = y-hoverNode.y
		pressedNode = hoverNode
	}
	moved_path_len = 0
	last_press_at = Date.now()
	last_x=x; last_y=y
	requestRedraw()
	return true
}

function move(x,y) {
	if (hoverNode && grab_x==grab_x) {
		hoverNode.x = x-grab_x
		hoverNode.y = y-grab_y
	} else {
		updateHoverNode(x,y)
		if (!selectedNode) {
			if (hoverNode) {
				fillNodeInfo(hoverNode, "preview")
			} else {
				hideNodeInfo()
			}
		}
	}
	moved_path_len += pointDis(x, y, last_x, last_y)
	last_x=x; last_y=y
	requestRedraw()
	return true
}

function up() {
	let it_was_click = (moved_path_len < 5) && (Date.now()-last_press_at < 500)
	if (it_was_click) {
		if (pressedNode) {
			fillNodeInfo(pressedNode, "edit")
		} else {
			hideNodeInfo()
			if (selectedNode) updateNodeModifFlag(selectedNode)
		}
		selectedNode = pressedNode
	}
	pressedNode = null
	grab_x = grab_y = NaN
	requestRedraw()
	return true
}

control.single({
	startElem: canvas,
	stopElem: document.body,
	down: down,
	move: move,
	up: up
})

function auto() {
	for (let edge of edges) {
		let n1 = edge.n1
		let n2 = edge.n2
		let dis = nodeDis(n1, n2)
		let k = 1/10
		let dx = (n2.x - n1.x) * k
		let dy = (n2.y - n1.y) * k
		n1.x += dx; n1.y += dy
		n2.x -= dx; n2.y -= dy
	}
	for (let i=0; i<nodes.length; i++) {
		for (let j=i+1; j<nodes.length; j++) {
			let n1 = nodes[i]
			let n2 = nodes[j]
			let dis = nodeDis(n1, n2)
			let k = -1/dis/dis*50
			let dx = (n2.x - n1.x) * k
			let dy = (n2.y - n1.y) * k
			n1.x += dx; n1.y += dy
			n2.x -= dx; n2.y -= dy
		}
	}
	requestRedraw()
}

let rc = canvas.getContext('2d')
window.onresize = function() {
	resize()
	setTimeout(resize, 100) //мало того, что оно пикселы округляет не туда, дак ещё и ресайз теперь кривой
}
window.onresize()
