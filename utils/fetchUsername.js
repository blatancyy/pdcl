module.exports = (client, uncleaned_uuid) => {
    let request = client.request;
    let uuid = clean(uncleaned_uuid);
    var ign = null;

    request.get({url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true}, (e, r, b) => {
        if (!b) return;
        
        if (b.constructor.name !== "Array") return ign = b.name;
        ign = b.pop().name;
    });

    return ign;
}

const clean = (uuid) => {
    if (typeof(uuid) !== "string") return false;
    return uuid.replace(/-/g, "");
}