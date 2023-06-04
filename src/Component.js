import { compareTwoVdom, findDOM } from "./react-dom/client";

// 更新队列
export let updateQueue = {
  // 是否批量更新的标识
  isBatchingUpdate: false,
  updaters: new Set(),
  batchUpdate() {
    updateQueue.isBatchingUpdate = false
    for (const updater of updateQueue.updaters) {
      updater.updateComponent();
    }
    updateQueue.updaters.clear();
  },
};

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;
    // 更新队列，存放更新状态
    this.pendingState = [];
    this.callbacks = [];
  }

  flushCallbacks() {
    if (this.callbacks.length > 0) {
      this.callbacks.forEach((callback) => callback());
      this.callbacks.length = 0;
    }
  }

  addState(partialState, callback) {
    this.pendingState.push(partialState);
    if (typeof callback === "function") {
      this.callbacks.push(callback);
    }
    this.emitUpdate();
  }

  emitUpdate() {
    // 如果需要批量更新
    if (updateQueue.isBatchingUpdate) {
      // 不直接更新组件，而是将更新器添加到updaters中暂存
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent();
    }
  }

  updateComponent() {
    // 获取更新队列和类的实例
    const { pendingState, classInstance } = this;
    // 如果有等待生效的状态
    if (pendingState.length > 0) {
      shouldUpdate(classInstance, this.getState());
    }
  }

  getState() {
    const { pendingState, classInstance } = this;
    let { state } = classInstance;
    pendingState.forEach((partialState) => {
      if (typeof partialState === "function") {
        partialState = partialState(state);
      }
      state = { ...state, ...partialState };
    });
    pendingState.length = 0;
    return state;
  }
}

function shouldUpdate(classInstance, nextState) {
  // 把计算得到的新的状态赋给类的实例
  classInstance.state = nextState;
  // 让组件强制更新
  classInstance.forceUpdate();
}

export class Component {
  // 给类Component添加一个静态属性，表面这是一个React组件
  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};
    // 每个类都会有一个更新器实例
    this.updater = new Updater(this);
  }

  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }

  forceUpdate() {
    // 获取老的虚拟DOM，再计算新的虚拟DOM
    // 找到新老虚拟DOM的差异，把差异更新到真实DOM上
    const { oldRenderVdom } = this;
    const newRenderVdom = this.render();
    const oldDOM = findDOM(oldRenderVdom);
    // 比较新老虚拟DOM的差异，并更新
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
    // 更新后需要把oldRenderVdom更新为当前的DOM节点
    this.oldRenderVdom = newRenderVdom;
    this.updater.flushCallbacks();
  }
}
