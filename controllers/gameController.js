const socketIO = require('socket.io')();
const Game = require("../models/Game")
const Player = require("../models/Players");
const Verificator = require('./verificator');
var game = new Game();


socketIO.on('connection', socket =>{
    // When connect get all game Status
    socket.emit("gameStatus", game);
    Player.getAll().then(players =>{
        socket.emit("allPlayers", players);
    })

    //For enter a new Player
    socket.on("Nickname", (nickname)=>{
        Verificator.playerExistence(nickname).then(()=>{
            socket.emit("player", "QwQ");
        
        }).catch(()=>{
            if(!Verificator.verifiedState(game.stage) || !Verificator.verifiedName(nickname)){
                socket.emit("error", "tOwOt");
            }else{
                let newPlayer = new Player(socket.id)
                newPlayer.name = nickname
                if(game.numberPlayers == 0){
                    newPlayer.admin="OwO)b"
                }
                newPlayer.create().then(player=>{
                    game.addPlayer();
                    let response ={game, player}
                    socket.emit("player", response)
                    socket.broadcast.emit("newPlayer", response)
                    
                })
            }
        })
        })
    //-- end new Player Event
    //game EVENTS

    socket.on("ask", (message)=>{
        game.addPhrase(message,socket.id, "ask").then(()=>{
            
            game.peopleDone();
            socket.emit("done", game)
            socket.broadcast.emit("done",game)
        })
    })
    socket.on("bringPhrase", ()=>{
        Player.findOne(socket.id).then(player=>{
            console.log(player);
            socket.emit("phrase", player.ask)
        })
    })
    socket.on("answer", message=>{

        Player.findOne(socket.id).then(player=>{
            let answered = new Player(player.id)
            
            answered.updatePlayer(player);
            answered.answer = message
            game.peopleDone()
            answered.update().then(player=>{
                socket.emit("done", game)
                socket.broadcast.emit("done", game)
            });
            
        })

    })
    socket.on("results", ()=>{
        Player.findByNumber(game.currentPlayer).then(player=>{
            socket.emit("result", player,game)
        })
    })
    socket.on("NextPrev", action=>{
        Player.findByNumber((game.currentPlayer + action)).then(player=>{
            if(action == 1){
                game.currentPlayer=  game.currentPlayer +1;
            }else{
                game.currentPlayer=  game.currentPlayer -1;
            }
            socket.emit("result", player,game)
            socket.broadcast.emit("result", player,game)
        })
    })
    socket.on("finalize", ()=>{
        game.reset()
        console.log(game)
        socket.emit("finish", game);
        socket.broadcast.emit("finish",game)
    })

    //when start game// about stages// cahnging states
    socket.on("start", message=>{
        if(game.numberPlayers >= 3){
            game.changeState();
            game.SortPhrases().then(()=>{
                game.defineNumbers();
                socket.emit("started", game);
                socket.broadcast.emit("started", game);
                let time = 0
                let interval = setInterval(()=>{
                      time++
                      socket.broadcast.emit("timer", time)
                      socket.emit("timer", time)
                      //finissh stage 1-------------------------------------------------
                      if(time == 31 || game.totalDone == game.numberPlayers){
                          //START STAGE 2
                          game.changeState();
                          time = 0 ;
                            
    
                                socket.emit("stage2", game)
                                socket.broadcast.emit("stage2", game)
                                   clearInterval(interval);
                                   let newInterval = setInterval(()=>{
                                     socket.emit("timer", time)
                                     socket.broadcast.emit("timer", time)
                                      ////////Finish Stage 2
                                        if(time == 31 || game.totalDone == game.numberPlayers){
                                            game.changeState();
                                            time = 0 ;
                                            socket.emit("stage3", game)
                                            socket.broadcast.emit("stage3", game)
                                            clearInterval(newInterval);
                                         }
                                        time ++
                                        },1000)
                              
                      }
                  },1000)
            });
        }

    })

    //WhenDisconect

    socket.on('disconnect', ()=>{
        Player.findOne(socket.id).then(player=>{
            let deletePlayer = new Player(socket.id)
            deletePlayer.updatePlayer(player);
            if(game.stage == 0){
                game.reducePlayers();
                deletePlayer.delete().then(()=>{
                    if(deletePlayer.admin == "OwO)b"){
                        if(game.numberPlayers !=0){
                            game.newAdmin().then(newAdmin=>{
                                let response= {
                                    newAdmin: newAdmin,
                                    deletePlayer: deletePlayer,
                                    game:game
                                }
                             socket.broadcast.emit("dc",response)
                        });
                        }
                }else{
                    let response= {
                        newAdmin: undefined,
                        deletePlayer: deletePlayer,
                        game:game
                    }
                        socket.broadcast.emit("dc", response)
                }
                });
            }else{
                deletePlayer.on = false
                deletePlayer.update().then(()=>{
                    if(deletePlayer.admin == "OwO)b"){
                           game.newAdmin().then(newAdmin=>{
                            let response= {
                                newAdmin: newAdmin,
                                deletePlayer: deletePlayer,
                                game:game
                            }
                            socket.broadcast.emit("dc", response)
                        });
                    }else{ 
                         let response= {
                        newAdmin: undefined,
                        deletePlayer: deletePlayer,
                        game:game
                    }
                        socket.broadcast.emit("dc", response)
                    }
                });
            }
        }).catch(()=>{})
    })


})


module.exports = socketIO;