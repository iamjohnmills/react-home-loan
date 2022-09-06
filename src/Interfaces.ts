export interface IAppLoanInputs {
  [key: string]: any,
  income_yearly_in: number,
  income_monthly_pretax_out: number,
  income_tax_rate: number,
  income_monthly_expenses: number,
  home_price: number,
  home_taxes_yearly: number,
  home_insurance_monthly: number,
  home_rent_monthly: number,
  loan_term_years: number,
  loan_rate_interest: number,
  loan_rate_pmi: number,
  loan_down_payment: number,
}

export interface IAppLoanCalculations {
  income_monthly_in: number,
  income_monthly_discretionary: number,
  income_monthly_discretionary_after_dues: number,
  loan_amount: number,
  loan_min_down_payment: number,
  loan_ceiling_28: number,
  loan_ceiling_36: number,
  loan_months_to_save_down_payment: number,
  loan_can_afford_28: boolean,
  loan_can_afford_36: boolean,
  ratio_28: number,
  ratio_36: number,
  due_monthly_pmi: number,
  due_monthly_taxes: number,
  due_monthly_principal: number,
  due_monthly_total: number,
}

export interface IAppLoan {
  inputs: IAppLoanInputs,
  calculations: IAppLoanCalculations,
}

export interface IAppIteration {
  increment: number,
  improving: boolean,
  can_afford: boolean,
  previous: number,
  current: number,
  run: boolean,
  finish: boolean,
}
