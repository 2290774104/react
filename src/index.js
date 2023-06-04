import React from "./react";
import ReactDOM from "./react-dom/client";

const root = ReactDOM.createRoot(document.getElementById("root"));

const element = (
  <div>
    <span style={{ color: "red" }}>123</span>
  </div>
);

console.log(element);

/**
 * 1. 函数组件接受一个属性对象，并返回一个React元素
 * 2. 函数必须以大写字母开头，应为内部通过大小写判断是自定义组件还是默认组件(div span)
 * 3. 函数组件在使用之前必须定义
 * 4. 函数组件只能返回一个根元素
 * @param {*} props
 * @returns
 */
function FunctionComponent(props) {
  return (
    <div className="title" style={{ color: "red" }}>
      <span>{props.title}</span>
    </div>
  );
}

console.log(<FunctionComponent title="hello" />);

class ClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  render() {
    return (
      <div onClick={this.divClick}>
        <p>{this.props.title}</p>
        <p>number: {this.state.number}</p>
        <button onClick={this.clickButton}>+</button>
      </div>
    );
  }

  clickButton = () => {
    console.log('clickButton');
  };

  divClick = () => {
    console.log('divClick');
  }
}

console.log(<ClassComponent title="hello" />);

root.render(<ClassComponent title="hello" />);
