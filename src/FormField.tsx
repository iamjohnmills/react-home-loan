import React from 'react'
import EventBus from './EventBus';

interface IAppProps {}

interface IAppState {
}

class FormField extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {
      value: props.value,
    };
  }
  componentDidMount(): void {
    // this.setState({ value: this.props.value });
  }
  componentDidUpdate(prev: IAppProps): void {
    if(JSON.stringify(this.props) === JSON.stringify(prev)) return;
    this.setState({ value: this.props.value });
  }
  async handleChangeInput(value):void {
    const val = !value ? 0 : value;
    await this.setState({ value: val });
    this.props.change(this.props.id,this.props.type === 'number' ? parseInt(val) : val);
  }
  handleClickStep(increment):void {
    this.props.do_step(this.props.id,this.props.step,increment);
  }
  render(): React.ReactNode { return (
  <div className="FormField mb-2">
    { this.props.type === 'number' || this.props.type === 'float' ?
    <div>
    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor={this.props.id}>
      {this.props.label}
      {this.props.description ?
        <span className="ml-1 text-xs font-normal text-gray-500">{this.props.description}</span>
      : null }
      {this.props.do_step ?
        <span className="flex items-center float-right">
        <span className="text-xs font-normal text-gray-500 cursor-pointer mr-1" onClick={() => { this.handleClickStep(-1) }}>
          Min
        </span>
        <span className="text-xs font-normal text-gray-500 cursor-pointer" onClick={() => { this.handleClickStep(1) }}>
          Max
        </span>
        </span>
      : null }
    </label>
    <input className="w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step={this.props.step} min={this.props.min} max={this.props.max} disabled={this.props.disabled} id={this.props.id} type="number" value={this.state.value} onChange={(event) => { this.handleChangeInput(event.target.value) }} />
    </div>
    : null }
  </div>
  ) }
}

export default FormField
