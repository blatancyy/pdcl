exports.run = (client) => {
    const leagues = ["CCL", "CWCL", "BCL", "MSCL", "SWCL"];
    let random = Math.floor(Math.random() * 5) + 0;

    client.user.setActivity(`${leagues[random]} | !invite`, { type: 'WATCHING'});
}

exports.time = 5000;