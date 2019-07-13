module.exports = (client, uncleaned_uuid) => {
    let request = client.request;
    let uuid = clean(uncleaned_uuid);

    request.get({url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true}, (e, r, b) => {
        if (!b) return null;
    
        if (b.constructor.name !== "Array") return b.name;
        return b.pop().name;
    });

}

const clean = (uuid) => {
    if (typeof(uuid) !== "string") return false;
    return uuid.replace(/-/g, "");
}