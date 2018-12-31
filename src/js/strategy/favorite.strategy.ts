// RegExp to test if it's favorite page
export const favPageURLReg = '^(?:http|https):\\/\\/space\\.bilibili\\.com\\/(\\d+)\\/.*favlist.*$'
// Root selector to inject vue root
export const toolbarRootSelector = '#page-fav'
// Vue root ID name
export const toolbarVueRootID = 'bilist-root'
// Run init() once user click on element which matches given selector
export const initRefreshNavTriggerSelector = '#navigator .wrapper'
// Extract current fid from the element that matches given selector
export const currentFavItemSelector = '.fav-item.cur'
// Refetch fid once user click favorite sidenav
export const fidRefreshTriggerSelector = '.fav-sidenav'
