import {
  Clock3,
  CreditCard,
  Receipt,
  Shield,
  TrendingUp,
  Umbrella
} from 'lucide-react';

import { DimensionKey, QuizAnswers, QuizQuestion } from '../types';

export const dimensionMeta: Record<DimensionKey, { label: string; icon: QuizQuestion['icon'] }> = {
  emergency: { label: 'Emergency Fund', icon: Shield },
  insurance: { label: 'Insurance', icon: Umbrella },
  investments: { label: 'Investments', icon: TrendingUp },
  debt: { label: 'Debt', icon: CreditCard },
  tax: { label: 'Tax Planning', icon: Receipt },
  retirement: { label: 'Retirement', icon: Clock3 }
};

export const questions: QuizQuestion[] = [
  {
    id: 'emergency_months',
    dimension: 'emergency',
    dimensionLabel: 'Emergency Fund',
    icon: Shield,
    question: 'How many months of living expenses can your current emergency fund cover?',
    options: [
      { label: 'Less than 1 month', value: 'Less than 1 month' },
      { label: '1 to 2 months', value: '1 to 2 months' },
      { label: '3 to 5 months', value: '3 to 5 months' },
      { label: '6 months or more', value: '6 months or more' }
    ]
  },
  {
    id: 'emergency_location',
    dimension: 'emergency',
    dimensionLabel: 'Emergency Fund',
    icon: Shield,
    question: 'Where do you keep your emergency money today?',
    options: [
      { label: 'No dedicated emergency fund', value: 'No dedicated emergency fund' },
      { label: 'Locked in fixed deposits only', value: 'Locked in fixed deposits only' },
      { label: 'Savings account or liquid fund', value: 'Savings account or liquid fund' },
      { label: 'Split across savings and liquid fund', value: 'Split across savings and liquid fund' }
    ]
  },
  {
    id: 'emergency_usage',
    dimension: 'emergency',
    dimensionLabel: 'Emergency Fund',
    icon: Shield,
    question: 'When did you last need to use your emergency buffer?',
    options: [
      { label: 'Within the last 3 months', value: 'Within the last 3 months' },
      { label: 'Within the last 6 months', value: 'Within the last 6 months' },
      { label: 'Not used in the last 12 months', value: 'Not used in the last 12 months' },
      { label: 'Never needed it so far', value: 'Never needed it so far' }
    ]
  },
  {
    id: 'insurance_health',
    dimension: 'insurance',
    dimensionLabel: 'Insurance',
    icon: Umbrella,
    question: 'What health insurance coverage do you currently have?',
    options: [
      { label: 'No health insurance', value: 'No health insurance' },
      { label: 'Employer health insurance only', value: 'Employer health insurance only' },
      { label: 'Individual or floater policy under ?10 lakh', value: 'Individual or floater policy under ?10 lakh' },
      { label: 'Floater policy plus super top-up', value: 'Floater policy plus super top-up' }
    ]
  },
  {
    id: 'insurance_life',
    dimension: 'insurance',
    dimensionLabel: 'Insurance',
    icon: Umbrella,
    question: 'How much term life insurance do you have relative to annual income?',
    options: [
      { label: 'No term life insurance', value: 'No term life insurance' },
      { label: 'Around 5 times my annual income', value: 'Around 5 times my annual income' },
      { label: 'Around 10 times my annual income', value: 'Around 10 times my annual income' },
      { label: 'More than 15 times my annual income', value: 'More than 15 times my annual income' }
    ]
  },
  {
    id: 'insurance_addon',
    dimension: 'insurance',
    dimensionLabel: 'Insurance',
    icon: Umbrella,
    question: 'Do you carry any additional protection like critical illness or personal accident cover?',
    options: [
      { label: 'No additional protection', value: 'No additional protection' },
      { label: 'Personal accident cover only', value: 'Personal accident cover only' },
      { label: 'Critical illness cover only', value: 'Critical illness cover only' },
      { label: 'Both critical illness and personal accident cover', value: 'Both critical illness and personal accident cover' }
    ]
  },
  {
    id: 'investments_rate',
    dimension: 'investments',
    dimensionLabel: 'Investments',
    icon: TrendingUp,
    question: 'Roughly what share of your monthly income do you invest?',
    options: [
      { label: 'I am not investing right now', value: 'I am not investing right now' },
      { label: 'Under 10 percent', value: 'Under 10 percent' },
      { label: '10 to 20 percent', value: '10 to 20 percent' },
      { label: 'More than 20 percent', value: 'More than 20 percent' }
    ]
  },
  {
    id: 'investments_mix',
    dimension: 'investments',
    dimensionLabel: 'Investments',
    icon: TrendingUp,
    question: 'Which option best describes your current investment mix?',
    options: [
      { label: 'Mostly cash, savings, or FDs', value: 'Mostly cash, savings, or FDs' },
      { label: 'Mutual fund SIPs', value: 'Mutual fund SIPs' },
      { label: 'Mostly direct stocks or crypto', value: 'Mostly direct stocks or crypto' },
      { label: 'Diversified mix of mutual funds, PPF, and index exposure', value: 'Diversified mix of mutual funds, PPF, and index exposure' }
    ]
  },
  {
    id: 'investments_sip',
    dimension: 'investments',
    dimensionLabel: 'Investments',
    icon: TrendingUp,
    question: 'What is your current monthly SIP amount?',
    options: [
      { label: 'No SIP right now', value: 'No SIP right now' },
      { label: 'Below ?5,000', value: 'Below ?5,000' },
      { label: '?5,000 to ?15,000', value: '?5,000 to ?15,000' },
      { label: 'Above ?15,000', value: 'Above ?15,000' }
    ]
  },
  {
    id: 'investments_horizon',
    dimension: 'investments',
    dimensionLabel: 'Investments',
    icon: TrendingUp,
    question: 'What is the time horizon for most of your investments?',
    options: [
      { label: 'Less than 1 year', value: 'Less than 1 year' },
      { label: '1 to 3 years', value: '1 to 3 years' },
      { label: '3 to 7 years', value: '3 to 7 years' },
      { label: 'More than 7 years', value: 'More than 7 years' }
    ]
  },
  {
    id: 'debt_emi',
    dimension: 'debt',
    dimensionLabel: 'Debt',
    icon: CreditCard,
    question: 'How much of your monthly income goes toward EMIs?',
    options: [
      { label: 'No EMIs', value: 'No EMIs' },
      { label: 'Below 20 percent', value: 'Below 20 percent' },
      { label: '20 to 40 percent', value: '20 to 40 percent' },
      { label: 'Above 40 percent', value: 'Above 40 percent' }
    ]
  },
  {
    id: 'debt_cc',
    dimension: 'debt',
    dimensionLabel: 'Debt',
    icon: CreditCard,
    question: 'What happens to your credit card bill most months?',
    options: [
      { label: 'I carry a balance and pay interest', value: 'I carry a balance and pay interest' },
      { label: 'I sometimes pay only part of it', value: 'I sometimes pay only part of it' },
      { label: 'I pay the full amount on time', value: 'I pay the full amount on time' },
      { label: 'I do not use credit cards', value: 'I do not use credit cards' }
    ]
  },
  {
    id: 'debt_type',
    dimension: 'debt',
    dimensionLabel: 'Debt',
    icon: CreditCard,
    question: 'What is your largest current debt?',
    options: [
      { label: 'Personal loan', value: 'Personal loan' },
      { label: 'Vehicle loan', value: 'Vehicle loan' },
      { label: 'Home loan', value: 'Home loan' },
      { label: 'I do not have debt', value: 'I do not have debt' }
    ]
  },
  {
    id: 'tax_80c',
    dimension: 'tax',
    dimensionLabel: 'Tax Planning',
    icon: Receipt,
    question: 'How do you use tax-saving deductions like Section 80C?',
    options: [
      { label: 'I do not use them', value: 'I do not use them' },
      { label: 'I use 80C partially', value: 'I use 80C partially' },
      { label: 'I fully use 80C each year', value: 'I fully use 80C each year' },
      { label: 'I optimize 80C, NPS, and HRA', value: 'I optimize 80C, NPS, and HRA' }
    ]
  },
  {
    id: 'tax_itr',
    dimension: 'tax',
    dimensionLabel: 'Tax Planning',
    icon: Receipt,
    question: 'How consistent are you with filing your income tax return?',
    options: [
      { label: 'I miss or delay filing', value: 'I miss or delay filing' },
      { label: 'I file on time every year', value: 'I file on time every year' },
      { label: 'A CA files it but I do not review much', value: 'A CA files it but I do not review much' },
      { label: 'My taxes are fully automated and reviewed', value: 'My taxes are fully automated and reviewed' }
    ]
  },
  {
    id: 'tax_strategy',
    dimension: 'tax',
    dimensionLabel: 'Tax Planning',
    icon: Receipt,
    question: 'Which statement best matches your tax planning approach?',
    options: [
      { label: 'No tax planning yet', value: 'No tax planning yet' },
      { label: 'Basic planning beyond 80C is missing', value: 'Basic planning beyond 80C is missing' },
      { label: 'I compare regimes and optimize yearly', value: 'I compare regimes and optimize yearly' },
      { label: 'I review deductions and capital gains quarterly', value: 'I review deductions and capital gains quarterly' }
    ]
  },
  {
    id: 'retirement_product',
    dimension: 'retirement',
    dimensionLabel: 'Retirement',
    icon: Clock3,
    question: 'Which retirement-focused products do you contribute to regularly?',
    options: [
      { label: 'None yet', value: 'None yet' },
      { label: 'PPF only', value: 'PPF only' },
      { label: 'EPF plus PPF or NPS', value: 'EPF plus PPF or NPS' },
      { label: 'A diversified retirement portfolio', value: 'A diversified retirement portfolio' }
    ]
  },
  {
    id: 'retirement_target',
    dimension: 'retirement',
    dimensionLabel: 'Retirement',
    icon: Clock3,
    question: 'How clear are you on the corpus you need for retirement?',
    options: [
      { label: 'I have no idea yet', value: 'I have no idea yet' },
      { label: 'I have a rough idea', value: 'I have a rough idea' },
      { label: 'I have a written target amount', value: 'I have a written target amount' },
      { label: 'I review my target annually', value: 'I review my target annually' }
    ]
  },
  {
    id: 'retirement_age',
    dimension: 'retirement',
    dimensionLabel: 'Retirement',
    icon: Clock3,
    question: 'When do you want to retire financially?',
    options: [
      { label: 'After 60', value: 'After 60' },
      { label: 'Between 55 and 60', value: 'Between 55 and 60' },
      { label: 'Between 50 and 55', value: 'Between 50 and 55' },
      { label: 'I want full financial freedom before 50', value: 'I want full financial freedom before 50' }
    ]
  },
  {
    id: 'retirement_amount',
    dimension: 'retirement',
    dimensionLabel: 'Retirement',
    icon: Clock3,
    question: 'How much do you set aside for retirement each month?',
    options: [
      { label: 'Nothing consistently', value: 'Nothing consistently' },
      { label: 'Below ?5,000', value: 'Below ?5,000' },
      { label: '?5,000 to ?15,000', value: '?5,000 to ?15,000' },
      { label: 'Above ?15,000', value: 'Above ?15,000' }
    ]
  }
];

export const demoAnswers: QuizAnswers = {
  emergency_months: '3 to 5 months',
  emergency_location: 'Savings account or liquid fund',
  emergency_usage: 'Not used in the last 12 months',
  insurance_health: 'Employer health insurance only',
  insurance_life: 'No term life insurance',
  insurance_addon: 'No additional protection',
  investments_rate: 'Under 10 percent',
  investments_mix: 'Mutual fund SIPs',
  investments_sip: 'Below ?5,000',
  investments_horizon: '3 to 7 years',
  debt_emi: '20 to 40 percent',
  debt_cc: 'I pay the full amount on time',
  debt_type: 'Home loan',
  tax_80c: 'I use 80C partially',
  tax_itr: 'I file on time every year',
  tax_strategy: 'Basic planning beyond 80C is missing',
  retirement_product: 'PPF only',
  retirement_target: 'I have a rough idea',
  retirement_age: 'Between 55 and 60',
  retirement_amount: 'Below ?5,000'
};
