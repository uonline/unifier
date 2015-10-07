$ = document.querySelector.bind(document)
$$ = document.querySelectorAll.bind(document)
Element.prototype.$ = Element.prototype.querySelector
Element.prototype.$$ = Element.prototype.querySelectorAll
NodeList.prototype.forEach = Array.prototype.forEach
