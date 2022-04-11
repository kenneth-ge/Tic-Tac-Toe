let room = require('./room')

let rooms = new Map()

let onconnect = (ws, req) => {
    let currentRoom = req.url

    if(!rooms.has(currentRoom)){
        rooms.set(currentRoom, room.Room())
    }

    rooms.get(currentRoom).addClient(ws)
}

module.exports = onconnect