module.exports = async(client, message) => {
    let channel = message.channel;
    let messages = await channel.fetchMessages({limit: 2}).catch((e) => console.log(`Something went wrong when fetching messages: ${e}.`));
    let prevMessage = messages.last();

    var valid = true;
    if (prevMessage.author.id == message.author.id) valid = false;
    if (message.content < prevMessage.content) valid = false;

    return(valid);
}