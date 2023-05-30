export class Component {
  // 给类Component添加一个静态属性，表面这是一个React组件
  static isReactComponent = true
  constructor(props) {
    this.props = props
  }
}
