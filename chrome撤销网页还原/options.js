var settings = {};

function save() {
	if (document.getElementById('ctrlZ').checked){
		document.getElementById('hKey1').disabled=false;
		document.getElementById('hKey2').disabled=false;
	}else{
		document.getElementById('hKey1').disabled=true;
		document.getElementById('hKey2').disabled=true;
	}
	
	if(!document.getElementById('showTime').checked) {document.getElementById('sexyBack').style.display = "none";}
	else {document.getElementById('sexyBack').style.display = "block";}

	settings.showClear = document.getElementById('showClear').checked;
	settings.showBadge = document.getElementById('showBadge').checked;
	settings.showTime = document.getElementById('showTime').checked;
	settings.sexy = document.getElementById('sexy').checked;
	settings.showSearch = document.getElementById('showSearch').checked;
	settings.boldFont = document.getElementById('bold').checked;
	settings.saveHistory = document.getElementById('saveHistory').checked;
	settings.ctrlZ = document.getElementById('ctrlZ').checked;
	settings.menuTop = document.getElementById('menuTop').checked;
	settings.disableDClick = document.getElementById('disableDClick').checked;
	settings.tooltipText = document.getElementById('tooltipText').checked;
	settings.altBut = document.getElementById('altBut').checked;
	
	settings.searchMode = getRadioValue('searchIn');
	
	settings.wPop = parseInt(document.getElementById('wPop-value').textContent,10);
	settings.numLimit = parseInt(document.getElementById('numLimit-value').textContent,10);
	settings.numItems = document.getElementById("numItems").value;
	settings.numLines = parseInt(document.getElementById("numLines").value,10);
	
	settings.hkey1 = document.getElementById("hKey1").value;
	settings.hkey2 = document.getElementById("hKey2").value;

	localStorage.settings = JSON.stringify(settings);
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
	if (closedTabIndex.length>settings.numLimit){
	  trimTabs(settings.numLimit);
	}
	setBadge();
	updateIcon();
	if(settings.ctrlZ){informHotkeyChange();}
}

// Make sure the options gets properly initialized from the
// saved preference.
document.addEventListener('DOMContentLoaded', function () {
	settings = JSON.parse(localStorage.settings);
	
	forMac();
	
	document.getElementById('showClear').checked = settings.showClear;
	document.getElementById('showClear').addEventListener('click', save);

	document.getElementById('showBadge').checked = settings.showBadge;
	document.getElementById('showBadge').addEventListener('click', save);

	document.getElementById('showTime').checked = settings.showTime;
	document.getElementById('showTime').addEventListener('click', save);
	if(!settings.showTime) document.getElementById('sexyBack').style.display = "none";
	
	document.getElementById('sexy').checked = settings.sexy;
	document.getElementById('sexy').addEventListener('click', save);

	document.getElementById('showSearch').checked = settings.showSearch;
	document.getElementById('showSearch').addEventListener('click', save);

	document.getElementById('bold').checked = settings.boldFont;
	document.getElementById('bold').addEventListener('click', save);

	document.getElementById('saveHistory').checked = settings.saveHistory;
	document.getElementById('saveHistory').addEventListener('click', save);

	document.getElementById('ctrlZ').checked = settings.ctrlZ;
	document.getElementById('ctrlZ').addEventListener('click', save);
	document.getElementById('hKey1').addEventListener('change', save);
	document.getElementById('hKey2').addEventListener('change', save);
	selectItemByValue(document.getElementById("hKey1"),settings.hkey1);
	selectItemByValue(document.getElementById("hKey2"),settings.hkey2);
	if(!settings.ctrlZ){
		document.getElementById('hKey1').disabled=true;
		document.getElementById('hKey2').disabled=true;
	}

	document.getElementById('menuTop').checked = settings.menuTop;
	document.getElementById('menuTop').addEventListener('click', save);

	document.getElementById('disableDClick').checked = settings.disableDClick;
	document.getElementById('disableDClick').addEventListener('click', save);
	
	document.getElementById('tooltipText').checked = settings.tooltipText;
	document.getElementById('tooltipText').addEventListener('click', save);
	
	document.getElementById('altBut').checked = settings.altBut;
	document.getElementById('altBut').addEventListener('click', save);
	
	document.getElementById('searchIn'+settings.searchMode).checked = true;
	document.getElementById('searchIn1').addEventListener('click', save);
	document.getElementById('searchIn2').addEventListener('click', save);
	document.getElementById('searchIn3').addEventListener('click', save);
	
	var popWidth = document.getElementById('wPop');
	var popWidthValue = document.getElementById('wPop-value');
	popWidth.value = popWidthValue.textContent = parseInt(settings.wPop,10);
	popWidth.addEventListener('input', function(event) { popWidthValue.textContent = event.target.value;save();}, false);

	var limitValue = document.getElementById('numLimit-value');
	document.getElementById('numLimit').value = parseInt(Math.pow((((settings.numLimit-5)*Math.pow(600,5))/99994),0.2),10);
	limitValue.textContent = settings.numLimit;
	document.getElementById('numLimit').addEventListener('input', function(event) {limitValue.textContent = 5+  parseInt((Math.pow(event.target.value,5)/Math.pow(600,5)) * 99994,10);save();}, false);

	var widthValue = document.getElementById('numItems-value');
	document.getElementById('numItems').value = widthValue.textContent = settings.numItems;
	document.getElementById('numItems').addEventListener('input', function(event) {widthValue.textContent = event.target.value;save();}, false);

	var lines = document.getElementById('numLines');
	var linesValue = document.getElementById('numLines-value');
	lines.value = linesValue.textContent = parseInt(settings.numLines,10);

	if (lines.value==0) linesValue.textContent="No Limit";
	lines.addEventListener('input', function(event) { if (event.target.value==0) linesValue.textContent="No Limit"; else linesValue.textContent = event.target.value;save();}, false);

	document.getElementById('resetButton').addEventListener('click', clearMemory);

	document.getElementById('searchOpt').title = chrome.i18n.getMessage("opt_func_opt1_tooltip");
	document.getElementById('ctrlzOpt').title = chrome.i18n.getMessage("opt_func_opt5_tooltip");
});

function trimTabs(tablimit){
	// Trim off the excess saved closed tabs
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
	var noToDelete = closedTabIndex.length - tablimit;
	for(var i = 0; i<noToDelete; i++){
		if(localStorage["ClosedTab-"+closedTabIndex[i]]){
			delete localStorage["ClosedTab-"+closedTabIndex[i]];
			closedTabIndex.splice(closedTabIndex.indexOf(closedTabIndex[i]),1);
		}
	}
	localStorage.ClosedTabIndex = JSON.stringify(closedTabIndex);
}

function informHotkeyChange(){
	var tabListIndex = JSON.parse(localStorage.TabListIndex);
	for(var i = tabListIndex.length-1; i>=0; i--){
		chrome.tabs.sendMessage(tabListIndex[i], {key1:settings.hkey1,key2:settings.hkey2});
	}
}

function getRadioValue(radioGroup){
	var rGrp = document.getElementsByName(radioGroup);
    for(var i = 0, j = rGrp.length; i < j; i++){
        if (rGrp[i].checked){
			return rGrp[i].value;
        }
    }
}

function selectItemByValue(elmnt, value){
	for(var i=0; i < elmnt.options.length; i++){
	  if(elmnt.options[i].value == value) elmnt.selectedIndex = i;
	}
}

function forMac() {
	//if a Mac...
	if (navigator.appVersion.indexOf("Mac")!=-1){
		var apple=document.createElement("option");
		apple.value="91";
		apple.textContent = "⌘";
		document.getElementById('hKey1').appendChild(apple);
	}
}

function clearMemory(){
	var sure=confirm(chrome.i18n.getMessage("opt_resetbtn_popupMsg"));
	if (sure==true) resetData();
}