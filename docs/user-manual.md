# User Manual

## Sign In

Open `http://localhost:5173` and sign in with your account. The navigation and
available actions depend on your role.

New team members can create an account from the registration page. Every public
registration starts with the `USER` role. Administrators can promote trusted
accounts to `INSPECTOR` or change account status from the Users page.

Forgot-password and reset-password pages are available from the sign-in screen.

## Dashboard

Each role receives a dashboard focused on its responsibilities:

- Administrators manage user accounts, inventory, reports, compliance, and data integrity.
- Inspectors conduct inspections, log results, and record maintenance.
- Users view extinguisher status, schedule inspections, and view inspection history.

## Fire Extinguishers

Use the inventory page to review serial number, location, type, size, status,
and expiry date. Administrators manage extinguisher records through the API.

## Inspections

All authenticated users can schedule inspections and view history. Inspectors
and administrators complete inspections and record results.

## Maintenance

All authenticated users can view maintenance history. Inspectors and
administrators log actions, issues, recommendations, and notes.

## Reports

Administrators can view live reports and export CSV or PDF files.

## Notifications and Profile

Notifications show inspection and system updates. The profile page displays the
current account and role. Password changes are available through the user API.
