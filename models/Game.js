const { playerExistence } = require("../controllers/verificator");
const Player = require("./Players");

class Game{
    
    #Phrases;
    constructor(){
        this.stage = 0
        this.numberPlayers =0
        this.totalDone=0
        this.#Phrases = [];
        this.currentPlayer = 0 ;
    }
    changeState(){
        this.stage = this.stage +1
        if(this.stage==4){
            this.reset()
        }else{
            this.totalDone= 0;
        }
    }
    addPlayer(){
        this.numberPlayers = this.numberPlayers+1
    }
    peopleDone(){
        this.totalDone = this.totalDone + 1
    }

    SortPhrases(){

        this.#Phrases = []
        
        return new Promise((resolve,reject)=>{
            let index = 0
            let rn=0

        while(this.numberPlayers > this.#Phrases.length){

            rn = Math.floor(Math.random() * this.numberPlayers);

            if(rn != index && this.#Phrases.indexOf(rn) == -1){
                this.#Phrases.push(rn)
                index++
            }else if(index == this.numberPlayers-1 && index == rn && this.#Phrases.indexOf(rn) == -1 ){

                this.#Phrases = []
                index = 0;
            }
        }
        resolve("OwO)b")

        })
    }
    reducePlayers(){
        this.numberPlayers = this.numberPlayers-1
        if(this.numberPlayers == 0){
            this.reset();
        }
    }
    reset(){
        this.stage = 0
        this.#Phrases = []
        this.totalDone = 0
        this.currentPlayer = 0;
        this.removeOffPlayers();
    }
    newAdmin(){
        return new Promise((resolve,reject)=>{
            Player.getAll().then(player=>{
                player = player.filter(player=>{
                    if(player.on == true){
                        return true
                    }else{ return false}
                })
                let newAdmin = new Player(player[0].socket)
                newAdmin.updatePlayer(player[0]);
                newAdmin.admin = "OwO)b"
                newAdmin.update()
                resolve(newAdmin)
            })
        })
    }

    addPhrase(phrase,socket,type){

        return new Promise((resolve, reject)=>{
            Player.findOne(socket).then(player=>{
                let number = this.#Phrases[player.number]
                Player.findByNumber(number).then(player=>{
                    let newPlayer = new Player(player.socket)
                    newPlayer.updatePlayer(player)
                    if(type == "ask"){
                        newPlayer.ask = phrase
                    }else if(type =="answer"){
                        newPlayer.answer = phrase
                    }
                    newPlayer.update().then(updated=>{
                        resolve(updated);
                    });
                })
            })
        })
    }
    defineNumbers(){
        Player.getAll().then(players=>{
            let number = 0;
            players.forEach(player=>{
                let newNumber = new Player(player.socket);
                newNumber.updatePlayer(player)
                newNumber.number = number
                newNumber.update();
                number++
            })
        })
    }
    removeOffPlayers(){
        Player.getAll().then(players=>{
            players.forEach(player=>{
                let deleted = new Player(player.socket)
                deleted.updatePlayer(player)
                if(deleted.on == false){
                    deleted.delete();
                }
            })
        })
    }
    }

module.exports = Game