export function intervalTest (test: () => boolean, interval = 50, timeout = 2500) {
    const begin = Date.now()

    return new Promise((resolve, reject) => {
        const repeat = setInterval(() => {
            const t = Date.now() - begin
            if (timeout > 0 && t > timeout) {
                clearInterval(repeat)
                reject(new Error('Timed out'))
                return
            }
            if (test()) {
                resolve()
                clearInterval(repeat)
            }
        }, interval)
    })
}
