# Revsi

Build a review request dashboard on the Supabase project this app is

already connected to. The database exists and is fully built.

CRITICAL CONSTRAINTS

- Do NOT create, alter, or drop any tables, columns, triggers, or

  functions. Do NOT write or run migrations. Do NOT enable Lovable Cloud.

  Read and write only through the tables listed below.

- Do NOT insert into or update the review_requests table from the

  frontend. Review requests are created automatically by a database

  trigger when a service row is set to status 'completed'. The frontend

  reads that table only.

- Do NOT modify the queue_review_request or queue_reminder_after_send

  database functions, the claim_due_review_requests function, or the

  send-review-requests edge function.

- Row level security is already enabled and scoped to the signed in user

  through businesses.owner_id. Do not add, change, or "fix" any RLS

  policies. Assume queries return only the user's own rows.

Before writing code, read the existing schema and confirm you can see

these five tables. If you cannot see them, stop and tell me instead of

creating anything.

EXISTING TABLES

- businesses (id, owner_id, name, review_url, timezone, from_name,

  reply_to_email, postal_address, request_delay_minutes,

  reminder_enabled, reminder_delay_days, is_active)

- customers (id, business_id, name, email, phone)

- services (id, business_id, customer_id, service_type, status,

  completed_at, notes) where status is scheduled, completed, or cancelled

- review_requests (id, business_id, service_id, customer_id, kind,

  channel, status, send_after, sent_at, clicked_at, click_count,

  error_message) where kind is initial or reminder

- contact_optouts (id, business_id, email, phone, reason)

AUTH

Email and password sign in against Supabase auth. No sign up page.

Redirect unauthenticated users to the login page. After login, load the

single business row belonging to the user and hold it in app context.

PAGES

1. Jobs, the home page

A table of services joined to customers, newest first, showing customer

name, email, service type, status, and completed date. A prominent

"New job" button. Each scheduled row has a "Mark completed" action that

sets status to 'completed' and completed_at to now. Show a toast

confirming a review request has been scheduled. Completed rows show when

the request is due to send.

2. New job, a dialog rather than a page

Fields: customer name, email, phone, service type, notes. A checkbox

"Completed now", checked by default. On save, look for an existing

customer with that email for this business and reuse it if found,

otherwise insert a new customer. There is a unique index on

(business_id, lower(email)), so inserting a duplicate email will fail.

Then insert the service. If "Completed now" is checked, set status

'completed' and completed_at to now, otherwise status 'scheduled'.

3. Requests

A read only table of review_requests joined to customers, newest first:

customer name, kind, status, send_after, sent_at, whether it was clicked,

and error_message when status is failed. A filter control by status.

4. Settings

An edit form over the single businesses row: name, review_url, from_name,

reply_to_email, postal_address, request_delay_minutes, reminder_enabled,

reminder_delay_days. Validate that review_url is a URL.

5. Stat cards on the Jobs page

Four counts for the last 30 days: jobs completed, requests sent, requests

clicked, and click rate as a percentage.

DESIGN

Clean modern SaaS. Light surfaces, generous whitespace, a single neutral

dark accent, no gradients, no heavy borders. Sidebar navigation. It must

work well on a phone, since jobs get marked complete in the field.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://service-feedback.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eceaa310-20aa-4f29-a3dd-aa55703a4b1b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
