# Audio briefing script: Dominion Energy

Ten chapters, about 150 words per minute. Render one MP3 per chapter, then concatenate them.

## Prologue: One territory. Every critical function. (`overview`)

Dominion Energy powers three point six million customers across Virginia, North Carolina and South Carolina. It also feeds the Pentagon, and it serves the largest data center market in the world. Every function you see on this map, from nuclear stations to contact centers, emits machine data. This briefing is the story of turning that data into agentic operations, starting with the Splunk platform your teams already run.

## Act I: The demand shock in Data Center Alley (`demand`)

Start in Data Center Alley. More than fifty-three gigawatts of data center capacity is in contracting, and nine of the ten all-time peak days happened this year. Grid reliability is now effectively a hyperscaler service level. Splunk ITSI and the Cisco Time Series Model can turn historian, EMS and smart meter data into forecasts and early warnings, so operators see the ramp before it arrives.

## Act II: Building the East Coast's largest offshore wind farm (`wind`)

Offshore, the Coastal Virginia Offshore Wind project delivered first power in March and is eighty-one percent complete. Each quarter of delay costs about one hundred forty-four million dollars. The turbines, offshore substations and vendor remote access add up to a brand new operational technology estate, and it has to be observed and defended from the first day of operation.

## Act III: Carbon-free baseload for 80 years (`nuclear`)

North Anna is licensed into the twenty-fifties, and Dominion is preserving a path to a small modular reactor with Amazon. Nuclear cyber programs live on evidence: portable media controls, critical digital asset baselines, one-way data transfers and insider risk. The goal is evidence that is complete, continuous and ready for an inspector at any time.

## Act IV: A grid that is being "inhabited silently" (`threat`)

Now the threat. Dragos reports VOLTZITE, which overlaps with Volt Typhoon, at stage two of the industrial control system kill chain, and SYLVANITE inside a U.S. electric utility. Operational technology ransomware is up sixty-four percent, and the E-ISAC logged more than thirty-five hundred physical incidents. The red pulses on the map are attack paths. None of this implies an incident at Dominion. It is what your teams defend against.

## Act V: Splunk: the data fabric under everything (`fabric`)

Underneath everything sits the platform you already run: Splunk Core, Enterprise Security Premier and SOAR. Building on it, every SCADA historian, firewall, badge reader, turbine and IVR session lands in one Cisco Data Fabric powered by Splunk. Data that should stay where it is gets searched in place in S3, Snowflake and Azure, and Edge Processor filters it at the substation.

## Act VI: Cisco Cloud Control: agentic ops with humans in charge (`agentic`)

Above the fabric, Cisco Cloud Control gives people and agents one login, one data layer and one system of action. Agent Builder connects ServiceNow, PagerDuty, Microsoft and AWS through native connectors and MCP. App Builder turns plain language into apps. AI Defense governs every agent, and Splunk AI Agent Monitoring traces every step, with a human approving production changes.

## Act VII: Mission assurance for the nation's capital (`mission`)

Dominion owns the main electric system that feeds Joint Base Myer-Henderson Hall and the Pentagon, serves more than three hundred federal sites, and is exploring on-base generation with the Navy at Yorktown. Splunk Cloud is FedRAMP High and holds a DoD impact level five provisional authorization, so mission customers can see the resilience data they need in an authorized environment.

## Act VIII: CIP-015: re-architecting access to storage (`storage`)

This is where our teams are working together today. CIP-015 asks Dominion to monitor inside the electronic security perimeter, retain anomalous activity data until each evaluation closes, and protect it from tampering. We are reshaping how Splunk Cloud stores and reaches that data: hot detections in Splunk Cloud, full-fidelity data in Dominion-owned S3 searched in place, and evidence archived for audits.

## Epilogue: Two companies, one future, one fabric (`merger`)

Finally, the proposed NextEra combination would create the largest regulated electric utility business in the world. A federated data fabric lets both security operations centers see each other's risk on day one without migrating a byte, while governed agents help manage the integration workload. One territory, one fabric, and agents that work for your people.

Total: 612 words, about 4.1 minutes.

## Render

```bash
pip install edge-tts
mkdir -p audio
# one file per chapter id, text taken from the sections above
edge-tts --voice en-US-AndrewMultilingualNeural --file chapter-overview.txt --write-media audio/overview.mp3
# repeat for: overview, demand, wind, nuclear, threat, fabric, agentic, mission, storage, merger
printf "file %s\n" audio/overview.mp3 audio/demand.mp3 audio/wind.mp3 audio/nuclear.mp3 audio/threat.mp3 audio/fabric.mp3 audio/agentic.mp3 audio/mission.mp3 audio/storage.mp3 audio/merger.mp3 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy audio/briefing.mp3
```

Other options: Gemini TTS (`gemini-2.5-flash-preview-tts`, voice Charon) or ElevenLabs (multilingual v2). Then set `AUDIO_MODE = 'mp3'` in `app/src/main.js` and ship `audio/` beside the page.
