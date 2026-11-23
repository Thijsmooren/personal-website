# Personal website

Personal website for Thijs Mooren.

## Frascati Centre discovery form

The private invitation route is `/discovery/frascati`. Rachel enters `Rachel`; Viv enters `Viv` or `Vivian` in the visible first-name field. Each receives a separate 12-hour session and role-specific introduction. Responses are held in the browser until Send. A successful Send emails the answers to the configured address; a failed send keeps them on screen and offers a text download.

Set these environment variables in Vercel for the deployment that will host the form:

| Variable | Purpose |
| --- | --- |
| `DISCOVERY_SESSION_SECRET` | Random secret of at least 32 bytes for signing sessions. Use a fresh value, separate from `CLASSIQ_PASSWORD`. |
| `RESEND_API_KEY` | Resend API key. |
| `DISCOVERY_FROM_EMAIL` | Verified sender address in Resend, such as `forms@your-verified-domain`. |
| `DISCOVERY_TO_EMAIL` | Address where Matthias receives completed answers. |

Keep real values out of Git. Once configured, deploy and submit one test response from each portal. The first names are easy to guess, so this is an invitation gate for a low-sensitivity questionnaire, not strong authentication. Do not put confidential or personal records in the answers. Email retention and deletion must be managed in the receiving mailbox; the website does not store submissions or implement timed deletion.
