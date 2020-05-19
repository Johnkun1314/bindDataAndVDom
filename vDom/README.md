# 函数列表

- nodeType
  定义节点类型
- childType
  定义子节点类型
- render()
  渲染函数,每次挂载节点或者更新节点的执行入口,执行 updata 和 mount

---

- mount()
  节点挂载，这里区别挂载节点的类型,执行 mountTextNode 和 mountHtmlNode
- mountTextNode()
  生成文本类型节点并加入父容器中,执行 patchData
- mountHtmlNode()
  生成标签节点并加入父容器中,执行 patchData 和 mountTextNode 以及 moountHtmlNode
- patchData()
  将定义的 data 属性如:点击事件,class,id,style 等加入到标签中去
- createElement()
  将模板编译器的编译结果生成虚拟 dom
- createTextVnode()
  生成文本类型的虚拟 dom

---

- updata()
  根据新旧节点的类型执行 replaceDom,replaceText 以及 patchDom
- replaceText()
  替换当前文本节点的值
- replaceDom()
  移除当前节点同挂载一个新节点
- patchDom()
  调用 patchData 更新节点行间属性,同时调用 patchChild 更新子节点
- patchChild()
  根据当前虚拟 dom 中子节点的类型去执行节点更新,插入以及移除操作,
