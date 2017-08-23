export default function(id, name, owner, personal, priv) {
    return {
        id: id,
        name: name,
        updatedOn: new Date().toUTCString(),
        owner: owner,
        personal: personal,
        priv: priv,
        vids: []
    }
}