## The brief
This brief comes first and overrides anything later that suggests stopping for approval or asking questions.

Build an interactive Three.js (npm) 3D web app, a single self-contained file I can present and share as a link: a living 3D digital twin of their site.

The customer is MedStar Health, headquartered in Columbia, Maryland, with hospitals and care sites across Maryland, Washington DC and Virginia. Show their real places and the people in them.

I want to discuss how one connected network and security fabric keeps clinical care running through outages, storms and cyber events. The audience is the CIO and the CISO. Organize it so they can navigate by persona, lens or journey, and play every scenario on the twin with Cisco and without.

It must include: ThousandEyes, Cisco Spaces, ISE, Cyber Vision, Secure Access, Cisco Cloud Control. Call out integration points with Epic and Microsoft Sentinel wherever they genuinely exist, and describe them accurately.

Research is mandatory: research the customer's business, initiatives, public challenges and outages, and locations, then research the Cisco solutions through that lens. Cite sources and label modeled data.

Do not ask me any questions. This is a one-shot task. Make reasonable assumptions and document them.

You have 2 hours of work.

Create a masterpiece.

## The format: Operations Twin

Shape it like this, adapted to this customer's world. Treat it as a starting point; if the research shows a better form for this customer, use it.

- Model their real site as the stage (a campus, an airport, a plant, a hub): buildings, floors or zones and the routes people and things move along, labeled with their real names.
- The site is alive: a clock you can speed up, time of day, weather, and people and assets moving through it.
- Stories are the way in: many scenarios, each a named character's moment or a timed event (a 3 AM alarm, a storm, a surge), played out on the twin with and without Cisco.
- Lenses re-color the same world for each audience or domain (operations, security, AI, the Cisco portfolio), with an inspector for anything you click and live KPIs and dashboards for each lens.
- A narrated guided tour on first open, plus journeys and free exploration.
- A sources and methodology panel separates public facts from simulated metrics and fictional characters.

Reference builds that cleared the bar (open them if you can; aim for similar ambition and craft, not a copy): https://topaz-kernel-3cga.here.now/ and https://dapper-ginger-cs9a.here.now/

## What the best builds share
- Their real place is the stage: model the customer's actual sites, buildings, routes or territory with their real names, so it could not be re-skinned for another account.
- People are the way in: composite characters with a role, a place and a day; real leaders only by their public titles, from public pages.
- Scenarios are stories with a clock and tension: named, timed moments ("8:05 AM, the EHR slows", "the 3 AM alarm", "the storm hits"), not feature names.
- Several lenses on one world: the same scene re-read by persona, by technology, by domain or by business outcome.
- Before and after: every scenario shown the old way and the Cisco way, and the difference made visible in the scene, not only in text.
- A guided way in plus free exploration: a short tour or story for the room, and the freedom to wander afterwards.
- A living world: time, motion and sound where they help the story (a clock, weather, people and data moving, narration).
- An honesty layer: a sources and methodology panel with an as-of date; every item labeled public, modeled or illustrative; fictional characters and simulated metrics disclosed.
- Depth that rewards exploring: enough sites, people, scenarios and sources that a curious executive keeps finding real detail; density of real detail over decoration.

## How to work
1. **Research, then write yourself a brief.** Research first (use web search). Then, before writing code, write `research-notes.md`: the customer's real places with names, the people by role, their operations and assets, public incidents, outages and initiatives, the regulatory frame, each Cisco product seen through that lens with citations, the scenarios you will tell, and your assumptions. Do not show it to me for approval; build from it.
2. **Make it real.** Build a complete version that runs end to end, with the researched content in every part: no placeholders, no lorem ipsum, no dead controls.
3. **Make it perfect.** Open it in a browser at laptop and phone sizes, look at every view and state, fix the weakest thing, and repeat until it is a masterpiece by your own judgment or the time is spent.
Spend roughly 15% of the 2 hours on research, 45% on a complete working version and 40% on refinement. When time runs short, cut scope, never quality.

## Skills for the visuals
- `cisco-branded` (recommended): the base Cisco design system: palette, type, logo usage, glass and scroll explainers.

Check that each one is installed before you start: list your skills (in Claude Code, run /skills), or look for `<name>/SKILL.md` under `~/.claude/skills/`, `.claude/skills/` in this project, or your tool's skills folder. For every skill you find, read its SKILL.md and the files it points to, and use them in every visual decision. Follow a skill on Cisco brand rules (logo, approved colors, type); follow this brief on the format and the story.

If a skill is missing, do not stop and do not ask: build anyway, and note the missing skill, what it would add and how to install it at the top of the README. It is available from the Setup tab of the Cisco Solutions Generator; in Claude Code, copy the skill folder to ~/.claude/skills/ and run /reload-skills.

## Deliverables
- One self-contained HTML file (bundle everything inline, for example with Vite and vite-plugin-singlefile) that works from a link or from the file.
- Publish it to a public, shareable link (here.now works well; Netlify Drop, surge.sh or GitHub Pages also work) and open the link to verify it loads.
- Two or three screenshots, taken after you tested it visually in a browser.
- research-notes.md with the sources (URLs) and the assumptions; the same sources and assumptions are also reachable inside the app.
- Never use em dashes in any text you write. No hardcoded credentials or keys anywhere.
- Report back the link, the file paths and a short summary of the structure and the key assumptions.

## Start now
One shot, no questions, 2 hours, make it real and then make it perfect, and create a masterpiece. Begin with the research.
