var control = window.control || {};
control.single = function(opts) {
	var startElem = opts.startElem;
	var stopElem = opts.stopElem;
	var last_touch_event_at = 0;
	
	
	function grab(e) {
		var box = startElem.getBoundingClientRect();
		opts.down(e.clientX-box.left, e.clientY-box.top) && e.preventDefault();
	}
	function move(e) {
		if (Date.now() - last_touch_event_at < 1000) return; // эксклюзивный костыль для кривой андроидной WebView
		var box = startElem.getBoundingClientRect();
		opts.move(e.clientX-box.left, e.clientY-box.top) && e.preventDefault();
	}
	function drop(e) {
		opts.up() && e.preventDefault();
	}
	
	
	function touchStart(e) {
		last_touch_event_at = Date.now();
		if (e.targetTouches.length > 1) return;
		
		var box = startElem.getBoundingClientRect();
		var t0 = e.targetTouches[0];
		
		opts.down(t0.clientX-box.left, t0.clientY-box.top) && e.preventDefault();
	}
	
	function touchMove(e) {
		last_touch_event_at = Date.now();
		if (e.targetTouches.length > 1) return;
		
		var box = startElem.getBoundingClientRect();
		var t0 = e.targetTouches[0];
		
		opts.move(t0.clientX-box.left, t0.clientY-box.top) && e.preventDefault();
	}
	
	function touchEnd(e) {
		last_touch_event_at = Date.now();
		if (e.targetTouches.length > 0) return;
		
		opts.up() && e.preventDefault();
	}
	
	startElem.addEventListener('mousedown', grab, true);
	startElem.addEventListener('mousemove', move, true);
	stopElem.addEventListener('mouseup', drop, true);
	startElem.addEventListener('touchstart', touchStart, true);
	startElem.addEventListener('touchmove', touchMove, true);
	stopElem.addEventListener('touchend', touchEnd, true);
}
