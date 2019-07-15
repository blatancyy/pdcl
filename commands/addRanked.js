exports.run = (client, message, args) => {
    if (message.author.id !== "207896400539680778") return;
    client.insertRanked(client, args);
}