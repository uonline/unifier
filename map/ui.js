"use strict"
let UI = new function() {
	this.onNodeParamUpdate = function(param, value){ return false /*if has been modified*/ }
	
	$$('.node-cfg-wrap [name]').forEach(function(elem) {
		elem.onchange = elem.onkeyup = function() {
			let modified = UI.onNodeParamUpdate(this.name, this.value)
			this.classList.toggle('modified', modified)
		}
	})
}

UI.resize = function(canvas) {
	let s = devicePixelRatio
	canvas.width = canvas.offsetWidth * s
	canvas.height = canvas.offsetHeight * s
}

UI.fillNodeInfo = function(node, edit_mode, side) {
	let wrap = $('.node-cfg-wrap')
	wrap.dataset.mode = edit_mode
	wrap.dataset.side = side
	wrap.$('.node-id').textContent = node.id
	for (let param of writableLocParams) {
		let e = wrap.$(`[name="${param}"]`)
		e.value = node.loc[param]
		e.classList.toggle('modified', node.loc[param] != node.locOriginal[param])
	}
}

UI.isOverNodeInfo = function(x) {
	return x > canvas.width - $('.node-cfg-wrap').offsetWidth
}

UI.hideNodeInfo = function() {
	$('.node-cfg-wrap').dataset.mode = "hidden"
}

