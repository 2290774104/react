import { REACT_TEXT } from "../constant";
import { addEvent } from "../event";

function mount(vdom, container) {
  const newDOM = createDOM(vdom);
  container.appendChild(newDOM);
}

/**
 * 把虚拟DOM变成真实DOM
 * @param {*} vdom 虚拟DOM
 */
function createDOM(vdom) {
  const { type, props, ref } = vdom;
  const { children } = props;
  let dom;
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props);
  } else if (typeof type === "function") {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
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
  // 在根据虚拟DOM创建真实DOM后，就可以建立关系
  vdom.realDOM = dom;
  if (ref) ref.current = dom
  return dom;
}

function mountClassComponent(vdom) {
  const { type, props } = vdom;
  const classInstance = new type(props);
  const renderVdom = classInstance.render();
  // 将render渲染结果放到classInstance上暂存
  classInstance.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

function mountFunctionComponent(vdom) {
  const { type, props } = vdom;
  const renderVdom = type(props);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
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
    // 处理绑定事件
    else if (/^on[A-Z].*/.test(key)) {
      addEvent(dom, key, newProps[key])
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

export function findDOM(vdom) {
  if (!vdom) return null
  return vdom.realDOM
}

export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
  const oldDOM = findDOM(oldVdom)
  const newDOM = createDOM(newVdom)
  parentDOM.replaceChild(newDOM, oldDOM)
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
