# Personal website

Personal website for Thijs Mooren.

## Frascati Centre discovery form

The private invitation route is `/discovery/frascati`. Rachel enters `Rachel`; Viv enters `Viv` or `Vivian` in the visible first-name field. Each receives a separate 12-hour session and a six-question pre-call form. Every question may be left blank. Responses are held in the browser until Send. A successful Send saves a private JSON file in Vercel Blob; a failed send keeps the answers on screen and offers a text download.

The private response page is `/discovery/frascati/responses`. It shows each submission and offers a CSV download. The admin password is `DISCOVERY_ADMIN_PASSWORD`, or the existing `CLASSIQ_PASSWORD` when the separate password is unset.

In the Vercel project, open Storage, create a **Private Blob** store, and connect it to the environments that host the form. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project automatically. This store must be private; a public store would expose responses to anyone with a file URL.

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Added by Vercel when the private Blob store is connected. Do not commit it. |
| `DISCOVERY_SESSION_SECRET` | Optional separate secret for signing sessions. If unset, the existing `CLASSIQ_PASSWORD` is used. |
| `DISCOVERY_ADMIN_PASSWORD` | Optional separate password for the response page. If unset, the existing `CLASSIQ_PASSWORD` is used. |

Keep real secrets out of Git. Once storage is connected, deploy and submit one test response from each portal, then check both on the private response page and download the CSV. The first names are easy to guess, so the respondent gate is for a low-sensitivity questionnaire, not strong authentication. Do not put confidential or personal records in the answers. The site does not implement timed deletion; manage deletion in the Vercel Blob dashboard.
