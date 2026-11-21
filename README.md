# Claims AI · interactive demo

**Live demo:** https://andy07-debug.github.io/claims-ai-ux/

A clickable prototype of **Claims Mode** in the Techolution creative workspace (AppMod.AI), built on the same
AppMod.AI shell as the Contracts AI demo (header, AskMod.AI chat, mode picker, filter settings, chat tools menu,
projects and history all work). The screens follow the Claims Mode demo: Welcome to Claims Mode, the dashboard,
claim search with ranked results, and claim details.

The guided flow follows the Claims AI launch trailer script:
ask "Show me John’s claims" → the claims come back ranked, each with an AI summary → "Why this claim is the 1st Match"
opens the supporting factors and the decision strength → a tag opens the evidence (the work status report) →
"Show me the gap" names what is missing on John Whitaker’s claim (the 90-day transitional-duty follow-up, overdue,
no note, no owner) → the dashboard → his claim → the AI offers "Update 120 Day Follow Up Date" → one click sets the
date, schedules the next follow-up, adds the note and assigns the owner.

- Click the highlighted control to move on, or use the **Guided demo** bar (◀ ▶ Play).
- `?clean` hides the demo bar and hint rings (for screen recording). `?play` plays the whole flow.
- `index.html#dashboard` (any step id) opens a step directly. Click the Techolution logo to start over.
- Build: `cd src && python3 final.py ../index.html`.

All data is sample data: every claimant, analyst, location and number is made up.
