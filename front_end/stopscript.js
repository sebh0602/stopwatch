function run(){
	if (localStorage.id == undefined){
		var randomID = "";
		for (var i=0; i<8; i++){
			randomID += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
		}
		localStorage.id = randomID;
	}
	document.getElementById("title").innerHTML = localStorage.id;
	if (localStorage.log != undefined){
		document.getElementById("log").value = localStorage.log;
	}

}

function changeID(){
	var newID = document.getElementById("idSelector").value;
	if (newID != ""){
		localStorage.id = document.getElementById("idSelector").value;
		document.getElementById("title").innerHTML = localStorage.id;
		document.getElementById("idSelector").value = "";
	}
}

function controlHandler(type){
	switch(type){
		case "reset":
			if (confirm("Are you sure you want to reset?")){
				localStorage.removeItem("log");
				document.getElementById("log").value = "";
			}
			document.getElementById("hours").innerHTML = "00";
			document.getElementById("minutes").innerHTML = "00";
			document.getElementById("seconds").innerHTML = "00";
			document.getElementById("fracs").innerHTML = "0";
			break;
		default:
			if (localStorage.log == undefined){
				localStorage.log = "";
			}
			localStorage.log += ((type == "stop") ? "stop " : type) + "|" + new Date().toISOString() + "\n";
			document.getElementById("log").value = localStorage.log;
	}
}

function updateTime(){
	var log = localStorage.log;
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
		if (splitLog[i].includes(nextCommand)){
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
	}

	var hours = Math.floor(totalDelta / 3600000);
	totalDelta -= hours * 3600000;
	hours = hours.toString();
	if (hours.length < 2){
		hours = "0" + hours;
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

run();
var iv = setInterval(updateTime, 100);
