class Verificator{
    constructor(){}

    static verifiedName(name){
        if(name=="" || name === undefined){
            return false
        }else{
            return true
        }
    }

    static verifiedState(gameState){
       if(gameState != 0){
           return false
       }else{
           return true
       }
    }
}