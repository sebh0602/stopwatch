function run(){
	if (window.location.search.indexOf("?id=") != -1){
		idFromUrl();
	}else if (localStorage.id == undefined){
		var randomID = "";
		for (var i=0; i<8; i++){
			randomID += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
		}
		localStorage.id = randomID;
		sessionStorage.id = randomID;
		updateURL();
	} else{
		sessionStorage.id = localStorage.id;
		updateURL();
	}
	document.getElementById("title").innerHTML = sessionStorage.id;
	document.title = "Stopwatch | " + sessionStorage.id;

	if (localStorage.log != undefined){
		var log = localStorage.log;
	} else if (sessionStorage.log != undefined){
		var log = sessionStorage.log;
	} else{
		var log;
	}

	if (log != undefined && log != ""){
		sessionStorage.log = log;
		document.getElementById("log").value = log;
		var splitLog = log.split("\n");
		splitLog = splitLog.slice(0,splitLog.length - 1);
		if (splitLog[splitLog.length - 1].indexOf("start") != -1){
			document.getElementById("startbutton").disabled = true;
		} else{
			document.getElementById("stopbutton").disabled = true;
		}
	} else{
		document.getElementById("stopbutton").disabled = true;
	}

	hostname = ((window.location.protocol == "https:") ? "wss://" : "ws://") + window.location.hostname + "/ws/";
	wSocket = new WebSocket(hostname);
	wSocket.onmessage = update;

	get();
}

function get(){
	var job = function(){
		payload = {
			id:btoa(sessionStorage.id)
		};
		payload = JSON.stringify(payload);
		wSocket.send(payload);
	}

	checkSocket();
	if (wSocket.readyState == WebSocket.CONNECTING){
		wSocket.onopen = job;
	} else{
		job();
	}
}

function push(){
	var job = function(){
		payload = {
			id:btoa(sessionStorage.id),
			log:(sessionStorage.log != undefined) ? sessionStorage.log:""
		};
		payload = JSON.stringify(payload);
		wSocket.send(payload);
	}

	checkSocket();
	if (wSocket.readyState == WebSocket.CONNECTING){
		wSocket.onopen = job;
	} else{
		job();
	}
}

function update(msg){
	var newLog = JSON.parse(msg.data).log;
	if (newLog == ""){
		reset();
	} else{
		sessionStorage.log = JSON.parse(msg.data).log;
		localStorage.log = sessionStorage.log;
		localStorage.id = sessionStorage.id;
		document.getElementById("log").value = sessionStorage.log;
	}
}

function checkSocket(){
	if (wSocket.readyState == WebSocket.CLOSED || wSocket.readyState == WebSocket.CLOSING){
		wSocket = new WebSocket(hostname);
		wSocket.onmessage = update;
		get();
	}
}

function changeID(){
	var newID = document.getElementById("idSelector").value;
	if (newID != ""){
		sessionStorage.id = document.getElementById("idSelector").value;
		localStorage.id = sessionStorage.id;
		reset();
		updateURL();
		document.getElementById("title").innerHTML = sessionStorage.id;
		document.title = "Stopwatch | " + sessionStorage.id;
		document.getElementById("idSelector").value = "";
		wSocket.close();
		get();
	}
}

function updateURL(){
	var newURL = window.location.href.split("?id=")[0] + "?id=" + encodeURI(sessionStorage.id);
	if (window.location.href.indexOf("?id=") == -1){
		window.history.replaceState(null,"",newURL);
	} else{
		window.history.pushState(null,"",newURL);
	}
}

function idFromUrl(){
	var id = decodeURI(window.location.search.split("?id=")[1]);
	if (id == "undefined"){
		return;
	}

	if (id != localStorage.id){
		localStorage.removeItem("log");
	}
	if (id != sessionStorage.id){ //a change in id has taken place (not reload)
		localStorage.removeItem("log");
		sessionStorage.removeItem("log");
	}
	sessionStorage.id = id;
	localStorage.id = id;

	document.getElementById("title").innerHTML = id;
	document.title = "Stopwatch | " + id;
	if (typeof wSocket !== "undefined"){
		wSocket.close();
		get();
	}
}

function updateTime(){
	var log = sessionStorage.log;
	if (log == undefined){
		return;
	}
	var splitLog = log.split("\n");
	splitLog = splitLog.slice(0,splitLog.length - 1);
	var nextCommand = "start";
	var start;
	var stop;
	var totalDelta = 0;
	for (var i = 0; i < splitLog.length; i++){
		if (splitLog[i].indexOf(nextCommand) != -1){
			if (nextCommand == "start"){
				start = new Date(splitLog[i].split("|")[1]);
				nextCommand = "stop";
			} else{
				stop = new Date(splitLog[i].split("|")[1]);
				totalDelta += stop - start;
				nextCommand = "start";
			}
		}
	}
	if (nextCommand == "stop"){
		totalDelta += new Date() - start;
		document.getElementById("stopbutton").disabled = false;
		document.getElementById("startbutton").disabled = true;
	} else{
		document.getElementById("stopbutton").disabled = true;
		document.getElementById("startbutton").disabled = false;
	}

	var negative = (totalDelta < 0) ? true:false;
	if (negative){
		totalDelta *= -1;
	}

	var hours = Math.floor(totalDelta / 3600000);
	totalDelta -= hours * 3600000;
	hours = hours.toString();
	if (hours.length < 2){
		hours = "0" + hours;
	}
	if (negative){
		hours = "-" + hours;
	}

	var minutes = Math.floor(totalDelta / 60000);
	totalDelta -= minutes * 60000;
	minutes = minutes.toString();
	if (minutes.length < 2){
		minutes = "0" + minutes;
	}

	var seconds = Math.floor(totalDelta / 1000);
	totalDelta -= seconds * 1000;
	seconds = seconds.toString();
	if (seconds.length < 2){
		seconds = "0" + seconds;
	}

	var fracs = Math.floor(totalDelta / 100);


	document.getElementById("hours").innerHTML = hours;
	document.getElementById("minutes").innerHTML = minutes;
	document.getElementById("seconds").innerHTML = seconds;
	document.getElementById("fracs").innerHTML = fracs;
}

function controlHandler(type){
	if (sessionStorage.log == undefined){
		sessionStorage.log = "";
	}
	switch(type){
		case "reset":
			reset();
			break;
		case "start":
			sessionStorage.log += "start|" + new Date().toISOString() + "\n";
			localStorage.log = sessionStorage.log;
			localStorage.id = sessionStorage.id;
			document.getElementById("log").value = sessionStorage.log;
			break;
		case "stop":
			sessionStorage.log += "stop |" + new Date().toISOString() + "\n\n";
			localStorage.log = sessionStorage.log;
			localStorage.id = sessionStorage.id;
			document.getElementById("log").value = sessionStorage.log;
			break;
		default:
			console.log("something went wrong");
	}
	push();
}

function reset(){
	localStorage.removeItem("log");
	sessionStorage.removeItem("log");
	document.getElementById("log").value = "";
	document.getElementById("hours").innerHTML = "00";
	document.getElementById("minutes").innerHTML = "00";
	document.getElementById("seconds").innerHTML = "00";
	document.getElementById("fracs").innerHTML = "0";
	document.getElementById("stopbutton").disabled = true;
	document.getElementById("startbutton").disabled = false;
	if (!document.getElementById("log").disabled){
		document.getElementById("editButton").innerHTML = "Edit";
		document.getElementById("log").disabled = true;
	}
}

function edit(){
	var editMode = document.getElementById("log").disabled;
	document.getElementById("log").disabled = !editMode;
	if (editMode){
		document.getElementById("editButton").innerHTML = "Submit";
	} else{
		document.getElementById("editButton").innerHTML = "Edit";
		sessionStorage.log = document.getElementById("log").value;
		localStorage.log = sessionStorage.log;
		localStorage.id = sessionStorage.id;
		push();
	}
}

run();
var iv = setInterval(updateTime, 100);
var iv2 = setInterval(checkSocket, 1000);
window.onpopstate = idFromUrl;
