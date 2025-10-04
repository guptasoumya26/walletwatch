# Pending Balances Feature - Implementation Summary

## Overview
Added a new **Pending Balances** feature to track non-shared expenses where one user owes another. These balances persist across months until marked as settled and automatically integrate into the total settlement calculation.

## What's New

### Database
- **New Table**: `pending_balances`
  - Tracks creditor, debtor, amount, description, category
  - Settlement tracking with timestamp and settler
  - Full audit trail with creator tracking

### API Routes
1. **GET/POST `/api/pending-balances`**
   - Fetch all pending balances (filter by active/settled/all)
   - Create new pending balance entries

2. **PUT/DELETE `/api/pending-balances/[id]`**
   - Mark pending balance as settled
   - Delete pending balance (only if not settled)

### UI Components

#### PendingBalancesSection
- Main container with "Add Pending Balance" button
- Displays active and settled balances
- Full CRUD operations

#### PendingBalanceForm
- Modal form for adding pending balances
- Radio buttons: "Partner owes me" / "I owe partner"
- Category dropdown (reuses expense categories)
- Description field with preview message
- Example: "Anu will owe you ₹5,000.00"

#### PendingBalancesList
- **Active Section**: Shows all pending balances with:
  - Color-coded cards (blue = they owe you, red = you owe them)
  - "Mark as Settled" button
  - "Delete" button (only for creator)
- **Settled History**: Collapsible section showing settled items

#### BalanceCalculator (Enhanced)
- Now shows **three-tier breakdown**:
  1. **Shared Expenses Balance**: From monthly expenses
  2. **Pending Balances**: Expandable with itemized list
  3. **Total Settlement Amount**: Combined total (highlighted)

## User Flow Example

### Scenario: Soumyansh pays Anu's gym fee

1. **Adding**:
   - Soumyansh clicks "Add Pending Balance"
   - Selects "Anu owes me"
   - Enters ₹5,000, category "Others", description "Gym membership"
   - Preview: "Anu will owe you ₹5,000.00"
   - Clicks "Add"

2. **Viewing**:
   - Both users see in Active Pending Balances:
     - "Anu owes Soumyansh ₹5,000.00 for Gym membership"
   - Balance Calculator shows:
     - Shared: Anu owes ₹10,000
     - Pending: +₹5,000 (expandable)
     - **Total: ₹15,000**

3. **Settling**:
   - Either user clicks "Mark as Settled"
   - Moves to "Settled History" with timestamp
   - Total settlement recalculates

## Files Created
```
supabase-pending-balances-schema.sql
src/lib/types.ts
src/app/api/pending-balances/route.ts
src/app/api/pending-balances/[id]/route.ts
src/components/PendingBalanceForm.tsx
src/components/PendingBalancesList.tsx
src/components/PendingBalancesSection.tsx
```

## Files Modified
```
src/lib/supabase.ts (added pending_balances table types)
src/components/BalanceCalculator.tsx (integrated pending balances)
src/components/Dashboard.tsx (added PendingBalancesSection)
```

## Setup Instructions

1. **Run Database Migration**:
   ```sql
   -- Execute in Supabase SQL Editor:
   -- File: supabase-pending-balances-schema.sql
   ```

2. **Build & Test**:
   ```bash
   npm run build
   npm run dev
   ```

3. **Verify**:
   - Login to dashboard
   - Click "Add Pending Balance"
   - Add a test entry
   - Check Balance Calculator for integration
   - Mark as settled and verify it moves to history

## Key Features

✅ Bi-directional debt tracking (both users can add)
✅ Automatic balance calculation integration
✅ Settlement workflow with timestamps
✅ Settled history with full audit trail
✅ Delete protection (only creator, only if not settled)
✅ Visual breakdown in Balance Calculator
✅ Expandable pending balance details
✅ Color-coded UI (blue = receiving, red = owing)
✅ Reuses existing category system
✅ Both users see all pending balances

## Security
- RLS enabled on pending_balances table
- Application-level authorization in API routes
- Only creator can delete unsettled balances
- Both users can mark as settled

## Next Steps (Optional Enhancements)
- Add email notifications for new pending balances
- Export pending balances to CSV
- Add pending balance notes/attachments
- Recurring pending balances
- Bulk settle feature
