const socket = io();

// Elements
const $messageform = document.querySelector('#message-form');
const $messageFormInput = $messageform.querySelector('input');
const $messageFormButton = $messageform.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage =  $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
  };

//Text Message
socket.on('message', (msg) => {
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
})

//Location Message
socket.on('location-message', (locationmsg) => {
    console.log(locationmsg);
    const html = Mustache.render(locationTemplate, {
        username: locationmsg.username,
        url: locationmsg.url,
        createdAt: moment(locationmsg.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

//Users-SideBar
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault();
    //Disable Send Button
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        //Enable Send Button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        } else {
            console.log('Server has recieved it');
        }
    });
})

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        $sendLocationButton.removeAttribute('disabled');
        return alert('Geolocation is not supported by your browser');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocationButton.removeAttribute('disabled');
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error);
            }
            console.log('Location Sent!');
        });
    })


})


socket.emit('join', { username, room }, (error) =>{
    if(error){
        alert(error);
        location.href = '/';
    }
});