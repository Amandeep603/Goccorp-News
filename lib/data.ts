export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Companies" | "Market" | "Sectors" | "Government";
  imageUrl: string;
  date: string;
  author: string;
  authorRole?: string;
  readTime?: string;
  content?: string[];
  featured?: boolean;
}

export const breakingHeadlines = [
  "Cabinet clears ₹24,000 Cr green hydrogen subsidy roadmap for central public sector undertakings",
  "BHEL secures major ₹6,500 Crore thermal power project contract from NTPC",
  "Nifty CPSE Index reaches all-time high as institutional inflows into PSU stocks cross ₹12,000 Cr",
  "Ministry of Finance outlines revised capital expenditure targets for Maharatna enterprises",
];

export const articles: Article[] = [
  // Hero Articles
  {
    id: "hero-1",
    slug: "maharatna-psus-clean-energy-transition",
    title: "India's Maharatna PSUs Spearhead ₹1.8 Trillion Clean Energy Transition",
    excerpt:
      "State-owned energy titans including NTPC, ONGC, and Indian Oil accelerate decarbonization plans with unprecedented joint investments in green hydrogen corridors, offshore wind farms, and next-generation battery storage systems.",
    category: "Companies",
    imageUrl: "https://placehold.co/800x450/0A2463/FFFFFF/png?text=Clean+Energy+Transition",
    date: "Sep 20, 2026",
    author: "Rajesh Sharma",
    authorRole: "Chief Energy Correspondent",
    readTime: "5 min read",
    featured: true,
    content: [
      "In a decisive push toward fulfilling India's Net Zero 2070 commitments, a coalition of premier Maharatna public sector enterprises has finalized an aggregated capital expenditure pipeline exceeding ₹1.8 trillion over the next five financial years. The strategic roadmap brings together NTPC Limited, Oil and Natural Gas Corporation (ONGC), Indian Oil Corporation (IOCL), and GAIL India in a synchronized campaign to establish national-scale clean energy infrastructure.",
      "Under the blueprint cleared during a high-level inter-ministerial review in New Delhi, the public sector conglomerates will pool balance sheet strengths to derisk high-capital technology frontiers. Key priorities include multi-gigawatt green hydrogen production facilities along the western and eastern coastlines, ultra-deep offshore wind exploration in Tamil Nadu and Gujarat, and decentralized grid-scale battery storage clusters.",
      "Senior government officials noted that the collaborative model departs from historical siloed operating frameworks, creating economies of scale in component procurement, electrolyzer localization, and sovereign transmission connectivity. The public sector's countercyclical capex deployment is expected to catalyze substantial private co-investment across downstream auxiliary manufacturing units.",
      "Furthermore, participating central public sector enterprises (CPSEs) have committed to issuing benchmark green bonds in offshore financial markets to optimize blended borrowing costs, signaling strong confidence in sovereign-backed sustainable governance metrics."
    ],
  },
  {
    id: "hero-2",
    slug: "bhel-railways-propulsion-order",
    title: "BHEL & Railways Finalize Landmark ₹9,200 Cr High-Speed Propulsion Order",
    excerpt:
      "The engineering giant strengthens its rail transportation portfolio with advanced propulsion technology designed and manufactured under the Make in India initiative.",
    category: "Sectors",
    imageUrl: "https://placehold.co/600x380/0A2463/FFFFFF/png?text=Rail+Propulsion",
    date: "Sep 20, 2026",
    author: "Sunita Verma",
    authorRole: "Industrial Manufacturing Analyst",
    readTime: "4 min read",
    content: [
      "Bharat Heavy Electricals Limited (BHEL) has formalized a transformational commercial agreement valued at ₹9,200 Crore with the Indian Railways for the indigenized supply and long-term maintenance of next-generation propulsion systems and traction power converters.",
      "The contract will cater to upcoming fleets of semi-high-speed passenger trains and dedicated freight haulers slated for deployment across key industrial economic corridors. The systems will be engineered at BHEL's specialized manufacturing units in Bengaluru and Bhopal, featuring IGBT-based traction converters that yield a 15% reduction in overall energy consumption.",
      "Industry analysts view the development as a major milestone for domestic technological self-reliance, substantially curbing reliance on imported electronic assemblies while fortifying BHEL's burgeoning order book for the remainder of the fiscal year."
    ],
  },
  {
    id: "hero-3",
    slug: "nifty-cpse-outperforms-benchmark-indices",
    title: "Nifty CPSE Outperforms Benchmark Indices with 32% Year-to-Date Return",
    excerpt:
      "Robust corporate earnings, consistent dividend yields, and aggressive capital expenditure continue to draw foreign and domestic institutional investors.",
    category: "Market",
    imageUrl: "https://placehold.co/600x380/138808/FFFFFF/png?text=CPSE+Index+Rally",
    date: "Sep 19, 2026",
    author: "Arun Mehra",
    authorRole: "Capital Markets Strategist",
    readTime: "4 min read",
    content: [
      "The Nifty Central Public Sector Enterprise (CPSE) Index has emerged as the premier performer across domestic equity gauges in the current calendar year, clocking a stellar 32% gain and beating broader benchmark indices by a comprehensive margin.",
      "Market participants attribute this sustained rerating to structurally elevated dividend distributions, historically lean corporate leverage, and sovereign guarantees supporting multi-year infrastructure pipelines. Institutional allocations from domestic mutual funds and international exchange-traded funds (ETFs) have scaled historic peaks over recent months.",
      "With public sector balance sheets showing record free cash flows and disciplined capital allocation policies, market experts project sustained multiple expansions heading into the subsequent fiscal quarters."
    ],
  },

  // Companies Section
  {
    id: "comp-1",
    slug: "ongc-discovers-hydrocarbon-reserves-kg-basin",
    title: "ONGC Discovers Significant Hydrocarbon Reserves in Krishna-Godavari Basin",
    excerpt:
      "Deepwater appraisal drilling confirms substantial natural gas reserves, augmenting India's domestic energy security roadmap over the coming decade.",
    category: "Companies",
    imageUrl: "https://placehold.co/600x400/0A2463/FFFFFF/png?text=ONGC+Deepwater",
    date: "Sep 19, 2026",
    author: "Pooja Hegde",
    authorRole: "Senior Oil & Gas Reporter",
    readTime: "3 min read",
    content: [
      "Oil and Natural Gas Corporation (ONGC) has officially notified the Directorate General of Hydrocarbons regarding a significant new discovery of natural gas and condensate reserves within its deepwater block in the prolific Krishna-Godavari (KG) offshore basin.",
      "Initial production testing and flow rate evaluations demonstrate exceptional permeability and reserve density. The asset is anticipated to ramp up commercial gas output over the medium term, delivering crucial domestic feedstock to power utilities and fertilizer plants across eastern and central states.",
      "ONGC's executive board has signaled expedited early-monetization plans, leveraging subsea tie-back infrastructure to existing processing platforms to minimize capital deployment durations."
    ],
  },
  {
    id: "comp-2",
    slug: "coal-india-automated-fleet-management-mines",
    title: "Coal India Implements Automated Fleet Management Across Mega Open Cast Mines",
    excerpt:
      "Digital transformation initiative reduces turnaround times by 14% while enhancing safety compliance across coal producing subsidiaries.",
    category: "Companies",
    imageUrl: "https://placehold.co/600x400/0A2463/FFFFFF/png?text=Coal+India+Tech",
    date: "Sep 18, 2026",
    author: "Vikram Sengupta",
    authorRole: "Mining & Resources Analyst",
    readTime: "4 min read",
    content: [
      "In one of the largest industrial IoT deployments within the natural resources sector, Coal India Limited (CIL) has successfully commissioned automated real-time fleet management systems across 12 of its flagship open-cast mining operations.",
      "The satellite-linked dispatch and telemetry platform tracks dump trucks, excavators, and draglines in real-time, optimizing haul routes and cutting idle fuel consumption by an estimated 14%. Early operational metrics indicate improved output productivity alongside enhanced worker safety vigilance.",
      "The state miner plans to expand the digital monitoring infrastructure to all subsidiary mines by the end of FY27, setting new operational benchmarks for modern sustainable open-cast operations."
    ],
  },
  {
    id: "comp-3",
    slug: "sail-modernization-targets-35-million-tonnes",
    title: "SAIL Modernization Program Targets 35 Million Tonnes Annual Capacity by 2030",
    excerpt:
      "The state steel manufacturer allocates capital towards energy-efficient blast furnaces and value-added specialized grades for automotive and defence.",
    category: "Companies",
    imageUrl: "https://placehold.co/600x400/0A2463/FFFFFF/png?text=SAIL+Expansion",
    date: "Sep 17, 2026",
    author: "Ananya Roy",
    authorRole: "Metals & Mining Desk",
    readTime: "3 min read",
    content: [
      "Steel Authority of India Limited (SAIL) has unveiled the next phase of its comprehensive modernization and expansion plan, committing ₹42,000 Crore to scale hot metal capacity to 35 million tonnes per annum by 2030.",
      "The investment cycle focuses primarily on replacing legacy facilities with high-efficiency blast furnaces, expanding cold-rolling facilities, and increasing output of high-tensile steel grades tailored for defence, aerospace, and electric vehicle construction.",
      "SAIL's management emphasized that carbon mitigation technologies, including carbon capture and hydrogen-enriched furnace injection, form integral pillars of the capital expenditure plan."
    ],
  },
  {
    id: "comp-4",
    slug: "hal-avionics-radar-assemblies-pact",
    title: "HAL Signs Technology Transfer Pact for Next-Gen Avionics and Radar Assemblies",
    excerpt:
      "Hindustan Aeronautics Limited expands indigenous production capabilities with key global aerospace component partnerships.",
    category: "Companies",
    imageUrl: "https://placehold.co/600x400/0A2463/FFFFFF/png?text=HAL+Aerospace",
    date: "Sep 16, 2026",
    author: "Karan Johar",
    authorRole: "Defence Industry Analyst",
    readTime: "4 min read",
    content: [
      "Hindustan Aeronautics Limited (HAL) has executed a major technology transfer agreement with premier international aerospace consortiums to manufacture advanced active electronically scanned array (AESA) radar systems and mission computers domestically.",
      "The agreement empowers HAL's Hyderabad and Nashik facilities to produce critical airborne sensors indigenously, catering to upcoming production lots of light combat aircraft and multirole combat helicopters.",
      "Defence industry experts note that achieving domestic sovereignty in airborne radar technology significantly insulates future fleet procurement programs from global supply chain disruptions."
    ],
  },
  {
    id: "comp-5",
    slug: "ioc-launches-green-hydrogen-plant-mathura",
    title: "Indian Oil Commissions North India's Largest Green Hydrogen Plant at Mathura",
    excerpt:
      "The 10-KTA green hydrogen electrolyzer facility marks a turning point in petroleum refining decarbonization for state-owned refiners.",
    category: "Companies",
    imageUrl: "https://placehold.co/600x400/0A2463/FFFFFF/png?text=IOC+Green+Hydrogen",
    date: "Sep 15, 2026",
    author: "Rajesh Sharma",
    authorRole: "Chief Energy Correspondent",
    readTime: "4 min read",
    content: [
      "Indian Oil Corporation (IOCL) has begun operations at North India's largest green hydrogen production facility located at its Mathura refinery complex. The plant operates on captive solar power wheeled through high-voltage dedicated interconnections.",
      "The electrolyzer unit produces high-purity hydrogen to replace carbon-intensive grey hydrogen in hydrocracking and desulfurization processes, cutting refinery greenhouse gas emissions by an estimated 130,000 tonnes annually.",
      "IOCL has outlined ambitious blueprints to replicate this green hydrogen model across its Panipat, Paradip, and Koyali refining installations over the next 36 months."
    ],
  },
  {
    id: "comp-6",
    slug: "ntpc-renewable-energy-arm-ipo-plans",
    title: "NTPC Green Energy Files Draft Red Herring Prospectus for ₹10,000 Cr Public Issue",
    excerpt:
      "The renewable energy arm of India's largest power generator gears up for one of the biggest state-owned public listings of the decade.",
    category: "Companies",
    imageUrl: "https://placehold.co/600x400/0A2463/FFFFFF/png?text=NTPC+Green+IPO",
    date: "Sep 14, 2026",
    author: "Arun Mehra",
    authorRole: "Capital Markets Strategist",
    readTime: "3 min read",
    content: [
      "NTPC Green Energy Limited (NGEL), the wholly owned clean power subsidiary of NTPC, has officially filed its draft papers with market regulator SEBI to raise ₹10,000 Crore through an initial public offering.",
      "Proceeds from the fresh equity issue will be directed toward funding equity contributions for 15 GW of ongoing solar, wind, and pumped storage projects under development across Rajasthan, Andhra Pradesh, and Gujarat.",
      "The listing is slated to be one of the marquee market events of the fiscal year, unlocking substantial valuation for parent entity NTPC while broadening the public shareholder base."
    ],
  },

  // Market Section
  {
    id: "mkt-1",
    slug: "psu-banking-stocks-surge-npa-record-low",
    title: "PSU Banking Stocks Surge as Gross NPA Ratios Plunge to Decadal Low of 2.1%",
    excerpt:
      "State Bank of India, Bank of Baroda, and Canara Bank post record quarterly recoveries and healthy credit growth in corporate loan books.",
    category: "Market",
    imageUrl: "https://placehold.co/600x400/138808/FFFFFF/png?text=PSU+Banking+Gains",
    date: "Sep 19, 2026",
    author: "Rohan Kapoor",
    authorRole: "Banking & Financial Services Editor",
    readTime: "4 min read",
    content: [
      "Public sector banking equities experienced aggressive institutional buying following the release of quarterly financial figures showing gross non-performing asset (GNPA) ratios falling to a multi-decade low of 2.1% across state-owned lenders.",
      "Aggressive recovery resolution through the Insolvency and Bankruptcy Code (IBC), coupled with underwriting discipline and expanded corporate credit appetite, has bolstered return-on-equity (RoE) metrics to multi-year highs.",
      "State Bank of India (SBI), Bank of Baroda, and Punjab National Bank gained between 3.5% and 6% in high-volume trading, driving the Nifty PSU Bank index up over 4% on the day."
    ],
  },
  {
    id: "mkt-2",
    slug: "lic-portfolio-allocation-sovereign-infra-debt",
    title: "LIC Raises Portfolio Allocation in Sovereign Infrastructure Debt Instruments",
    excerpt:
      "Life Insurance Corporation of India channels ₹45,000 Crore into long-tenure power transmission, expressway, and dedicated freight projects.",
    category: "Market",
    imageUrl: "https://placehold.co/600x400/138808/FFFFFF/png?text=LIC+Investments",
    date: "Sep 18, 2026",
    author: "Meera Nair",
    authorRole: "Institutional Investments Desk",
    readTime: "4 min read",
    content: [
      "Life Insurance Corporation of India (LIC) has approved an expanded allocation framework targeting high-grade infrastructure bonds, directing ₹45,000 Crore toward sovereign and quasi-sovereign debt instruments in FY27.",
      "The long-duration institutional capital will provide critical non-bank liquidity for national highway construction, high-voltage power transmission lines, and dedicated freight corridor developments.",
      "The institutional insurer highlighted that sovereign-backed infrastructure debt provides optimal asset-liability matching for long-term annuity obligations while assuring stable, inflation-hedged yields."
    ],
  },
  {
    id: "mkt-3",
    slug: "dipam-signals-measured-tranche-sales-q3",
    title: "DIPAM Signals Measured Tranche Sales for Strategic Non-Core Assets in Q3",
    excerpt:
      "The Department of Investment and Public Asset Management reviews offer-for-sale schedules while prioritizing market stability and investor demand.",
    category: "Market",
    imageUrl: "https://placehold.co/600x400/138808/FFFFFF/png?text=DIPAM+Asset+Sale",
    date: "Sep 17, 2026",
    author: "Siddharth Rao",
    authorRole: "Policy & Disinvestment Analyst",
    readTime: "3 min read",
    content: [
      "The Department of Investment and Public Asset Management (DIPAM) has indicated a cautious, investor-friendly pacing for secondary stake sales in central public sector enterprises during the upcoming third quarter.",
      "Rather than large disruptive divestment tranches, DIPAM plans to utilize Offer-for-Sale (OFS) windows in smaller tranches to ensure secondary market absorption without downward pressure on enterprise market capitalizations.",
      "The strategic pivot highlights the government's commitment to maximizing long-term shareholder value in listed state assets rather than chasing arbitrary annual fiscal receipts."
    ],
  },
  {
    id: "mkt-4",
    slug: "retail-investor-participation-cpse-etf-record",
    title: "Retail Investor Participation in CPSE Exchange Traded Funds Hits Record 4.2 Million",
    excerpt:
      "Attractive historical yields and consistent government enterprise balance sheets continue to democratize public sector equity investments.",
    category: "Market",
    imageUrl: "https://placehold.co/600x400/138808/FFFFFF/png?text=CPSE+ETF+Growth",
    date: "Sep 16, 2026",
    author: "Deepak Joshi",
    authorRole: "Retail Wealth Correspondent",
    readTime: "3 min read",
    content: [
      "Unique retail folios invested in CPSE ETFs and Bharat 22 ETF have surpassed 4.2 million accounts, marking an unprecedented democratization of public enterprise wealth among Indian household savers.",
      "Digital mutual fund platforms and systematic investment plans (SIPs) have channeled over ₹1,200 Crore of fresh monthly retail savings into dividend-yielding PSU equities throughout the current fiscal year.",
      "Financial planners note that low expense ratios and solid dividend yield safety nets have made public enterprise ETFs cornerstone allocations in balanced retail investment portfolios."
    ],
  },
  {
    id: "mkt-5",
    slug: "foreign-institutional-inflows-defence-psus-peak",
    title: "Foreign Portfolio Investors Inject ₹8,400 Cr into Listed Defence PSUs",
    excerpt:
      "Robust export pipelines and soaring order books attract marquee global institutional funds to Indian aerospace and naval shipbuilders.",
    category: "Market",
    imageUrl: "https://placehold.co/600x400/138808/FFFFFF/png?text=FPI+Defence+Inflows",
    date: "Sep 13, 2026",
    author: "Arun Mehra",
    authorRole: "Capital Markets Strategist",
    readTime: "4 min read",
    content: [
      "Foreign Portfolio Investors (FPIs) have recorded the highest quarterly net purchase of Indian defence PSU shares on record, accumulating ₹8,400 Crore in equities across HAL, Bharat Electronics (BEL), and Mazagon Dock Shipbuilders.",
      "International investment managers cite India's burgeoning defence hardware export trajectory and multi-year visibility in domestic modernization tenders as rare global structural growth drivers.",
      "Institutional weightings for Indian defence industrials in emerging market indices have doubled over the past eighteen months as institutional liquidity expands."
    ],
  },

  // Sectors Section
  {
    id: "sec-1",
    slug: "power-grid-hvdc-link-ladakh-haryana",
    title: "Power Grid Commissions High-Voltage Direct Current Link Connecting Ladakh & Haryana",
    excerpt:
      "The 13 GW renewable energy evacuation transmission corridor is hailed as one of Asia's most complex high-altitude engineering triumphs.",
    category: "Sectors",
    imageUrl: "https://placehold.co/600x400/FF6B00/FFFFFF/png?text=Power+Grid+HVDC",
    date: "Sep 19, 2026",
    author: "Amitabh Sen",
    authorRole: "Power & Infrastructure Editor",
    readTime: "5 min read",
    content: [
      "Power Grid Corporation of India Limited (POWERGRID) has officially commissioned the first phase of the monumental Ladakh-Haryana High-Voltage Direct Current (HVDC) transmission link, unlocking bulk evacuation of high-altitude solar energy.",
      "Traversing rugged Himalayan passes exceeding 14,000 feet, the ±800 kV bi-pole transmission line represents one of Asia's most complex high-altitude infrastructure undertakings. The line is engineered to withstand extreme seismic activity and temperature variations.",
      "Once fully operational, the corridor will feed up to 13 gigawatts of clean solar and wind electricity into the Northern Regional Grid, significantly offsetting thermal generation during peak daylight hours."
    ],
  },
  {
    id: "sec-2",
    slug: "defence-psus-export-record-hardware-h1",
    title: "Defence PSUs Export Record ₹21,000 Crore Hardware in H1 FY27 to Friendly Nations",
    excerpt:
      "Indigenous naval corvettes, advanced light helicopters, and missile guidance systems drive international defence supply contracts.",
    category: "Sectors",
    imageUrl: "https://placehold.co/600x400/FF6B00/FFFFFF/png?text=Defence+Exports",
    date: "Sep 18, 2026",
    author: "Col. Sanjeev Nair",
    authorRole: "Defence & Strategic Affairs Analyst",
    readTime: "4 min read",
    content: [
      "India's state-owned defence industrial undertakings recorded an all-time high export performance of ₹21,000 Crore during the first half of FY27, supplying defense systems to friendly nations across Southeast Asia, the Middle East, and Africa.",
      "The flagship exports include fast patrol vessels, coastal surveillance radar systems, light combat helicopters, and specialized ammunition. Rigorous cost-efficiency and modular engineering standards have positioned Indian PSUs as highly competitive alternatives to traditional Western suppliers.",
      "The Ministry of Defence has set an annual export milestone of ₹35,000 Crore for the sector, backed by aggressive diplomatic line-of-credit arrangements."
    ],
  },
  {
    id: "sec-3",
    slug: "bsnl-expands-indigenous-5g-network-coverage",
    title: "Telecom Sector Overhaul: BSNL Expands 4G/5G Network Coverage to 100,000 Sites",
    excerpt:
      "Indigenously deployed mobile stack passes high-throughput validation trials in rural and semi-urban tier-3 districts nationwide.",
    category: "Sectors",
    imageUrl: "https://placehold.co/600x400/FF6B00/FFFFFF/png?text=BSNL+5G+Rollout",
    date: "Sep 17, 2026",
    author: "Priya Sundaram",
    authorRole: "Telecom & Technology Correspondent",
    readTime: "3 min read",
    content: [
      "Bharat Sanchar Nigam Limited (BSNL) has achieved a pivotal milestone in its strategic network modernization program, surpassing 100,000 active 4G/5G mobile tower installations powered entirely by an indigenous telecom technology stack.",
      "Developed collaboratively by C-DOT and leading domestic hardware manufacturers, the open-RAN network architecture delivers gigabit mobile broadband to previously underserved rural and border hamlets.",
      "Field audits reveal robust subscriber additions and high data usage growth, setting the stage for nationwide commercial 5G launch phases by mid-2027."
    ],
  },
  {
    id: "sec-4",
    slug: "civil-aviation-greenfield-cargo-terminals-aai",
    title: "Civil Aviation Ministry Announces 15 New Greenfield Cargo Terminals with AAI",
    excerpt:
      "Airport Authority of India partners with domestic logistics carriers to bolster air cargo processing times and perishables export corridors.",
    category: "Sectors",
    imageUrl: "https://placehold.co/600x400/FF6B00/FFFFFF/png?text=AAI+Air+Cargo",
    date: "Sep 15, 2026",
    author: "Gaurav Dave",
    authorRole: "Aviation & Logistics Desk",
    readTime: "4 min read",
    content: [
      "The Ministry of Civil Aviation, in partnership with the Airports Authority of India (AAI), has unveiled plans to develop 15 state-of-the-art greenfield air cargo terminals across tier-2 industrial clusters.",
      "The specialized facilities will feature cold-chain automated warehousing, digitized customs clearance bays, and direct tarmac access to expedite pharmaceutical, agricultural, and high-value manufacturing exports.",
      "The program is projected to compress air freight transit turnaround times by 35%, empowering regional manufacturers to access global supply chains directly from hinterland airstrips."
    ],
  },
  {
    id: "sec-5",
    slug: "inland-waterways-freight-traffic-crosses-milestone",
    title: "Inland Waterways Authority Reports Record 130 Million Tonnes Cargo Movement",
    excerpt:
      "National Waterway 1 and 2 emerge as sustainable, low-cost freight alternatives for bulk steel, cement, and foodgrain shipments.",
    category: "Sectors",
    imageUrl: "https://placehold.co/600x400/FF6B00/FFFFFF/png?text=Inland+Waterways",
    date: "Sep 12, 2026",
    author: "Amitabh Sen",
    authorRole: "Power & Infrastructure Editor",
    readTime: "3 min read",
    content: [
      "The Inland Waterways Authority of India (IWAI) has reported a record 130 million tonnes of commercial cargo transit across national rivers during the previous twelve months, representing a 28% annual increase.",
      "Heavy industrial commodities including steel coils from SAIL, fertilizer from NFL, and coal consignments have transitioned to waterway transport, slashing logistics costs by an average of 40% compared to road freight.",
      "The Authority is deploying 10 new multimodal river terminals along the Ganga and Brahmaputra corridors to support growing industrial transit requirements."
    ],
  },

  // Government Section
  {
    id: "gov-1",
    slug: "dpe-modernized-corporate-governance-framework",
    title: "DPE Releases Modernized Corporate Governance Framework for Central PSUs",
    excerpt:
      "Updated regulatory criteria mandate dedicated sustainability committees, independent director evaluations, and transparent executive compensation audits.",
    category: "Government",
    imageUrl: "https://placehold.co/600x400/1E293B/FFFFFF/png?text=DPE+Governance",
    date: "Sep 19, 2026",
    author: "Kavita Krishnamurthy",
    authorRole: "Public Governance Specialist",
    readTime: "4 min read",
    content: [
      "The Department of Public Enterprises (DPE) has issued an updated Corporate Governance Guidelines Handbook for Central Public Sector Undertakings (CPSUs), aligning state-owned enterprise standards with international best practices.",
      "The reformed handbook introduces mandatory board-level sustainability and climate risk oversight committees, annual 360-degree performance appraisals for independent directors, and institutionalized whistle-blower safeguards.",
      "Enterprises that meet or exceed top-tier governance benchmarks will enjoy accelerated capital expenditure approvals and simplified overseas joint venture delegation limits."
    ],
  },
  {
    id: "gov-2",
    slug: "parliamentary-committee-financial-autonomy-navratnas",
    title: "Parliamentary Committee Recommends Enhanced Financial Autonomy for Navratnas",
    excerpt:
      "Proposed legislation aims to raise overseas joint venture expenditure limits without requiring prior cabinet sign-off for top-tier performers.",
    category: "Government",
    imageUrl: "https://placehold.co/600x400/1E293B/FFFFFF/png?text=Navratna+Autonomy",
    date: "Sep 18, 2026",
    author: "Manoj Chhabra",
    authorRole: "Parliamentary Affairs Bureau",
    readTime: "4 min read",
    content: [
      "A bipartisan Parliamentary Standing Committee on Public Undertakings has tabled landmark recommendations urging the Union Cabinet to double the discretionary financial investment powers of Navratna and Miniratna enterprises.",
      "Under the suggested changes, top-performing enterprises would be authorized to sanction domestic capital projects up to ₹2,500 Crore and overseas joint ventures up to ₹1,500 Crore without lengthy inter-ministerial screening protocols.",
      "Committee members argued that agility in decision-making is imperative for state enterprises competing in volatile international mineral and energy procurement markets."
    ],
  },
  {
    id: "gov-3",
    slug: "ministry-streamlines-mineral-exploration-clearances",
    title: "Union Ministry Streamlines Inter-Ministerial Clearances for Mineral Exploration",
    excerpt:
      "A unified single-window digital mechanism cuts environment and forest approval timeframes from 180 days to under 45 days.",
    category: "Government",
    imageUrl: "https://placehold.co/600x400/1E293B/FFFFFF/png?text=Mineral+Clearances",
    date: "Sep 17, 2026",
    author: "Radhika Anand",
    authorRole: "Resources Policy Correspondent",
    readTime: "3 min read",
    content: [
      "The Ministry of Mines in coordination with the Ministry of Environment, Forest and Climate Change has operationalized an integrated single-window portal to expedite statutory clearances for critical mineral prospecting.",
      "By integrating geographic information system (GIS) layers and automated inter-agency documentation routing, the average clearance timeline for non-invasive exploratory drilling has dropped from 180 days to under 45 days.",
      "State exploration entities including MECL and NMDC are rapidly deploying exploratory drill rigs in newly demarcated lithium, cobalt, and rare earth elements (REE) blocks across five states."
    ],
  },
  {
    id: "gov-4",
    slug: "niti-aayog-national-psu-innovation-index",
    title: "NITI Aayog Unveils National PSU Innovation Index to Benchmark Technology R&D",
    excerpt:
      "Annual comparative ranking measures patent filings, university research tie-ups, and commercialization milestones among public enterprises.",
    category: "Government",
    imageUrl: "https://placehold.co/600x400/1E293B/FFFFFF/png?text=NITI+Aayog+Index",
    date: "Sep 16, 2026",
    author: "Nikhil Deshmukh",
    authorRole: "Science & Innovation Desk",
    readTime: "4 min read",
    content: [
      "NITI Aayog, the government's premier policy think tank, has launched the inaugural National PSU Innovation & Intellectual Property Index to foster research excellence across central public sector undertakings.",
      "The framework evaluates enterprises on R&D expenditure as a percentage of turnover, patent grant speed, joint research initiatives with IITs and CSIR laboratories, and revenue realized from proprietary indigenous technologies.",
      "Leading engineering and energy enterprises including BHEL, IOCL, and HAL topped the inaugural rankings, setting ambitious benchmarks for the broader public enterprise ecosystem."
    ],
  },
  {
    id: "gov-5",
    slug: "finance-ministry-dividend-payout-norms-cpsus",
    title: "Finance Ministry Reaffirms Consistent Dividend Payout Norms for CPSUs",
    excerpt:
      "Government advises profitable public sector enterprises to maintain minimum 30% profit-after-tax dividend distributions.",
    category: "Government",
    imageUrl: "https://placehold.co/600x400/1E293B/FFFFFF/png?text=Govt+Dividends",
    date: "Sep 11, 2026",
    author: "Kavita Krishnamurthy",
    authorRole: "Public Governance Specialist",
    readTime: "3 min read",
    content: [
      "The Ministry of Finance has issued its annual advisory reminding profitable Central Public Sector Undertakings to maintain robust dividend distribution policies for FY27.",
      "In accordance with established capital management guidelines, enterprises are required to pay a minimum annual dividend of 30% of profit after tax (PAT) or 5% of net worth, whichever is higher, subject to capex requirements.",
      "The predictable dividend stream provides vital non-tax revenues for sovereign welfare initiatives while ensuring minority public shareholders receive attractive yields."
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug || a.id === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  const normalizedCategory = category.toLowerCase().trim();
  return articles.filter(
    (a) => a.category.toLowerCase() === normalizedCategory
  );
}

export function getRelatedArticles(
  currentSlug: string,
  category: string,
  limit: number = 3
): Article[] {
  const normalizedCategory = category.toLowerCase().trim();
  return articles
    .filter(
      (a) =>
        a.category.toLowerCase() === normalizedCategory &&
        a.slug !== currentSlug &&
        a.id !== currentSlug
    )
    .slice(0, limit);
}

export const validCategories = [
  "Companies",
  "Market",
  "Sectors",
  "Government",
] as const;

export type ValidCategory = (typeof validCategories)[number];
