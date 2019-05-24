window.addEventListener("load", bgOnLoad);

var defaultSettings = {
	"showClear" : true,
	"showBadge" : false,
	"showTime" : true,
	"showSearch" : true,
	"searchMode" : 1,
	"boldFont" : false,
	"saveHistory" : true,
	"ctrlZ" : false,
	"menuTop" : false,
	"disableDClick" : false,
	"tooltipText" : true,
	"numLimit" : 10,
	"numItems" : 10,
	"numLines" : 1,
	"altBut" : false,
	"hkey1" : 17,
	"hkey2" : 90,
	"wPop" : 300,
	"sexy" : false
};

settingsUpdate();

function bgOnLoad(){
	// console.log("SUC Loaded");
	if(localStorage.getItem('settings')!==null)updateIcon();
	if(localStorage.getItem('TabListIndex')!==null){regExistingTabs();}
}


chrome.runtime.onStartup.addListener(function() {
// console.log("LOAD");
	var settings = JSON.parse(localStorage.settings);
	if (!settings.saveHistory) {
		resetData(); 
	}
	else {
		tabListProcessing();
		setBadge();
	}
	//console.log("START: "+Object.keys(settings).length);
});

chrome.runtime.onInstalled.addListener(function(runInfo) {
	if (runInfo.reason=="install") {
		initialize();
	}
	if (runInfo.reason=="update") {
		localStorage.dcTime = Date.now();

		settingsUpdate();
		// resetData(); 
	}
	setBadge();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var settings = JSON.parse(localStorage.settings);
	if (((request == "ctrlZ")&&settings.ctrlZ)||request == "dclick") {
	// console.log("DISPLAY");
		getLatestCTab();
	}	
});

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
if(tab.status==="complete"){
sendHotKey(tabId);
addNewTab(tab);}
});

chrome.tabs.onRemoved.addListener(function(tabId, info)  {
addClosedTab(tabId,0);
// if(info.isWindowClosing) localStorage.lastCloseTime = Date.now();
});

// chrome.windows.onRemoved.addListener(function(windowId){
// localStorage.lastCloseTime = Date.now();
// });

function initialize(){
	localStorage.settings = JSON.stringify(defaultSettings);
		
	localStorage.dcTime = Date.now();
	// localStorage.lastCloseTime = 0;
	
	localStorage.updatedTill = chrome.runtime.getManifest().version;
	
	localStorage.setItem("TabListIndex",JSON.stringify([]));
	localStorage.setItem("ClosedTabIndex",JSON.stringify([]));
	regExistingTabs();
}

/*preserve old settings while adding new one*/
function settingsUpdate(){
	if(localStorage.settings === undefined){ initialize();}
	if(localStorage.settings !== undefined&&(localStorage.updatedTill === undefined||needUpdateOrNot("1.3.4"))){
		console.log("Updating...");
		//delete useless "bold" key (1.3.3.6)
		var settingsB = JSON.parse(localStorage.settings);
			if(settingsB.hasOwnProperty('bold')) delete settingsB.bold;
		localStorage.settings = JSON.stringify(settingsB);
		//end
		if(Object.keys(JSON.parse(localStorage.settings)).length < Object.keys(defaultSettings).length){
			console.log("Updating settings...");
			var localKeys = Object.keys(JSON.parse(localStorage.settings)).sort();
			var currDefKeys = Object.keys(defaultSettings).sort();
			var settings = JSON.parse(localStorage.settings);
			for(var i=0; i < currDefKeys.length; i++){
				var found = false;
				for(var j=0; j < localKeys.length; j++){
					if(currDefKeys[i] === localKeys[j]) {found = true; break;}
				}
				if(!found) {settings[currDefKeys[i]] = defaultSettings[currDefKeys[i]];}
			}
			localStorage.settings = JSON.stringify(settings);
		}
		
		delete localStorage["lastCloseTime"]; //1.3.3.5
		
		if(localStorage.getItem('TabListIndex')===null){localStorage.setItem("TabListIndex",JSON.stringify([]));}
		if(localStorage.getItem('ClosedTabIndex')===null){localStorage.setItem("ClosedTabIndex",JSON.stringify([]));}
		
		updateCTabs();
		
		localStorage.updatedTill = chrome.runtime.getManifest().version;
	}
}

//split 5 4 3 %% |!|
function updateCTabs(){
console.log("Updating closed tabs...");
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
	
	for(i = localStorage["closedUpperBound"] - 1; i>localStorage["closedLowerBound"]; i--){
		var closedTab=localStorage["ClosedTab-"+i];
		
		if (closedTab){
			var rId = randomIdGen();
			//old vers
			if (closedTab.split("%%").length > 3){
				var split = closedTab.split("%%");
				localStorage["ClosedTab-"+rId] = split[1]+"|!|"+split[2]+"|!|"+split[3];
			}
			//1.3.2.3
			if (closedTab.split("|!|").length === 3){
				localStorage["ClosedTab-"+rId] = localStorage["ClosedTab-"+i];
			}
			
			delete localStorage["ClosedTab-"+i];
			closedTabIndex.unshift(rId);
		}
	}
	localStorage.ClosedTabIndex = JSON.stringify(closedTabIndex);
	
	delete localStorage["closedUpperBound"];
	delete localStorage["closedLowerBound"];
	delete localStorage["closedTabCount"];
}

//compare updatedTill with specified version, if greater true
function needUpdateOrNot(specVer){
	var need = false;
	if(localStorage.updatedTill === undefined){need = true;}
	else if(localStorage.updatedTill !== undefined && specVer !== "skip"){
		if(localStorage.updatedTill !== specVer){
			var spcVer = specVer.split(".").map(Number);
			var tillVer = localStorage.updatedTill.split(".").map(Number);
			var len = Math.max(spcVer.length, tillVer.length);
			for(var i = 0; i<len; i++){
				if(spcVer[i]===undefined){spcVer[i]=0;}
				if(tillVer[i]===undefined){tillVer[i]=0;}
				if(spcVer[i]>tillVer[i]){need = true; break;} 
			}
		}	
	}
	return need;
}

function addClosedTab(tabId, mode){
	// console.log("REMOVED: "+tabId+"==="+(localStorage["TabList-"+tabId]!=undefined));
	if(localStorage["TabList-"+tabId]!=undefined){
		var settings = JSON.parse(localStorage.settings);
		var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
		// Should we record this tab?
		var splitValue = localStorage["TabList-"+tabId].split("|!|");
		var url = splitValue[0];
		var re = /^(http:|https:)/;
		//if url is valid?
		if (url && re.test(url)) {
			var exists = -1;
			//go through all saved closed tabs
			for(var i = closedTabIndex.length-1; i>=0; i--){
				var closedTab=localStorage["ClosedTab-"+closedTabIndex[i]];
				if (closedTab){
					var split = closedTab.split("|!|");
					//if new removed exists in saved closed tabs
					if (split[1]===url){
						exists=closedTabIndex[i];
						break;
					}
				}
			}
			//settle the time according to mode
			// var timing;
			// if(mode==0) {timing = Date.now();} else {timing = localStorage.lastCloseTime;}
			// var createStr = timing + "|!|" + localStorage["TabList-"+tabId];
			var createStr = Date.now() + "|!|" + localStorage["TabList-"+tabId];
			//if new removed exists in saved closed tabs, remove it first
			if (exists!=-1){
				delete localStorage["ClosedTab-"+exists];
				closedTabIndex.splice(closedTabIndex.indexOf(exists),1);
			}

			var rId = randomIdGen();
			localStorage["ClosedTab-"+rId] = createStr;
			closedTabIndex.push(rId);

			// Code for managing overflow
			if (closedTabIndex.length>settings.numLimit){
			// console.log("OVERFLOW - "+closedTabIndex.length+">"+settings.numLimit);
				for(var i = 0; i<closedTabIndex.length; i++){
					var closedTab=localStorage["ClosedTab-"+closedTabIndex[i]];
					if (closedTab){
					// console.log("CLOSE TAB - delete and lower bound to "+i);
						delete localStorage["ClosedTab-"+closedTabIndex[i]];
						closedTabIndex.splice(closedTabIndex.indexOf(closedTabIndex[i]),1);
						break;
					}
				}
			}
			localStorage.ClosedTabIndex = JSON.stringify(closedTabIndex);
			setBadge();
		}
		delete localStorage["TabList-"+tabId];
		var tabListIndex = JSON.parse(localStorage.TabListIndex);
		tabListIndex.splice(tabListIndex.indexOf(tabId),1);
		localStorage.TabListIndex = JSON.stringify(tabListIndex);
	}
}

function sendHotKey(tabId){
//console.log("send to tab "+tabId);
	var settings = JSON.parse(localStorage.settings);
	if(settings.ctrlZ){ chrome.tabs.sendMessage(tabId, {key1:settings.hkey1,key2:settings.hkey2});}
}

function getLatestCTab(){
	// console.log("LAST CLOSED TAB");
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
	createTab(closedTabIndex[closedTabIndex.length-1],true);
}

//check for open tabs of previous browser close and make them closed tabs
function tabListProcessing() {
	var storageSize = localStorage.length;
	var tabListIndex = JSON.parse(localStorage.TabListIndex);
	for(var i = 0; i < storageSize; i++){
	// console.log("TLC"+i+" of "+storageSize+": "+localStorage.key(i));
		if(localStorage.key(i).indexOf("TabList-")!=-1) {
			var tabListId = parseInt(localStorage.key(i).substr(8));
			if(tabListIndex.indexOf(tabListId)!=-1){
				addClosedTab(tabListId,1);
			}else{localStorage.removeItem(localStorage.key(i));}
			storageSize = localStorage.length;
			--i;
		}
	}
}

function randomIdGen(){
	return Math.random().toString(36).substring(2,8);
}