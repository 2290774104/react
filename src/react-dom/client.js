import { REACT_TEXT } from "../constant";

function mount(vdom, container) {
  const newDOM = createDOM(vdom);
  container.appendChild(newDOM);
}

/**
 * 把虚拟DOM变成真实DOM
 * @param {*} vdom 虚拟DOM
 */
function createDOM(vdom) {
  const { type, props } = vdom;
  const { children } = props
  let dom;
  console.log(type, vdom, children);
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else {
    dom = document.createElement(type);
  }
  if (props) {
    updateProps(dom, {}, props);
    if (children) {
      // 如果只有一个子级，将子级的虚拟DOM转换成真实DOM，插入到DOM节点上
      if (typeof children === "object" && children.type) {
        mount(children, dom);
      } else if (Array.isArray(children)) {
        reconcileChildren(children, dom);
      }
    }
  }
  return dom
}

function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    mount(childrenVdom[i], parentDOM);
  }
}

/**
 * 更新DOM元素的属性
 * 1. 把新的属性全部赋上去
 * 2. 把老的属性在新的属性对象中没有的全部删掉
 * @param {*} dom 真实DOM元素
 * @param {*} oldProps 老的属性
 * @param {*} newProps 新的属性
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (const key in newProps) {
    // children 属性后面单独处理
    if (key === "children") {
      continue;
    }
    // 把样式对象上的所有属性赋给真实DOM
    else if (key === "style") {
      let styleObject = newProps[key];
      for (const attr in styleObject) {
        dom.style[attr] = styleObject[attr];
      }
    }
    // 其他属性之间赋值
    else {
      dom[key] = newProps[key];
    }
  }
  // 删掉老的属性在新的属性对象中没有的
  for (const key in oldProps) {
    if (!Object.prototype.hasOwnProperty.call(newProps, key)) {
      dom[key] = null;
    }
  }
}

class DOMRoot {
  constructor(container) {
    this.container = container;
  }

  render(vdom) {
    mount(vdom, this.container);
  }
}

function createRoot(container) {
  return new DOMRoot(container);
}

const ReactDOM = {
  createRoot,
};

export default ReactDOM;
