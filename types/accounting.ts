export interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subtype: string;
  parentAccountId?: string;
  level: number;
  currency: string;
  balance: number;
  debitBalance: number;
  creditBalance: number;
  isActive: boolean;
  description?: string;
  taxAccount: boolean;
  bankAccount: boolean;
  bankAccountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  type: 'standard' | 'opening' | 'closing' | 'adjusting' | 'reversing';
  status: 'draft' | 'posted' | 'void';
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  attachments?: string[];
  referenceType?: 'sale' | 'purchase' | 'payment' | 'receipt' | 'invoice' | 'expense' | 'adjustment';
  referenceId?: string;
  createdBy: string;
  createdByName: string;
  postedBy?: string;
  postedByName?: string;
  postedAt?: string;
  voidedBy?: string;
  voidedByName?: string;
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description?: string;
  debit: number;
  credit: number;
  currency: string;
  exchangeRate?: number;
  taxId?: string;
  taxAmount?: number;
  costCenterId?: string;
  projectId?: string;
}

export interface GeneralLedger {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
  period: string;
  transactions: GeneralLedgerTransaction[];
}

export interface GeneralLedgerTransaction {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  referenceType?: string;
  referenceId?: string;
}

export interface TrialBalance {
  period: string;
  date: string;
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
}

export interface TrialBalanceAccount {
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheet {
  date: string;
  currency: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export interface BalanceSheetSection {
  accounts: BalanceSheetAccount[];
  subtotals: { [key: string]: number };
  total: number;
}

export interface BalanceSheetAccount {
  code: string;
  name: string;
  subtype: string;
  amount: number;
  level: number;
}

export interface IncomeStatement {
  startDate: string;
  endDate: string;
  currency: string;
  revenue: IncomeStatementSection;
  costOfGoodsSold: IncomeStatementSection;
  operatingExpenses: IncomeStatementSection;
  otherIncomeExpense: IncomeStatementSection;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  grossProfitMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
}

export interface IncomeStatementSection {
  accounts: IncomeStatementAccount[];
  subtotals: { [key: string]: number };
  total: number;
}

export interface IncomeStatementAccount {
  code: string;
  name: string;
  subtype: string;
  amount: number;
  percentage: number;
}

export interface CashFlowStatement {
  startDate: string;
  endDate: string;
  currency: string;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  netCashFlow: number;
  openingCashBalance: number;
  closingCashBalance: number;
}

export interface CashFlowSection {
  items: CashFlowItem[];
  total: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
  category: string;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  fiscalYear: string;
  status: 'open' | 'closed' | 'locked';
  closingEntryId?: string;
  closedBy?: string;
  closedByName?: string;
  closedAt?: string;
  createdAt: string;
}

export interface TaxReport {
  id: string;
  type: 'vat' | 'income' | 'withholding' | 'sales';
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'filed' | 'paid';
  taxableAmount: number;
  taxAmount: number;
  credits: number;
  totalDue: number;
  filedDate?: string;
  paidDate?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  accountId: string;
  accountName: string;
  fiscalYear: string;
  period: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  notes?: string;
}

export interface AccountingSettings {
  baseCurrency: string;
  fiscalYearStart: string;
  taxRate: number;
  accountingMethod: 'accrual' | 'cash';
  enableMultiCurrency: boolean;
  enableCostCenters: boolean;
  enableProjects: boolean;
  chartOfAccountsTemplate: string;
  retainedEarningsAccountId?: string;
  currentYearEarningsAccountId?: string;
}

export interface AccountingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
