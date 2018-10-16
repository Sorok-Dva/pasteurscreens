let Socket = {};
let socket = io.connect('https://hostmybot.tk', {query: 'user=' + user });

socket.on('connect', (data) =>  $('#stateServer').empty().append('Connecté.').css('color', 'green'));
socket.on('disconnect', (data) => $('#stateServer').empty().append('Connexion perdue.').css('color', 'red'));
socket.on('message', (data) => console.log(data));
socket.on('stats', (stats) => console.log(stats));
socket.on('install_bot', (data) => {
    console.log(data);
    if (data.info) {
        $.notify({
            // options
            icon: 'fa fa-info',
            title: 'Information :',
            message: data.info,
        },{
            type: 'info',
            placement: {
                from: 'bottom',
                align: 'left'
            },
            delay: 5000,
            timer: 5000,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            }
        });
    }
});
socket.on('botConsoleLogger', (data) => {
    console.log(data);
    if (data.showConsole) {
        $('[aria-labelledby="bot-terminal"]').modal('show');
        $('.terminal-body-inner').empty();
    }
    if (data.command) {
        $('.terminal-body-inner').append(`<p><span class="terminal-user">${invit}</span><span id="terminalType${data.id}"></span></p>`);
        let terminalTyped = new Typed(`#terminalType${data.id}`, {
            strings: [
                `${data.command}`
            ],
            typeSpeed: 10,
            backspeed: 0,
            backDelay: 3000,
            loop: false
        });
    } else if (data.answer) {
        $('.terminal-body-inner').append(`<p>${data.answer}</p>`);
    }
});

Socket.sendTchatMessage = (msg, nickname) => {
    socket.emit('send-message-to-chat', { msg, nickname });
};