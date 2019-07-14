module.exports = async (client, uncleaned_uuid) => {
    let request = client.request_promise;
    let uuid = clean(uncleaned_uuid);
    let ign = null;

    let b = await request({ url: `https://api.mojang.com/user/profiles/${uuid}/names`, json: true });
    if (!b) return;
        
    if (b.constructor.name !== "Array") return ign = b.name;
    ign = b.pop().name;

    return ign;
}

const clean = (uuid) => {
    if (typeof(uuid) !== "string") return false;
    return uuid.replace(/-/g, "");
}