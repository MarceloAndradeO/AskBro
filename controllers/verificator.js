var Products = require('../models/Players');

class Verificator{

    constructor(){}

    static verifiedName(name){
            if(name=="" || name === undefined){
                return false
            }else{
                return true
            }
    }
    static playerExistence(name){
        return new Promise((resolve,reject)=>{
            Products.getAll().then(players=>{
                players.forEach(player=>{
                    if(player.name == name){
                        resolve(true)
                    }
                })
                reject(false)
        })
    })
    
}

    static verifiedState(gameState){
       if(gameState == 0){
           return true
       }else{
           return false
       }
    }
}

module.exports = Verificator