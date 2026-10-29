# CSX wayside briefing (Type A, Explorable Briefing)

```bash
npm install
npm run dev     # local dev server
npm run build   # writes ../dist/csx.html (single self-contained file)
```

- Edit copy and data in `src/data/content.js` (brand, sources, assumptions, places, personas, tech, scenarios, story, legend). Map geometry is in `src/data/geo.js`.
- Deep links: `#mode=without|with|split`, `#open=persona:ciso` / `tech:ise` / `scenario:rogue` / `place:hq`, `#view=map|wayside&focus=bungalow`, `#story=0..6`.
- Keys: Left and Right arrows step the story, Esc closes the modal, H collapses the panels.
- Open assumption to confirm with CSX: Microsoft Sentinel as the SOC SIEM (the 10-K cites a third-party managed SOC).
