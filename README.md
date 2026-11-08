# Revsi

Automated Google review requests for small service businesses.

Live at **[revsi.app](https://revsi.app)**

## The problem

Online reviews decide whether a local service business gets found. Everyone running one knows this. Almost nobody asks consistently, because asking is manual work that happens after the job is already done and the next one is already starting. The request either never goes out or arrives days later, when the customer has moved on.

## What I learned

Timing and personalization matter more than volume. A request that arrives shortly after the job, referencing the actual work, performs very differently from a batch send. That turned the problem into a data problem rather than a marketing one: the product has to know when a job actually finished.

## How it works

Job completed, wait, personalized request, follow up once if there is no response, then stop. The sequence runs itself. The business does nothing after marking the job complete.

## Design decisions worth explaining

**Generic data model.** Business, Customer, Service, ReviewRequest. Nothing in the schema knows about notaries, which is the industry the first customer came from. Keeping it generic from the start was the decision that made it sellable beyond one vertical.

**Allowance keyed to the review URL.** New businesses get 20 free review requests with no time limit, and no card up front. The allowance is keyed to the Google review URL rather than the account, so signing up again with a different email does not reset it. A time-boxed trial would have been easier to build and would have failed, because a business with two jobs a week cannot evaluate this product in fourteen days.

**API first.** Revsi integrates directly with OpenSked, another product of mine, but the same workflow can be triggered by any platform through a public API. The integration is one consumer of the API rather than a special path through the code.

**Billing per business.** $29/month for the first business with unlimited requests, $15/month for each additional one. Each business is invoiced separately but managed from one login, because the people running several locations want separate books and one password.

## Stack

- React + TypeScript
- Supabase (Postgres, Auth, Edge Functions)
- Row-level security for tenant isolation
- Resend for transactional email

## Development

```bash
git clone https://github.com/milenawebb/revsi.git
cd revsi
npm install
npm run dev
```

Requires a `.env` with Supabase and Resend values. See `.env.example`.

## Notes

Built with AI-native tooling, primarily Lovable. The data model, the workflow design and the product decisions were made by hand.

---

Built by [Milena Webb](https://milenawebb.com).
