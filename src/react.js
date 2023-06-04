import { REACT_ELEMENT, REACT_FORWARD_REF_TYPE } from "./constant";
import { wrapToVdom } from "./utils";
import { Component } from "./Component";

/**
 * 根据参数创建React元素
 * @param {*} type 元素的类型
 * @param {*} config 配置对象
 * @param {*} children 后面的参数都是 children
 */
function createElement(type, config, children) {
  let ref;
  let key;
  if (config) {
    delete config.__self;
    delete config.__source;
    ref = config.ref;
    delete config.ref;
    key = config.key;
    delete config.key;
  }
  const props = {
    ...config,
  };

  // 如果参数数量大于3，说明有子级，且大于一个
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  }
  // 如果参数数量等于3，说明有且只有一个子级
  else if (arguments.length === 3) {
    props.children = wrapToVdom(children);
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    props,
    ref,
    key,
  };
}

function createRef() {
  return { current: null };
}

//其实函数组件本质上就是render方法，就是接收属性，返回react元素
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render, // 其实就是原来的函数组件那个函数
  };
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
};

export default React;
