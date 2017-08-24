export default function(id, name, owner, uid, personal, priv) {
    return {
        id: id,
        name: name,
        updatedOn: new Date().toUTCString(),
        owner: owner,
        uid: uid,
        personal: personal,
        priv: priv,
        vids: []
    }
}