let util = module.exports = {
    //param: type id class prop data css inner event
    create: function (param) {
        //print(param);
        var t;
        if (param.type !== 'svg' && param.type !== 'path' && param.type !== 'circle')
            t = document.createElement(param.type)
        else
            t = document.createElementNS('http://www.w3.org/2000/svg', param.type);
        if (param.class) t.className = param.class
        if (param.id) t.id = param.id
        if (param.css) {
            param.css.forEach(function (c) {
                t.style[c[0]] = c[1]
            })
        }
        if (param.data) {
            param.data.forEach(function (d) {
                t.dataset[d[0]] = d[1]
            })
        }
        if (param.prop) {
            param.prop.forEach(function (p) {
                t.setAttribute(p[0], p[1])
            })
        }
        if (param.inner) {
            t.innerHTML = param.inner
        }
        if (param.event) {
            param.event.forEach(function (e) {
                t[e[0]] = e[1]
            })
        }
        return t
    },

    //target: append to this target; list: child node(s); first: set true if append at first
    //child: true if return appended child node
    append: function (target, list, first = false, child = false) {
        var node
        if (Array.isArray(list)) {
            list.forEach(function (item, index) {
                if (first)
                    node = target.insertBefore(item, target.firstChild)
                else
                    node = target.appendChild(item)
            })
        } else {
            if (first)
                node = target.insertBefore(list, target.firstChild)
            else
                node = target.appendChild(list)
        }
        if (child)
            return node
        else
            return target
    },

    //append css sheet
    AddSheetFile: function (path){
        document.head.appendChild(util.create({
            type: 'link',
            prop: [
                ['rel', 'stylesheet'],
                ['type', 'text/css'],
                ['href', path]
            ]
        }))
    },

    //Simulate event on element
    //https://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
    fireEvent: function (etype, el){
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    },

    styleValue: function (type, el) {
        let style = window.getComputedStyle(el)
        return style.getPropertyValue(type)
    }
}