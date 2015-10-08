"use strict"

let rc = canvas.getContext('2d')
let animation_frame_requested = false
let shift_x = 0, shift_y = 0
let zoom = 1

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

let nodes = []
let nodeById = {}

let edges = []
let edgeByNodesId = {}


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

let resize = () => (UI.resize(canvas), requestRedraw())
window.onresize = function() {
	resize()
	setTimeout(resize, 100) //мало того, что оно пикселы округляет не туда, дак ещё и ресайз теперь кривой
}

window.onresize()
initGraph(areas)


// Полезности
function pointDis(x1,y1, x2,y2) {
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}
function nodeDis(n1,n2) {
	return pointDis(n1.x,n1.y, n2.x,n2.y)
}
function worldx(x){ return (x - shift_x) / zoom }
function worldy(y){ return (y - shift_y) / zoom }


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
	
	// Генерим рёбра графа
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
	for (let node of nodes) {
		if (pointDis(x, y, node.x, node.y) < NODE_R) {
			hoverNode = node
			break
		}
	}
}


// Обработчики мышиного (и трогательного тоже) ввода.
function singleDown(x, y, is_switching) {
	updateHoverNode(x, y)
	if (hoverNode) { //нажали на ноду
		grab_x = worldx(x) - hoverNode.x
		grab_y = worldy(y) - hoverNode.y
		pressedNode = hoverNode
	} else { //нажали мимо ноды
		grab_x = x
		grab_y = y
	}
	moved_path_len = 0
	last_press_at = Date.now()
	last_x=x; last_y=y
	requestRedraw()
	return true
}
function singleMove(x, y) {
	if (hoverNode && grab_x==grab_x) { //если перетаскивается нода
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
	moved_path_len += pointDis(x, y, last_x, last_y)
	last_x=x; last_y=y
	requestRedraw()
	return true
}
function singleUp(is_switching) {
	let it_was_click = (moved_path_len < 5) && (Date.now()-last_press_at < 500)
	if (it_was_click) {
		if (pressedNode) { //кликнули в ноду
			UI.fillNodeInfo(pressedNode, "edit", UI.isOverNodeInfo(last_x) ? "left" : "right")
		} else { //кликнули мимо ноды
			UI.hideNodeInfo()
			if (selectedNode) updateNodeModifFlag(selectedNode)
		}
		selectedNode = pressedNode
	}
	pressedNode = null
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
