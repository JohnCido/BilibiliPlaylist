function getLists() {
    return JSON.parse(localStorage.getItem('lists'))
}

export default {
    saveList: (list) => {
        var lists = getLists()
        if (lists === null) { lists = {} }
        lists[`${list.id}`] = list
        localStorage.setItem('lists', lists)
    },

    getList: (id) => {
        var lists = getLists()
        if (lists === null) { return null }
        return lists[`${id}`]
    },

    removeList: (id) => {
        var lists = getLists()
        if (lists === null) { return }
        if (lists[`${id}`] === null) { return }
        delete lists[`${id}`]
        localStorage.setItem('lists', lists)
    },

    removeAllLists: () => {
        localStorage.setItem('lists', {})
    }
}