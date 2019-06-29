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
	if (splitLog[splitLog.length - 1].includes("start")){
		var lastStart = splitLog[splitLog.length - 1].split("|")[1];
		var delta = new Date() - new Date(lastStart);
		console.log(delta);
	}
	/*var t = new Date()
	document.getElementById("hours").innerHTML = t.getHours();
	document.getElementById("minutes").innerHTML = t.getMinutes();
	document.getElementById("seconds").innerHTML = t.getSeconds();
	//document.getElementById("fracs").innerHTML = Math.floor(t.getMilliseconds()/10);*/
}

run();
var iv = setInterval(updateTime, 200);
