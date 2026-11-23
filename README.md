# Personal website

Personal website for Thijs Mooren.

## Frascati Centre discovery form

The private invitation route is `/discovery/frascati`. Rachel enters `Rachel`; Viv enters `Viv` or `Vivian` in the visible first-name field. Each receives a separate 12-hour session and role-specific introduction. Responses are held in the browser until Send. A successful Send stores the answers in one Formspree dashboard; a failed send keeps them on screen and offers a text download.

Create one Formspree form, then set its form ID in Vercel for the deployment that will host the form:

| Variable | Purpose |
| --- | --- |
| `FORMSPREE_FORM_ID` | The ID from the Formspree form's Integration tab. |
| `DISCOVERY_SESSION_SECRET` | Optional separate secret for signing sessions. If unset, the existing `CLASSIQ_PASSWORD` is used. |

Keep real secrets out of Git. Once configured, deploy and submit one test response from each portal, then check both in the Formspree dashboard. The first names are easy to guess, so this is an invitation gate for a low-sensitivity questionnaire, not strong authentication. Do not put confidential or personal records in the answers. The website does not store submissions or implement timed deletion. Manage response access and deletion in Formspree.
