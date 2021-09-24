const nedb = require('nedb');
const Game = require('./Game');
const playerData = new nedb({ filename: 'players.db', autoload: true })

class Player{
    constructor(socket){
        this.socket = socket
        this.name="Sr Picas"
        this.number=0
        this.ask =""
        this.answer=""
        this.askNumber=0
        this.admin = "tOwOt"
        this.on = true
    }

    create(){

        //creating the player
        return new Promise((resolve, reject)=>{

            let player = {
        
                socket: this.socket,
                name: this.name,
                number: this.number,
                ask: this.ask,
                answer: this.answer,
                askNumber: this.askNumber,
                admin: this.admin,
                on: this.on
            }
        
           playerData.insert(player, (err,player)=>{
                (err)? reject(err): resolve(player)
            });
    })
}
   delete(){
       //delete the player
       return new Promise((resolve,reject)=>{
        playerData.remove({socket: this.socket}, {}, err=>{
            (err)? reject(err): resolve(true)
            })
        })
   }
   update(){
    //update the player
      return new Promise((resolve,reject)=>{

        let updated = { 
            socket: this.socket,
            name: this.name, 
            ask: this.ask, 
            answer: this.answer, 
            askNumber: this.askNumber, 
            admin: this.admin, 
            number: this.number,
            on :this.on
        }

        playerData.update({socket: this.socket}, updated, err=>{
            err ? reject(err): this.updatePlayer(updated); resolve(updated) }
            )
      })
   }
   //update class player after update on BD
   updatePlayer(data){

       this.name = data.name
       this.socket = data.socket
       this.answer = data.answer
       this.ask = data.ask
       this.askNumber= data.askNumber
       this.admin = data.admin
       this.number = data.number
       this.on = data.on
       this.done = false;

    }
    static findOne(socket){
        return new Promise((resolve,reject)=>{
            playerData.findOne({socket: socket},(err,player)=>{
             err? reject(err) : resolve(player)
            })
        }) 
    }
    static findByNumber(number){
    
        return new Promise((resolve,reject)=>{
            playerData.findOne({number: number},(err,player)=>{
                err? reject(err) : resolve(player)
            })
        })     
    }
    static getAll(){
        return new Promise((resolve,reject)=>{
            playerData.find({}).sort({}).exec((err,player)=>{
                err? reject(err) : resolve(player)
            })
        })
    }
}

module.exports = Player