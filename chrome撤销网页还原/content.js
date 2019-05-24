//this script should be injected to all normal pages to enable custom undo hotkey
var k1, k2;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// console.log(request.key1+","+request.key2);
	k1 = request.key1;
	k2 = request.key2;
	
	window.addEventListener("keydown", keyHandler);
});
  
function keyHandler(event) { 
// console.log("PRESSED: "+k1+","+k2);
	var element;
	if(event.target) element=event.target;
	else if(event.srcElement) element=event.srcElement;
	if(element.nodeType==3) element=element.parentNode;

	if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;

	//to do: set dynamic downKey if code = 17 downkey = ctrl
	var downKey;
	if (k1==17) downKey = event.ctrlKey;
	if (k1==18) downKey = event.altKey;
	if (k1==16) downKey = event.shiftKey;
	if (k1==91) downKey = event.metaKey;
	
	//if ((event.ctrlKey ||event.metaKey) && event.keyCode==90 ){
	if (downKey && event.keyCode==k2 ){
	// console.log("CTRL-Z:MATCH");
		chrome.runtime.sendMessage("ctrlZ"); 
		event.preventDefault();
		event.stopPropagation();
	}
}