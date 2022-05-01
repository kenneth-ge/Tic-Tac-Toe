let room = require('./room')

let rooms = new Map()

let onconnect = (ws, req) => {
    let currentRoom = req.url.slice(0, 10)

    if(!rooms.has(currentRoom)){
        rooms.set(currentRoom, room.Room())
    }

    if(rooms.get(currentRoom).inactive()){
        console.log('inactive')
        rooms.set(currentRoom, room.Room())
    }

    rooms.get(currentRoom).addClient(ws)
}

module.exports = onconnect