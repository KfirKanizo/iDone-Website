---
title: "Payments, invoices and CRM that talk to each other"
client: "Several businesses (a recurring package)"
year: "2024–2025"
services:
  - "automation"
summary: "An approved payment issues the document, sends it to the customer, updates the CRM and logs a line for the accountant. No hands involved."
problem: "A gap between the payment processor and the bookkeeping system meant errors, duplicates and a pile of manual work at the end of every month."
built:
  - "Approved transactions detected through a webhook from the payment processor"
  - "Invoice or receipt issued automatically in the accounting system"
  - "Sent to the customer's email and recorded on the CRM customer card"
  - "A line logged in an audit sheet for the accountant, plus scheduled payment reminders"
result:
  - "No double entry between payments and bookkeeping"
  - "An up-to-date financial picture inside the customer record"
  - "Orderly collections without chasing"
tools:
  - "n8n"
  - "Make"
  - "Google Sheets"
  - "CRM"
  - "Payment gateway"
media:
  type: "flow"
  ratio: "16 / 9"
flow:
  - "Payment"
  - "Webhook"
  - "Invoice"
  - "Customer email"
  - "CRM"
  - "Accountant sheet"
tbd:
  - "One named client example, on approval"
---
