const users = [];

const addUser = ({ id, username, room }) => {

    // Modify the username and room
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Check if room and username are empty
    if (!username || !room) {
        return {
            error: 'Username & Room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store User
    const user = { id, username, room };
    users.push(user);

    return {user};

}

// Remove User Function
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Get user Function
const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })
    return user;
}

// Get Users in Room
const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });
    return usersInRoom;
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


