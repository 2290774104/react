import { updateQueue } from "./Component";

/**
 * 给DOM元素添加事件处理函数
 * @param {*} dom 要添加事件的DOM元素
 * @param {*} eventType 事件的类型
 * @param {*} handler 事件处理
 */
export function addEvent(dom, eventType, handler) {
  // 判断dom元素上是否有store属性，有直接返回，没有则赋值为空对象然后返回
  let store = dom.store || (dom.store = {});
  // 向store中存放属性和值，属性是事件类型，值是事件函数
  store[eventType.toLowerCase()] = handler;
  const eventName = eventType.toLowerCase();
  const name = eventName.replace(/Capture$/, "").slice(2);
  if (!document[name]) {
    document.addEventListener(
      eventName.slice(2).toLowerCase(),
      (event) => {
        dispatchEvent(event, true);
      },
      true
    );
    document.addEventListener(
      eventName.slice(2).toLowerCase(),
      (event) => {
        dispatchEvent(event, false);
      },
      false
    );
    document[name] = true;
  }
}

function dispatchEvent(event, isCapture) {
  // 事件委托
  // 1. 减少绑定次数，提高性能
  // 2. 统一进行事件处理，实现合成事件
  const { target, type } = event;
  const eventType = `on${type}`;
  const eventTypeCapture = `on${type}Capture`;
  const syntheticEvent = createSyntheticEvent(event);
  updateQueue.isBatchingUpdate = true;
  //
  const targetStack = [];
  let currentTarget = target;
  while (currentTarget) {
    targetStack.push(currentTarget);
    currentTarget = currentTarget.parentNode;
  }
  if (isCapture) {
    for (let i = targetStack.length - 1; i >= 0; i--) {
      const currentTarget = targetStack[i];
      const { store } = currentTarget;
      const handler = store && store[eventTypeCapture];
      handler && handler(syntheticEvent);
    }
  } else {
    for (let i = 0; i < targetStack.length; i++) {
      const currentTarget = targetStack[i];
      const { store } = currentTarget;
      const handler = store && store[eventType];
      handler && handler(syntheticEvent);
      if (syntheticEvent.isPropagationStopped) {
        break;
      }
    }
  }
  // const currentTarget = event.currentTarget
  // while(currentTarget) {
  //   const { store } = currentTarget
  //   const handler = store && store[eventTypeCapture]
  //   handler && handler(syntheticEvent);
  // }
  updateQueue.batchUpdate();
}

/**
 * 根据原生事件创建合成事件
 * 1. 处理兼容性
 * @param {*} event
 */
function createSyntheticEvent(nativeEvent) {
  const syntheticEvent = {};
  for (const key in nativeEvent) {
    let value = nativeEvent[key];
    if (typeof value === "function") value = value.bind(nativeEvent);
    syntheticEvent[key] = value;
  }
  syntheticEvent.nativeEvent = nativeEvent;
  // 是否阻止了默认事件
  syntheticEvent.isDefaultPrevented = false;
  syntheticEvent.preventDefault = preventDefault;
  syntheticEvent.isPropagationStopped = false;
  syntheticEvent.stopPropagation = stopPropagation;
  return syntheticEvent;
}

function preventDefault() {
  this.isDefaultPrevented = true;
  const nativeEvent = this.nativeEvent;
  if (nativeEvent.preventDefault) {
    nativeEvent.preventDefault();
  } else {
    nativeEvent.returnValue = false;
  }
}

function stopPropagation() {
  this.isPropagationStopped = true;
  const nativeEvent = this.nativeEvent;
  if (nativeEvent.stopPropagation) {
    nativeEvent.stopPropagation();
  } else {
    nativeEvent.cancelBubble = true;
  }
}
