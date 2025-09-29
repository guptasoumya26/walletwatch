export const EXPENSE_CATEGORIES = [
  'Amazon',
  'Rent',
  'Blinkit',
  'Zomato',
  'Bigbasket',
  'Meter recharge',
  'Netflix',
  'Broadband',
  'Car Wash',
  'Gas Cylinder',
  'Swiggy',
  'Maid',
  'Cook',
  'Others'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export const USERS = {
  SOUMYANSH: 'Soumyansh',
  ANU: 'Anu'
} as const