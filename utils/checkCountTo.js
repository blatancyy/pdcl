module.exports = async(client, message) => {
    let channel = message.channel;
    let messages = await channel.fetchMessages({limit: 2}).catch((e) => console.log(`Something went wrong when fetching messages: ${e}.`));
    let prevMessage = messages.last();

    var valid = true;
    // Same Author:
    if (prevMessage.author.id == message.author.id) valid = false;

    // Compare strings:
    let isNAN = isNaN(message.content);
    if (isNAN) valid = false;

    let sentNum = + message.content;
    if (isNaN(sentNum)) valid = false;

    let prevNum = + prevMessage.content;
    if (sentNum < prevNum) valid = false;

    return(valid);
}