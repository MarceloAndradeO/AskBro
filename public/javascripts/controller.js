
class Controller{
    constructor(){
        this.socket = io();
        this.login = document.getElementById("login");
        this.nick = document.getElementById("nickname");
        this.playerList = document.getElementById("allplayer-list");
        this.playerArea = document.getElementById("the-player");
        this.infoPlayers = document.getElementById("info-players");
        this.gameArea = document.getElementById("area-msg");
        this.cardHeader = document.getElementById("card-header");
        this.cardAsk =document.getElementById("card-ask");
        this.cardAnswer = document.getElementById("card-answer");
        this.buttonsAdmin= document.getElementById("admin-button")
        this.game
        this.player= 0
        this.onSubmit();
        this.addPlayer();
        this.getState();
        this.getAllPlAyers();
        this.dcPlayer();
        this.startedGame();
        this.timer();
        this.stage2();
        this.finishStage()
        this.finalized();
        this.results();
        this.done();
    }
// About Players on game
    onSubmit(){
        this.login.addEventListener('submit', event=>{
            event.preventDefault()
            //do verification if name is correctly and if game is running alredy;
            if(!Verificator.verifiedName(this.nick.value)){
                this.nick.setAttribute("class", "mb-2 border border-danger");
                this.nick.setAttribute("placeholder", "Type anything bro...")
            }else if(!Verificator.verifiedState(this.game.stage)){
               alert("Game is running bro OwO)b")
            }else{
                this.socket.emit("Nickname", this.nick.value);
            }
        })
    }

    addPlayer(){
        this.socket.on("newPlayer", response=>{
            this.addRow(response.player);
            this.game= response.game;
            this.attGame(this.game);
        })
        this.socket.on("player", response=>{
            if(response.player=="QwQ"){
                alert("Alredy Exist Bro")
            }else{
                this.player = response.player;
                this.thePlayer();
                this.sidebar();
                this.game= response.game;
                this.attGame(this.game); 
            }
        })
    }

    addRow(player){
       let playerRow =  document.createElement("li")
       playerRow.setAttribute("class", "list-group-item d-flex justify-content-between align-items-end")
       if(player.on =="false"){
        playerRow.setAttribute("class", "list-group-item d-flex justify-content-between align-items-start off")
    }
       playerRow.setAttribute("id", player.name)
       playerRow.innerHTML = 
       `
       <div class="number me-3" style="visibility: hidden;">${player.number}</div>
       <div class="admin">${player.admin == "OwO)b"?'<i class="fas fa-crown"></i>':'<i class="fas fa-chess-pawn"></i>'}</div>
       <div class="name ms-3">${player.name}</div>
       <div class="done  ms-auto me-auto"><i class="fas fa-pen"style="font-size: 20px"></i></div>
       <div class="online p-2 ${player.on == true ? 'bg-success': 'bg-danger'} border border-light rounded-circle"></div>
       `
       this.playerList.appendChild(playerRow)
    }
    thePlayer(){
        this.playerArea.innerHTML= 
        `
        <li class="list-group-item d-flex justify-content-between align-items-start" id="${this.player.name}">
        <div class="number me-3" style="visibility: hidden;">${this.player.number}</div>
        <div class="admin">${this.player.admin == "OwO)b"?'<i class="fas fa-crown"></i>':'<i class="fas fa-chess-pawn"></i>'}</div>
        <div class="name ms-3">${this.player.name}</div>
        <div class="done  ms-auto me-auto"><i class="fas fa-pen"style="font-size: 20px"></i></div>
        <div class="online p-2 ${this.player.on == true ? 'bg-success': 'bg-danger'} border border-light rounded-circle"></div>
      </li>
        `
    }

    btnsSend(){
        let done = document.getElementById("txt-msg").value
        if(this.game.stage == 1){
            this.socket.emit("ask", done,this.player)
        }else if(this.game.stage == 2){
            this.socket.emit("answer", done,this.player)
        }else{
            alert("anything wrong not is rigth");
        }
    }
     finalized(){
         this.socket.on("finish", game=>{
            let offPlayers = document.getElementsByClassName("off");
            Array.from(offPlayers).forEach(player=>{
                player.remove();
            })
            document.querySelector(".card").setAttribute("id", "timer")
            if(this.player.admin == "OwO)b"){
                document.querySelector("#finish").remove();
                document.querySelector("#btn-next").remove()
                document.querySelector("#btn-prev").remove()
            }
            this.cardAnswer.innerText =""
            this.cardHeader.innerText=""
            this.cardAsk.innerText=""
            this.game = game;
            this.attGame(this.game);
         })
    }

    getAllPlAyers(){
        this.socket.on("allPlayers", players =>{
            console.log("getAllPlayers: ", players);
            players.forEach(player=>{
                this.addRow(player);
            })
        })
    }
    dcPlayer(){
        this.socket.on("dc", (response)=>{
            console.log(response);
            if(response.newAdmin !== undefined){
                if(response.newAdmin.name == this.player.name){
                    this.player.admin ="OwO)b"
                }
            }

            if(this.game.stage == 0){
                if(response.newAdmin != undefined){  
                    this.updatePlayer(response.newAdmin)              
                }
                this.removePlayer(response.deletePlayer);
                
            }else{
                if(response.newAdmin != undefined){
                    this.updatePlayer(response.newAdmin)
                }
                this.updatePlayer(response.deletePlayer)
                
            }
            this.game = response.game
            this.attGame(this.game);
        })
    }
    //game doing
    startedGame(){
        this.socket.on("started", game=>{
            this.game= game
            if(this.player.admin =="OwO)b"){
                document.getElementById("btn-start").remove();
            }
            this.attGame(this.game);
            if(this.player != 0){
                this.removeCute();
            }
        })
    }
    stage2(){
        this.socket.on("stage2", game=>{
            this.game= game
            if(this.player != 0){
                this.socket.emit("bringPhrase");
                this.socket.on("phrase", phrase=>{
                    console.log("here", phrase);
                    this.removeCute(phrase);
                })
            }
            this.attGame(this.game);
        })
    }
    finishStage(){
        this.socket.on("stage3", game=>{
            this.game = game
            if(this.player != 0){
                this.addCute();
            }
            this.changeResults();
            this.attGame(this.game)
            this.socket.emit("results")
        })
    }
    done(){
        this.socket.on("done", (game)=>{
            this.attGame(game);
        })
    }
    //-about game state
    getState(){
        this.socket.on("gameStatus", gameStatus=>{
            this.game = gameStatus;
            if(gameStatus != 3){
                document.querySelector(".card").setAttribute("id", "timer")
            }else{
                document.querySelector(".card").setAttribute("id", "modal")
            }
            this.attGame(this.game);
        })
    }
    //about view

    removePlayer(player){
        let listItem = document.getElementById(player.name);
        listItem.remove();
    }

    updatePlayer(player){
        let listsItem= document.getElementById(player.name);
        if(player.on === false ){
            listsItem.setAttribute("class", "list-group-item d-flex justify-content-between align-items-start off")
        }
        listsItem.innerHTML= 
        `
        <div class="number me-3" style="visibility: hidden;">${player.number}</div>
        <div class="admin">${player.admin == "OwO)b"?'<i class="fas fa-crown"></i>':'<i class="fas fa-chess-pawn"></i>'}</div>
        <div class="name ms-3">${player.name}</div>
        <div class="done  ms-auto me-auto"><i class="fas fa-pen"style="font-size: 20px"></i></div>
        <div class="online p-2 ${player.on == true ? 'bg-success': 'bg-danger'} border border-light rounded-circle"></div>
        `
    }

    sidebar(){

        document.getElementById("wrapper").setAttribute("class", "Logged");
    setTimeout(()=>{
        document.getElementById("login").remove();
    },300)

    }
    //atualize game view info
    attGame(game){

        this.infoPlayers.innerHTML = `<p> Total Players : ${game.totalDone}/${game.numberPlayers}</p>`
        if(this.player != 0 ){
            if(this.player.admin== "OwO)b"){
                this.btnsAdmin();
            }
        }
        this.stageView();
    }

    btnsAdmin(){
        if(this.game.stage ==0){
            let btnStart = document.createElement("button")
            btnStart.setAttribute("id", "btn-start")
            btnStart.setAttribute("class","btn btn-dark mt-1 mb-1")
            btnStart.innerText = "Start"
            document.getElementById("hmmm").innerHTML =  ``;
            document.getElementById("hmmm").appendChild(btnStart);
            btnStart.addEventListener('click', ()=>{
                this.startGame();
            })
        }else{
        }
    }
    stageView(){
        document.getElementById("stage").innerHTML =
        `
        <span class="badge ${this.game.stage == 0? "bg-dark" : "bg-secondary" }">Waiting Start</span>
        <span class="badge ${this.game.stage == 1? "bg-dark" : "bg-secondary" }"">Asks</span>
        <span class="badge ${this.game.stage == 2? "bg-dark" : "bg-secondary" }">Answers</span>
        <span class="badge ${this.game.stage == 3? "bg-dark" : "bg-secondary" }">Results</span>
        `
    }

    startGame(){
        if(this.game.numberPlayers >=3){
            this.socket.emit("start", "true");
        }else{
            alert("need + players");
        }
    }

    timer(){
        this.socket.on("timer", timer=>{
            this.updateTimer(timer);
        })
    }
    removeCute(phrase = null){
        this.gameArea.innerHTML = "";
        let form = document.createElement("form")
        form.setAttribute("id", "send-msg")
        form.innerHTML = 
        `
        <p>${phrase != null ? phrase : ""}</p>
        <input type="text" class="mb-1" id="txt-msg">
        <button type="submit" class="btn btn-dark" id="btn-send">SEND</button>
        `
        form.addEventListener("submit", event=>{
            event.preventDefault();
            this.btnsSend();
            this.addCute();
        })
        this.gameArea.appendChild(form);
        
    }
    addCute(){
        this.gameArea.innerHTML = `<img src="images/waiting.gif" id="image" class="mt-3">`
    }
    updateTimer(time){

        this.cardHeader.innerText= "Timer"
        this.cardAsk.innerText = time;
        this.cardAnswer.innerText = ""

    }
    changeResults(){
       document.querySelector(".card").setAttribute("id", "modal")

        this.cardHeader.innerText ="Name"
        this.cardAsk.innerText="Ask"
        this.cardAnswer.innerText="Answer"

        if(this.player.admin == "OwO)b"){    
            //btn prev next
            let btnPrev =document.createElement("button");
            let btnNext = document.createElement("button");
            btnPrev.disabled= true;
            btnNext.disabled=false;
            btnNext.setAttribute("id", "btn-next");
            btnPrev.setAttribute("id", "btn-prev");
            btnNext.innerText = "Next"
            btnPrev.innerText = "Previous"

            btnPrev.addEventListener("click", ()=>{
                this.socket.emit("NextPrev", -1)
            })
            btnNext.addEventListener("click", ()=>{
                this.socket.emit("NextPrev", 1)
            })
            //prev next finisgh
            // btn finalizer//
            let btnFinalizer = document.createElement("button");
            btnFinalizer.setAttribute("id", "finish")
            btnFinalizer.innerText = "Finalizer"
            btnFinalizer.addEventListener("click", ()=>{
                this.socket.emit("finalize");
            })
            btnFinalizer.value="Finalizar"
            this.buttonsAdmin.appendChild(btnFinalizer);
            this.buttonsAdmin.appendChild(btnPrev);
            this.buttonsAdmin.appendChild(btnNext);
        }
    }
    results(){ 
        this.socket.on("result", (player,game)=>{
            this.cardHeader.innerText = player.name;
            this.cardAnswer.innerText = player.answer;
            this.cardAsk.innerText = player.ask;
            this.game = game
            if(this.player.admin == "OwO)b"){
               if(this.game.currentPlayer ==  0){
                document.getElementById("btn-prev").disabled = true
            }else{
                document.getElementById("btn-prev").disabled = false
            }

            if(this.game.currentPlayer == (this.game.numberPlayers-1)){
                document.getElementById("btn-next").disabled = true
            }else{
                document.getElementById("btn-next").disabled = false
            }

        }
        })
    }
}