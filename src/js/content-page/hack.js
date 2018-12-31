// Some hacks to make URL changes detectable
const locationChangeEventName = 'locationchange'

addPatch('pushState')
addPatch('replaceState')

function addPatch (name) {
    const method = history[name]
    history[name] = function () {
        method.apply(history, arguments)
        window.dispatchEvent(new Event(name))
        window.dispatchEvent(new Event(locationChangeEventName))
    }
}

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event(locationChangeEventName))
})
