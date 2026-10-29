// Content for the CSX wayside briefing. Facts are from public sources (see SOURCES).
// Personas, the wayside site, KPIs and scenario narratives are MODELED or ILLUSTRATIVE.

export const BRAND = {
  title: 'Cisco for CSX',
  subtitle: 'Securing the wayside',
  docTitle: 'Securing CSX Wayside Infrastructure | Cisco',
  kicker: 'Executive briefing for the CSX CISO and CIO',
  headline: ['Every bungalow, a sensor.', 'Every mile, assured.'],
  intro: "An interactive 3D walk through CSX's eastern US network and a representative wayside control point: signals, PTC, crossings, detectors, switches and backhaul. Every scenario is told two ways, without Cisco and with Cisco, and shows where Microsoft Sentinel receives the context.",
  note: 'Public facts are cited in the Sources panel. Personas, site layout and KPIs are modeled and labeled as such. See Assumptions.',
  siem: 'Microsoft Sentinel',
  researched: 'October 2026',
};

export const SOURCES = {
  "csx10k": {
    "title": "CSX Corporation Form 10-K for FY2025 (filed Feb 12, 2026)",
    "url": "https://www.sec.gov/Archives/edgar/data/277948/000027794826000006/csx-20251231.htm",
    "group": "CSX"
  },
  "csxAR": {
    "title": "CSX 2025 Annual Report",
    "url": "https://www.sec.gov/Archives/edgar/data/277948/000162828026021995/csx2025annualreport.pdf",
    "group": "CSX"
  },
  "csxARnews": {
    "title": "CSX releases 2025 Annual Report (CSX.com)",
    "url": "https://www.csx.com/index.cfm/about-us/csx-releases-2025-annual-report-touting-major-infrastructure-rebuilds-and-safety-gains/",
    "group": "CSX"
  },
  "csxMgmt": {
    "title": "CSX Management Team (CSX.com)",
    "url": "https://www.csx.com/index.cfm/about-us/company-overview/csx-leadership/management-team/",
    "group": "CSX"
  },
  "csxProxy": {
    "title": "CSX 2026 Proxy Statement",
    "url": "https://s2.q4cdn.com/859568992/files/doc_financials/2026/ar/CSX-2026-Proxy-Statement.pdf",
    "group": "CSX"
  },
  "csxMerger": {
    "title": "CSX position on proposed UP-NS transaction (csxstayingontrack.com)",
    "url": "https://csxstayingontrack.com/",
    "group": "CSX"
  },
  "csxBlueRidge": {
    "title": "CSX Celebrates Reopening of Blue Ridge Subdivision (Oct 2, 2025)",
    "url": "https://www.csx.com/index.cfm/about-us/media/press-releases/csx-celebrates-reopening-of-blue-ridge-subdivision/",
    "group": "CSX"
  },
  "csxBlueRidgeProj": {
    "title": "Blue Ridge Subdivision Recovery project page (CSX.com)",
    "url": "https://www.csx.com/index.cfm/about-us/projects-and-partnerships/blue-ridge-subdivision-recovery/",
    "group": "CSX"
  },
  "railfanBR": {
    "title": "CSX Blue Ridge Subdivision Reopens (Railfan & Railroad)",
    "url": "https://railfan.com/csx-blue-ridge-subdivision-reopens/",
    "group": "CSX"
  },
  "hstReopen": {
    "title": "CSX Reopens Expanded Howard Street Tunnel Ahead of Schedule (Sep 26, 2025)",
    "url": "https://investors.csx.com/news-and-events/news/news-details/2025/CSX-Reopens-Expanded-Howard-Street-Tunnel-Ahead-of-Schedule-Strengthening-East-Coast-Freight-Growth/default.aspx",
    "group": "CSX"
  },
  "hstTrains": {
    "title": "First CSX double-stack train operates through Howard Street Tunnel (Trains)",
    "url": "https://www.trains.com/pro/freight/intermodal/first-csx-double-stack-train-operates-through-howard-street-tunnel/",
    "group": "CSX"
  },
  "hstMD": {
    "title": "Governor Moore leads ribbon-cutting of double-stack rail operations (Jun 22, 2026)",
    "url": "https://governor.maryland.gov/news/press-releases/governor-moore-leads-ribbon-cutting-double-stack-rail-operations-port-baltimore",
    "group": "CSX"
  },
  "csxNOC": {
    "title": "CSXT West JAX Command Center listing, 3019 Warrington St (MapQuest)",
    "url": "https://www.mapquest.com/us/florida/csxt-west-jax-command-center-445212592",
    "group": "CSX"
  },
  "csxDC": {
    "title": "CSX Data Center Colocation Services (CSX.com)",
    "url": "https://www.csx.com/index.cfm/about-us/company-overview/colocation-services/",
    "group": "CSX"
  },
  "colomap": {
    "title": "CSX Data Center, 6425 Southpoint Pkwy (ColoMap)",
    "url": "https://colomap.com/facilities/csx-data-center/",
    "group": "CSX"
  },
  "humpYards": {
    "title": "North America's hump yards (Trains)",
    "url": "https://www.trains.com/trn/train-basics/abcs-of-railroading/north-americas-hump-yards/",
    "group": "CSX"
  },
  "humpRemoval": {
    "title": "CSX removing humps at three yards, adding switching ladders (Trains)",
    "url": "https://www.trains.com/pro/maintenance-of-way/csx-removing-humps-at-three-yards-adding-new-switching-ladders-to-improve-operations/",
    "group": "CSX"
  },
  "csxPTC2015": {
    "title": "CSX PTC status letter, 2,500+ WIUs and 465 base stations (SEC exhibit, 2015)",
    "url": "https://www.sec.gov/Archives/edgar/data/277948/000119312515318553/d94247dex991.htm",
    "group": "Rail and PTC"
  },
  "csxPTCSenate": {
    "title": "CSX statement on PTC, Senate Commerce Committee",
    "url": "https://www.commerce.senate.gov/wp-content/uploads/meetings/F7F97386-494F-4A18-A6C1-AE0C39EA97DD/260115%20CSX%20Statement%20on%20PTC.PDF",
    "group": "Rail and PTC"
  },
  "csxWIU": {
    "title": "CSXT GE ElectroBlox WIU Product Safety Plan (FRA docket)",
    "url": "https://downloads.regulations.gov/FRA-2010-0028-0183/attachment_1.pdf",
    "group": "Rail and PTC"
  },
  "itcnet": {
    "title": "Meteorcomm ITCnet and ITCR 220 MHz PTC radios",
    "url": "https://meteorcomm.com/digital-network-solutions/itcnet-products/",
    "group": "Rail and PTC"
  },
  "tsaSD": {
    "title": "TSA SD 1580-21-01E Enhancing Rail Cybersecurity (effective Jan 16, 2026)",
    "url": "https://www.tsa.gov/sites/default/files/signed_security-directive-1580-21-01e-and-transmittal-memo_508c.pdf",
    "group": "Regulatory and threat"
  },
  "tsaSD2": {
    "title": "TSA SD 1580/82-2022-01E Rail Cybersecurity Mitigation Actions and Testing",
    "url": "https://www.tsa.gov/sites/default/files/signed_security_directive_1580_82-2022-01e_and_transmittal_memo_508c.pdf",
    "group": "Regulatory and threat"
  },
  "tsaNPRM": {
    "title": "TSA NPRM: Enhancing Surface Cyber Risk Management (Federal Register)",
    "url": "https://www.federalregister.gov/documents/2024/11/07/2024-24704/enhancing-surface-cyber-risk-management",
    "group": "Regulatory and threat"
  },
  "cisaEOT": {
    "title": "CISA ICSA-25-191-10 End-of-Train and Head-of-Train Remote Linking Protocol",
    "url": "https://www.cisa.gov/news-events/ics-advisories/icsa-25-191-10",
    "group": "Regulatory and threat"
  },
  "freightwaves": {
    "title": "Global tech outage largely bypasses freight railroads (FreightWaves, Jul 2024)",
    "url": "https://www.freightwaves.com/news/global-tech-outage-largely-bypasses-freight-and-passenger-railroads",
    "group": "Regulatory and threat"
  },
  "ccNews": {
    "title": "Cisco Powers Secure Infrastructure for the AI Era (Cisco Live, Jun 10, 2025)",
    "url": "https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2025/m06/cisco-powers-secure-infrastructure-for-the-ai-era.html",
    "group": "Cisco"
  },
  "ccGA": {
    "title": "Cisco Cloud Control is now generally available for U.S. customers (Cisco Blogs)",
    "url": "https://blogs.cisco.com/ai/cisco-cloud-control-us-general-availability",
    "group": "Cisco"
  },
  "ccRN": {
    "title": "Cisco Cloud Control Release Notes",
    "url": "https://www.cisco.com/c/en/us/td/docs/ai/cisco-cloud-control/release-notes/cisco-cloud-control-release-notes.html",
    "group": "Cisco"
  },
  "ccSite": {
    "title": "Cisco Cloud Control product page",
    "url": "https://www.cisco.com/site/us/en/solutions/artificial-intelligence/agentic-ops/cisco-cloud-control/index.html",
    "group": "Cisco"
  },
  "ie3500": {
    "title": "Cisco IE3500 Rugged Series Data Sheet",
    "url": "https://www.cisco.com/c/en/us/products/collateral/networking/industrial-switches/ie3500-rugged-series/ie3500-rugged-series-ds.html",
    "group": "Cisco"
  },
  "ir1101": {
    "title": "Cisco Catalyst IR1101 Rugged Series Router Data Sheet",
    "url": "https://www.cisco.com/c/en/us/products/collateral/routers/1101-industrial-integrated-services-router/datasheet-c78-741709.html",
    "group": "Cisco"
  },
  "irRN": {
    "title": "Release Notes, Catalyst IR1101/IR1800/IR8140/IR8340, IOS XE 17.18.x",
    "url": "https://www.cisco.com/c/en/us/td/docs/routers/IIoT/release-notes/17-18-x/IOT-IR-17-18-1-RN.html",
    "group": "Cisco"
  },
  "teIR": {
    "title": "ThousandEyes Enterprise Agents on Cisco Industrial Routers",
    "url": "https://docs.thousandeyes.com/product-documentation/global-vantage-points/enterprise-agents/installing/cisco-devices/industrial-routers",
    "group": "Cisco"
  },
  "teWebhooks": {
    "title": "ThousandEyes Custom Webhooks documentation",
    "url": "https://docs.thousandeyes.com/product-documentation/integration-guides/custom-webhooks",
    "group": "Cisco"
  },
  "cvDS": {
    "title": "Cisco Cyber Vision Data Sheet",
    "url": "https://www.cisco.com/c/en/us/products/collateral/security/cyber-vision/cyber-vision-ds.html",
    "group": "Cisco"
  },
  "cvSyslog": {
    "title": "Cisco Cyber Vision syslog configuration (CEF, TCP+TLS), Admin Guide 5.6",
    "url": "https://www.cisco.com/c/en/us/td/docs/security/cyber_vision/Release-5-6-x/Admin-Guide/cisco-cyber-vision-classic-ui-administration-guide-release-5-6-0/maintain-and-monitor-cisco-cyber-vision-5-6/c-syslog-configurations.html",
    "group": "Cisco"
  },
  "cvISE": {
    "title": "Integrate Cisco Cyber Vision with Cisco ISE through pxGrid",
    "url": "https://www.cisco.com/c/en/us/td/docs/security/cyber_vision/Release-5-4-0/Integrate-Cisco-Cyber-Vision-with-Cisco-Identity-Services-Engine--ISE--through-pxGrid/b_Integrate_Cisco_Cyber_Vision_with_Cisco_ISE_through_pxGrid/m_Introduction.html",
    "group": "Cisco"
  },
  "cvRN": {
    "title": "Cisco Cyber Vision 5.0.2 Release Notes (supported sensor platforms incl. IR1101)",
    "url": "https://www.cisco.com/c/dam/en/us/td/docs/security/cyber_vision/Cisco-Cyber-Vision_Release-Notes-5-0-2.pdf",
    "group": "Cisco"
  },
  "ccIA": {
    "title": "Cisco Catalyst Center for Industrial Automation (solution brief)",
    "url": "https://www.cisco.com/c/dam/en/us/td/docs/solutions/Verticals/Industrial_Automation/IA_Horizontal/IA_Networking/Update-Cisco-Catalyst-Center-for-IA/Cisco_Catalyst_Center_for_IA_SB.pdf",
    "group": "Cisco"
  },
  "ccCompliance": {
    "title": "Catalyst Center User Guide 2.3.7: Compliance Audit for Network Devices",
    "url": "https://www.cisco.com/c/en/us/td/docs/cloud-systems-management/network-automation-and-management/catalyst-center/2-3-7/user_guide/b_cisco_catalyst_center_user_guide_237/m-compliance-audit-for-network-devices.html",
    "group": "Cisco"
  },
  "xdrSentinel": {
    "title": "Cisco XDR Connect: Microsoft Sentinel integration",
    "url": "https://connect.xdr.security.cisco.com/integration/microsoft-sentinel",
    "group": "Microsoft Sentinel"
  },
  "ciscoSentinel": {
    "title": "Cisco Security and Microsoft Sentinel (Cisco)",
    "url": "https://www.cisco.com/site/us/en/products/security/technical-alliance-partners/microsoft-sentinel.html",
    "group": "Microsoft Sentinel"
  },
  "iseSentinel": {
    "title": "Cisco ISE solution for Microsoft Sentinel (Azure Marketplace)",
    "url": "https://azuremarketplace.microsoft.com/en-us/marketplace/apps/azuresentinel.azure-sentinel-solution-ciscoise?tab=overview",
    "group": "Microsoft Sentinel"
  },
  "amaCEF": {
    "title": "Ingest syslog and CEF messages to Microsoft Sentinel with AMA (Microsoft Learn)",
    "url": "https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama",
    "group": "Microsoft Sentinel"
  },
  "amaDevices": {
    "title": "Syslog via AMA connector: device list incl. Cisco ISE (Microsoft Learn)",
    "url": "https://learn.microsoft.com/en-us/azure/sentinel/unified-connector-syslog-device",
    "group": "Microsoft Sentinel"
  }
};

export const ASSUMPTIONS = [
  "Audience: CSX CISO and the CSX executive who holds the CIO remit. CSX.com lists Steve Watkins as Chief Digital and Technology Officer (from May 2026); we treat that role as the \"CIO\" audience.",
  "The CISO is shown by role only. The FY2025 10-K describes the CISO as \"Assistant Vice President of Cloud Infrastructure Platforms and CISO\". We do not name an individual because public sources conflict.",
  "All non-executive personas (dispatcher, signal maintainer, OT engineer, SOC analyst, field technician) are modeled composites, not real CSX employees.",
  "Network lines on the map are schematic corridors drawn between real city coordinates. They are not survey-accurate and omit many subdivisions.",
  "The 26 highlighted states follow the 10-K statement of 26 states plus DC; the specific state list is our reconstruction (including New England states from the 2022 Pan Am acquisition).",
  "The wayside site is a representative, modeled control point (signals, PTC WIU, crossing, hot box detector, switch, bungalow, backhaul). It does not depict any specific CSX location or CSX equipment inventory.",
  "We assume CSX operates a Microsoft Sentinel SIEM for SOC analytics. This is not publicly confirmed. The 10-K states CSX uses a third-party managed SOC service.",
  "Sentinel integration paths are shown only where documented: ISE (Microsoft Sentinel solution, Syslog via AMA), Cyber Vision (CEF syslog to the CEF via AMA connector), Cisco XDR (native Sentinel export workflows), ThousandEyes (custom webhooks to a customer-built ingestion endpoint), and IOS XE devices (standard syslog). Catalyst Center and Cloud Control flows are shown as integration patterns to validate.",
  "Cisco Cloud Control: previewed at Cisco Live June 2025 and generally available for U.S. customers on August 25, 2026, per Cisco release notes. Capabilities depend on connected products and subscriptions.",
  "ThousandEyes Enterprise Agent on IR1101 requires IOS XE 17.18.1 or later (application hosting). We assume IR1101 units are on a supported release.",
  "All KPIs and timelines shown under \"without Cisco\" and \"with Cisco\" are illustrative, modeled values for discussion. They are not measured CSX data or Cisco performance guarantees.",
  "Threat scenarios are plausible composites informed by public advisories (for example CISA ICSA-25-191-10) and TSA directives. No scenario describes a real CSX incident.",
  "The app is intended for a presentation context; it avoids any CSX sensitive security information and uses only public sources."
];

export const PLACES = [
  {
    "id": "hq",
    "name": "CSX Headquarters",
    "sub": "500 Water Street, Jacksonville, FL",
    "ll": [
      -81.664,
      30.322
    ],
    "kind": "hq",
    "modeled": false,
    "src": [
      "csx10k"
    ],
    "body": "Corporate headquarters of CSX, a Class I railroad with about 20,000 route miles across 26 states, DC, Ontario and Quebec. 2025 revenue was $14.1B with about 23,000 employees.",
    "personas": [
      "ciso",
      "cio"
    ]
  },
  {
    "id": "noc",
    "name": "Network Operations Center",
    "sub": "3019 Warrington St, Jacksonville, FL (West JAX Command Center listing)",
    "ll": [
      -81.735,
      30.338
    ],
    "kind": "ops",
    "modeled": false,
    "src": [
      "csxNOC"
    ],
    "body": "Public listings identify a CSXT command center at 3019 Warrington St. Dispatchers and network operations staff depend on signal, PTC and backhaul health every minute of every shift.",
    "personas": [
      "dispatcher",
      "soc"
    ]
  },
  {
    "id": "dc",
    "name": "CSX Data Center",
    "sub": "6425 Southpoint Pkwy, Jacksonville, FL",
    "ll": [
      -81.56,
      30.24
    ],
    "kind": "dc",
    "modeled": false,
    "src": [
      "csxDC",
      "colomap"
    ],
    "body": "Purpose-built data center that houses CSX critical rail network data (also offered as ColoCSX colocation). Natural home for on-prem Cyber Vision Center, ISE and Catalyst Center nodes.",
    "personas": [
      "oteng"
    ]
  },
  {
    "id": "waycross",
    "name": "Rice Yard",
    "sub": "Waycross, GA (hump yard)",
    "ll": [
      -82.37,
      31.215
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpYards"
    ],
    "body": "One of CSX's active hump classification yards and a hub for southeastern merchandise traffic. Surrounding subdivisions are dense with signals, crossings and detectors.",
    "personas": [
      "maintainer"
    ]
  },
  {
    "id": "selkirk",
    "name": "Selkirk Yard",
    "sub": "Selkirk, NY (hump yard)",
    "ll": [
      -73.83,
      42.54
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpYards"
    ],
    "body": "Northeast gateway hump yard serving New York, New England and the Water Level Route.",
    "personas": [
      "maintainer"
    ]
  },
  {
    "id": "avon",
    "name": "Avon Yard",
    "sub": "Avon, IN (hump yard)",
    "ll": [
      -86.39,
      39.76
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpYards"
    ],
    "body": "Hump yard west of Indianapolis connecting Chicago, St. Louis and the East.",
    "personas": []
  },
  {
    "id": "queensgate",
    "name": "Queensgate Yard",
    "sub": "Cincinnati, OH (hump yard)",
    "ll": [
      -84.54,
      39.11
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpYards"
    ],
    "body": "Hump yard at the Ohio River crossroads of north-south and east-west CSX corridors.",
    "personas": []
  },
  {
    "id": "radnor",
    "name": "Radnor Yard",
    "sub": "Nashville, TN (hump yard)",
    "ll": [
      -86.76,
      36.08
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpYards"
    ],
    "body": "Hump yard in Nashville. CSX and CN strengthened Canada to Nashville service in 2025.",
    "personas": []
  },
  {
    "id": "cumberland",
    "name": "Cumberland Yard",
    "sub": "Cumberland, MD (flat switching)",
    "ll": [
      -78.77,
      39.64
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpRemoval"
    ],
    "body": "Former hump yard converted to flat switching with a new classification ladder. Gateway between the Mid-Atlantic and the Midwest.",
    "personas": []
  },
  {
    "id": "hamlet",
    "name": "Hamlet Yard",
    "sub": "Hamlet, NC (flat switching)",
    "ll": [
      -79.7,
      34.89
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpRemoval"
    ],
    "body": "Carolinas hub. Hump decommissioned in 2017 under the precision scheduled railroading model; now flat switching.",
    "personas": []
  },
  {
    "id": "willard",
    "name": "Willard Yard",
    "sub": "Willard, OH (flat switching)",
    "ll": [
      -82.73,
      41.05
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "humpRemoval"
    ],
    "body": "Northern Ohio yard on the Chicago to East Coast mainline; hump decommissioned in 2017.",
    "personas": []
  },
  {
    "id": "hst",
    "name": "Howard Street Tunnel",
    "sub": "Baltimore, MD",
    "ll": [
      -76.62,
      39.3
    ],
    "kind": "project",
    "modeled": false,
    "src": [
      "hstReopen",
      "hstTrains",
      "hstMD"
    ],
    "body": "The 1.7-mile 1890s tunnel was closed Feb 1, 2025, reopened Sep 26, 2025, and carried its first revenue double-stack train on May 4, 2026. The State of Maryland reported final project cost of $495M. New intermodal lanes raise the cost of any corridor outage.",
    "personas": [
      "fieldtech"
    ]
  },
  {
    "id": "blueridge",
    "name": "Blue Ridge Subdivision",
    "sub": "Nolichucky Gorge, NC and TN",
    "ll": [
      -82.37,
      36.07
    ],
    "kind": "event",
    "modeled": false,
    "src": [
      "csxBlueRidge",
      "csxBlueRidgeProj",
      "railfanBR"
    ],
    "body": "Hurricane Helene (Sep 2024) destroyed about 60 miles of this line that carries over 14 million tons a year. CSX rebuilt it in about a year (reported $450M) and reopened it on Sep 25, 2025. Every rebuilt mile needed new signals, crossings and communications.",
    "personas": [
      "fieldtech"
    ]
  },
  {
    "id": "nwoh",
    "name": "Northwest Ohio Intermodal Terminal",
    "sub": "North Baltimore, OH",
    "ll": [
      -83.68,
      41.18
    ],
    "kind": "yard",
    "modeled": false,
    "src": [
      "csx10k"
    ],
    "body": "Central intermodal hub. Intermodal was CSX's main volume growth driver in 2025 (about 3.0M units).",
    "personas": []
  },
  {
    "id": "wayside",
    "name": "Representative wayside control point",
    "sub": "Modeled site near Waycross, GA",
    "ll": [
      -82.75,
      30.85
    ],
    "kind": "wayside",
    "modeled": true,
    "src": [],
    "body": "A modeled control point used for the 3D deep dive: signals, PTC wayside interface unit and 220 MHz radio, grade crossing, hot box detector, power switch, bungalow, and fiber plus cellular backhaul.",
    "personas": [
      "maintainer",
      "oteng"
    ]
  }
];

export const PERSONAS = [
  {
    "id": "ciso",
    "name": "Chief Information Security Officer",
    "role": "CSX CISO (role per FY2025 10-K)",
    "place": "hq",
    "public": true,
    "src": [
      "csx10k"
    ],
    "color": "#38bdf8",
    "cares": [
      "TSA SD 1580-21-01E and 1580/82-2022-01E obligations",
      "Visibility to the lowest Purdue levels in bungalows",
      "Managed SOC effectiveness and Microsoft Sentinel correlation",
      "Third-party and vendor remote access risk"
    ],
    "scenarios": [
      "tsa",
      "rogue",
      "lateral",
      "vendor"
    ],
    "priority": "Show me every asset in the field, prove TSA compliance, and get OT signals into my SOC without a new silo."
  },
  {
    "id": "cio",
    "name": "Steve Watkins",
    "role": "Chief Digital and Technology Officer (public, CIO remit)",
    "place": "hq",
    "public": true,
    "src": [
      "csxMgmt"
    ],
    "color": "#a78bfa",
    "cares": [
      "Service reliability for new intermodal lanes (Howard Street, BNSF and CPKC partnerships)",
      "Resilience after events like Hurricane Helene",
      "One operational view instead of many consoles",
      "Cost discipline and fewer truck rolls"
    ],
    "scenarios": [
      "backhaul",
      "helene",
      "tsa",
      "config"
    ],
    "priority": "Keep the railroad running, simplify operations, and make every dollar of network spend count toward reliability."
  },
  {
    "id": "dispatcher",
    "name": "Dana, Train Dispatcher",
    "role": "Network Operations Center, Jacksonville (modeled persona)",
    "place": "noc",
    "public": false,
    "src": [],
    "color": "#f59e0b",
    "cares": [
      "PTC wayside status messages arriving on time",
      "Fewer false signal failures",
      "Clear ETAs from field teams"
    ],
    "scenarios": [
      "backhaul",
      "crossing"
    ],
    "priority": "When a WIU drops off PTC, I get a restricted-speed train and a delay. I need to know why, fast."
  },
  {
    "id": "maintainer",
    "name": "Marcus, Signal Maintainer",
    "role": "C&S territory near Waycross, GA (modeled persona)",
    "place": "waycross",
    "public": false,
    "src": [],
    "color": "#22c55e",
    "cares": [
      "Remote diagnostics before driving out",
      "Simple swap and replace in the field",
      "Knowing which laptops touch signal equipment"
    ],
    "scenarios": [
      "rogue",
      "crossing",
      "vendor"
    ],
    "priority": "I cover a lot of track. I want to roll the truck once, with the right part, and know my bungalow is not talking to strangers."
  },
  {
    "id": "oteng",
    "name": "Priya, OT Network Engineer",
    "role": "Network engineering, Jacksonville (modeled persona)",
    "place": "dc",
    "public": false,
    "src": [],
    "color": "#06b6d4",
    "cares": [
      "Golden configs and PSIRT compliance at scale",
      "Zero-touch provisioning",
      "Segmentation that does not break signal logic"
    ],
    "scenarios": [
      "config",
      "helene",
      "lateral"
    ],
    "priority": "Thousands of wayside sites, mixed vintages, and every config change is a risk. I need automation with guardrails."
  },
  {
    "id": "soc",
    "name": "Jordan, SOC Analyst",
    "role": "Managed SOC partner (modeled persona; 10-K cites a third-party SOC service)",
    "place": "noc",
    "public": false,
    "src": [
      "csx10k"
    ],
    "color": "#ef4444",
    "cares": [
      "OT context in Microsoft Sentinel incidents",
      "Fewer, better correlated alerts",
      "Playbooks that can actually contain a field device"
    ],
    "scenarios": [
      "lateral",
      "rogue",
      "vendor"
    ],
    "priority": "My Sentinel queue is full of IT alerts. OT alerts either never arrive or arrive with no context."
  },
  {
    "id": "fieldtech",
    "name": "Luis, Field Communications Technician",
    "role": "Blue Ridge Subdivision rebuild crew (modeled persona)",
    "place": "blueridge",
    "public": false,
    "src": [],
    "color": "#f472b6",
    "cares": [
      "Zero-touch bring-up of new bungalows",
      "Cellular fallback when fiber is gone",
      "Proof of path performance before handing back to service"
    ],
    "scenarios": [
      "helene",
      "backhaul"
    ],
    "priority": "After Helene we rebuilt sites from bare ground. Every box I install should configure itself and prove it works."
  }
];

export const TECH = [
  {
    "id": "ie3500",
    "abbr": "IE",
    "name": "Cisco IE3500 Rugged Switch",
    "short": "IE3500",
    "color": "#22d3ee",
    "obj": "ie3500",
    "src": [
      "ie3500",
      "ccIA"
    ],
    "facts": [
      "DIN-rail, fanless, -40 C to +75 C; up to 3x10G uplinks and 8 PoE+/4PPoE downlinks (model dependent)",
      "Cisco Cyber Vision sensor embedded via IOx; Network Advantage includes a 3-year, 24-endpoint Cyber Vision and Secure Equipment Access entitlement",
      "Trust Anchor secure boot, MACsec-256, TrustSec segmentation",
      "REP, MRP, DLR rings; PRP/HSR on IE3505; Swap Drive zero-config replacement",
      "Managed on-prem by Catalyst Center or via Meraki dashboard"
    ],
    "wayside": "Sits on the DIN rail inside the signal bungalow and connects the WIU, signal controller, crossing controller and detector electronics.",
    "sentinel": "IOS XE syslog can be sent to a Syslog via AMA forwarder for Microsoft Sentinel. Asset and threat context comes through Cyber Vision (below).",
    "scenarios": [
      "rogue",
      "config",
      "helene"
    ]
  },
  {
    "id": "ir1101",
    "abbr": "IR",
    "name": "Cisco Catalyst IR1101 Rugged Router",
    "short": "IR1101",
    "color": "#34d399",
    "obj": "ir1101",
    "src": [
      "ir1101",
      "irRN",
      "teIR",
      "cvRN"
    ],
    "facts": [
      "Modular 5G/LTE router, FirstNet Capable, dual active LTE and dual SIM, 9.6 to 60V DC, -40 C to 60 C",
      "WAN diversity: GE SFP fiber plus cellular for backhaul resilience",
      "Serial and SCADA gateway (raw socket, DNP3 serial to IP)",
      "Hosts the Cyber Vision sensor and, from IOS XE 17.18.1, the ThousandEyes Enterprise Agent",
      "IOS XE 17.18.x adds 5G network slicing on IR1101"
    ],
    "wayside": "The bungalow edge router: fiber primary, 5G secondary backhaul to the data center and cloud.",
    "sentinel": "IOS XE syslog to Sentinel via Syslog via AMA. ThousandEyes and Cyber Vision running on the router have their own Sentinel paths.",
    "scenarios": [
      "backhaul",
      "helene",
      "crossing"
    ]
  },
  {
    "id": "cybervision",
    "abbr": "CV",
    "name": "Cisco Cyber Vision",
    "short": "Cyber Vision",
    "color": "#f472b6",
    "obj": "cv",
    "src": [
      "cvDS",
      "cvSyslog",
      "cvISE"
    ],
    "facts": [
      "Network-embedded sensors (IE3500, IR1101 and others) do DPI of industrial protocols with 2 to 5 percent extra traffic",
      "Continuous OT asset inventory, vulnerabilities, communication baselines and anomalies",
      "IEC 62443 zones and conduits feed ISE and Secure Firewall policy",
      "Secure Equipment Access: zero trust remote access for vendors and maintainers",
      "Global Center aggregates all sites for CISO-level reporting"
    ],
    "wayside": "Turns every bungalow switch and router into a sensor; no SPAN network or appliance per site.",
    "sentinel": "Documented: Cyber Vision Center exports events and alerts as CEF syslog (UDP, TCP, or TCP+TLS). Ingest with the Microsoft Sentinel \"Common Event Format (CEF) via AMA\" connector. We did not find a dedicated Cyber Vision solution in the Sentinel Content hub, so custom analytics rules are assumed.",
    "scenarios": [
      "rogue",
      "vendor",
      "lateral",
      "tsa"
    ]
  },
  {
    "id": "ise",
    "abbr": "ISE",
    "name": "Cisco Identity Services Engine",
    "short": "ISE",
    "color": "#60a5fa",
    "obj": "ise",
    "src": [
      "cvISE",
      "iseSentinel",
      "amaDevices"
    ],
    "facts": [
      "802.1X and MAB admission for every port in the bungalow",
      "Receives Cyber Vision asset attributes over pxGrid (Cyber Vision 4.4.1+/ISE 3.2+) for OT profiling",
      "TrustSec security groups enforce segmentation on IE3500",
      "Adaptive Network Control for quarantine of a suspect endpoint"
    ],
    "wayside": "Decides who and what may connect to the bungalow network, and which zones may talk.",
    "sentinel": "Documented: the Microsoft \"Cisco ISE\" solution for Sentinel ingests ISE logs via Syslog via AMA and ships a parser, workbook, 10 analytic rules, 10 hunting queries and 3 playbooks.",
    "scenarios": [
      "rogue",
      "lateral",
      "vendor"
    ]
  },
  {
    "id": "catcenter",
    "abbr": "CC",
    "name": "Cisco Catalyst Center",
    "short": "Catalyst Center",
    "color": "#fbbf24",
    "obj": "catc",
    "src": [
      "ccIA",
      "ccCompliance"
    ],
    "facts": [
      "On-prem automation and assurance for IE3500 and Catalyst IE switches",
      "Plug and Play zero-touch day-0 provisioning, golden images, templates",
      "Compliance audits: running vs startup config, images, critical security advisories (PSIRT), EoX",
      "Integrates with ISE (pxGrid) and helps automate Cyber Vision sensor enablement"
    ],
    "wayside": "The engineering control plane for thousands of wayside switches.",
    "sentinel": "Integration pattern (validate): Catalyst Center event notifications can be sent to external receivers; forward them to a Sentinel ingestion endpoint. Device syslog goes direct via AMA.",
    "scenarios": [
      "config",
      "helene"
    ]
  },
  {
    "id": "thousandeyes",
    "abbr": "TE",
    "name": "Cisco ThousandEyes",
    "short": "ThousandEyes",
    "color": "#a3e635",
    "obj": "te",
    "src": [
      "teIR",
      "teWebhooks",
      "ccNews"
    ],
    "facts": [
      "Enterprise Agent runs on IR1101 (IOS XE 17.18.1+) and IE3500 (per datasheet)",
      "Hop-by-hop path visibility across owned fiber and unowned carrier 5G/LTE",
      "Tests from the bungalow to the PTC back office, data center and cloud apps",
      "Assurance was extended to industrial IoT in 2025"
    ],
    "wayside": "Proves the backhaul works from the bungalow outward, and shows who owns the fault.",
    "sentinel": "Documented: Custom Webhooks POST alert JSON with custom headers and auth to any endpoint. Point them at a customer-built ingestion endpoint (for example the Azure Monitor Logs Ingestion API) to land alerts in a Sentinel custom table. No native Sentinel preset is documented.",
    "scenarios": [
      "backhaul",
      "helene",
      "crossing"
    ]
  },
  {
    "id": "cloudcontrol",
    "abbr": "CL",
    "name": "Cisco Cloud Control",
    "short": "Cloud Control",
    "color": "#c084fc",
    "obj": "cc",
    "src": [
      "ccNews",
      "ccGA",
      "ccRN",
      "ccSite"
    ],
    "facts": [
      "Unified operations platform across networking, security and observability, previewed June 10, 2025",
      "Generally available for U.S. customers on August 25, 2026",
      "One login, one inventory, one topology; correlated actions",
      "AI Assistant and AI Canvas for multi-person, human-approved investigations; Cloud Control Studio for third-party tools"
    ],
    "wayside": "The single pane where the CIO and CISO teams see wayside network, security and assurance together.",
    "sentinel": "No native Sentinel connector was found in public docs. Cisco states third-party tools connect through Cloud Control Studio; treat a Sentinel link as a roadmap item to validate.",
    "scenarios": [
      "tsa",
      "backhaul",
      "helene"
    ]
  },
  {
    "id": "xdr",
    "abbr": "XDR",
    "name": "Cisco XDR (bridge to Sentinel)",
    "short": "XDR",
    "color": "#fb7185",
    "obj": "xdr",
    "src": [
      "xdrSentinel",
      "ciscoSentinel",
      "cvDS"
    ],
    "facts": [
      "\"Report to XDR\" from Cyber Vision creates an investigation with OT observables",
      "Native workflows export XDR incident summaries and detection findings to Microsoft Sentinel",
      "XDR automation can run Sentinel queries and fetch Sentinel incidents"
    ],
    "wayside": "Correlates OT detections with IT telemetry and hands an enriched incident to Sentinel.",
    "sentinel": "Documented: \"Microsoft Sentinel - Export Incident Summary\" and \"Export XDR Detection Findings\" workflows.",
    "scenarios": [
      "lateral",
      "rogue"
    ]
  },
  {
    "id": "sentinel",
    "abbr": "MS",
    "name": "Microsoft Sentinel (customer SIEM)",
    "short": "Sentinel",
    "color": "#3b82f6",
    "obj": "sentinel",
    "src": [
      "amaCEF",
      "iseSentinel",
      "xdrSentinel"
    ],
    "facts": [
      "Assumed CSX SIEM for this story (not publicly confirmed)",
      "Receives ISE, Cyber Vision (CEF), XDR incidents, ThousandEyes webhooks and device syslog",
      "Analysts work OT incidents with Cisco context, inside their existing queue"
    ],
    "wayside": "Where the managed SOC sees wayside security events alongside enterprise IT.",
    "sentinel": "Integration hub for this architecture.",
    "scenarios": [
      "lateral",
      "rogue",
      "vendor",
      "tsa"
    ]
  }
];

export const SCENARIOS = [
  {
    "id": "rogue",
    "title": "Unknown laptop in a signal bungalow",
    "focus": "bungalow",
    "place": "wayside",
    "personas": [
      "maintainer",
      "ciso",
      "soc"
    ],
    "tech": [
      "ie3500",
      "ise",
      "cybervision",
      "xdr",
      "sentinel"
    ],
    "hook": "A contractor plugs a personal laptop into a spare port to \"check something\" on the signal controller.",
    "without": [
      "Spare port is live and flat on the same VLAN as the WIU and signal controller",
      "No inventory of what normally talks to what, so the new device is invisible",
      "Laptop scans the subnet and reaches the PTC WIU management interface",
      "Discovered weeks later, if ever, during a manual audit"
    ],
    "with": [
      "IE3500 port demands 802.1X; ISE profiles the device as unknown and places it in a restricted TrustSec group",
      "Cyber Vision sensor in the IE3500 flags a new component and an abnormal scan against signal assets",
      "ISE syslog and Cyber Vision CEF alerts land in Microsoft Sentinel; XDR adds the incident summary",
      "Maintainer gets the alert on the way in; port is quarantined with Adaptive Network Control"
    ],
    "kpi": {
      "without": {
        "mttd": "Weeks",
        "vis": "~40%",
        "roll": "3 trips"
      },
      "with": {
        "mttd": "Minutes",
        "vis": "~100%",
        "roll": "1 trip"
      }
    }
  },
  {
    "id": "backhaul",
    "title": "PTC WIU goes quiet on the backhaul",
    "focus": "radio",
    "place": "wayside",
    "personas": [
      "dispatcher",
      "cio",
      "fieldtech"
    ],
    "tech": [
      "ir1101",
      "thousandeyes",
      "cloudcontrol",
      "sentinel"
    ],
    "hook": "WIU status messages to the PTC back office become intermittent. Trains approach at restricted speed.",
    "without": [
      "Dispatcher sees a PTC exception, opens a ticket, and waits",
      "Network team checks the core; carrier says \"no problem found\"",
      "A truck rolls to a site that is three hours away",
      "Root cause (carrier congestion on one cell sector) found after a day"
    ],
    "with": [
      "ThousandEyes agent on the IR1101 shows loss on the carrier hop, not the bungalow",
      "IR1101 shifts WIU traffic to the second SIM and 5G path automatically",
      "Cloud Control correlates the IR1101 health, ThousandEyes path and affected sites in one view",
      "ThousandEyes custom webhook posts the alert to the Sentinel ingestion endpoint for audit"
    ],
    "kpi": {
      "without": {
        "mttd": "Hours",
        "vis": "Core only",
        "roll": "1 to 2 trips"
      },
      "with": {
        "mttd": "< 5 min",
        "vis": "Hop-by-hop",
        "roll": "0 trips"
      }
    }
  },
  {
    "id": "config",
    "title": "Unapproved config and stale firmware",
    "focus": "switch",
    "place": "dc",
    "personas": [
      "oteng",
      "cio"
    ],
    "tech": [
      "catcenter",
      "ie3500",
      "cybervision"
    ],
    "hook": "A critical security advisory lands for switches deployed across hundreds of bungalows, and some sites have drifted from the golden config.",
    "without": [
      "Spreadsheets and SSH sessions to find which sites are affected",
      "Drift unknown until an outage reveals it",
      "Patching takes months of maintenance windows"
    ],
    "with": [
      "Catalyst Center compliance shows every IE3500 out of policy: image, PSIRT, running vs startup config",
      "Cyber Vision lists the vulnerable OT assets behind each switch",
      "Templates and image updates are staged per maintenance window with approvals",
      "Evidence report exported for the CISO and auditors"
    ],
    "kpi": {
      "without": {
        "mttd": "Months",
        "vis": "Sampled",
        "roll": "Many"
      },
      "with": {
        "mttd": "Same day",
        "vis": "Fleet-wide",
        "roll": "Few"
      }
    }
  },
  {
    "id": "helene",
    "title": "Rebuilding the Blue Ridge after Helene",
    "focus": "bungalow",
    "place": "blueridge",
    "personas": [
      "fieldtech",
      "oteng",
      "cio"
    ],
    "tech": [
      "catcenter",
      "ie3500",
      "ir1101",
      "thousandeyes",
      "cloudcontrol"
    ],
    "hook": "About 60 miles of railroad were rebuilt after Hurricane Helene (reopened Sep 25, 2025). Each new site needs signals, crossings and comms on day one. (Story illustrates future rebuilds; it does not describe what CSX deployed.)",
    "without": [
      "Each new bungalow is hand-configured by a specialist on site",
      "Fiber is not ready yet, so sites wait",
      "No proof of performance before handing back to service"
    ],
    "with": [
      "IR1101 comes up on 5G first and calls home; Catalyst Center Plug and Play pushes the site template",
      "IE3500 Swap Drive allows a no-expertise replacement if a unit fails",
      "ThousandEyes validates paths to the PTC back office before the site goes live",
      "Cloud Control shows rebuild progress across all sites"
    ],
    "kpi": {
      "without": {
        "mttd": "Days per site",
        "vis": "Per tech",
        "roll": "Specialist"
      },
      "with": {
        "mttd": "Hours per site",
        "vis": "Fleet",
        "roll": "Any tech"
      }
    }
  },
  {
    "id": "lateral",
    "title": "Ransomware tries to cross from IT to wayside",
    "focus": "bungalow",
    "place": "noc",
    "personas": [
      "soc",
      "ciso",
      "oteng"
    ],
    "tech": [
      "ise",
      "cybervision",
      "xdr",
      "sentinel"
    ],
    "hook": "An enterprise workstation is compromised and starts probing networks that route toward field sites.",
    "without": [
      "Flat routing between enterprise and field networks",
      "SOC sees endpoint alerts but no OT context",
      "Attack reaches bungalow management interfaces before anyone connects the dots"
    ],
    "with": [
      "ISE TrustSec groups only allow approved conduits between enterprise and OT zones",
      "Cyber Vision detects the new IT-to-OT communication pattern and reports to XDR",
      "XDR exports the correlated incident to Microsoft Sentinel; ISE events enrich via the Sentinel ISE solution",
      "Sentinel playbook plus ISE quarantine contain the workstation"
    ],
    "kpi": {
      "without": {
        "mttd": "Days",
        "vis": "IT only",
        "roll": "Broad outage risk"
      },
      "with": {
        "mttd": "Minutes",
        "vis": "IT + OT",
        "roll": "Contained"
      }
    }
  },
  {
    "id": "vendor",
    "title": "Vendor remote access to a hot box detector",
    "focus": "detector",
    "place": "wayside",
    "personas": [
      "maintainer",
      "ciso",
      "soc"
    ],
    "tech": [
      "cybervision",
      "ise",
      "ie3500",
      "sentinel"
    ],
    "hook": "The detector vendor needs to pull logs from a hot box detector after false alarms.",
    "without": [
      "Shared VPN account and always-on modem at the site",
      "No session recording or time limit",
      "Vendor can reach anything on the subnet"
    ],
    "with": [
      "Secure Equipment Access (included with Cyber Vision) grants a time-boxed session to that one detector",
      "Session runs through the IE3500 without a site VPN",
      "Access events and anomalies go to Microsoft Sentinel via CEF",
      "CISO gets an auditable record for TSA directive evidence"
    ],
    "kpi": {
      "without": {
        "mttd": "Unknown",
        "vis": "None",
        "roll": "Standing access"
      },
      "with": {
        "mttd": "Real time",
        "vis": "Per session",
        "roll": "Just in time"
      }
    }
  },
  {
    "id": "crossing",
    "title": "Grade crossing controller acting strangely",
    "focus": "crossing",
    "place": "wayside",
    "personas": [
      "dispatcher",
      "maintainer"
    ],
    "tech": [
      "cybervision",
      "ir1101",
      "thousandeyes"
    ],
    "hook": "A crossing controller starts reporting intermittently, raising safety and service questions.",
    "without": [
      "Only visible when the public calls in a gate problem",
      "Maintainer dispatched without knowing whether it is power, network or the controller"
    ],
    "with": [
      "Cyber Vision baselines the controller and highlights a change in its communications",
      "ThousandEyes on the IR1101 rules the backhaul in or out",
      "Maintainer arrives with the right part and the right diagnosis"
    ],
    "kpi": {
      "without": {
        "mttd": "Public report",
        "vis": "None",
        "roll": "2 trips"
      },
      "with": {
        "mttd": "Proactive",
        "vis": "Device level",
        "roll": "1 trip"
      }
    }
  },
  {
    "id": "tsa",
    "title": "TSA directive evidence for the board",
    "focus": "control",
    "place": "hq",
    "personas": [
      "ciso",
      "cio"
    ],
    "tech": [
      "cybervision",
      "cloudcontrol",
      "ise",
      "sentinel"
    ],
    "hook": "SD 1580-21-01E (effective Jan 16, 2026) and SD 1580/82-2022-01E require a cybersecurity coordinator, incident reporting, response plans, assessments, and mitigation actions and testing.",
    "without": [
      "Asset lists assembled by hand from field surveys",
      "Segmentation claims hard to prove",
      "Board briefings built from slides, not live data"
    ],
    "with": [
      "Cyber Vision Global Center provides a live OT inventory and vulnerability posture across all sites",
      "ISE and TrustSec policy shows enforced zones and conduits",
      "Cloud Control gives one inventory and topology for executive review",
      "Sentinel workbooks track incidents for TSA and CISA reporting timelines"
    ],
    "kpi": {
      "without": {
        "mttd": "Quarterly",
        "vis": "Sampled",
        "roll": "Manual"
      },
      "with": {
        "mttd": "Continuous",
        "vis": "Full fleet",
        "roll": "Automated"
      }
    }
  }
];

// Extra sources prepended to a scenario's source list (beyond its technologies' sources).
export const SCENARIO_EXTRA_SOURCES = { helene: ['csxBlueRidge'], tsa: ['tsaSD', 'tsaSD2'], lateral: ['csx10k'] };

export const STORY = [
  {
    "title": "CSX: 20,000 route miles, 26 states",
    "view": "map",
    "place": null,
    "text": "CSX moves freight across the eastern US from its Jacksonville headquarters. 2025 revenue was $14.1B with about 23,000 employees. Every mile depends on wayside signals, PTC, crossings and detectors.",
    "src": [
      "csx10k"
    ],
    "mode": "without"
  },
  {
    "title": "A network under pressure",
    "view": "map",
    "place": "blueridge",
    "text": "Hurricane Helene destroyed about 60 miles of the Blue Ridge Subdivision (rebuilt and reopened Sep 2025). The Howard Street Tunnel opened double-stack service in May 2026. New lanes and partnerships raise the cost of every outage.",
    "src": [
      "csxBlueRidge",
      "hstTrains"
    ],
    "mode": "without"
  },
  {
    "title": "Regulators and adversaries are watching rail",
    "view": "map",
    "place": "hq",
    "text": "TSA SD 1580-21-01E and SD 1580/82-2022-01E are in force. CISA ICSA-25-191-10 showed how a legacy rail RF protocol can be abused. The CSX 10-K names cyber-attack as a risk that could cause service interruption or a train accident.",
    "src": [
      "tsaSD",
      "tsaSD2",
      "cisaEOT",
      "csx10k"
    ],
    "mode": "without"
  },
  {
    "title": "Inside the wayside",
    "view": "wayside",
    "focus": "overview",
    "text": "Thousands of sites like this one: signals, a PTC wayside interface unit and 220 MHz radio, a grade crossing, a hot box detector, a power switch, a bungalow, and backhaul. CSX reported more than 2,500 WIUs as early as 2015.",
    "src": [
      "csxPTC2015",
      "itcnet"
    ],
    "open": null
  },
  {
    "title": "Without Cisco: blind, flat, slow",
    "view": "wayside",
    "focus": "bungalow",
    "mode": "without",
    "text": "Flat networks, unknown devices, standing vendor access, and backhaul faults found by driving out. OT events rarely reach the SOC with context.",
    "src": [],
    "open": "scenario:rogue"
  },
  {
    "title": "With Cisco: every bungalow is a sensor",
    "view": "wayside",
    "focus": "bungalow",
    "mode": "with",
    "text": "IE3500 and IR1101 embed Cyber Vision. ISE enforces identity and segmentation. ThousandEyes proves the path. Catalyst Center automates. Cloud Control unifies. Microsoft Sentinel gets the context.",
    "src": [
      "ie3500",
      "ir1101",
      "cvDS"
    ],
    "open": "tech:cybervision"
  },
  {
    "title": "Side by side",
    "view": "wayside",
    "focus": "overview",
    "mode": "split",
    "text": "The same site, the same morning. Pick a scenario on the left to compare outcomes for each persona.",
    "src": [],
    "open": "scenario:backhaul"
  }
];

export const LEGEND = {
  map: [
    ['sw', '#38bdf8', 'HQ'], ['sw', '#f59e0b', 'Operations center'], ['sw', '#06b6d4', 'Data center'],
    ['sw', '#facc15', 'Yard / terminal'], ['sw', '#f43f5e', 'Helene impact (Blue Ridge Sub)'],
    ['ln', '#f5b301', 'CSX corridors (schematic, modeled)'], ['sw', '#ef4444', 'Without: unmonitored wayside sites'],
    ['sw', '#2dd4bf', 'With: sensor telemetry to Jacksonville'],
  ],
  mapNote: 'Click a marker. Drag to orbit, scroll to zoom.',
  wayside: [
    ['sw', '#22d3ee', 'IE3500 industrial switch'], ['sw', '#34d399', 'IR1101 industrial router'],
    ['sw', '#2dd4bf', 'Cyber Vision sensor flows'], ['sw', '#a3e635', 'ThousandEyes path hops'],
    ['sw', '#93c5fd', 'Flows into Microsoft Sentinel'], ['sw', '#ef4444', 'Threats and blind spots'],
  ],
  waysideNote: 'Representative site, modeled layout.',
};
