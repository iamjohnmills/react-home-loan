import {IAppLoanInputs,IAppLoanCalculations,IAppLoan,IAppIteration} from './Interfaces'

class Loan {
  private inputs: IAppLoanInputs;
  private calculations: IAppLoanCalculations;

  constructor(){
    this.inputs = {
      income_yearly_in: 120000,
      income_monthly_pretax_out: 420,
      income_tax_rate: 27,
      income_monthly_expenses: 1200,
      home_price: 450000,
      home_taxes_yearly: 7000,
      home_insurance_monthly: 300,
      home_rent_monthly: 0,
      loan_term_years: 30,
      loan_rate_interest: 4.5,
      loan_rate_pmi: 0.6,
      loan_down_payment: 20000,
    }
    this.calculations = {
      income_monthly_in: 0,
      income_monthly_discretionary: 0,
      income_monthly_discretionary_after_dues: 0,
      loan_amount: 0,
      loan_min_down_payment: 0,
      loan_ceiling_28: 0,
      loan_ceiling_36: 0,
      loan_months_to_save_down_payment: 0,
      loan_can_afford_28: false,
      loan_can_afford_36: false,
      ratio_28: 0,
      ratio_36: 0,
      due_monthly_pmi: 0,
      due_monthly_taxes: 0,
      due_monthly_principal: 0,
      due_monthly_total: 0,
    }
  }
  async set(key:string, value:number): Promise<IAppLoan> {
    this.inputs[key] = value;
    await this.calculate();
    return this.get();
  }
  get(): IAppLoan {
    return {
      inputs: this.inputs,
      calculations: this.calculations,
    }
  }
  crunchTheNumbers(key:string, step:number, increment:number): Promise<IAppLoan>{
    return new Promise(async (resolve,reject) => {
      let run:boolean = true;
      while(run){
        const iteration:IAppIteration = await this.iterate(key,step,increment);
        run = iteration.run;
        if(iteration.finish){
          this.inputs[key] = iteration.previous;
          await this.calculate();
          const revert:boolean = iteration.improving && (this.calculations.loan_can_afford_28 || this.calculations.loan_can_afford_36) && (this.calculations.loan_can_afford_28 !== this.calculations.loan_can_afford_36);
          if(revert){
            this.inputs[key] = iteration.current;
            await this.calculate();
            return resolve(await this.get());
          } else {
            return resolve(await this.get());
          }
        }
      }
    })
  }
  async iterate(key:string, step:number, increment:number): Promise<IAppIteration>{
    const previous_ratio_28:number = this.calculations.ratio_28;
    const previous_ratio_36:number = this.calculations.ratio_36;
    const previous:number = this.inputs[key];
    this.inputs[key] = this.inputs[key] + (step * increment);
    await this.calculate();
    const current_ratio_28:number = this.calculations.ratio_28;
    const current_ratio_36:number = this.calculations.ratio_36;
    const improving:boolean = current_ratio_28 < previous_ratio_28 || current_ratio_36 < previous_ratio_36;
    const can_afford:boolean = this.calculations.loan_can_afford_28 && this.calculations.loan_can_afford_36;
    let rules_run:Array<boolean> = [
      increment === 1 && improving && !can_afford,
      increment === 1 && !improving && can_afford,
      increment === -1 && !improving && can_afford,
      increment === -1 && improving && !can_afford,
    ]
    let run:boolean = rules_run.includes(true);
    let rules_finish:Array<boolean> = [
      !run && increment === 1 && !improving && !can_afford,
      !run && increment === -1 && !improving && !can_afford,
      !run && increment === 1 && improving && can_afford,
      !run && increment === -1 && improving && can_afford
    ]
    let finish:boolean = rules_finish.includes(true);
    return {
      increment: increment,
      improving: improving,
      can_afford: can_afford,
      previous: previous,
      current: this.inputs[key],
      run: run,
      finish: finish,
    }
  }
  async calculate(): Promise<boolean> {
    this.calculations.income_monthly_in = await this.income_monthly_in();
    this.calculations.income_monthly_discretionary = await this.income_monthly_discretionary();
    this.calculations.loan_amount = await this.loan_amount();
    this.calculations.loan_min_down_payment = await this.loan_min_down_payment();
    this.calculations.loan_months_to_save_down_payment = await this.loan_months_to_save_down_payment();
    this.calculations.due_monthly_taxes = await this.due_monthly_taxes();
    this.calculations.due_monthly_pmi = await this.due_monthly_pmi();
    this.calculations.due_monthly_principal = await this.due_monthly_principal();
    this.calculations.due_monthly_total = await this.due_monthly_total();
    this.calculations.income_monthly_discretionary_after_dues = await this.income_monthly_discretionary_after_dues();
    this.calculations.loan_ceiling_28 = await this.loan_ceiling_28();
    this.calculations.loan_ceiling_36 = await this.loan_ceiling_36();
    this.calculations.loan_can_afford_28 = await this.loan_can_afford_28();
    this.calculations.loan_can_afford_36 = await this.loan_can_afford_36();
    this.calculations.ratio_28 = await this.ratio_28();
    this.calculations.ratio_36 = await this.ratio_36();
    return true;
  }
  income_monthly_in(): number {
    const a = this.inputs.income_monthly_pretax_out * 12;
    const b = this.inputs.income_yearly_in - a;
    const c = this.inputs.income_tax_rate / 100;
    const d = b - (b * c);
    return d / 12;
  }
  income_monthly_discretionary(): number {
    return this.calculations.income_monthly_in - this.inputs.income_monthly_expenses;
  }
  loan_amount(): number {
    return this.inputs.home_price - this.inputs.loan_down_payment;
  }
  due_monthly_taxes(): number {
    return this.inputs.home_taxes_yearly / 12;
  }
  loan_min_down_payment(): number {
    return 0.035 * this.inputs.home_price;
  }
  due_monthly_total(): number {
    return this.calculations.due_monthly_principal + this.calculations.due_monthly_pmi + this.calculations.due_monthly_taxes + this.inputs.home_insurance_monthly;
  }
  due_monthly_principal(): number {
    const a = this.inputs.loan_term_years * 12;
    const b = this.inputs.loan_rate_interest / 1200;
    const c = Math.pow(1 + b, a - 1);
    const d = b + b / c;
    return d * this.calculations.loan_amount;
  }
  loan_ceiling_28(): number {
    const a = this.inputs.income_yearly_in / 12;
    const b = this.inputs.income_tax_rate / 100;
    const c = this.inputs.home_rent_monthly * b;
    const d = this.inputs.home_rent_monthly - c;
    const e = a + d;
    return 0.28 * e;
  }
  loan_ceiling_36(): number {
    const a = this.inputs.income_yearly_in / 12;
    const b = this.inputs.income_tax_rate / 100;
    const c = this.inputs.home_rent_monthly * b;
    const d = this.inputs.home_rent_monthly - c;
    const e = a + d;
    return 0.36 * e;
  }
  due_monthly_pmi(): number {
    const a = this.inputs.loan_rate_pmi / 100;
    const b = a * this.calculations.loan_amount;
    const c = this.calculations.loan_amount * 0.20;
    return this.inputs.loan_down_payment >= c ? 0 : b / 12;
  }
  income_monthly_discretionary_after_dues(): number {
    const a = this.calculations.due_monthly_total + this.inputs.income_monthly_expenses;
    const b = this.calculations.income_monthly_in - a;
    const c = this.inputs.income_tax_rate / 100;
    const d = this.inputs.home_rent_monthly * c;
    const e = b + this.inputs.home_rent_monthly;
    return e - d;
  }
  loan_can_afford_28(): boolean {
    return this.calculations.due_monthly_principal < this.calculations.loan_ceiling_28;
  }
  loan_can_afford_36(): boolean {
    return this.calculations.due_monthly_total < this.calculations.loan_ceiling_36;
  }
  loan_months_to_save_down_payment(): number {
    return Math.floor(this.inputs.loan_down_payment / this.calculations.income_monthly_discretionary);
  }
  ratio_28(): number {
    return this.calculations.due_monthly_principal / this.calculations.loan_ceiling_28;
  }
  ratio_36(): number {
    return this.calculations.due_monthly_total / this.calculations.loan_ceiling_36;
  }
}

export default new Loan()
