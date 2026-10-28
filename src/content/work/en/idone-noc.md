---
title: "iDone NOC: monitoring that calls you when something breaks"
client: "An iDone product"
year: "2025–2026"
services:
  - "web"
  - "automation"
summary: "A monitoring platform that checks client systems every minute, opens an incident when something fails, and escalates through alerts up to an active phone call that reads out the error details."
problem: "Systems and automations we hand over have to keep working after the handover. Without monitoring, the client is the one who finds out something broke, usually too late. An email or a chat alert is not always enough at three in the morning."
built:
  - "Active monitoring engine: HTTP, SSL and keyword checks every minute, with a retry before anything is declared down, to avoid false alarms"
  - "Incident management with a full log: what was checked, what failed, who was alerted and when they acknowledged"
  - "Escalation policies: up to five levels of contacts, retries per level, and automatic hand-off to the next level when nobody answers"
  - "An active phone call in Hebrew or English that reads out the error details and asks for 1 to acknowledge; without an acknowledgement the escalation continues"
  - "Alerts by email, and through n8n as a central router to WhatsApp, Slack and any other channel"
  - "A React client portal for configuring monitors, live status and subscription plans, billed through n8n with no lock-in to a payment provider"
result:
  - "Every system we ship comes with eyes on it, 24/7"
  - "A critical problem reaches a person by phone, not just an inbox"
  - "The same platform serves our clients as a SaaS"
tools:
  - "Python / FastAPI"
  - "Celery"
  - "PostgreSQL"
  - "React"
  - "Twilio"
  - "n8n"
  - "Docker"
media:
  type: "flow"
  ratio: "16 / 9"
flow:
  - "Check every minute"
  - "Retry"
  - "Incident"
  - "Email"
  - "Phone call"
  - "Escalation"
tbd:
  - "Product or sign-up page link, if any"
---
