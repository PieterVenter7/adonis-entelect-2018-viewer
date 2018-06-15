'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')
const Helpers = use("Helpers")
const fs = Helpers.promisify(require('fs'));
const path = use("path")
Route.get('/', ({response}) => {
    return response.route('live')
})

Route.get('/game/live', ({view}) => {
    return view.render('live')
}).as('live')

Route.post('/game', ({session, request, response}) => {
    session.put('replay_path', request.input("replay_path"))
    // console.log(session.get("replay_path"))
    return response.route('game', { round: 0 })
})

Route.get('/game/:round/:speed?', async({view, params, session}) => {
    console.log(session.get('replay_path'))
    let rounds = await fs.readdir(session.get('replay_path'))
    let maxRounds = Math.max(...rounds.map(stat => parseInt(stat.replace( /^\D+/g, ''))))
    let thisRound = rounds.find(r => parseInt(r.replace( /^\D+/g, ''))===parseInt(params.round))
    let roundPath = path.join(session.get('replay_path'), thisRound)
    let playerAPath = (await fs.readdir(roundPath)).find(file => file.substring(0,1)==="A")
    let playerBPath = (await fs.readdir(roundPath)).find(file => file.substring(0,1)==="B")
    roundPath = path.join(roundPath,playerAPath)
    let state = await(require(path.join(roundPath,'JsonMap.json')))
    
    return view.render("game",{
        playerA: playerAPath,
        playerB: playerBPath,
        currentRound: parseInt(params.round),
        speed: parseInt(params.speed),
        state: state,
        gamePath: session.get('replay_path'),
        maxRounds: maxRounds
    })
    // return 'test'
}).as("game")
