//https://developer.mozilla.org/zh-CN/docs/Web/Guide/API/DOM/Whitespace_in_the_DOM

/**
 * 以下所谓的“空白符”代表：
 *  "\t" TAB \u0009 （制表符）
 *  "\n" LF  \u000A （换行符）
 *  "\r" CR  \u000D （回车符）
 *  " "  SPC \u0020 （真正的空格符）
 *
 * 不包括 JavaScript 的“\s”，因为那代表如不断行字符等其他字符。
 */


/**
 * 测知某节点的文字内容是否全为空白。
 *
 * @参数   nod  |CharacterData| 类的节点（如  |Text|、|Comment| 或 |CDATASection|）。
 * @传回值      若 |nod| 的文字内容全为空白则传回 true，否则传回 false。
 */
function is_all_ws( nod )
{
    // Use ECMA-262 Edition 3 String and RegExp features
    return !(/[^\t\n\r ]/.test(nod.data));
}


/**
 * 测知是否该略过某节点。
 *
 * @参数   nod  DOM1 |Node| 对象
 * @传回值      若 |Text| 节点内仅有空白符或为 |Comment| 节点时，传回 true，
 *              否则传回 false。
 */

function is_ignorable( nod ) {
    return ( nod.nodeType == 8) || // 注释节点
         ( (nod.nodeType == 3) && is_all_ws(nod) ); // 仅含空白符的文字节点
}

export default {
    /**
     * 此为会跳过空白符节点及注释节点的 |previousSibling| 函数
     * （ |previousSibling| 是 DOM 节点的特性值，为该节点的前一个节点。）
     *
     * @参数   sib  节点。
     * @传回值      有两种可能：
     *               1) |sib| 的前一个“非空白、非注释”节点（由 |is_ignorable| 测知。）
     *               2) 若该节点前无任何此类节点，则传回 null。
     */
    nodeBefore: function ( sib ) {
        while ((sib = sib.previousSibling)) {
            if (!is_ignorable(sib)) return sib;
        }
        return null;
    },

    /**
     * 此为会跳过空白符节点及注释节点的 |nextSibling| 函数
     *
     * @参数   sib  节点。
     * @传回值      有两种可能：
     *               1) |sib| 的下一个“非空白、非注释”节点。
     *               2) 若该节点后无任何此类节点，则传回 null。
     */
    nodeAfter: function ( sib ) {
        while ((sib = sib.nextSibling)) {
            if (!is_ignorable(sib)) return sib;
        }
        return null;
    },

    /**
     * 此为会跳过空白符节点及注释节点的 |lastChild| 函数
     * （ lastChild| 是 DOM 节点的特性值，为该节点之中最后一个子节点。）
     *
     * @参数   par  节点。
     * @传回值      有两种可能：
     *               1) |par| 中最后一个“非空白、非注释”节点。
     *               2) 若该节点中无任何此类子节点，则传回 null。
     */
    lastChild: function ( par ) {
        var res=par.lastChild;
        while (res) {
            if (!is_ignorable(res)) return res;
            res = res.previousSibling;
        }
        return null;
    },

    /**
     * 此为会跳过空白符节点及注释节点的 |firstChild| 函数
     *
     * @参数   par  节点。
     * @传回值      有两种可能：
     *               1) |par| 中第一个“非空白、非注释”节点。
     *               2) 若该节点中无任何此类子节点，则传回 null。
     */
    firstChild: function ( par ) {
        var res=par.firstChild;
        while (res) {
            if (!is_ignorable(res)) return res;
            res = res.nextSibling;
        }
        return null;
    },

    /**
     * 此为传回值不包含文字节点资料的首尾所有空白符、
     * 并将两个以上的空白符缩减为一个的 |data| 函数。
     *（ data 是 DOM 文字节点的特性值，为该文字节点中的资料。）
    *
    * @参数   txt 欲传回其中资料的文字节点
    * @传回值     文字节点的内容，其中空白符已依前述方式处理。
    */
    dataOf: function ( txt ) {
        var data = txt.data;
        // Use ECMA-262 Edition 3 String and RegExp features
        data = data.replace(/[\t\n\r ]+/g, " ");
        if (data.charAt(0) == " ")
            data = data.substring(1, data.length);
        if (data.charAt(data.length - 1) == " ")
            data = data.substring(0, data.length - 1);
        return data;
    }
}