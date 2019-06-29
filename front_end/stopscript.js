function run(){
	if (localStorage.id == undefined){
		var randomID = "";
		for (var i=0; i<8; i++){
			randomID += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
		}
		localStorage.id = randomID;
	}
	document.getElementById("title").innerHTML = localStorage.id;

	var log = localStorage.log
	if (log != undefined){
		document.getElementById("log").value = log;
		var splitLog = log.split("\n");
		splitLog = splitLog.slice(0,splitLog.length - 1);
		if (splitLog[splitLog.length - 1].includes("start")){
			document.getElementById("startbutton").disabled = true;
		} else{
			document.getElementById("stopbutton").disabled = true;
		}
	} else{
		document.getElementById("stopbutton").disabled = true;
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
	if (localStorage.log == undefined){
		localStorage.log = "";
	}
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
			document.getElementById("stopbutton").disabled = true;
			document.getElementById("startbutton").disabled = false;
			break;
		case "start":
			localStorage.log += "start|" + new Date().toISOString() + "\n";
			document.getElementById("log").value = localStorage.log;
			document.getElementById("startbutton").disabled = true;
			document.getElementById("stopbutton").disabled = false;
			break;
		case "stop":
			localStorage.log += "stop |" + new Date().toISOString() + "\n\n";
			document.getElementById("log").value = localStorage.log;
			document.getElementById("startbutton").disabled = false;
			document.getElementById("stopbutton").disabled = true;
			break;
		default:
			console.log("something went wrong");
	}
}

function edit(){
	var editMode = document.getElementById("log").disabled;
	document.getElementById("log").disabled = !editMode;
	if (editMode){
		document.getElementById("editButton").innerHTML = "Submit";
	} else{
		document.getElementById("editButton").innerHTML = "Edit";
		localStorage.log = document.getElementById("log").value;
	}
}

run();
var iv = setInterval(updateTime, 100);
