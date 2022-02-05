const WebSocket = require("ws");
var fs = require("fs");
const wss = new WebSocket.Server({ port:8080, maxPayload:5000000}); //mayPayload in bytes
var idIndex = {};
var data = {};

function run(){
	if (fs.existsSync("data/data.json")){
		data = JSON.parse(fs.readFileSync("data/data.json").toString());
	}

	wss.on("connection", function connection(ws){
		ws.on("message", function incoming(message) {
			try{
				var msg = JSON.parse(message);
			} catch(err) {
				console.log(err);
				return;
			}
			var id = Buffer.from(msg.id).toString('base64');
			if (!idIndex.hasOwnProperty(id)){
				idIndex[id] = [ws];
			} else{
				var workingConnections = [];
				for (var i=0; i<idIndex[id].length;i++){
					if (idIndex[id][i].readyState == WebSocket.OPEN){
						workingConnections.push(idIndex[id][i]);
					}
				}
				if (!workingConnections.includes(ws)){
					workingConnections.push(ws);
				}
				idIndex[id] = workingConnections;
			}

			if (msg.log != undefined){
				data[id] = msg.log;
				var payload = {
					log:msg.log
				};
				payload = JSON.stringify(payload);
				for (var i=0; i < idIndex[id].length; i++){
					var client = idIndex[id][i];
					if (client != ws){
						client.send(payload);
					}
				}
				if (data[id] == ""){
					delete data[id];
				}
				fs.writeFileSync("data/data.json", JSON.stringify(data));
			} else{
				var payload = {
					log:(data[id] != undefined) ? data[id]:""
				};
				payload = JSON.stringify(payload);
				ws.send(payload);
			}

	    	//ws.send(message);
			console.log("_")
			for (key in idIndex){
				console.log(Buffer.from(Buffer.from(key, 'base64').toString('ascii'),"base64").toString("ascii"),idIndex[key].length);
			}
		});
	});

	console.log("Ready to handle connections!");
}

function cleanse(){
	for (id in idIndex){
		var workingConnections = [];
		for (var i=0; i<idIndex[id].length;i++){
			if (idIndex[id][i].readyState == WebSocket.OPEN){
				workingConnections.push(idIndex[id][i]);
			}
		}
		idIndex[id] = workingConnections;

		if (idIndex[id].length == 0){
			delete idIndex[id];
		}
	}
}

var iv = setInterval(cleanse,30000);
run();
