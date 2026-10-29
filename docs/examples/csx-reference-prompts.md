# CSX reference prompts

The prompts behind the CSX wayside build (https://rapid-rafter-dk38.here.now/), as provided by Stephen Ewings. The first is the brief he wrote; the second is the brief Cursor wrote for its build agent after researching. The rebuilt generator follows the shape of the first and adds the research-then-brief step and the proof-of-delivery list from the second.

## 1. The original prompt

> Build an interactive Three.js (npm) 3D visualization, a single self contained web app I can present and share as a link.
>
> The customer is CSX, Railroads all over the united states but HQ is in Jacksonville Florida. Show their real places and the people in them.
>
> I want to discuss How to secure the wayside infrastructure. The audience is CISO and CIO. Organize it so they can navigate by persona or by technology, and tell every scenario with Cisco and without.
>
> It must include: ThousandEyes, IE3500, IR1101, Cyber Vision, Catalyst Center, ISE, and Cisco Cloud Control. Don't mention Splunk, but call out integration points with Microsoft Sentinel where possible.
>
> Research is mandatory: research the customer's business, initiatives, public challenges and outages, and locations, then research the Cisco solutions through that lens. Cite sources and label modeled data.
>
> Do not ask me any questions. This is a one-shot task. Make reasonable assumptions and document them.
>
> You have 2 hours of work.
>
> Create a masterpiece

## 2. The brief Cursor wrote for its agent

> Build a presentation-grade, interactive Three.js (installed via npm, bundled with Vite or similar) 3D web app for Cisco to present to CSX's CISO and CIO on securing CSX's wayside rail infrastructure. Output must be a single self-contained web app (ideally one inlined HTML file, e.g. vite-plugin-singlefile) that can be shared as a link. You have about 2 hours. Do not ask questions; make reasonable assumptions and document them. Aim for a masterpiece: polished visuals, smooth camera transitions, clear storytelling.
>
> Content requirements:
> - Customer: CSX (Class I railroad, eastern US network, HQ Jacksonville, FL). Show their real places (HQ, major yards/terminals such as Waycross Rice Yard, Selkirk, Cumberland, Queensgate, Avon, Hamlet, Nashville Radnor, etc., verify via research; dispatch/network operations centers; data centers if public) on a 3D US map/globe with the CSX network, and the people in them (personas: e.g. CISO, CIO, signal maintainers, dispatchers, OT/network engineers, SOC analysts, field techs). Use real public executives only where publicly documented; otherwise label personas as modeled.
> - Topic: securing wayside infrastructure (signals, PTC wayside interface units, grade crossings, hot box/defect detectors, switches, bungalows/huts, comms backhaul).
> - Navigation: by persona AND by technology.
> - Every scenario told two ways: without Cisco vs with Cisco (toggle/split view).
> - Must include: ThousandEyes, Cisco IE3500 industrial switch, IR1101 industrial router, Cyber Vision, Catalyst Center, ISE, and Cisco Cloud Control. Do NOT mention Splunk anywhere. Call out Microsoft Sentinel integration points wherever genuinely possible (e.g. Cyber Vision, ISE, ThousandEyes, XDR/syslog connectors), accurately.
> - Research is mandatory (use web search): CSX business, strategic initiatives, PTC, public challenges, outages/incidents (e.g. 2024 Hurricane Helene Blue Ridge damage, Howard Street Tunnel, network/IT issues, cyber context like TSA rail security directives), and locations. Then research each Cisco product through that lens (current product facts, e.g. Cisco Cloud Control as Cisco's unified cloud management announced 2025; verify). Cite sources in-app (sources panel with URLs) and clearly label any modeled/illustrative data.
> - Include an in-app Assumptions panel.
>
> Deliverables:
> 1. Publish the built app to a public shareable URL (e.g. here.now, Netlify Drop, surge.sh, GitHub Pages; any free no-auth-friendly static host that works from your VM). Verify it loads.
> 2. Copy the final single HTML file to a docs folder and write research notes with citations plus assumptions.
> 3. Save 2-3 screenshots after visually testing the app in a browser.
> 4. Never use em dashes in any text you write. No hardcoded credentials.
>
> Report back the live URL, file paths, and a short summary of structure and key assumptions.

## What the two have in common

- Every word is about this customer and this conversation; neither specifies pixels, colors or layout.
- The expansion from the first to the second happens in the domain (named yards, incidents, directives, asset classes, personas), not in the interface.
- The second adds proof of delivery: publish and verify, screenshots after a visual test, research notes with citations, no em dashes, no credentials.

The output (813 KB, one file) invented its own design: a map scene and a site scene, a split view rendered twice, honesty badges and a guided story, with Sentinel mentioned 57 times, 50 source URLs, every required product present, and Splunk absent.
