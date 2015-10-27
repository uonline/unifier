"use strict"

let rc = canvas.getContext('2d')
let animation_frame_requested = false
let shift_x = 0, shift_y = 0
let zoom = 1

let last_x = NaN, last_y = NaN
let grab_x = NaN, grab_y = NaN
//let buttons = 0
let moved_path_len = [0, 0, 0]
let last_press_at = [0, 0, 0]
let hoverNode = null
let pressedNode = null
let selectedNode = null
let firstEdgeNode = null
let NODE_R = 5
let writableLocParams = ['name', 'label', 'description', 'picture']

let locById = {}
let locByLabel = {}

let nodes = []
let nodeById = {}

let edges = []
let edgeByNodesId = {}


canvas.oncontextmenu = function(e){ e.preventDefault() }

UI.onNodeParamUpdate = function(param, value) {
	if (!selectedNode) throw new Error('no node is selected') //this must not happen
	selectedNode.loc[param] = value
	let modified = value != selectedNode.locOriginal[param]
	if (modified && param == "name") requestRedraw()
	return modified
}

control.double({
	startElem: canvas,
	stopElem: document.body,
	
	singleDown: singleDown,
	singleMove: singleMove,
	singleUp: singleUp,
	wheelRot: wheelRot,
	
	doubleDown: doubleDown,
	doubleMove: doubleMove,
	doubleUp: doubleUp
})

window.onkeydown = function(e) {
	switch (e.keyCode) {
	case 46: //DEL
		if (!UI.nodeInfoIsFocused() && selectedNode) {
			e.preventDefault()
			Node.del(selectedNode)
			selectedNode = null
			requestRedraw()
			UI.hideNodeInfo()
		}
		break
	}
}

let resize = () => (UI.resize(canvas), requestRedraw())
window.onresize = function() {
	resize()
	setTimeout(resize, 100) //мало того, что оно пикселы округляет не туда, дак ещё и ресайз теперь кривой
}

window.onresize()
setTimeout(initGraph, 1, areas)


// Полезности
function pointDis(x1,y1, x2,y2) {
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}
function nodeDis(n1,n2) {
	return pointDis(n1.x,n1.y, n2.x,n2.y)
}
function worldx(x){ return (x - shift_x) / zoom }
function worldy(y){ return (y - shift_y) / zoom }


function Node(x, y, loc) {
	this.id = loc ? loc.id : Node.randomId()
	this.loc = Node.copyLocParams(loc || {})
	this.locOriginal = loc ? Node.copyLocParams(loc) : {}
	this.modified = false
	this.x = x
	this.y = y
}

Node.randomId = _ => (_=(Math.random()*0xFFFF|0)) in nodeById ? Node.randomId() : _
console.log(Node.randomId)

Node.copyLocParams = loc => writableLocParams.reduce((l,p) => (l[p]=loc[p]||'', l), {}) // чтоб никто ничего не понял. даже я

Node.add = function(x, y, loc) {
	let node = new Node(x, y, loc)
	nodes.push(node)
	nodeById[node.id] = node
	return node
}

Node.del = function(node) {
	let ind = nodes.indexOf(node)
	if (ind == -1) throw new Error('node #'+node.id+' not in nodes array')
	nodes.splice(ind, 1)
	delete nodeById[node.id]
	for (let i=0; i<edges.length; i++) {
		let e = edges[i]
		if (node==e.n1 || node==e.n2) { Edge.del(e); i-- }
	}
}


function Edge(n1, n2) {
	this.n1 = n1
	this.n2 = n2
}

Edge.add = function(n1, n2) {
	if (n1.id+","+n2.id in edgeByNodesId) return null
	let edge = new Edge(n1, n2)
	edges.push(edge)
	edgeByNodesId[n1.id+","+n2.id] = edge
	edgeByNodesId[n2.id+","+n1.id] = edge
	return edge
}

Edge.del = function(edge) {
	var ind = edges.indexOf(edge)
	if (ind == -1) throw new Error('edge ('+edge.n1.id+'-'+edge.n2.id+') not in edges array')
	edges.splice(ind, 1)
	delete edgeByNodesId[edge.n1.id+","+edge.n2.id]
	delete edgeByNodesId[edge.n2.id+","+edge.n1.id]
}


// Инициализация графа по массиву зон.
// Массив зон от выхлопа lib/locparse отличается отсутствием у локаций ссылок
// на зоны, в которых эти локации находятся (у location нету 'area').
function initGraph(areas) {
	// Распихиваем локации по кешам для быстрого поиска
	for (let area of areas)
		for (let loc of area.locations) {
			locById[loc.id] = loc
			locByLabel[loc.label] = loc
		}
	
	// Генерим ноды графа
	for (let area of areas)
		for (let loc of area.locations) {
			let a = Math.random()*2*Math.PI
			let r = 192
			let x = r * Math.cos(a) + canvas.width/2
			let y = r * Math.sin(a) + canvas.height/2
			Node.add(x, y, loc)
		}
	
	// Генерим рёбра графа
	for (let node of nodes) {
		for (let label in locById[node.id].actions) {
			let loc = locByLabel[label]
			let edge = Edge.add(node, nodeById[loc.id])
			//if edge==null { эти две ноды уже соединены }
		}
	}
}


// Рисует граф.
function draw(rc) {
	rc.save()
	rc.clearRect(0, 0, rc.canvas.width, rc.canvas.height)
	rc.translate(shift_x, shift_y)
	//rc.translate(shift_x + canvas.width/2, shift_y + canvas.height/2)
	rc.scale(zoom, zoom)
	
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

	if (firstEdgeNode) {
		rc.beginPath()
		rc.moveTo(selectedNode.x, selectedNode.y)
		rc.lineTo(worldx(last_x), worldy(last_y))
		rc.strokeStyle = 'green'
		rc.stroke()
		rc.strokeStyle = 'black'
	}
	
	rc.restore()
	if (automator.checked) auto()
}
// 1) Огранизовывает отрисовку через каноничный requestAnimationFrame
// 2) Ограничивает кол-во перерисовок в секунду (можно хоть 1000 раз подряд вызвать
//    requestRedraw(), перерисуется всё один раз через несколько миллисекунд)
function onAnimFrame() {
	animation_frame_requested = false
	draw(rc)
}
function requestRedraw() {
	if (animation_frame_requested) return
	requestAnimationFrame(onAnimFrame, canvas)
	animation_frame_requested = true
}

// Обнавляет флажок изменённости у ноды.
function updateNodeModifFlag(node) {
	node.modified = false
	for (let param of writableLocParams) {
		if (node.loc[param] == node.locOriginal[param]) continue
		node.modified = true
		break
	}
}

// Ищет и запоминает ноду под курсором.
function updateHoverNode(x,y) {
	x = worldx(x)
	y = worldy(y)
	hoverNode = null
	for (let i=nodes.length-1; i>=0; i--) {
		let node = nodes[i]
		if (pointDis(x, y, node.x, node.y) < NODE_R) {
			hoverNode = node
			break
		}
	}
}


// Обработчики мышиного (и трогательного тоже) ввода.
function singleDown(x, y, button, is_switching) {
	updateHoverNode(x, y)
	if (button == 0) {
		if (selectedNode && selectedNode==hoverNode) { // если нажали на уже выбранную ноду
			// будем добавлять ребро
			firstEdgeNode = selectedNode
		} else if (hoverNode) { //нажали на ноду
			grab_x = worldx(x) - hoverNode.x
			grab_y = worldy(y) - hoverNode.y
			pressedNode = hoverNode
		} else { //нажали мимо ноды
			grab_x = x
			grab_y = y
		}
	}
	//buttons |= 1<<button
	moved_path_len[button] = 0
	last_press_at[button] = Date.now()
	last_x=x; last_y=y
	requestRedraw()
	return true
}
function singleMove(x, y, buttons) {
	if (firstEdgeNode) { //если добавляем ребро
		updateHoverNode(last_x, last_y)
	} else if (hoverNode && grab_x==grab_x) { //если перетаскивается нода
		hoverNode.x = worldx(x) - grab_x
		hoverNode.y = worldy(y) - grab_y
	} else if (!hoverNode && grab_x==grab_x) { //если перетаскивается всё
		shift_x += x-last_x
		shift_y += y-last_y
	} else { //если ничего не перетаскивается
		updateHoverNode(x, y)
		if (!selectedNode) {
			if (hoverNode) {
				UI.fillNodeInfo(hoverNode, "preview", UI.isOverNodeInfo(x) ? "left" : "right")
			} else {
				UI.hideNodeInfo()
			}
		}
	}
	let moved_dis = pointDis(x, y, last_x, last_y)
	for (let i=0; i<3; i++) if (buttons & (1<<i)) moved_path_len[i] += moved_dis
	last_x=x; last_y=y
	requestRedraw()
	return true
}
function singleUp(button, is_switching) {
	let it_was_click = (moved_path_len[button] < 5) && (Date.now()-last_press_at[button] < 500)
	if (button == 0) {
		if (it_was_click) {
			if (pressedNode) { //кликнули в ноду
				UI.fillNodeInfo(pressedNode, "edit", UI.isOverNodeInfo(last_x) ? "left" : "right")
				selectedNode = pressedNode
			} else if (selectedNode) { //кликнули мимо, снимаем выделение
				UI.hideNodeInfo()
				updateNodeModifFlag(selectedNode)
				selectedNode = null
			} else { // кликнули мимо, ничего не выделено
				let node = Node.add(worldx(last_x), worldy(last_y), null)
				node.modified = true
				UI.fillNodeInfo(node, "edit", UI.isOverNodeInfo(last_x) ? "left" : "right")
				selectedNode = node
			}
		} else {
			if (firstEdgeNode && hoverNode && firstEdgeNode!=hoverNode) {
				let edge = Edge.add(firstEdgeNode, hoverNode)
				if (!edge) alert('no')
			}
		}
		firstEdgeNode = null
	}
	pressedNode = null
	//buttons &= ~(1<<button)
	grab_x = grab_y = NaN
	requestRedraw()
	return true
}

function wheelRot(dx, dy, dz) {
	let d = Math.pow(2, -dy/200)
	zoom *= d
	shift_x += (last_x - shift_x) * (1-d)
	shift_y += (last_y - shift_y) * (1-d)
	requestRedraw()
	return true
}

// TODO: управление двумя пальцами
function doubleDown(x1,y1,x2,y2){ return true }
function doubleMove(x1,y1,x2,y2){ return true }
function doubleUp(){ return true }

// Магия.
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
