# Email API

Backend API for sending emails from the Higher Ed Med mobile app.
All pushes to this repo automatically deploy a new version to vercel

## Environment Variables

- `TO_EMAIL`: Email to send requests to: The HEM email
- `RESEND_API_KEY`: Resend email API key: Held in HEM email account in resend

## How email sending works (Resend)

All sending happens in `api/send-email.js`, which calls the Resend REST API (`https://api.resend.com/emails`) directly with `fetch`. It does not use the Resend SDK.

### Workaround: no verified domain

- The sender is `onboarding@resend.dev`, Resend's built-in test address. No domain is verified.
- The test sender can **only deliver to the email that owns the Resend account**. That's why the Resend account was created under the HEM email, and why `TO_EMAIL` is that same HEM address.
- You can't send from a Gmail address (tried in `a6d0601`, reverted in `e265b05`), because Resend only sends from domains you've verified.
- To send to anyone else, verify a domain in Resend (Domains → add DNS records), then change `from` to an address on that domain.

### Workaround: separate emails per request

Gmail and Outlook were grouping requests into one thread. To stop that, each email gets:
- a timestamp in the subject line
- custom `Message-ID`, `Thread-Index` and `X-Unique-ID` headers

(The Message-ID still uses the placeholder `@yourdomain.com`.)

### Where to see stats and logs

Log into [resend.com](https://resend.com) with the **HEM email account**, not a personal account.
- **Emails**: every sent email and its delivery status
- **Logs**: raw API requests, including failed calls
- **API Keys**: the key used for `RESEND_API_KEY`

Errors are also logged to Vercel's function logs (`Resend Error: ...`).

## Versions:

1.1.0: Updated Env vars for correct email