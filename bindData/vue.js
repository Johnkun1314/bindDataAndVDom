
class myVue {
    constructor(opt) {
        this._init(opt)
    }
    _init(opt) {
        console.log('begin init')
        this.$opt = opt
        this.$el = document.querySelector(opt.el)
        this.$data = opt.data
        this.$methods = opt.methods
        this._binding = {}
        this._observe(this.$data)
        this._complie(this.$el)
    }
    _observe(obj) {
        console.log('begin observe')
        let value
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                value = obj[key]
                if (typeof value === 'object') {
                    this._observe(value)
                }
                this._binding[key] = {
                    _directives: []
                }
                let binding = this._binding[key]
                Object.defineProperty(this.$data, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return value
                    },
                    set: function (newVal) {
                        if (value !== newVal) {
                            value = newVal
                            binding._directives.forEach(item => {
                                item.update()
                            })
                        }
                    }
                })
            }
        }
    }
    _complie(root) {
        console.log('begin complie')
        let _this = this
        let nodes = root.children
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i]
            if (node.children.length) {
                this._complie(node)
            }
            if (node.hasAttribute('v-click')) {
                console.log('click')
                node.onclick = (function (i) {
                    let attrVal = nodes[i].getAttribute('v-click')
                    console.log(attrVal)
                    return _this.$methods[attrVal].bind(_this.$data)
                })(i)
            }
            if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
                node.addEventListener('input', (function (key) {
                    let attrVal = node.getAttribute('v-model')
                    _this._binding[attrVal]._directives.push(new Watcher('input', node, _this, attrVal, 'value'))
                    return () => {
                        _this.$data[attrVal] = nodes[key].value
                    }
                })(i))
            }
            if (node.hasAttribute('v-bind')) {
                let attrVal = node.getAttribute('v-bind')
                this._binding[attrVal]._directives.push(new Watcher('text', node, this, attrVal, 'innerHTML'))
            }
        }
    }
}


class Watcher {
    constructor(name, el, vm, exp, attr) {
        console.log('begin watcher')
        this.name = name
        this.el = el
        this.vm = vm
        this.exp = exp
        this.attr = attr
        this.update()
    }
    update() {
        console.log('begin update')
        this.el[this.attr] = this.vm.$data[this.exp]
    }
}

