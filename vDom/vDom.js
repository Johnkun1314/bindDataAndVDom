const nodeType = {
    TEXT: 'TEXT',
    HTML: 'HTML',
    COMPONENT: 'COMPONENT'
}

const childType = {
    EMPTY: 'EMPTY',
    SINGLE: 'SINGLE',
    MULTIPLE: 'MULTIPLE'
}


function render(vnode, container) {
    if (container.vnode) {
        // 更新节点
        updata(container.vnode, vnode, container)
    } else {
        // 首次挂载
        mount(vnode, container)
    }
    // 保存每一次节点更新后的虚拟dom
    container.vnode = vnode
}

function updata(_vnode, vnode, container) {
    if (_vnode.tag != vnode.tag) {
        replaceDom(_vnode, vnode, container)
    } else if (vnode.flag == nodeType.TEXT) {
        replaceText(_vnode, vnode)
    } else if (vnode.flag == nodeType.HTML) {
        patchDom(_vnode, vnode, container)
    } else {
        // 组件这里不处理
    }
}

function patchDom(_vnode, vnode, container) {
    if (_vnode.tag != vnode.tag) {
        replaceDom(_vnode, vnode, container)
        return
    } else {
        let prevData = _vnode.data
        let nextData = vnode.data
        vnode.el = _vnode.el
        for (let key in nextData) {
            patchData(vnode.el, key, prevData[key], nextData[key])
        }
        for (let key in prevData) {
            if (!nextData[key]) {
                if (key != 'style')
                    patchData(vnode.el, key, prevData[key], null)
            } else {
                patchData(vnode.el, key, prevData[key], nextData[key])
            }
        }

    }

    patchChild(_vnode, vnode, vnode.el)
}

function patchChild(_vnode, vnode, container) {
    
    let preChildFlag  = _vnode.childrenFlag
    let nextChildFlag = vnode.childrenFlag
 
    switch (preChildFlag) {
        case childType.EMPTY:
            switch (nextChildFlag) {
                case childType.EMPTY:
                    break;
                case childType.SINGLE:
                    mountTextNode(vnode.children, container)
                    break;
                case childType.MULTIPLE:
                    for(let key in vnode.children){
                        mountHtmlNode(vnode.children[key], container)
                    }
                    break;
            }
            break;
        case childType.SINGLE:
            switch (nextChildFlag) {
                case childType.EMPTY:
                    container.removeChild(_vnode.children.el)
                    break;
                case childType.SINGLE:
                    updata(_vnode.children, vnode.children, container)
                    break;
                case childType.MULTIPLE:
                    container.removeChild(_vnode.children.el)
                    for(let key in vnode.children){
                        mountHtmlNode(vnode.children[key],container)
                    }
                    break;
            }
            break;
        case childType.MULTIPLE:
       
            switch (nextChildFlag) {
                case childType.EMPTY:
                    for(let key in _vnode.children){
                        container.removeChild(_vnode.children[key])
                    }
                    break;
                case childType.SINGLE:
                    for(let key in _vnode.children){
                        container.removeChild(_vnode.children[key])
                    }
                    mountTextNode(vnode.children, container)
                    break;
                case childType.MULTIPLE:
                  
                    let lastIndex = 0
                    vnode.children.map((nextVnode,nextIndex)=>{
                       
                        let exist = false
                        _vnode.children.map((preVnode,prevIndex)=>{
                            if(preVnode.data.key === nextVnode.data.key ){
                                exist = true
                                updata(preVnode, nextVnode, container)
                                if(prevIndex<lastIndex){
                                    // 移动
                                    //  abc --> ddbdac
                                    container.insertBefore(preVnode.el, _vnode.children[lastIndex].el)
                                }else{
                                    lastIndex = prevIndex + 1
                                }
                            }
                        })
                        if(!exist){
                            mountHtmlNode(nextVnode, container, _vnode.children[lastIndex].el)
                        }

                    })
                    _vnode.children.map((item,index)=>{
                      let ok = vnode.children.some(it=>it.data.key == item.data.key)
                      if(!ok){
                          container.removeChild(item.el)
                      }
                    })
                    break;
            }
            break;
    }
}

function replaceText(_vnode, vnode) {
    vnode.el = _vnode.el
    vnode.el.text = vnode.children
}

function replaceDom(_vnode, vnode, container) {
    container.removeChild(_vnode.el)
    mount(vnode, container)
}

function mount(vnode, container) {
    let {
        flag
    } = vnode
    if (flag == nodeType.TEXT) {
        mountTextNode(vnode, container)
    } else if (flag == nodeType.HTML) {
        mountHtmlNode(vnode, container)
    } else {
        // mountComponent() 组件挂载这里不写
    }
}

function mountTextNode(vnode, container) {
    let dom = document.createTextNode(vnode.children)
    vnode.el = dom
    for (let key in vnode.data) {
        patchData(dom, key, null, vnode.data[key])
    }
    container.appendChild(dom)
}

function mountHtmlNode(vnode, container, flagNode) {
    let {
        tag,
        children,
        data,
        childrenFlag
    } = vnode
    let dom = document.createElement(tag)
    vnode.el = dom
    for (let key in vnode.data) {
        patchData(dom, key, null, vnode.data[key])
    }

    flagNode ? container.insertBefore(dom, flagNode) : container.appendChild(dom)

    if (childrenFlag == childType.EMPTY) {
        return
    } else if (childrenFlag == childType.SINGLE) {
        mountTextNode(children, dom)
    } else {
        for (let i in children) {
            mountHtmlNode(children[i], dom)
        }
    }
}

function patchData(dom, key, prev, next) {

    if (key.indexOf('@') > -1) {
        dom.removeEventListener(key.slice(1), prev)
        dom.addEventListener(key.slice(1), next)
    } else if (key == 'class') {
        if (prev != next) {
            dom.className = next
        }
    } else if (key == 'key') {
        if (prev != next) {
            dom.setAttribute(key, next)
        }
    }else if(key == 'id'){
        if(prev != next ){
            dom.id = next
        }
    } else if (key == 'style') {
        for (let style in next) {
            dom.style[style] = next[style]
        }
        for (let style in prev) {
            if (!next[style]) {
                dom.style[style] = ''
            }
        }
    }

}

function createElement(tag, data, children = null) {
    let flag
    let childrenFlag
    if (typeof tag == 'string') {
        flag = nodeType.HTML
    } else if (typeof tag == 'function') {
        flag = nodeType.COMPONENT
    } else {
        flag = nodeType.TEXT
    }

    if (children == null) {
        childrenFlag = childType.EMPTY
    } else if (Array.isArray(children)) {
        let len = children.length
        if (len == 0) {
            childrenFlag = childType.EMPTY
        } else {
            childrenFlag = childType.MULTIPLE
        }
    } else {
        childrenFlag = childType.SINGLE
        children = createTextVnode(children)
    }

    return {
        flag,
        tag,
        data,
        children,
        childrenFlag
    }
}

function createTextVnode(text) {
    return {
        flag: nodeType.TEXT,
        tag: null,
        data: null,
        children: text,
        childrenFlag: childType.EMPTY
    }
}