// RegExp to test if it's favorite page
export const favPageURLReg = /^(?:http|https):\/\/space\.bilibili\.com\/(\d+)\/.*favlist.*$/
// Root selector to inject vue root
export const toolbarRootSelector = '#page-fav'
// Vue root ID name
export const toolbarVueRootID = 'bilist-root'
// Run init() once user click on element which matches given selector
export const initRefreshNavTriggerSelectors = [
    '#navigator .wrapper',
    '#navigator-fixed .wrapper'
]
// Attribute key of fid
export const favItemIDAttrKey = 'fid'
// Extract current fid from the element that matches given selector
export const currentFavItemSelector = '.fav-item.cur'
// Refetch fid once user click favorite sidenav
export const fidRefreshTriggerSelector = '.fav-sidenav'
// Video counts in current folder
export const currentFavVidsCountSelector = '.fav-item.cur .num'
// Selector for pager item
export const pageIndexItemSelector = '.be-pager-item a'
// Selector for active pager item
export const activePageIndexItemSelector = '.be-pager-item.be-pager-item-active'
// Selector for page filter
export const pageOptionItemSelector = '.be-dropdown-item'
export const optionNameAllCategory = '全部分区'
export const optionNameSortRecent = '最近收藏'

// Video item selector
export const videoItemSelector = '.fav-video-list .small-item'
// Unavailable video item class name
export const videoItemUnavailabelClassName = 'disabled'
// Video av
export const videoItemAvDataKey = 'aid'
// Video name
export const videoItemNameSelector = 'a.title'
// Uploader name
export const videoItemUpNameSelector = 'a.cover .meta-mask .meta-info .author'
// Uploader name filter
export const videoItemUpNameReg = /^UP主：(.*)$/
// Dataset used to indicate a video item is already fetched
export const videoItemFetchedDataFlag = 'bilistfetched'
// Vieo length
export const videoItemLengthSelector = 'a.cover .length'
// List name
export const listNameSelector = 'p.item.cur'
// List owner
export const listOwnerSelector = '#h-name'
// Indicates if the logged in viewer is real owner of the list
export const listPersonalIndicatorSelector = '.space-theme-trigger.icon'
// List private selector
export const listPrivateSelector = '.fav-meta span.type'
// List private text
export const listPrivateText = '私有'
