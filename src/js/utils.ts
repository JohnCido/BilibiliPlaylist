import seededShuffle from 'seededshuffle'
import { IVideoModel } from './storage'
import { videoPageBaseURL } from './strategy/video.strategy'

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

/**
 * Generate a correct url with given playlist ID, av and shuffle
 * @param id ID of playlist
 * @param av ID of video
 * @param shuffle Whether it's in shuffle mode
 */
export function generateVideoURL (id: string | number, av: string | number, seed = '1') {
    return `${videoPageBaseURL}av${av}/?bpid=${id}&seed=${seed}`
}

/**
 * Generate a random string with given length.
 * @param {number} length - Length of the string.
 */
export function randomString (length = 5) {
    let text = ''
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (let i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return text
}

/**
 * Return a shuffled videos list from given vids using the seed
 * @param vids Videos list
 * @param seed
 */
export function shuffleVideos (vids: IVideoModel[], seed: string): IVideoModel[] {
    switch (seed) {
    case '1':
        return vids
    case '-1':
        return vids.reverse()
    default:
        return seededShuffle.shuffle(vids, seed)
    }
}

/**
 * Generate a valid video page URL with shuffle mode on
 * @param id Play list ID
 * @param vids Videos list
 */
export function generateShuffleVideoURL (id: string | number, vids: IVideoModel[], seed?: string) {
    const _seed = seed !== undefined ? seed : randomString()
    return generateVideoURL(id, shuffleVideos(vids, _seed)[0].av, _seed)
}

/**
 * Generate a valid video page URL with shuffle mode on
 * @param id Play list ID
 * @param vids Videos list
 */
export function generateQueuedVideoURL (id: string | number, vids: IVideoModel[], reverse = false) {
    return generateShuffleVideoURL(id, vids, reverse ? '-1' : '1')
}
