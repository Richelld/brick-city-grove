## Brick City Grove

GirlHacks 2026 Plan of Action

The doc you linked says GirlHacks is a 24-hour event. That's the biggest constraint on this plan, so I've split everything into must-have, should-have, and stretch tiers. That way you can demo a polished core instead of six half-working integrations.

## The concept: one app, two sides, like Clover

Clover's strength is that it serves both sides of a transaction: the customer paying and the merchant running a business. Fiserv judges will notice if you copy that structure. Your app has two experiences:

- Residents explore Newark through a map and three tabs: Food & Shops, Events, and Jobs. They get rewarded for spending locally, and they can ask an AI guide for recommendations.

- Business owners and organizers get a small Clover-style dashboard. They can post events, update hours, post open shifts, and see their foot traffic and sales trends.

The theme writes itself. Newark is called Brick City, and Branch Brook Park has the largest cherry blossom collection in the US. You can call the app something like Brick City Grove, or just The Grove. That name also echoes Avanade's "Heart of the Grove" prize. Businesses are the "groves" you visit, and the rewards are "Seeds" you plant back into the community.

Your one-sentence pitch: "The Grove keeps Newark's money growing in Newark." Every discount and reward is earned at one local business and spent at another. A live counter on the home screen shows how many dollars stayed local this week. That number is your demo's emotional hook, and it gives Tiger Data a real job.

## How each sponsor track fits

| Track | What it does in your app | Effort |
| --- | --- | --- |
| Tiger Data | Stores users and businesses as regular tables. Stores | Core |
|   | check-ins, purchases, and page views as time-series |   |
|   | data (hypertables). Pre-computed summaries |   |
|   | (continuous aggregates) power the heatmap, the |   |
|   | business dashboard, and the "dollars kept local" |   |
|   | counter. |   |


| Gemini | A "Forest Guide" chatbot that answers things like "cheap | Core |
| --- | --- | --- |
|   | dinner near me that's open now" by querying your actual |   |
|   | database. Also auto-categorizes events, drafts event |   |
|   | descriptions for business owners, and translates |   |
|   | content. |   |
| Azure | Azure Maps draws the heatmap and pins. Azure AI | Core |
|   | Language analyzes the sentiment of reviews to give |   |
|   | each business a vibe score. You can also host the app |   |
|   | on Azure with student credits. |   |
| GoDaddy Registry Register your domain early using the MLH claim code. |   | 15 min |
|   | Check which TLDs it covers; names like brickcitygrove |   |
|   | or newarkgrove are worth trying. |   |
| ElevenLabs | The Forest Guide speaks its answers, and any listing | Low |
|   | can be read aloud. Pitch this as accessibility for elderly, |   |
|   | low-vision, and non-English-speaking residents. |   |
| Solana | Pay-ahead and rewards on Solana devnet (test | Riskiest |
|   | network). Customers pay through Solana Pay QR codes |   |
|   | with a Phantom wallet and earn "Seed" tokens |   |
|   | redeemable at any participating business. |   |

Two corrections to your notes:

- Sentiment analysis can't categorize events. It only tells you whether text is positive or negative. Use Gemini to sort events into categories, and use Azure sentiment on reviews instead. That's a more honest use of both tools, and the CS professors will notice.

- Keep Solana's scope tight. Real card payments aren't feasible in 24 hours. Use devnet, say clearly in the demo that it's a prototype, and frame it as "near-zero fees matter for small businesses paying 3% card processing fees." Fiserv judges know that pain point well.

## Location-based discounts, done responsibly

Only check the user's location when they tap "Pay" or "Check in." Never track them in the background. If they're within roughly 100 meters of the business, the discount applies. Mention this privacy choice in your pitch, since judges like seeing it.


Build a demo mode toggle that teleports your location to the Ironbound or downtown. You'll be presenting from NJIT, not standing inside a bakery, and this one feature will save your demo.

## Suggested tech stack

Pick things your team already knows. Here's a stack that keeps everything in one codebase:

- App: Next.js with React and Tailwind. Frontend and backend live together.

- Login: Auth.js with Google sign-in. Users pick "Resident" or "Business" at signup, and a business account unlocks the dashboard.

- Database: Tiger Cloud (managed Postgres). Distances can come from PostGIS if your instance has it, or from a simple distance formula in code if not.

- Maps: Azure Maps Web SDK, which has a built-in heatmap layer.

- AI: The Gemini API with function calling, so the chatbot can query your database instead of making up answers.

- Voice: The ElevenLabs text-to-speech API.

- Payments: @solana/web3.js, Solana Pay, and Phantom wallet on devnet.

- Hosting: Azure Static Web Apps or App Service, which strengthens your Azure submission.

Seed data: Hand-enter 30 to 50 real Newark businesses and events, spread across neighborhoods. Then write a script that generates a few weeks of fake check-ins and purchases so the heatmap and charts look alive. Tell the judges the activity data is simulated. Honesty plays well.

## Team roles (assuming four people)

- Person 1, Frontend and UI: the enchanted forest design system, the tabs, listing pages, accessibility.

- Person 2, Backend and Tiger Data: the database design, the time-series tables and summaries, the API routes, the seed script.

- Person 3, AI: the Gemini chatbot and auto-categorization, ElevenLabs voice, Azure sentiment analysis.

- Person 4, Maps, payments, and deployment: Azure Maps and the heatmap, the Solana flow, the domain, deploying to Azure, recording a backup demo video.

## 24-hour timeline


| Hours | Goal |
| --- | --- |
| 0–1 | Lock scope, register the domain, create every account and API key (Azure, |
|   | Gemini, ElevenLabs, Tiger Cloud, Phantom devnet wallet). Account setup is |
|   | where hackathons lose hours. |
| 1–3 | Database design done, Next.js app created, Google login working, seed data |
|   | going in. Agree on the color palette and component style. |
| 3–8 | Must-haves: map with business and event pins, the three tabs with filters, |
|   | listing pages, a basic business dashboard for posting events. |
| 8–12 | Gemini chatbot connected to real data, Azure heatmap from the summary |
|   | tables, simulated activity data generated. |
| 12–14 | Sleep in shifts. Don't skip this; tired teams ship bugs. |
| 14–18 | Should-haves: Solana pay-ahead with discount, Seed rewards, location |
|   | check-in, ElevenLabs voice, sentiment scores, translation. |
| 18–21 | Deploy to Azure, fix bugs, accessibility pass (contrast, keyboard navigation, |
|   | screen reader labels), dashboard charts. |
| 21–24 | Freeze features. Record a backup demo video, write the Devpost entry with |
|   | one section per sponsor track, rehearse the pitch three times. |

If Solana isn't working by hour 18, cut it and keep a mocked "Pay ahead" button. A working core beats a broken extra.

## Enchanted forest UI that stays readable

- Offer two themes: "Moonlit Forest" (dark) and "Daytime Glade" (light). Test every text and background pair for WCAG AA contrast (4.5:1 for body text). Dark green on darker green is the classic trap.

- Use decorative fonts only for headings. Something storybook-like works there, but body text should be a clean sans-serif at 16px or larger.

- Pair every forest name with a plain label. For example, "Gatherings · Events" or "Quests · Jobs." Theme names alone confuse new users and screen readers.

- Keep animation optional. Floating fireflies, glowing lantern map pins, and vines framing cards are great. Turn the animation off when the user's device has "reduce motion" enabled.

- Never use color alone to carry meaning. For example, heatmap legends need labels.


## Ideas to make it unmistakably Newark

- 1. Speak Newark's languages. Use Gemini for English, Spanish, and Portuguese, which reflects the Ironbound's Portuguese and Brazilian community. Judges will remember this.

- 2. Filter by ward. Newark has five wards (North, South, East, West, Central). It's an easy feature that shows you know the city.

- 3. Add owner-identity badges. Let businesses self-identify as Black-owned, Latino-owned, women-owned, or immigrant-owned so residents can choose who to support.

- 4. Build a "Lantern Board" of free community resources: food pantries, library programs, free clinics, NJIT and Rutgers-Newark public events. This makes it a community app, not just a shopping app.

- 5. Connect the Jobs tab to ADP. Businesses post part-time shifts and residents apply in one tap. Pitch it as "hire from your own block." That speaks directly to ADP's world.

- 6. Give owners Clover-style insights like "Your busiest hour is 6pm Fridays" or "Customers who visit you also love X." Gemini can write a weekly summary from the Tiger Data numbers.

- 7. Show a Neighborhood Pulse on the home screen with "trending this week" pulled from the time-series data.

## Three-minute pitch structure

- 1. The problem, 30 seconds. Newark has an incredible small-business scene that's hard to discover, and money spent at chains leaves the city.

- 2. Demo as a resident, 90 seconds. Open the map, ask the Forest Guide a question out loud and hear it answer, pay ahead with Solana, earn Seeds, watch the "dollars kept local" counter go up.

- 3. Demo as a business owner, 40 seconds. Post an event, show the foot-traffic chart and the AI weekly summary.

- 4. Architecture, 20 seconds. One slide showing how Tiger Data, Azure, Gemini, ElevenLabs, and Solana connect. The professors will want it.
