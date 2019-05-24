var settings = JSON.parse(localStorage.settings);

var pageNo = 0;

var filterTimeOut;
var filterStrings;
var filterRegEx;

var currentTime;
var content;

var tWidth;

dClickHandler();

//--Detect double click
//Reverted to early methods as something changed again
function dClickHandler() {
	if (!settings.disableDClick){
		//difference btw the 2 clicks
		var timeDiff =  Date.now() - localStorage.dcTime;
		if (timeDiff<600){ 
			chrome.runtime.sendMessage("dclick");
			window.close();
			return;
		}
	}
	localStorage.dcTime = Date.now();
}

function createLink(id, url, pgTitle) {
  var link = document.createElement('a');
  link.href="";
  link.addEventListener('click',function(e){
	e.preventDefault();
	e.stopPropagation();
	//if middle mouse button click
	if (e.button == 1){ 
		createTab(id,false); 
	}else{ 
		createTab(id,true);
	}
	setup();
  },false);
  if(settings.tooltipText){
	link.href = url;
	link.title = pgTitle;
  }else{
	link.title = url;
  }
  return link;
}

function setup(){

	content = document.getElementById("content");

	if (settings.menuTop == true) content = document.getElementById("content2");
	if (settings.boldFont == true) content.className+=" bold";
	
	populate();
	
	if(settings.showSearch == false && settings.showClear == false && settings.numLimit == settings.numItems) { document.getElementById("controls").style.display="none"; } else{
	//console.log("Controls show..");

		if (settings.showSearch == false){
			document.getElementById("searchQ").style.display="none";
		}
		if (settings.showClear == true) {
			document.getElementById("clr").style.display="inline";
		}else {
			document.getElementById("clrholder").style.display="none";
		}

		if (filterStrings!=null) {
			document.getElementById("tailenders").className="tailendersShow";
			document.getElementById("delete").style.display="inline";
			document.getElementById("prev").style.display="none";
			document.getElementById("next").style.display="none";
			document.getElementById("clrholder").style.display="none";
		}else{
			document.getElementById("delete").style.display="none";
			if(settings.showClear) document.getElementById("clrholder").style.display="table-cell";
			document.getElementById("prev").style.display="inline";
			document.getElementById("next").style.display="inline";
		}
	
	}
}

function populate(){
	
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);	
	if (closedTabIndex.length == 0){
		//console.log("No tabs");
		content.innerHTML=chrome.i18n.getMessage("popup_noTabsMsg");
		document.getElementById("controls").style.display="none";
	}else{
		//console.log("LOAD PAGE");
		content.innerHTML="";
		
		var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
		var disp_per_pg=settings.numItems;
		if (filterStrings!=null) disp_per_pg=1000;

		currentTime = Date.now(); 
		
		var i = closedTabIndex.length - 1;
		for(var j = 0; i>=0 && j<pageNo*disp_per_pg; i--){ if (localStorage["ClosedTab-"+closedTabIndex[i]]) j++;}

		for(var j = 0; i>=0 && j<disp_per_pg; i--){
			var closedTab = localStorage["ClosedTab-"+closedTabIndex[i]];
			if (closedTab){
				if (filterStrings==null || (filterStrings!=null && closedTab.multiFind(filterStrings))){
					createEntry(closedTabIndex[i],closedTab);
					j++;
				}
			}
		}

		if (filterStrings==null) {
			//console.log("No search");
			document.getElementById("tailenders").className="tailendersHide";
			document.getElementById("prev").style.visibility="hidden";
			document.getElementById("next").style.visibility="hidden";
			if (pageNo > 0) {
			//console.log("tailenders4");
			document.getElementById("tailenders").className="tailendersShow";
			document.getElementById("prev").style.visibility="visible";
			}
			if (closedTabIndex.length > (pageNo+1) * settings.numItems) {
			//console.log("tailenders5");
			document.getElementById("tailenders").className="tailendersShow";
			document.getElementById("next").style.visibility="visible";
			}
		}else{
			if (j==0) content.innerHTML="<center>"+chrome.i18n.getMessage("popup_noSearchResult")+" \'"+unescape(filterStrings.join(" "))+"\'</center>";
		}
	}
	
}

function createEntry(i,closedTab) {

	var split = closedTab.split("|!|");
	var tabTime = split[0];
	var tabUrl = split[1];
	var tabTitle = split[2];

	var text_link = createLink(i, tabUrl, tabTitle);
	var html;

	html="<img class=\"icon\" src=\"chrome://favicon/"+tabUrl+"\" alt=\""+tabUrl+"\">"; 

	if (filterStrings!=null) tabTitle=tabTitle.multiReplace(filterStrings);
	
	html+="<div class=\"titleTxt";
	if (settings.numLines!=0 && !isNaN(settings.numLines) && filterStrings==null) html+=" maxh"+settings.numLines+"";
	html+="\" style=\"width:"+tWidth+"px\"> "+ tabTitle +"</div>";
	
	if(settings.showTime){ 
		var spanClass = "nxtLine";
		if(settings.sexy) spanClass = "nxtLine smeLine delTxt";
		html+="<span class=\""+spanClass+"\">"+getElapsedTime(currentTime - tabTime)+"</span>";
	}
	
	var itm = document.createElement("div");
	itm.className = "item";
	
	var delBtn = document.createElement("div");
	delBtn.id = "del-"+i;
	delBtn.className = "del";
	delBtn.title = chrome.i18n.getMessage("popup_delbtn");
	delBtn.innerHTML = "<p class=\"delTxt\">×</p>";
	delBtn.addEventListener('click',function(event){ 
		event.stopPropagation(); //click-shield!
		removeClosedTab(i); 
		populate();
	},false);
	
	var delBg = document.createElement("div");
	delBg.className = "delBg";
	
	itm.innerHTML=html;
	itm.appendChild(delBtn);
	itm.appendChild(delBg);
	text_link.appendChild(itm);
	content.appendChild(text_link);
}

function searchFor(string) {
	string = string.replace(/(\%)/g, "%25");
	string = string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	string = stripVowelAccent(string);

	if ((filterStrings==null && string=="") || (filterStrings!=null && string==filterStrings.join(" "))) return;

	if (string==""){
		pageNo=0;
		filterStrings = null;
	}else{
		pageNo=0;
		//for(var i=0; i < filterStrings.length-1; i=i+1) { 
		string=string.toLowerCase();
		filterStrings = string.split(" "); 
	}
	clearTimeout(filterTimeOut);
	filterTimeOut=setTimeout(setup,200);
}
function next() {
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
	if (closedTabIndex.length > (pageNo+1) * settings.numItems) pageNo++;
	setup();
}

function prev() {
	if (pageNo > 0) pageNo--;
	setup();
}

function reset(){
	if (document.getElementById("searchQ").value!=""){
		document.getElementById("searchQ").value="";
		searchFor("");
	}else{
		resetData();
		pageNo = 0;
		setup();
	}
}

function deleteFoundTabs(){
	if (filterStrings==null) return;
	var closedTabIndex = JSON.parse(localStorage.ClosedTabIndex);
	for(i = closedTabIndex.length - 1; i>=0; i--){
		var closedTab = localStorage["ClosedTab-"+closedTabIndex[i]];
		if (closedTab){
			if (filterStrings!=null && closedTab.multiFind(filterStrings)){
				removeClosedTab(closedTabIndex[i]);
			}
		}
	}
	document.getElementById('searchQ').value = "";
	filterStrings = null;
	setup();
}

//math from http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
function getElapsedTime(ms){
	var text = "<b>";
	var s,min,h,days,x;
    x = ms / 1000;
    s = Math.floor(x % 60);
    x /= 60;
    min = Math.floor(x % 60);
    x /= 60;
    h = Math.floor(x % 24);
    x /= 24;
    days = Math.floor(x);
	// console.log(days+":"+h+":"+min+":"+s);
		
	if(days!=0) {text += days+" day"; if(days>1) text+="s";}
	else if((h!=0&&h<2)&&min!=0) {text += h+"h "+min+"min "}
	else if(h!=0) {text += h+"h "}
	else if(min!=0) {text += min+"min "}
	else if(s!=0) {text += s+"s "}	
	else {text += "0s "}
	text+="</b> ago";
	
	return text;
}

function cleanInvalidTabs(){
	chrome.tabs.query({"url":"*://*/*"}, function(tabs) {
		var tabListIndex = JSON.parse(localStorage.TabListIndex);
		// console.log(tabs.length+" tabs vs "+tabListIndex.length+" indexed");
		if(tabListIndex.length>tabs.length){
			var tabsToClean = tabListIndex.length-tabs.length;
			for(var t = 0; t<tabsToClean; t++){
				delete localStorage["TabList-"+tabListIndex[t]];
			}
			tabListIndex.splice(0,tabsToClean);
			localStorage.TabListIndex = JSON.stringify(tabListIndex);
		}
	});
}

function stripVowelAccent(str)
{
	var rExps=[ /[\xC0-\xC2]/g, /[\xE0-\xE2]/g,
		/[\xC8-\xCA]/g, /[\xE8-\xEB]/g,
		/[\xCC-\xCE]/g, /[\xEC-\xEE]/g,
		/[\xD2-\xD4]/g, /[\xF2-\xF4]/g,
		/[\xD9-\xDB]/g, /[\xF9-\xFB]/g ];

	var repChar=['A','a','E','e','I','i','O','o','U','u'];

	for(var i=0, j=rExps.length; i<j; ++i)
		str=str.replace(rExps[i],repChar[i]);

	return str;
}

String.prototype.multiFind = function ( strings ) {
//console.log("this-"+this);
	var str = this, i;
	str = stripVowelAccent(str);
	str = str.toLowerCase();
	if(settings.searchMode!=3){
		var splitStr = str.split("|!|");
		if(settings.searchMode==1) str = splitStr[2];
		if(settings.searchMode==2) str = splitStr[1];
	}
	var foundAmount=0;
	for(i = 0, j = strings.length; i < j; i++ ) {
	//console.log("str-"+str+"||strings[i]-"+strings[i]);
		if (str.indexOf(strings[i])!= -1) foundAmount++;
	}
	return (foundAmount==strings.length);
};
String.prototype.multiReplace = function ( strings ) {
	var str_real = this, i;
	var str = str_real;
	str = stripVowelAccent(str);
	str = str.toLowerCase();
	var position=-1;
	for(i = 0, j = strings.length; i < j; i++ ) {
		position = str.indexOf(strings[i]);
		if (position!= -1) {
			str_real = str_real.substr(0,position) + "<u>" + str_real.substr(position, strings[i].length) + "</u>" + str_real.substr(position + strings[i].length); 
			str = stripVowelAccent(str_real).toLowerCase();
		}
		//str = str.replace(new RegExp('(' + strings[i] + ')','gi'), replaceBy);
	}
	return str_real;
};

//keyboard navigation
var selLink = -1;
document.onkeydown = function(evt) {
    evt = evt || window.event;
	//left right
	if (evt.keyCode == 37||evt.keyCode == 39) { 
		if (evt.keyCode == 37) { 
           prev();
        }
        if (evt.keyCode == 39) { 
           next();
        }
	}
	//up down
	else if (evt.keyCode == 38||evt.keyCode == 40) {
        if (evt.keyCode == 38) { 
           if(selLink>0) selLink--;
		   else selLink=(document.links.length-1);
        }
        if (evt.keyCode == 40) { 
           if(selLink<(document.links.length-1)) selLink++;
		   else selLink=(0);
        }
		document.links[selLink].focus();
	}
	//enter
	else if (evt.keyCode == 13) {
		document.links[selLink].click();
	}
	else {
		document.getElementById('searchQ').focus();
	}
};

//populate popup and bind functions to buttons on popup load
document.addEventListener('DOMContentLoaded', function () {

document.body.style.width = settings.wPop+'px';
tWidth = settings.wPop - 30-5;
if(settings.sexy) tWidth -= 91;
setup();

document.getElementById('clr').addEventListener('click',reset);
document.getElementById('clr').title = chrome.i18n.getMessage("popup_clrbtn_tooltip");
document.getElementById('clr').innerHTML = chrome.i18n.getMessage("popup_clrbtn");
document.getElementById('searchQ').addEventListener('keyup',function(){
 searchFor(document.getElementById('searchQ').value);
});
document.getElementById('searchQ').title = chrome.i18n.getMessage("popup_search_tooltip");
document.getElementById('delete').addEventListener('click',deleteFoundTabs);
document.getElementById('delete').title = chrome.i18n.getMessage("popup_delbtn_tooltip");
document.getElementById('delete').innerHTML = chrome.i18n.getMessage("popup_delbtn");
document.getElementById('prev').addEventListener('click',prev);
document.getElementById('prev').title = chrome.i18n.getMessage("popup_prvbtn_tooltip");
document.getElementById('next').addEventListener('click',next);
document.getElementById('next').title = chrome.i18n.getMessage("popup_nxtbtn_tooltip");

cleanInvalidTabs();

});