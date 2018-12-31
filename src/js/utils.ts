/**
 * Run the `test` on an `interval` and resolve promise after the `delay` once the `test` passes.
 * Reject if The `test` takes longer than `timeout` to pass.
 * Set `timeout` to `0` or lower to run the `test` forever.
 *
 * @export
 * @param {() => boolean} test
 * @param {number} [delay=0]
 * @param {number} [interval=50]
 * @param {number} [timeout=2500]
 * @returns `Promise`
 */
export function intervalTest (test: () => boolean, delay = 0, interval = 50, timeout = 2500) {
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
                delay > 0 ? setTimeout(resolve, delay) : resolve()
                clearInterval(repeat)
            }
        }, interval)
    })
}
