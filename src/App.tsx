import React from 'react'
import EventBus from './EventBus';
import {IAppLoan} from './Interfaces'
import FormField from './FormField'
import Loan from './Loan'

interface IAppProps {}

interface IAppState {
  loan: IAppLoan
}

const usd_format = (val:any) => {
  if(typeof val !== 'number') return val;
  return `$${val.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
}

class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {
      loan: Loan.get(),
    };
  }
  async componentDidMount():Promise<void> {
    await Loan.calculate();
    this.setState({ loan: await Loan.get() })
  }
  async handleChangeInput(key:string,value:any):Promise<void> {
    this.setState({ loan: await Loan.set(key,value) })
  }
  async handleClickStep(key:string,step:number,increment:number):Promise<void> {
    this.setState({ loan: await Loan.crunchTheNumbers(key,step,increment) });
  }
  render(): React.ReactNode { return (
  <div className="App py-6 px-3">

  <div className="max-w-3xl leading-4 mx-auto mb-5">
    <h1 className="text-white font-bold"><span className="text-xl">Home Loan Calculator</span> <span className="pl-3 text-sm text-slate-400">@github.com/iamjohnmills</span></h1>
  </div>

  <div className="max-w-3xl leading-4 drop-shadow-lg mx-auto rounded-lg">
  {this.state.loan.calculations.loan_can_afford_28 && this.state.loan.calculations.loan_can_afford_36 ?
  <div className="can-afford-icon text-4xl flex items-center justify-center drop-shadow-md w-20 h-20 bg-white rounded-full absolute z-10">👍</div>
  : null }
  <div className="flex space-x-6 bg-white rounded-t-lg py-6 px-8">
    <div className="basis-1/3">
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <div className="text-slate-600 font-bold text-sm">{usd_format(this.state.loan.calculations.income_monthly_in)}</div>
        <div className="text-slate-500 text-xs">Income Monthly</div>
      </div>
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <div className="text-slate-600 font-bold text-sm">{usd_format(this.state.loan.inputs.income_monthly_expenses)}</div>
        <div className="text-slate-500 text-xs">Expenses Monthly</div>
      </div>
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <div className="text-slate-600 font-bold text-sm">{usd_format(this.state.loan.calculations.income_monthly_discretionary)}</div>
        <div className="text-slate-500 text-xs">After Expenses Monthly</div>
      </div>
      <div>
        <div className="text-slate-600 font-bold text-sm">{this.state.loan.calculations.loan_months_to_save_down_payment} Months</div>
        <div className="text-slate-500 text-xs">To Save Down Payment</div>
      </div>
    </div>
    <div className="basis-1/3">
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <span className="text-slate-600 text-sm font-bold">{ usd_format(this.state.loan.calculations.due_monthly_total) }<sup className={`pl-1 ${this.state.loan.calculations.loan_can_afford_36 ? 'text-cyan-500' : 'text-rose-500'}`}>{usd_format(this.state.loan.calculations.loan_ceiling_36)}</sup></span>
        <span className="text-slate-500 text-xs block">PITI Monthly</span>
      </div>
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <span className="text-slate-600 text-sm block font-bold">{usd_format(this.state.loan.calculations.income_monthly_discretionary_after_dues)}</span>
        <span className="text-slate-500 text-xs block">After Payments & Expenses</span>
      </div>
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <div className="text-slate-600 font-bold text-sm">{usd_format(this.state.loan.calculations.loan_amount)}</div>
        <div className="text-slate-500 text-xs">Prinicpal Loan Amount</div>
      </div>
      <div>
        <div className="text-slate-600 font-bold text-sm">{usd_format(this.state.loan.inputs.loan_down_payment)}<sup className={`pl-1 ${this.state.loan.calculations.loan_min_down_payment < this.state.loan.inputs.loan_down_payment ? 'text-cyan-500' : 'text-rose-500'}`}>{usd_format(this.state.loan.calculations.loan_min_down_payment)}</sup></div>
        <div className="text-slate-500 text-xs">Down Payment</div>
      </div>
    </div>
    <div className="basis-1/3">
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <span className="text-slate-600 text-sm block font-bold">{usd_format(this.state.loan.calculations.due_monthly_principal)}<sup className={`pl-1 ${this.state.loan.calculations.loan_can_afford_28 ? 'text-cyan-500' : 'text-rose-500'}`}>{usd_format(this.state.loan.calculations.loan_ceiling_28)}</sup></span>
        <span className="text-slate-500 text-xs block">{this.state.loan.inputs.loan_term_years} years @ {this.state.loan.inputs.loan_rate_interest}% Monthly</span>
      </div>
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <span className="text-slate-600 text-sm block font-bold">{usd_format(this.state.loan.calculations.due_monthly_pmi)}</span>
        <span className="text-slate-500 text-xs block">PMI Monthly @ {this.state.loan.inputs.loan_rate_pmi ? `${this.state.loan.inputs.loan_rate_pmi}%` : ''}</span>
      </div>
      <div className="mb-2 border-slate-200 border-b-2 pb-2">
        <span className="text-slate-600 text-sm block font-bold">{usd_format(this.state.loan.calculations.due_monthly_taxes)}</span>
        <span className="text-slate-500 text-xs block">Taxes Monthly</span>
      </div>
      <div>
        <span className="text-slate-600 text-sm block font-bold">{usd_format(this.state.loan.inputs.home_insurance_monthly)}</span>
        <span className="text-slate-500 text-xs block">Insurance &bull; HOA Monthly</span>
      </div>
    </div>
  </div>

  <div className="flex space-x-6 bg-slate-100 border-slate-200 border-t-2 rounded-b-lg py-6 px-8">
    <div className="basis-1/3">
      <FormField id="income_yearly_in" label="Salary" description="Yearly" min={0} step={5000} type="number" value={this.state.loan.inputs.income_yearly_in} do_step={(key:string,step:number,increment:number):void => { this.handleClickStep(key,step,increment) }} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="income_monthly_pretax_out" label="Pre-tax" description="Monthly" min={0} step={10} type="number" value={this.state.loan.inputs.income_monthly_pretax_out} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="income_tax_rate" label="Tax Rate" description="Percent" min={0} step={0.1} type="float" value={this.state.loan.inputs.income_tax_rate} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="income_monthly_expenses" label="Expenses" description="Monthly" type="number" min={0} step={100} value={this.state.loan.inputs.income_monthly_expenses} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
    </div>
    <div className="basis-1/3">
      <FormField id="home_price" label="Home Price" type="number" min={0} step={5000} value={this.state.loan.inputs.home_price} do_step={(key:string,step:number,increment:number):void => { this.handleClickStep(key,step,increment) }} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="loan_down_payment" label="Amount Down" type="number" min={0} step={5000} value={this.state.loan.inputs.loan_down_payment} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="loan_rate_interest" label="Interest Rate" description="Percent" type="float" min={0} step={0.1} value={this.state.loan.inputs.loan_rate_interest} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="loan_term_years" label="Term" description="Years" type="float" step={15} min={15} max={30} value={this.state.loan.inputs.loan_term_years} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
    </div>
    <div className="basis-1/3">
      <FormField id="home_taxes_yearly" label="Taxes" description="Yearly" type="number" min={0} step={1000} value={this.state.loan.inputs.home_taxes_yearly} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="home_insurance_monthly" label="Insurance &bull; HOA" description="Monthy" type="number" min={0} step={100} value={this.state.loan.inputs.home_insurance_monthly} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="loan_rate_pmi" label="PMI Rate" description="Percent" type="float" min={0} step={0.1} value={this.state.loan.inputs.loan_rate_pmi} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
      <FormField id="home_rent_monthly" label="Rental Rate" description="Monthly" type="number" min={0} step={1200} value={this.state.loan.inputs.home_rent_monthly} change={(key:string,value:any):void => { this.handleChangeInput(key,value) }} />
    </div>
  </div>
  
  </div>
  </div>
  ) }
}

export default App
