// Narration for the narrated edition and off-camera talking points for the live edition.
// One entry per click, aligned with SCENES[i].notes in content.js (same counts).
// The narrator is an AI voice, says so, and tells Stephen's story in the third person.

export const NARRATION = {
  open: ['Welcome. I am an AI narrator, standing in for Stephen Ewings, a Solutions Engineer at Cisco. This briefing is for the CSX CISO and the executive who holds the CIO remit. Its idea is simple: every bungalow, a sensor, and every mile, assured. Watch the labels as we go. Public means sourced. Modeled means a composite. Illustrative means a story and numbers for discussion. You can step through with the arrow keys or the controls below.'],
  network: [
    'This is the CSX network. About 20,000 route miles across 26 states, DC, Ontario and Quebec, according to the 10-K. The corridor lines are schematic, drawn between real cities, so they are labeled modeled.',
    'Everything rolls up to Jacksonville: the headquarters on Water Street, the West JAX command center, and the CSX data center on Southpoint Parkway.',
    'The network is under pressure. Hurricane Helene destroyed about 60 miles of the Blue Ridge Subdivision, and the Howard Street Tunnel opened double-stack service in May 2026. New lanes raise the cost of every outage.',
    'And rail is being watched. TSA directives are in force, CISA published an advisory on a legacy rail radio protocol, and the CSX 10-K names cyber attack as a risk. The red points are wayside sites that no one can see today.',
  ],
  wayside: [
    'Now one site, up close. This control point is modeled near Waycross, Georgia: signals, a grade crossing, a hot box detector and a power switch.',
    'This is positive train control at the trackside: a wayside interface unit and a 220 megahertz radio. CSX reported more than 2,500 of these units as early as 2015.',
    'This is the bungalow, the equipment house where signal, crossing and detector electronics come together. Most of the scenarios start here.',
    'And this is the backhaul: fiber first, cellular second, back to Jacksonville. If this path goes quiet, trains slow down.',
  ],
  rogue: [
    'Scenario one, the unknown laptop. A contractor plugs a personal laptop into a spare port. Without Cisco, the port is live and flat, on the same network as the WIU. The laptop scans and reaches the PTC management interface, and it is found weeks later, if ever.',
    'With Cisco, the IE3500 port demands 802.1X, and ISE puts the laptop in a restricted group. Cyber Vision, inside the same switch, flags the new device and the scan. Both events land in Microsoft Sentinel, and XDR adds the incident summary.',
    'The port is quarantined, and the maintainer knows before he arrives. The numbers here are illustrative: weeks to minutes, and three truck rolls down to one.',
  ],
  backhaul: [
    'Scenario two, the quiet WIU. Status messages to the PTC back office turn intermittent. Without Cisco, the dispatcher opens a ticket and waits, the carrier says no problem found, and a truck rolls three hours out. The root cause takes a day.',
    'With Cisco, a ThousandEyes agent on the IR1101 shows the loss on the carrier hop, not the bungalow. The router moves WIU traffic to its second SIM and the 5G path automatically.',
    'Cloud Control shows the router, the path and the affected sites in one view, and a ThousandEyes webhook posts the alert to Sentinel for audit. Illustratively, hours become under five minutes, with no truck roll.',
  ],
  lateral: [
    'Scenario three, IT to OT. A compromised enterprise workstation probes toward the field. Without Cisco, routing is flat, the SOC sees endpoint alerts with no OT context, and the attack reaches bungalow management interfaces.',
    'With Cisco, ISE TrustSec allows only approved conduits between enterprise and OT zones. Cyber Vision spots the new IT to OT conversation and reports it to XDR.',
    'XDR exports the correlated incident into Microsoft Sentinel, and a playbook plus ISE quarantine contain the workstation. Illustratively, days become minutes.',
  ],
  trackside: [
    'Scenarios four and five, at the trackside. The detector vendor needs logs. Without Cisco, that means a shared VPN account and an always-on modem, with no recording, no time limit, and the whole subnet in reach.',
    'With Cisco, Secure Equipment Access grants a time-boxed session to that one detector, through the IE3500. Access events go to Sentinel, and the CISO gets an auditable record.',
    'Next, a crossing controller starts reporting intermittently. Without Cisco, it shows up only when the public calls in a gate problem, and the maintainer drives out without a diagnosis.',
    'With Cisco, Cyber Vision flags the change in the controller, and ThousandEyes rules the backhaul in or out. One trip, with the right part.',
  ],
  fleet: [
    'Scenario six, the fleet. A critical security advisory lands for switches across hundreds of bungalows, and some have drifted from the golden config. Without Cisco, it is spreadsheets and SSH sessions, and patching takes months.',
    'With Cisco, Catalyst Center compliance shows every IE3500 out of policy: image, advisory, and running versus startup config. Cyber Vision lists the vulnerable assets behind each switch.',
    'Updates are staged per maintenance window with approvals, and an evidence report goes to the CISO and auditors. Illustratively, months become the same day.',
  ],
  helene: [
    'Scenario seven, the Blue Ridge. In September 2024, Hurricane Helene destroyed about 60 miles of this line. CSX rebuilt it in about a year and reopened it on September 25, 2025. The story that follows illustrates future rebuilds, not what CSX deployed.',
    'Without Cisco, each new bungalow is hand configured by a specialist on site, sites wait for fiber, and there is no proof of performance before service.',
    'With Cisco, the IR1101 comes up on 5G and calls home, Catalyst Center Plug and Play pushes the template, and ThousandEyes proves the path to the PTC back office before the site goes live.',
  ],
  tsa: [
    'Scenario eight, the board. The TSA directives require a coordinator, incident reporting, response plans, assessments, and mitigation testing. Without Cisco, asset lists are built by hand, segmentation is hard to prove, and the board sees slides.',
    'With Cisco, Cyber Vision Global Center keeps a live OT inventory and vulnerability posture across all sites, and ISE and TrustSec show the zones that are actually enforced.',
    'Cloud Control gives one inventory and topology for executive review, and Sentinel workbooks track incidents for the TSA and CISA timelines. Quarterly becomes continuous.',
  ],
  people: [
    'Seven people live this story. Two executives, shown by public role, and five modeled composites who are not real CSX employees. The words in quotes are illustrative priorities, not quotes.',
    'The CISO, shown by role. Every asset in the field, proof for TSA, and OT signals in the SOC without a new silo.',
    'Steve Watkins, Chief Digital and Technology Officer, with the CIO remit. Keep the railroad running and make network spend count toward reliability.',
    'Dana, a modeled dispatcher in Jacksonville, who needs to know fast why a WIU dropped off PTC.',
    'Marcus, a modeled signal maintainer near Waycross, who wants one truck roll with the right part.',
    'Priya, a modeled OT network engineer, who wants automation with guardrails across thousands of sites.',
    'Jordan, a modeled analyst at the managed SOC partner, whose OT alerts arrive with no context, if at all.',
    'And Luis, a modeled technician from the Blue Ridge rebuild crew, who wants every box to configure itself and prove it works.',
  ],
  adds: [
    'What does it add up to? It starts in the bungalow. The IE3500 switch and IR1101 router both host the Cyber Vision sensor, and ThousandEyes runs on the router.',
    'ISE, Cyber Vision, XDR and ThousandEyes each have a documented path into Microsoft Sentinel, along with plain device syslog.',
    'Two links are patterns to validate, not documented connectors: Catalyst Center notifications and Cloud Control Studio. And Sentinel itself is assumed, not publicly confirmed as the CSX SIEM.',
  ],
  sources: [
    'Every public fact here is cited, from 46 sources: CSX filings and CSX.com, rail and PTC records, TSA, CISA and the Federal Register, and Cisco and Microsoft documentation.',
    'And the assumptions are stated plainly. Sentinel is assumed, the KPIs are illustrative, the personas are composites, the site is representative, and no scenario describes a real CSX incident.',
  ],
  close: [
    'To close: the switch and router every bungalow already needs can be the sensor the SOC is missing. Visibility in the field, context in Sentinel, and proof for the board.',
    'Stephen\'s ask is to validate the Sentinel paths together, one territory at a time. Thank you for watching.',
  ],
};

export const POINTS = {
  open: [['Stephen Ewings, Solutions Engineer, Cisco', 'Every bungalow a sensor, every mile assured', 'Public, modeled, illustrative']],
  network: [
    ['About 20,000 route miles, 26 states', 'Corridors are schematic (modeled)'],
    ['Jacksonville: HQ, West JAX, data center'],
    ['Helene: about 60 miles destroyed', 'Howard Street double-stack, May 4, 2026'],
    ['TSA directives, CISA advisory', '10-K names cyber attack risk'],
  ],
  wayside: [
    ['Modeled site near Waycross, GA', 'Signals, crossing, detector, switch'],
    ['PTC WIU plus 220 MHz radio', '2,500+ WIUs reported in 2015'],
    ['The bungalow ties it together'],
    ['Fiber first, cellular second', 'Quiet path means slow trains'],
  ],
  rogue: [
    ['Without: flat port, invisible laptop', 'Found in weeks, if ever'],
    ['With: 802.1X, ISE restricts', 'Cyber Vision flags; Sentinel plus XDR'],
    ['Weeks to minutes (illustrative)', 'Three trips to one'],
  ],
  backhaul: [
    ['Without: ticket, carrier says no fault', 'Three hour truck roll'],
    ['With: ThousandEyes sees carrier hop', 'IR1101 fails over to 5G'],
    ['Cloud Control one view', 'Webhook to Sentinel; under five minutes'],
  ],
  lateral: [
    ['Without: flat IT to OT routing', 'SOC has no OT context'],
    ['With: TrustSec approved conduits only', 'Cyber Vision to XDR'],
    ['XDR incident into Sentinel', 'Playbook plus ISE quarantine'],
  ],
  trackside: [
    ['Vendor without: shared VPN, modem always on'],
    ['Vendor with: time-boxed SEA session', 'Auditable record for TSA'],
    ['Crossing without: public calls it in'],
    ['Crossing with: Cyber Vision baseline', 'ThousandEyes rules out backhaul'],
  ],
  fleet: [
    ['Without: spreadsheets and SSH', 'Patching takes months'],
    ['With: Catalyst Center compliance', 'Image, PSIRT, config drift'],
    ['Staged per window, approved', 'Evidence for auditors; same day'],
  ],
  helene: [
    ['Helene: about 60 miles, $450M reported', 'Reopened Sep 25, 2025'],
    ['Without: specialist per site', 'Waiting on fiber'],
    ['With: 5G first, Plug and Play', 'ThousandEyes proves the path'],
  ],
  tsa: [
    ['Two TSA directives in force', 'Without: hand-built lists, slides'],
    ['With: Global Center live inventory', 'TrustSec zones enforced'],
    ['Cloud Control one topology', 'Sentinel workbooks; continuous'],
  ],
  people: [
    ['Two public roles, five composites', 'Quotes are illustrative'],
    ['CISO: assets, TSA, OT in the SOC'],
    ['Steve Watkins: reliability, simplicity'],
    ['Dana: why did the WIU drop?'],
    ['Marcus: one roll, right part'],
    ['Priya: automation with guardrails'],
    ['Jordan: OT context in Sentinel'],
    ['Luis: self-configuring boxes'],
  ],
  adds: [
    ['IE3500 plus IR1101 are the sensors', 'No appliance per site'],
    ['Five documented Sentinel paths'],
    ['Two patterns to validate', 'Sentinel is assumed'],
  ],
  sources: [
    ['46 public sources', 'Full list in the talk track'],
    ['13 assumptions, stated plainly'],
  ],
  close: [
    ['The network is the sensor'],
    ['Ask: validate Sentinel paths together', 'Thank you'],
  ],
};

// Premium voices are pre-rendered with tools/gen_audio.py (edge-tts neural voices).
// `look` drives the animated narrator in js/avatar.js. styles: long, short, bob, side.
export const VOICES = [
  { key: 'ava', voice: 'en-US-AvaMultilingualNeural', name: 'Ava', look: { skin: '#c98d6b', hair: '#2a1a12', style: 'long', shirt: '#00bceb', blazer: '#0d274d' } },
  { key: 'andrew', voice: 'en-US-AndrewMultilingualNeural', name: 'Andrew', look: { skin: '#8d5a3c', hair: '#120c08', style: 'short', beard: true, shirt: '#6cc04a', blazer: '#07182d' } },
  { key: 'emma', voice: 'en-US-EmmaMultilingualNeural', name: 'Emma', look: { skin: '#f1c7a5', hair: '#8a5a2b', style: 'bob', shirt: '#fbab18', blazer: '#0d274d' } },
  { key: 'brian', voice: 'en-US-BrianMultilingualNeural', name: 'Brian', look: { skin: '#e0ad8a', hair: '#3b2a1f', style: 'side', shirt: '#9be7ff', blazer: '#1a2433' } },
];
