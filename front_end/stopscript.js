function run(){
	if (localStorage.id == undefined){
		randomID = "";
		for (var i=0; i<8; i++){
			randomID += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
		}
		localStorage.id = randomID;
	}
	document.getElementById("title").innerHTML = localStorage.id;

}

function changeID(){
	newID = document.getElementById("idSelector").value;
	if (newID != ""){
		localStorage.id = document.getElementById("idSelector").value;
		document.getElementById("title").innerHTML = localStorage.id;
	}
}

run();
