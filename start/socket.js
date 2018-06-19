'use strict'

/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

const Ws = use('Ws')
const Event = use('Event')
const ENV = use('Env')
const fs = use('fs')
const {promisify} = use('Helpers')
const fsAsync = promisify(fs)
const path = use("path")

Ws.channel('live', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

fs.watch(ENV.get("LIVE_REPLAY_PATH"), async (eventType, filename) => {
  console.log(`newMatch ${filename}`)
  let matchPath = path.join(ENV.get("LIVE_REPLAY_PATH"),filename)
  watchRound(filename, matchPath)
//   if(Ws.getChannel('live').topic('live')) {
//     Ws
//       .getChannel('live')
//       .topic('live')
//       .broadcast('new:round',{
//         matchPath: matchPath,
//         match: filename,
//       })
//   }
})

function getLog(roundPath) {
  return new Promise(function(resolve, reject) {
    console.log(path.join(roundPath,'Console','BotOutput.txt'))
    fs.readFile(path.join(roundPath,'Console','BotOutput.txt'),'utf-8', function(err, data){
        if (err) 
            reject(err); 
        else 
          console.log(data)
          resolve(data);
    });
  });
}

async function watchRound(match,matchPath) {
  fs.watch(matchPath, async (eventType, filename) => {
    let roundPath = path.join(matchPath,filename)
    let thisRound = parseInt(filename.replace( /^\D+/g, ''))
    // console.log(fsAsync)
    setTimeout(async()=>{
      let playerAPath = (await fsAsync.readdir(roundPath)).find(file => file.substring(0,1)==="A")
      let playerBPath = (await fsAsync.readdir(roundPath)).find(file => file.substring(0,1)==="B")
      roundPath = path.join(roundPath,playerAPath)
      let state = await(require(path.join(roundPath,'JsonMap.json')))
      let playerLog = await getLog(roundPath)
      broadcastRound({
        matchPath: matchPath,
        match: match,
        currentRound: thisRound,
        playerA: playerAPath,
        playerB: playerBPath,
        state: state,
        playerLog: playerLog
      })
    },1000)
  })
}

function broadcastRound(data) {
  if(Ws.getChannel('live').topic('live')) {
    Ws
      .getChannel('live')
      .topic('live')
      .broadcast('new:round',data)
  }
}