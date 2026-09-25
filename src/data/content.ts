/**
 * Content model for Aaron DuChateau portfolio recreation.
 * Profile data is adapted from the public site and paired with stock visuals.
 */

import {
  RANDOM_MONKEY_DOG_FEATURE_ID,
  RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID,
} from "@/activity/unlockFeatures";
import type { MediaModalConfig } from "@/types/media-modal";
import type { SimpleNoteModal } from "@/types/simple-note";

export const person = {
  name: "Aaron DuChateau",
  title: "Full Stack Developer · Vue · React · Node.js",
  tagline:
    "I build sustainable, scalable web applications and move quickly from concept to a working product.",
  instagram: "https://aaronduchateau.github.io/",
  github: "https://github.com/aaronduchateau",
  linkedin: "https://www.linkedin.com/in/aaron-duchateau/",
  email: "chateauconcept@gmail.com",
};

export const images = {
  hero: "/photos/Aaron_DuChateau_aaron.png",
  portrait:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
};

export const heroTestimonial = {
  preview:
    "As a Senior full stack developer, Aaron worked with me on a React / Java / Hibernate / Postgres web application that featured extensive Websocket integration and Responsive styling and layout, and was backed by a RESTful API.",
  fullQuote:
    "As a Senior full stack developer, Aaron worked with me on a React / Java / Hibernate / Postgres web application that featured extensive Websocket integration and Responsive styling and layout, and was backed by a RESTful API.\n\nAaron specializes in React, Redux, CSS, Webpack, Javascript and frontend integrations. He is a gifted rapid prototyper and moves very fast in the frontend. He implemented several full stack features including a Redis-based, websocketed locking system to keep users from interfering with shared resources by pushing lock statuses out to connected users.\n\nAaron is fun to work with (he planned a ski trip for our team.) He is respectful and considerate of his coworkers. Despite his skills and accomplishments, he is also humble, he enjoys mentoring others in his strengths, he takes feedback well and he loves to learn new stuff.\n\nI would gladly work with Aaron again.",
  attribution: "Brunson Moody",
  org: "Former Google Site-Reliability engineer",
  photo: "/photos/testimonials/Aaron_DuChateau_brunson-moody.png",
};

export const workHistory = [
  {
    id: "1",
    role: "Software Engineer",
    employer: "Elmstreet Technology",
    period: "Jan 2023 — Present",
    summary:
      "Builds and ships features for IDX Broker using active MLS data. Leveraged Vue, React, custom web components, RabbitMQ, MySQL, Elasticsearch, and Firebase.",
    mark: { initials: "ES", from: "#0f172a", to: "#06b6d4" },
  },
  {
    id: "2",
    role: "Contract Software Engineer",
    employer: "Independent",
    period: "2020 - 2023",
    summary:
      "Sells House, attends NEARCON in Portugal, Miami Crypto Exp and competes in hackathons, also travels to the Philippines, Belize and lives in Puerto Rico.",
    mark: { initials: "IN", from: "#1e1b4b", to: "#a855f7" },
  },
  {
    id: "3",
    role: "Software Engineer / Project Manager",
    employer: "LegalGPS",
    period: "2018 — 2019",
    summary:
      "Led feature planning and full-stack implementation for a legal education platform, balancing product vision, UX concerns, and delivery milestones.",
    mark: { initials: "LG", from: "#14532d", to: "#22c55e" },
  },
  {
    id: "4",
    role: "Software Engineer",
    employer: "Palo Alto Software",
    period: "2014 — Feb 2018",
    summary:
      "Built features and fixes across LivePlan and Outpost with React, Flux/Redux-style patterns, Java services, PostgreSQL, and supporting infrastructure.",
    mark: { initials: "PA", from: "#7c2d12", to: "#f97316" },
  },
  {
    id: "5",
    role: "Software Engineer / Business Development",
    employer: "Insilico, LLC",
    period: "Feb 2013 — Sep 2014",
    summary:
      "Worked across multiple client stacks, collaborated on deliveries, onboarded new clients, and bridged product and engineering needs.",
    mark: { initials: "IS", from: "#0c4a6e", to: "#38bdf8" },
  },
  {
    id: "6",
    role: "Co-owner / Developer / Designer",
    employer: "Genius Media Solutions",
    period: "Mar 2010 — Jan 2012",
    summary:
      "Co-founded a small web services company and grew a local client base through networking, design, and practical software delivery.",
    mark: { initials: "GM", from: "#7c2d12", to: "#f97316" },
  },
];

/** Closing quote row — themed remake of the classic site’s Jacque Fresco block. */
export const frescoQuote = {
  text: "The shape and solutions of the future rely totally on the collective effort of people working together. We are all an integral part of the web of life.",
  attribution: "Jacque Fresco",
  photoSrc: "/photos/Aaron_DuChateau_jacque-fresco.jpeg",
  photoAlt: "Portrait of Jacque Fresco",
};

export const education = [
  {
    school: "University of Oregon",
    degree: "B.S. Digital Arts",
    detail:
      "Focused on interactive design, installation work with microprocessors, and UI/UX foundations that informed later web product work.",
    years: "2003 — 2008",
    accent: { from: "#7c2d12", to: "#f97316" },
  },
  {
    school: "University of Oregon",
    degree: "B.S. Advertising / Journalism",
    detail:
      "Studied sales-driven design and copywriting across print, web, and radio with an emphasis on real-world campaign execution.",
    years: "2003 — 2008",
    accent: { from: "#0c4a6e", to: "#38bdf8" },
  },
  {
    school: "University of Oregon",
    degree: "Minor in Business Administration",
    detail:
      "Built a foundation in management, ethics, and financial principles that supported client work and small-business operations.",
    years: "2003 — 2008",
    accent: { from: "#1e1b4b", to: "#a855f7" },
  },
];

export const educationSection = {
  id: "education",
  eyebrow: "Education",
  title: "University background",
  description:
    "Degrees and studies from the University of Oregon that shaped both design thinking and technical execution.",
  degrees: education,
};

/** Route namespace for hero Learn more placeholders / work-card deep links. */
export const HERO_LEARN_MODAL_NAMESPACE = "hero-learn";
export const HERO_LEARN_PLACEHOLDER_KEY = "placeholder";

export const heroLearnPlaceholderModal: MediaModalConfig = {
  title: "More coming soon",
  date: "Placeholder",
  contextLabel: "Hero learn more",
  intro:
    "This Learn more target does not have a dedicated modal yet. A fuller case study will land here.",
  detail:
    "Every hero trailer cue now opens a modal. Matched projects reuse existing video or testimonial modals; unmatched cues use this placeholder until their content is ready.",
  media: [
    {
      type: "photo",
      id: "hero-learn-placeholder",
      src: "/photos/Aaron_DuChateau_hero-video-poster.png",
      alt: "Portfolio trailer placeholder",
    },
  ],
};

/** Route namespace for `?modal=testimonials:<id>` (see useRouteModal). */
export const TESTIMONIALS_MODAL_NAMESPACE = "testimonials";

/** `voice.gender` selects on-device TTS. Women share the best female voice; men spread across the remaining natural male voices. */

export const testimonials = [
  {
    id: "mimi-dollah",
    quote: `I've had the pleasure of working closely with Aaron during his time at Elm Street Technology, and I can confidently say he is an outstanding Software Developer. What stood out most was his strong commitment to quality, collaboration, and delivering dependable, forward-thinking solutions.

Aaron consistently demonstrated deep technical expertise across the full stack while bringing creativity and innovation to every project he worked on. He was not only skilled at solving complex technical challenges, but also proactive in identifying opportunities to modernize applications, improve workflows, and introduce meaningful feature enhancements that elevated the overall product experience. His ability to think strategically while still executing effectively made a significant impact on the team.

He was always open to feedback, highly collaborative with QA and cross-functional teams, and committed to ensuring releases were stable, scalable, and successful. Aaron approached problems with a solution-oriented mindset and had a unique ability to balance technical excellence with business needs and user experience.

Beyond his technical abilities, Aaron brings professionalism, accountability, and a positive attitude to every project. He communicates effectively across teams, adapts quickly in fast-paced environments, and consistently contributes ideas that drive improvement and innovation. On top of that, Aaron is simply a fun person to work with — someone who brings positive energy to the team and makes collaboration enjoyable.

I would highly recommend Aaron to any organization looking for a talented, creative, and dependable software engineer. He would be a tremendous asset to any development team.`,
    name: "Mimi Dollah",
    title: "Director of QA · Elm Street Technology",
    voice: { gender: "female" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_mimi.png",
  },
  {
    id: "james-batcheller",
    quote: `Aaron is an exceptionally talented Senior Software Engineer and was a true pleasure to have on the team. He is a rare full-picture engineer who can take a complex concept and turn it into a reality, most notably shown when he spearheaded the creation of an entire product tier from the ground up.

Aaron also pioneered our integration of AI features, showcasing his ability to stay ahead of the technical curve while delivering practical, high-quality results.

Beyond his technical brilliance in handling everything from architecture to deep-stack troubleshooting, he is a fantastic collaborator who makes the people around him better. Aaron is a powerhouse engineer who will be a massive asset to his next company, and I cannot recommend him highly enough.`,
    name: "James Batcheller",
    title: "QA Engineer · Elm Street Technology",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_james.png",
  },
  {
    id: "kelly-beth-costello",
    quote: `Aaron follows up and huddles with you to get FAST answers for bugs. No one else does this, leading to missed notifications that are not seen for days, weeks, or months.

His attitude and attention to detail make him fun to work with. Without the usual politics of pushback or finding flawed logic to close an unresolved ticket, he demonstrates he is a good person in all he does and he is who you want in your company. He gets tickets and problems solved.`,
    name: "Kelly Beth Costello",
    title: "Social Ads Designer, Manager & Copywriter",
    voice: { gender: "female" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_kelly.png",
  },
  {
    id: "brunson-moody",
    quote: `As a Senior full stack developer, Aaron worked with me on a React / Java / Hibernate / Postgres web application that featured extensive Websocket integration and Responsive styling and layout, and was backed by a RESTful API.

Aaron specializes in React, Redux, CSS, Webpack, Javascript and frontend integrations. He is a gifted rapid prototyper and moves very fast in the frontend. He implemented several full stack features including a Redis-based, websocketed locking system to keep users from interfering with shared resources by pushing lock statuses out to connected users.

Aaron is fun to work with (he planned a ski trip for our team.) He is respectful and considerate of his coworkers. Despite his skills and accomplishments, he is also humble, he enjoys mentoring others in his strengths, he takes feedback well and he loves to learn new stuff.

I would gladly work with Aaron again.`,
    name: "Brunson Moody",
    title: "Former Google Site-Reliability engineer",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_brunson-moody.png",
  },
  {
    id: "bryan-peterson",
    quote: `I had the pleasure of working with Aaron at Elm Street Technology, and I can say without hesitation that he is one of the most dependable engineers I've worked with.

Aaron combines strong technical ability with a practical, solutions-oriented mindset. He consistently approaches challenges with professionalism and a calm, methodical attitude, whether debugging complex production issues, implementing new features, or helping the team navigate unfamiliar technologies.

What stands out most about Aaron is his willingness to go above and beyond for both his teammates. He is thoughtful, collaborative, and always willing to share his knowledge. His ability to break down difficult problems and turn them into clear solutions makes him an invaluable member of any engineering team.

Beyond his technical skills, Aaron is simply a great person to work with. He brings a positive attitude, communicates clearly, and consistently earns the trust and respect of those around him.`,
    name: "Bryan Peterson",
    title: "Full Stack Developer · Elm Street Technology",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_bryan.png",
  },
  {
    id: "johnathan-curry",
    quote: `Aaron is naturally intelligent and is fearless when it comes to tackling a problem scope, new technology, or asking any and all questions he needs to be successful.

His willingness to identify and challenge assumptions when necessary invites refreshing opportunities for innovation. He works hard, prototypes like a beast, and thinks like a business owner.`,
    name: "Johnathan Curry",
    title: "CEO, Ointt Inc.",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_johnathan-curry.jpg",
  },
  {
    id: "ben-hickman",
    quote: `When our client's developer fell through at the last second we contacted Aaron.

He is a fantastic find, certainly an expert, but also professional and personal.`,
    name: "Ben Hickman",
    title: "Senior UI / UX manager at Pluto TV",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_ben-hickman.jpg",
  },
  {
    id: "doug-yook",
    quote: `It was my great pleasure to have Aaron work for us as a web developer. He rose to the challenge of every task and new technology that we threw at him.

He is diligent, conscientious, curious and multitalented. He has a keen sense for business, marketing, design and has great client relation skills. Aaron would be a great asset for any development team.`,
    name: "Doug Yook",
    title: "CEO, Insilico, LLC",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_doug-yook.jpg",
  },
  {
    id: "chris",
    quote: `I have had the pleasure of working with Aaron at a couple of different places, and this was true at both places.

Aaron's just someone who gets stuff done. You can hand him something with barely any direction and he'll run with it and figure it out. The work he puts out is solid too, he thinks things through. And he's not stuck in "this is how we've always done it" mode. Good guy to have on a team.`,
    name: "Adam",
    title: "Manager / Software Engineer",
    voice: { gender: "male" as const },
    photo: "/photos/testimonials/Aaron_DuChateau_chris.png",
  },
];

export type ContributionProject = {
  /** Stable track / modal key from content JSON. */
  id: string;
  company: string;
  role: string;
  window: string;
  location: string;
  photo: string;
  bullets: string[];
  url?: string;
  modal?: MediaModalConfig;
  wiggleOnClick?: boolean;
};

/** @deprecated alias */
export type MajorProject = ContributionProject;

export type ContributionsSectionConfig = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  projects: ContributionProject[];
  /** Major projects: sample photo is B&W/dim until the whole card is hovered. */
  revealPhotoOnHover?: boolean;
  /** Phone list expands to the original card (close X) instead of a compact action. */
  mobileRevealFullCard?: boolean;
};

/** Product contributions — copy adapted from https://aaronduchateau.github.io/ and live sites */
export const majorProjects: ContributionProject[] = [
  {
    id: "idx-broker-elite",
    company: "IDX Broker® Elite",
    role: "Software Engineer",
    window: "Jan 2023 — Present",
    location: "Elmstreet Technology",
    url: "https://www.idxbroker.com/idx-broker-elite/",
    photo: "/photos/projects/Aaron_DuChateau_elite.png",
    bullets: [
      "Vue, React, custom web components, RabbitMQ, MySQL, Elasticsearch, and Firebase on live MLS data.",
      "Non-trivial work on property search, lead capture, and highly customizable agent-facing experiences.",
    ],
  },
  {
    id: "legalgps",
    company: "LegalGPS",
    role: "Software Engineer / Project Manager",
    window: "2018 — 2019",
    location: "Legal GPS, Inc.",
    url: "https://www.legalgps.com/",
    photo: "/photos/projects/Aaron_DuChateau_legal.png",
    bullets: [
      "React, Node.js, Express, PostgreSQL, and Material UI for an attorney-guided legal roadmap platform.",
      "Owned full-stack delivery from product vision through production features—not surface-level tweaks.",
    ],
  },
  {
    id: "stockbossup",
    company: "StockBossUP",
    role: "Contract Software Engineer",
    window: "Recent work",
    location: "Remote",
    url: "https://www.stockbossup.com/",
    photo: "/photos/projects/Aaron_DuChateau_stock.png",
    bullets: [
      "Angular, Webpack, and Material UI across feed, team, portfolio, and roster experiences.",
      "Dark theme migration, custom modals, and non-trivial interactive feature integrations.",
    ],
  },
  {
    id: "connected-lane-county",
    company: "Connected Lane County",
    role: "Software Engineer",
    window: "Recent work",
    location: "Eugene & Springfield, OR",
    url: "https://connectedlane.org/",
    photo: "/photos/projects/Aaron_DuChateau_connected.jpg",
    bullets: [
      "Contributed to digital experiences supporting youth programs, drop-ins, and workforce pathways.",
      "Meaningful engineering on platforms that connect underserved youth to education and employment.",
    ],
  },
  {
    id: "outpost",
    company: "OutPost",
    role: "Full Stack Engineer",
    window: "2014 — 2018",
    location: "Palo Alto Software",
    url: "https://support.teamoutpost.com/outpost-is-no-longer-available",
    photo: "/photos/projects/Aaron_DuChateau_outpost.png",
    bullets: [
      "React, Redux, Webpack, PostCSS, Java, Resque, PostgreSQL, S3, Dropwizard, Elasticsearch, and more.",
      "Shared inbox and email collaboration for growth-stage teams—substantial full-stack product work.",
    ],
  },
  {
    id: "liveplan",
    company: "LivePlan",
    role: "Full Stack Engineer",
    window: "2014 — 2018",
    location: "Palo Alto Software",
    url: "https://www.liveplan.com/",
    photo: "/photos/projects/Aaron_DuChateau_liveplan.png",
    bullets: [
      "React, Flux, Webpack, PostCSS, Java, Resque, PostgreSQL, S3, Dropwizard, Elasticsearch, and more.",
      "Award-winning business planning software with tens of thousands of subscribers.",
    ],
  },
  {
    id: "lothopper",
    company: "LotHopper",
    role: "Owner / Architect / Full Stack Engineer",
    window: "Independent",
    location: "Eugene, OR",
    photo: "/photos/projects/Aaron_DuChateau_lothopper.png",
    wiggleOnClick: true,
    bullets: [
      "HTML, jQuery, Bootstrap, PHP, Laravel, PostgreSQL, and a custom MapBox PostGIS service.",
      "End-to-end county taxlot import, browse, and advanced parcel search—not a thin CRUD wrapper.",
    ],
  },
];

export const majorProjectsSection: ContributionsSectionConfig = {
  id: "projects",
  eyebrow: "Major projects",
  title: "A few projects i've contributed to",
  description:
    "Each engagement involved non-trivial full-stack work—shared infrastructure, product features, and ownership—not one-off fixes or surface-level UI tweaks.",
  projects: majorProjects,
  revealPhotoOnHover: true,
  mobileRevealFullCard: true,
};

const nearconExternal = { href: "https://nearcon.org/", label: "Visit NEARCON" };
const youtubeLink = (id: string, label = "Watch on YouTube") => ({
  href: `https://www.youtube.com/watch?v=${id}`,
  label,
});

export const hackathonContributions: ContributionProject[] = [
  {
    id: "nearcon",
    company: "Nearcon",
    role: "Core Prototype Engineer",
    window: "2023",
    location: "Lisbon, Portugal",
    photo: "/photos/hackathon/Aaron_DuChateau_nearcon.png",
    bullets: [
      "Awarded 20 thousand dollar grant.",
      "Rapid prototyping under time pressure: wallet UX, success paths, and demo-ready polish for judges and sponsors.",
    ],
    modal: {
      title: "Nearcon",
      date: "2023",
      contextLabel: "Event context",
      intro:
        "Our concept was awarded a $20,000 grant, but we declined it—we didn't feel it was enough to move the product forward successfully.",
      detail:
        "The proof of concept centered on leveraging a blockchain transfer and signature to secure immutable membership to an organization. The applications for that pattern are endless; what we shipped was a demonstration to iterate on the power of the NEAR and Mintbase ecosystems.\n\nThe photos and pitch footage here capture Lisbon 2023.",
      media: [
        {
          type: "video",
          id: "nearcon-lisbon-video-1",
          youtubeId: "5IGpBBcRcZA",
          externalLink: nearconExternal,
        },
        {
          type: "photo",
          id: "nearcon-1",
          src: "/photos/externals/Aaron_DuChateau_nearcon_1.png",
          alt: "NEARCON sign against evergreen foliage",
          externalLink: nearconExternal,
        },
        {
          type: "photo",
          id: "nearcon-2",
          src: "/photos/externals/Aaron_DuChateau_nearcon_2.png",
          alt: "Pena Palace tower and stone walls in Sintra",
          externalLink: nearconExternal,
        },
        {
          type: "photo",
          id: "nearcon-3",
          src: "/photos/externals/Aaron_DuChateau_nearcon_3.png",
          alt: "Nearcon Lisbon",
          externalLink: nearconExternal,
        },
        {
          type: "photo",
          id: "nearcon-4",
          src: "/photos/externals/Aaron_DuChateau_nearcon_4.png",
          alt: "Nearcon Lisbon",
          externalLink: nearconExternal,
        },
      ],
    },
  },
  {
    id: "hack-for-a-cause",
    company: "Hack for a Cause",
    role: "Judge",
    window: "Live event",
    location: "Community hackathon",
    photo: "/photos/hackathon/Aaron_DuChateau_hack.png",
    bullets: [
      "Reviewed teams on product clarity, technical execution, and real-world impact for nonprofit and civic challenge tracks.",
      "Coached presenters on scope, demo narrative, and how to show working software—not slideware.",
    ],
    wiggleOnClick: true,
  },
  {
    id: "startup-weekend",
    company: "Startup Weekend",
    role: "Team Lead & Idea Guy",
    window: "2013",
    location: "Bend, Oregon",
    photo: "/photos/hackathon/Aaron_DuChateau_robot_salad_2.jpg",
    bullets: [
      "Shipped Robot Salad—a playful hardware-leaning concept tying robotics, food service automation, and a memorable demo for pitch night.",
      "Owned integration and frontend flows, branding, a mechanically sound 3D mockup made by a mechanical engineer, and a virtual demo.",
    ],
    modal: {
      title: "Startup Weekend",
      date: "2013",
      contextLabel: "Event context",
      intro:
        "In 2013 our team traveled to Bend, Oregon for Startup Weekend. My idea was selected for the sprint: inventing a machine that made a robot salad.",
      detail:
        "We didn't have the resources to build a real machine that weekend, but we delivered frontend flows, branding, a mechanically sound 3D mockup made by a mechanical engineer, and a virtual demo.\n\nTen years later, robot salad became a reality anyway. The idea outlasted that weekend in Bend—the pitch footage and photos here are a snapshot of where it started. But it was invented by our team in 2013 in Bend, Oregon, and current designs match the specification of what we modeled in Blender almost identically. Unfortunately, the only barrier to being ten years earlier to this product market was money. Currently over a dozen companies are making and selling real machines that do exactly what we conjured up.",
      media: [
        {
          type: "video",
          id: "startup-pitch",
          youtubeId: "vTE-IsaCG6U",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
        {
          type: "photo",
          id: "robot-salad-6",
          src: "/photos/hackathon/Aaron_DuChateau_robot_salad_6.jpg",
          alt: "Robot Salad 3D mockup",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
        {
          type: "video",
          id: "startup-later",
          youtubeId: "mgozRjX-qNE",
          externalLink: youtubeLink("mgozRjX-qNE"),
        },
        {
          type: "photo",
          id: "robot-salad-2",
          src: "/photos/hackathon/Aaron_DuChateau_robot_salad_2.jpg",
          alt: "Robot Salad team",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
        {
          type: "photo",
          id: "robot-salad-1",
          src: "/photos/hackathon/Aaron_DuChateau_robot_salad.jpg",
          alt: "Robot Salad",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
        {
          type: "photo",
          id: "robot-salad-3",
          src: "/photos/hackathon/Aaron_DuChateau_robot_salad_3.jpg",
          alt: "Robot Salad",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
        {
          type: "photo",
          id: "robot-salad-5",
          src: "/photos/hackathon/Aaron_DuChateau_robot_salad_5.jpg",
          alt: "Robot Salad",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
        {
          type: "photo",
          id: "robot-salad-voting",
          src: "/photos/hackathon/Aaron_DuChateau_robot_salad_voting.jpg",
          alt: "Robot Salad voting",
          externalLink: youtubeLink("vTE-IsaCG6U"),
        },
      ],
    },
  },
];

export const hackathonContributionsSection: ContributionsSectionConfig = {
  id: "hackathons",
  eyebrow: "Live events",
  title: "Hackathon Contributions",
  description:
    "In-person hackathons, judging, and sprint builds—high-intensity collaboration where working demos and clear storytelling matter as much as the code.",
  projects: hackathonContributions,
};

export const blogPosts = [
  {
    slug: "stockbossup",
    title: "StockBossUP",
    date: "Recent Work",
    excerpt:
      "Angular + Webpack + Material project work including dark theme migration, UI/UX concept development, and interactive feature integrations.",
    cover:
      "https://images.unsplash.com/photo-1551281044-8b7cbf3b2f9b?auto=format&fit=crop&w=1200&q=70",
  },
  {
    slug: "spaceranchdao",
    title: "SpaceRanchDAO",
    date: "Recent Work",
    excerpt:
      "Web3 pilot MVP integrating Near / Mintbase membership purchasing, transaction verification callbacks, and license agreement flows.",
    cover:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=70",
  },
  {
    slug: "legalgps",
    title: "LegalGPS",
    date: "Recent Work",
    excerpt:
      "React, Node, Express, and PostgreSQL e-learning legal platform for young entrepreneurs; product ownership and full-stack delivery.",
    cover:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=70",
  },
];

export const animationStoryCards = [
  {
    id: "tp9tyruxglc",
    title: "Shade4 — False Horizons",
    date: "Narrative short",
    excerpt:
      "A compare-and-contrast of Wizard of Oz allegory and the Bob Lazar story—tin man, yellow brick road, and the wizard mapped onto industry, the gold standard, and the deep state—converging on the surveillance state.",
    youtubeId: "TP9TyruxGLc",
    modalText:
      "Shade4 — False Horizons pairs classical modern readings of The Wizard of Oz with the contemporary Bob Lazar narrative, and lands both in the conventions of the surveillance state.",
    modalDetail: `Concept:
Shade4 — False Horizons compares and contrasts the narrative of The Wizard of Oz—using classical modern interpretations of the story—with a current reading of the Bob Lazar account. The aim is a marriage of the two concepts: both end in the fallout and conventions of the surveillance state and the hidden powers behind it, powers that have drifted from the principles of the gold standard.

In those Oz readings, the Tin Man stands for the industrial worker made less relevant after the industrial revolution; the yellow brick road stands for the gold standard; and finding the Wizard of Oz is analogous to confronting a deep-state figure—authority that presents as all-knowing while operating from behind a curtain.

Set against that frame, the Bob Lazar story functions as a modern counterpart: claims of hidden technology, restricted facilities, and institutions that manage what the public is allowed to know. Where Oz ends in the unmasking of a manufactured wizard, Lazar’s narrative ends in contested testimony about what those hidden powers may already control.

Las Vegas is the perfect setting to marry the two. Not only for its proximity to Los Alamos and the restricted desert corridors that haunt the Lazar story, but because the city itself is the ultimate yellow-brick-road narrative—a neon path that promises arrival at something solid and decisive. Both Oz and Las Vegas sell the ironic promise of a concrete solution at the end of the road: the wizard who can fix everything, the jackpot that settles the score. In both cases the destination is spectacle first, and the “solution” may be a curtain, a casino floor, or a classified fence line.

The piece holds the two stories side by side so their shared destination is clear. Whether through allegory or whistleblower mythos, both arcs describe a world where spectacle and secrecy substitute for transparent value—and where the surveillance state and its conventions replace the older promise of a standard you could touch, weigh, and trust.

Implementation:
This project combines motion capture with many of the new tools I have been experimenting with over the last year for media development.

All of the frame editing was done manually (like in the olden days). One of my goals was to bring character continuity up to a reasonable level, while still leaving room for “dream formation glitches” on the perceptual edge.

I tried to use additional sound elements (outside of the original music score) thoughtfully and carefully—as a complement to the track, rather than something that overpowers it.

The visual tone of the first part of the film is meant to merge science fiction, cyberpunk, and dream state. After the alarm goes off we “come back to reality,” yet an ambiguous Tokyo-blue tone remains, so the level of reality stays unsettled.`,
  },
  {
    id: "quzylybl7om",
    title: "Virtual staging widget concept",
    date: "Concept advertisement",
    excerpt:
      "A Wizard of Oz–tinged concept spot for AI virtual staging—showing how buyers can reimagine a cottage themselves, used internally to shift Elm Street’s marketing toward AI video.",
    youtubeId: "quzylybL7OM",
    modalText:
      "A concept advertisement for a virtual staging and remodeling widget from my time at Elm Street Technology—never shipped, but influential inside the org.",
    modalDetail: `The concept behind this video was to advertise a widget that virtually remodels the interior or exterior of a home—classic virtual staging and virtual remodeling, which was already an independent industry before the advent of AI. People selling expensive homes, where a one or two percent difference in sale price can mean a massive swing for the parties involved, had long been willing to pay private organizations significant amounts to stage a home in a way that appealed to purchasers. The product—which I worked on extensively during my time at Elm Street Technology—needed to tell the real estate industry that there was now a solution that could take that time-consuming process and do it with AI.

In the narrative, a real estate agent shows a prospective buyer a home that has not yet been virtually restaged. Without that vision of what the house could become with a little love and attention, the agent struggles to get the buyer to imagine the potential.

The video uses a fanciful narrative with a slight wink to Toto from The Wizard of Oz to communicate the complete reimagining of a small yet charming cottage—something that can become beautiful when previously it was not.

The point is that with the widget, prospective buyers can take the lead themselves in imagining what any property could look like, through a process that appears to be magic.

This video was never shipped into production, but it was used as a reference to show our advertising team how far AI video production had come and how it could help the organization win more clients. After the demonstration, the marketing department began adapting AI video generation into its core marketing policy.

The core success of the demo was that team members saw how powerful AI video generation had become and began converting leads on the back of that new capability.`,
  },
  {
    id: "xupbd-6yt4u",
    title: "Sri Lankan spice cuisine spot",
    date: "Advertisement",
    excerpt:
      "A short food-cart ad that pairs regional music and landscape with clean, spice-forward cooking—and a clear path from view to order or follow.",
    youtubeId: "XuPbd-6YT4U",
    modalText:
      "An advertisement for Sri Lankan spice cuisine built around home cooking, clean eating, and support for local food businesses.",
    modalDetail: `In this advertisement for Sri Lankan spice cuisine, the objective was to communicate the principles behind the food cart—combining the romanticism of grandma’s home-cooked meals with the health benefits of eating clean, simple food, a core idea in the traditional Sri Lankan diet. For years that diet has been associated with health and longevity in the region, as people who eat this way traditionally avoid processed foods and their components.

The short jingle pairs a musical style commensurate with the region and place with visuals that move between unique, healthy spices and ingredients and breathtaking imagery of Sri Lanka itself.

In the conclusion we tie back to local business community support and the importance of purchasing food from individuals in your local environment.

Finally we end with a CTA that points to the patron’s social media and website—a clear path for someone who sees the ad to order immediately or become a follower and, later, a customer.`,
  },
]

/** Shared archive disclaimer for Older Video Showcase modals (content-driven splash). */
export const ARCHIVE_VIDEO_ENTER_SPLASH = {
  message:
    "Some of this original content was likely created a long time ago and does not necessarily reflect the current design principles of Aaron as of 2026.",
  continueLabel: "Continue",
} as const;

export const featuredWorkCards = [
{
    id: "dqpqfhk-8k",
    title: "AI Redesign",
    date: "2026",
    excerpt:
      "A modern web component built with Vue 3 and compiled as an Immediately Invoked Function Expression to avoid namespace collisions.",
    /** Card thumbnail — first clip in the modal strip. */
    youtubeId: "rYmH4W59rh0",
    modalText:
      "A Vue 3 custom element—an AI redesign widget for property detail pages—built and shipped as an IIFE bundle so it stays isolated from crowded global scope and legacy scripts.",
    modalDetail: `This is an example of a web component I made in Vue 3 and exported as an IIFE (Immediately Invoked Function Expression).

The purpose of compiling this widget as an IIFE was to safely deploy it inside an existing application environment where the global namespace was already crowded with legacy scripts, third-party dependencies, and platform-specific JavaScript. In this case, the component itself is an AI redesign widget designed to live on a property details page—an environment where many unrelated scripts are already competing for scope and execution.

Rather than introducing the risk of namespace collisions, overwritten variables, or dependency conflicts, I chose to package the Vue 3 component as a standalone web component and export it using the .iife build format. This wraps the entire bundle inside an anonymous self-executing function, isolating its internal logic from the surrounding application while still allowing the component to mount and function independently.

This approach allowed me to inject modern Vue architecture into a much larger and older system without forcing a full framework migration or disrupting the existing application stack. The widget could operate as a self-contained unit—handling its own state, styling, and AI-driven interactions—while remaining invisible to the rest of the page's JavaScript ecosystem.

The result was a modular AI redesign experience that could be dropped into a high-traffic production environment with minimal risk, clean separation of concerns, and strong protection against global scope pollution.`,
    modal: {
      title: "AI Redesign",
      date: "2026",
      contextLabel: "Video context",
      intro:
        "A Vue 3 custom element—an AI redesign widget for property detail pages—built and shipped as an IIFE bundle so it stays isolated from crowded global scope and legacy scripts.",
      detail: `This is an example of a web component I made in Vue 3 and exported as an IIFE (Immediately Invoked Function Expression).

The purpose of compiling this widget as an IIFE was to safely deploy it inside an existing application environment where the global namespace was already crowded with legacy scripts, third-party dependencies, and platform-specific JavaScript. In this case, the component itself is an AI redesign widget designed to live on a property details page—an environment where many unrelated scripts are already competing for scope and execution.

Rather than introducing the risk of namespace collisions, overwritten variables, or dependency conflicts, I chose to package the Vue 3 component as a standalone web component and export it using the .iife build format. This wraps the entire bundle inside an anonymous self-executing function, isolating its internal logic from the surrounding application while still allowing the component to mount and function independently.

This approach allowed me to inject modern Vue architecture into a much larger and older system without forcing a full framework migration or disrupting the existing application stack. The widget could operate as a self-contained unit—handling its own state, styling, and AI-driven interactions—while remaining invisible to the rest of the page's JavaScript ecosystem.

The result was a modular AI redesign experience that could be dropped into a high-traffic production environment with minimal risk, clean separation of concerns, and strong protection against global scope pollution.`,
      media: [
        {
          type: "video" as const,
          id: "ai-redesign-walkthrough",
          youtubeId: "rYmH4W59rh0",
          intro: "Product walkthrough of the AI redesign widget on a property details page.",
        },
        {
          type: "video" as const,
          id: "ai-redesign-iife",
          youtubeId: "dQPQFHK_8-k",
          intro: "Technical walkthrough — Vue 3 web component packaged as an IIFE for legacy host pages.",
        },
      ],
    },
  },
{
    id: "vvxlxbaitge",
    title: "Advanced search & mapping",
    date: "2016",
    excerpt:
      "LotHoppers parcel search from sparse clues—owner name, a landmark polygon, and price filters—combined into one query to isolate the correct tax lot and export a full report.",
    youtubeId: "vvxlXBAItgE",
    modalText:
      "Walkthrough of advanced property search on the LotHoppers platform: start with an owner name, refine by geography and value, link filters together, then generate tax/lot reports with multiple map base layers.",
    modalDetail: `This video demonstrates an advanced property search using the LotHoppers platform to identify a specific parcel of land based on limited information.

Initial search: The user begins by searching for the owner’s first name, Frank, which returns too many results (573) to filter manually.

Refining with geography: The user locates a local landmark—the Matthew Knight Arena—and uses the polygon tool to define a search perimeter around that area.

Applying filters: To narrow further, the user adds a price range of $400,000 to $500,000 to align with an estimated value of about $489,000.

Data integration: Using link-where functionality, the user combines the polygon, price range, and owner name into a single query, narrowing the results to three properties.

Final selection: After sorting by total value in list view, the user identifies the correct parcel for Baker George Frank.

Report generation: Once the property is found, the demo shows how to generate a full tax/lot report, toggle map base layers (satellite, topography, street view), and save or print the information for presentation.`,
  },
{
    id: "7k2bict15gc",
    title: "MLS property search",
    date: "2026",
    excerpt:
      "A live MLS search experience with Zillow-style discovery—location search by city, zip, or state, plus filters for status, price, beds and baths, property type, and advanced fields.",
    youtubeId: "7k2biCt15gc",
    modalText:
      "Walkthrough of a property search page backed by real MLS data, with organic typing for location and faceted filters across status, price, beds and baths, type, and advanced criteria.",
    modalDetail: `This is an example of a search page that searches against real MLS data.

The experience mirrors what users expect from platforms like Zillow: you can search by city, zip code, city and state, or whatever location format fits the query. As you type, location suggestions resolve organically.

Beyond location, the page supports filtering by listing status, price, beds and baths, property type, and additional advanced search fields shown earlier in the flow.

In the demo, a lower price point is selected—useful in an expensive market—then Filter is applied. The results surface affordable homes within shouting distance of Yonkers.`,
  },
{
    id: "45dzo3peo2k",
    title: "MenuViolet MVP",
    date: "2024",
    excerpt:
      "Digitize restaurant menus from a photo, then interact with items independently—accessibility-first contrast, voice playback, and personalization for foodies and diners with visual needs.",
    youtubeId: "45dzO3PeO2k",
    modalText:
      "MenuViolet turns a photo or download of a restaurant menu into an interactive, accessibility-first experience—local AI recreation, voice playback with speed control, and contrast you set for your own eyes.",
    modalDetail: `MenuViolet is a mobile application that creates a digital representation of menus from your favorite restaurants and lets you interact with menu items on their own terms—standalone from how the printed menu was originally laid out.

Who it’s for: Anyone who wants to digitize favorite food menus and save favorite meals. It was also built with accessibility-first design principles for the nearly 2.2 billion people globally who struggle with daily visual tasks—like sitting down to a meal and reading a restaurant menu without asking for help.

Inspiration: The product was inspired by a visual accessibility expert who photographs hard-to-read text and uses phone zoom to make it visible. MenuViolet takes that a step further: a local AI model recreates the existing menu in an interactive format. Download a menu or take a picture; afterward the menu becomes interactive—playback menu items from a photo with full control over both voice and speed.

What “accessibility first” means here: From a visual perspective, the foreground and background colors of the information you consume can be set independently for your specific needs. Colorblind, dyslexic, visually compromised, or a combination—you choose the contrast that lets you read a menu appropriately. MenuViolet is accessibility-first, but not an accessibility-only app.

For foodies: Experiment with different items and the customizations you make. Modifications for allergies or preferences can turn a dining experience from two-star to five-star—lobster bisque with a side of cream, or a seafood dish without ingredients that make you sick. The app is a personal interface for tracking what you like and what you don’t when you go out to eat with friends.

Demo note: The walkthrough includes interactive playback of a sample item (e.g. grilled meatloaf with description and price) to show how a photo-derived menu becomes speakable, controllable content.`,
  },
{
    id: "cpbseuddjeq",
    title: "Product demo reel",
    date: "2018 — 2019",
    excerpt:
      "Legal GPS®—a step-by-step legal roadmap for entrepreneurs: interactive checkups, guided learning paths, attorney-approved templates, and a proprietary Legal Status Report.",
    youtubeId: "cPbSeuDdJeQ",
    enterSplash: ARCHIVE_VIDEO_ENTER_SPLASH,
    modalText:
      "Product walkthrough for Legal GPS® (legalgps.com), built with startup attorneys to guide owners through formation and growth—think TurboTax clarity, applied to small-business legal work. Aaron served as full-stack engineer and project owner (2018–2019).",
    modalDetail: `Legal GPS® is an all-in-one DIY platform that walks business owners through the legal side of starting and growing a company—without needing a law degree first. Built with top startup attorneys, it is marketed as “Your Small Business Legal Roadmap” on legalgps.com.

The product centers on interactive guidance: a legal checkup uses questions so founders surface issues they “don’t know they don’t know,” even when they assume a simple structure like a single-member LLC covers everything. Users sign up for on-demand access, learn at their own pace along step-by-step paths, complete those paths, and receive the proprietary Legal GPS® Legal Status Report. The library includes attorney-approved contract templates, guides, and in-depth tips—positioned at less than 1% of the cost of many traditional legal options. The site highlights typical outcomes such as about 117 hours saved and $5,500 in average user savings, with 300+ attorneys recommending the platform.

Coverage spans starting a company, hiring staff, day-to-day operations, trademarks, copyrights, trade secrets and patents, website agreements, and more—with pointers when rules vary by state, county, or city.

Aaron was Software Engineer / Project Manager (2018–2019), working in React, Node.js, Express, PostgreSQL, and Material UI on AWS-hosted infrastructure. He translated product vision into milestones, balanced UX with delivery, and shipped full-stack features from concept through production.

For entrepreneurs who would otherwise piece together blogs and free templates, Legal GPS® is meant to feel like a cheatsheet for legal steps that can otherwise derail a business early. This demo reel shows the guided flows and product polish behind that experience.`,
  },
{
    id: "8atginpr5ps",
    title: "ShareFile order portal",
    date: "2011",
    excerpt:
      "Custom client backend for order intake and fulfilled-document delivery—integrated with Citrix ShareFile so each customer only sees the folders and files you authorize.",
    /** Card thumbnail — first clip in the modal strip. */
    youtubeId: "yMchio1Ncbg",
    enterSplash: ARCHIVE_VIDEO_ENTER_SPLASH,
    modalText:
      "Walkthrough of a Genius Media Solutions build: submit orders, track fulfillment, and download delivered documents through your own site—authenticated on your app, powered by the ShareFile API behind the scenes.",
    modalDetail: `In custom business applications, customers place orders and you need to deliver a final product—often documents or folders of documents—to the right person. This project solves that by integrating Citrix ShareFile (Citrix’s secure file-sharing platform) via its API.

ShareFile lets you share files and folders with clients while restricting each client to only the information you assign. Because it exposes an API, we built a custom application on top of the platform rather than sending people to ShareFile directly.

The demo shows a custom backend where staff can submit a new order and clients can retrieve documents tied to their orders. Order details are defined in the UI; when a folder contains the fulfilled document, the action control turns green—signaling the client that delivery is ready. One click queries ShareFile and produces a downloadable document from within the logged-in website experience (not a separate ShareFile login).

For business owners stuck with Excel, manual handoffs, and many people touching an order pipeline, a system like this can replace a cumbersome process with something clean for both you and your customers.`,
    modal: {
      title: "ShareFile order portal",
      date: "2011",
      contextLabel: "Video context",
      intro:
        "Walkthrough of a Genius Media Solutions build: submit orders, track fulfillment, and download delivered documents through your own site—authenticated on your app, powered by the ShareFile API behind the scenes.",
      detailLead:
        "I performed a meta experiment between a new video service called Trupeer and the original video from 20 years ago.",
      detail: `In custom business applications, customers place orders and you need to deliver a final product—often documents or folders of documents—to the right person. This project solves that by integrating Citrix ShareFile (Citrix’s secure file-sharing platform) via its API.

ShareFile lets you share files and folders with clients while restricting each client to only the information you assign. Because it exposes an API, we built a custom application on top of the platform rather than sending people to ShareFile directly.

The demo shows a custom backend where staff can submit a new order and clients can retrieve documents tied to their orders. Order details are defined in the UI; when a folder contains the fulfilled document, the action control turns green—signaling the client that delivery is ready. One click queries ShareFile and produces a downloadable document from within the logged-in website experience (not a separate ShareFile login).

For business owners stuck with Excel, manual handoffs, and many people touching an order pipeline, a system like this can replace a cumbersome process with something clean for both you and your customers.`,
      enterSplash: ARCHIVE_VIDEO_ENTER_SPLASH,
      media: [
        {
          type: "video" as const,
          id: "sharefile-portal-primary",
          youtubeId: "yMchio1Ncbg",
          intro: "ShareFile order portal walkthrough.",
        },
        {
          type: "video" as const,
          id: "sharefile-portal-archive",
          youtubeId: "8aTGinpr5Ps",
          startSeconds: 54,
          intro: "Additional archive clip of the ShareFile order portal demo.",
        },
      ],
    },
  },
{
    id: "w5a0tpo6bou",
    title: "Deal Brewer POC",
    date: "2013",
    excerpt:
      "Location-based deals on an interactive map—redeem only inside a venue radius, wait while the offer “brews,” then present a scannable barcode at the bar or restaurant.",
    youtubeId: "W5A0TpO6BoU",
    startSeconds: 10,
    enterSplash: ARCHIVE_VIDEO_ENTER_SPLASH,
    modalText:
      "Early Deal Brewer POC: map centered on downtown Eugene, deals plotted around town, and redemption gated by proximity so offers are only valid when the patron is actually at the venue.",
    modalDetail: `Deal Brewer is an application that pulls up an interactive map, zooms to the user’s current location (demo recorded in downtown Eugene), and surfaces special offers around town—think free nachos at a specific bar.

A radius ring shows where you are. Deals outside that radius can’t be redeemed—the UI marks them in red during debugging, and attempting redemption shows that you must be within range (0.5 miles in the demo; production would use a much tighter radius so the person is truly on-site).

Inside the radius, you open a deal, see the venue name and details (e.g. free nachos), and start redemption. A short “brew” timer runs while the customer waits—30 seconds in the test build, with the product concept closer to ~15 minutes so they stay at the venue and spend on drinks and food before the free item unlocks.

When the deal is ready, the app shows a scannable barcode the patron can present to the bartender or owner to claim the offering.`,
  },
{
    id: "g-whj37xau0",
    title: "A worm that was meant for bigger things",
    date: "Archive",
    excerpt:
      "A short clip of a worm that was meant for bigger things—stray footage from the odds-and-ends pile.",
    youtubeId: "G-wHJ37Xau0",
    enterSplash: ARCHIVE_VIDEO_ENTER_SPLASH,
    modalText:
      "A short clip of a worm that was meant for bigger things.",
    modalDetail: `One of those odds-and-ends videos that never needed a product brief—just a worm with bigger plans.`,
  }
];

export const videoShowcaseCards = featuredWorkCards.slice(0, 4);
export const olderVideoShowcaseCards = featuredWorkCards.slice(4);

export const videoShowcaseSection = {
  id: "new-software-demos",
  eyebrow: "Video showcase",
  title: "New Software Demos",
  description: "Big, small, i've done it all. Here are some highlights of my journey.",
  cards: videoShowcaseCards,
} as const;

export const olderVideoShowcaseSection = {
  id: "older-videos",
  eyebrow: "Archive",
  title: "Older Video Showcase",
  description: "Earlier product demos and proof-of-concept walkthroughs from prior chapters of the journey.",
  cards: olderVideoShowcaseCards,
} as const;

export const animationStorySection = {
  eyebrow: "Motion & narrative",
  title: "Animation and story telling",
  description: "Click any card to open a video modal with animation samples and supporting context.",
  cards: animationStoryCards,
} as const;

const howThisSiteWorksMarkdown = `# Classic site → web component

Options → **Site archive · V1** does not load the live aaronduchateau.com domain. It mounts a **ported classic document root** from this deploy through \`<legacy-portfolio-archive>\`.

## Separate root on disk

Everything for V1 lives under \`public/archive/v1/\`:

- \`index.html\` — classic markup, **inline styles kept**, YouTube embeds kept, local \`img/*\` paths
- \`bootstrap/\` + \`jquery/\` — Bootstrap 2.3.2, jQuery 1.10, jQuery UI, helper (vendored locally)
- \`css/custom.css\` — archive chrome (still incomplete vs live)
- \`img/\` — classic photographs and project shots
- \`legacy-portfolio.js\` — the web component definition

No second Next.js compile. Static export copies \`public/\` into \`out/\`.

## How jQuery runs “inside” the web component

Scripts stuffed into a shadow tree with \`innerHTML\` **never run**. Even \`appendChild\`’d jQuery still queries the host \`document\`, so \`$('.navbar')\` misses the classic markup.

So the custom element hosts \`/archive/v1/index.html\` as its **own document** (same-origin). The WC is the API/shell; the nested root is where jQuery 1.10 + Bootstrap actually execute.

## Rebuild

\`node scripts/snapshot-legacy-portfolio.mjs [optional-html-dump]\` rewrites the HTML entry files and re-vendors Bootstrap/jQuery. Keep \`img/\` and \`css/custom.css\` alongside.

---

# Port log

*Real-time feed of figuring out this port together—decisions, challenges, mistakes, and what still looks wrong. Newest entries at the top.*

## 2026-08-09 — Nav outline + mobile accordion contrast (nightcap)

**Aaron:** Everything looks good except (1) a weird line around the main nav, (2) mobile accordion/collapse contrast is wrong. Document the fix strategy, ship the two fixes, call it a night.

**Nav outline:** Bootstrap 2’s \`.navbar-inner\` defaults include \`border: 1px solid #d4d4d4\` plus inset box-shadow. On a black bar that reads as a light rectangular stroke around the whole nav (desktop + hamburger view). **Fix:** archive overrides force \`border: 0\` and \`box-shadow: none\` on \`.navbar-inner\` / \`.navbar .container\`.

**Mobile accordion contrast:** Under Bootstrap’s \`max-width: 979px\` collapse, default link color is muted grey (\`#777\`) with light button chrome—low contrast on our light page / dark bar mix. **Fix:** dark collapse panel (\`#111\`), near-white nav links, darker hamburger control; also bump stacked work/employment (\`.bullet-b4\`, \`.work-desc*\`) to \`#333\` with stronger blue carets so the “accordion” stack stays readable.

## 2026-08-09 — Fixed footer, quote marks, top black bar, contact redaction

**Aaron:** Static footer wasn’t sticking; quote icons too small; big black line at top; put the black bar at the **bottom of the modal**; xxx out phone/email. Asked whether \`fixed\`/\`absolute\` work in the web-component context.

**Answer:** Yes—for our host model the classic page runs in a **same-origin nested document** (iframe viewport = modal content). \`position: fixed; bottom: 0\` on \`.footer\` is relative to that iframe, i.e. the bottom of the archive pane inside the modal—not the outer V2 page. Same for the fixed top \`.navbar\`.

**Root cause of wrong chrome:** We had reconstructed a thin \`custom.css\` instead of the real sheet from \`aaronduchateau.github.io/css/custom.css\` (~10KB). That sheet already defines:

- \`.footer { position: fixed; bottom: 0; width: 100%; background: black }\`
- \`.navbar { position: fixed; top: 0; width: 100%; background: black }\`
- \`.guts:before\` quote mark at **\`font-size: 350px\`** (we had ~7rem—far too small)
- \`.hr-custom-4/5\` as **invisible spacers** (our reconstruction painted visible rules → “big black line”)

**Fixes applied:** Copied the github.io \`custom.css\` into the archive, kept light-page overrides + fluid modal widths, forced footer/navbar fixed to the iframe edges, restored large quote marks, redacted footer to \`XXX-XXX-XXXX\` / \`XXXXXXXXXXXX@XXXXX.XXX\` (also in the snapshot script for future rebuilds).

## 2026-08-09 — Screenshot pack + modal width / top-menu responsivity

**Aaron provided** a large set of side-by-side references: live \`aaronduchateau.github.io\` vs the archive modal (black shell + light classic page). Clear deltas called out in those frames:

- Top nav crowding when the classic page is squeezed (Education link missing/clipped in the narrow modal; live full-bleed shows all five links with room)
- \`>\` bullets should read as **light-blue carets** (LegalGPS / StockBossUP), not grey/missing \`::before\`
- Blue title chips, Brunson attribution bar, \`.last-decade\` React/Node chip, quote marks, three-column education/employment grids
- Live content is a **centered ~1150px rail** on a light plate—not a dark theme

**Decision / fix in progress:**

1. **Widen the V1 archive modal** as far as practical (\`max-w\` ≈ viewport minus small gutters, taller \`96dvh\`) so the nested document’s iframe viewport is closer to a real browser width. That alone reduces false “responsive breakage” caused by hosting the classic site in a \`max-w-5xl\` box.
2. **Menu must respond to the modal (iframe) width, not only the user’s monitor.** Bootstrap collapse and our CSS media queries key off the **iframe viewport**. Fixed rails in archive CSS (\`.navbar-inner { width: 1110px }\`, \`.inner-div-height-margin { width: 1150px }\`) were crushing the top menu inside the modal—changed to **fluid \`width: 100%\` / \`max-width\`** plus tighter nav link padding under ~1100px / ~900px iframe widths.
3. Documented for the port: any future shadow-scoped or nested-document host must treat **container width = modal content width** as the responsive basis for the classic top menu.

**Still open after this pack:** pixel-matching remaining sections (employment three-up, Fresco quote row, testimonial quote geometry) against the new screenshots; confirm Education nav item always visible at the widened modal size.

## 2026-08-09 — Still broken: CSS source of truth (open)

**Working theory:** The live classic page does **not** get its look from JavaScript. Styling is **compiled/linked CSS and/or inline \`style=\`**. On the live host, \`css/custom.css\` and local Bootstrap paths often **404**, yet the browser still shows blue bars, \`>\` bullets, and light layout—so either cached CSS, a sheet we never captured, or more inline rules than we modeled.

**What we guessed wrong:** Treating the small Wayback \`custom.css\` (~2KB, dark \`body { color: white }\` + dark wells) as the visual source of truth. That produced the black “modal archive” screenshot that did not match the light live site.

**What’s still missing (called out by Aaron):** Bullet rendering and the exact **before/after** (CSS \`::before\` / \`::after\`) styling shown in the provided screenshots—not V2 Fun-things slide-reveals. A naive \`.bullet-b4:before { content: "> " }\` reconstruction is not faithful enough. More screenshots of broken vs live pairs would help close the gap.

**Decision challenged (#5):** “Leave images out / placeholders are fine.” → Later: **bring the images over** so the component can be judged on layout/CSS, not empty boxes. Images now live under \`public/archive/v1/img/\` (from classic \`aaronduchateau.github.io/img/\`). Wayback image URLs returned HTML, not binaries.

## 2026-08-09 — jQuery “inside” the web component

**Aaron asked:** Old jQuery should be able to run compiled inside the web component, right?

**Answer we landed on:** Yes—but only as a **real document**. \`innerHTML\` into shadow does not execute scripts; shadow-scoped jQuery still won’t see the classic DOM the way Bootstrap’s data-api expects. The WC therefore hosts the nested \`/archive/v1/index.html\` document so jQuery/Bootstrap run normally.

**Decision challenged (#4):** “No iframe / closed shadow markup injection is enough.” → Challenged when fidelity required a full classic runtime. Compromise: **web component shell** + **same-origin nested document root** (not the live domain).

## 2026-08-09 — Light site vs black archive (background)

**Aaron:** Black screenshot = our WC port (wrong). Other screenshots = how it actually looks now (light grey/white plate, dark type, sky-blue bars).

**Mistake:** Forced dark plate (\`#111\`, dark wells, inverted type) and called it “classic.” The live reference is a **light** page. Nested libraries and inline styles must come along; inventing a dark skin was incorrect.

**Decision challenged (#3):** “Archive should look like Wayback dark custom.css / backstretch-era chrome.” → Rejected. Match the **current light** rendering, including background that reads white/light grey—not a black shell.

## 2026-08-09 — Lazy port: more than images stripped

**Aaron:** Only images were supposed to be left out. Why isn’t the background right? Where are the before and afters? Feels like a lazy port.

**What went wrong in early snapshots:**

- YouTube iframes replaced with “Video placeholder”
- CSS \`url(...)\` nuked without light fallbacks
- Scripts dropped without a plan
- \`::before\` / \`::after\` / bullet chrome not ported from the real sheet
- Misread “before and afters” as V2 painting slide-reveals instead of **classic CSS pseudo-elements** (and bullet carets) from the screenshots

**Decision challenged (#2):** “Strip media and approximate with placeholders / dark CSS.” → Rejected. Keep embeds, inline styles, nested CSS/JS; only omit what we explicitly agree to omit (images were later restored anyway).

## 2026-08-09 — Separate root vs Lit/Stencil debate

**Aaron:** Want a **separate root**; it doesn’t necessarily need its own compilation process. Don’t reframe the ask as “hand-written custom element vs compiled WC.”

**What went right eventually:** \`public/archive/v1/\` as a nested static root (Bootstrap/jQuery/css/img) copied by Next \`public/\` → \`out/\`—no second toolchain.

**Decision challenged (#1):** Treating “web component” as needing Lit/Stencil/compile, or as “iframe vs nothing.” → Clarified: **isolation + faithful port**, separate root on disk; host mechanism secondary to visual/CSS fidelity.

## 2026-08-09 — “How this site works” placement

**Aaron asked for:** A **new section below** Animation and story telling—one card, no video, short description, modal body in **markdown** explaining the port.

**Mistake:** First shipped a fourth card *inside* Animation and story telling with a diagram/photo modal. Corrected to \`MarkdownArticleCardSection\` under Motion & narrative with this write-up + port log.

## Earlier / structural wins (keep)

- Options → Site archive · V1 modal shell (theme-neutral chrome, “since August 2006”)
- Snapshot script \`scripts/snapshot-legacy-portfolio.mjs\` (Node builtins only—no \`package.json\` deps for the classic stack)
- Vendored Bootstrap 2.3.2 + jQuery into the archive tree when the live host 404s those paths
- Preserving inline \`style=\` attributes from the HTML dump (e.g. \`color: #3a3a3a\`, \`.last-decade\` padding, \`#81bedb\` accents)

## Open questions

1. Where does the **authoritative** live stylesheet actually live if \`css/custom.css\` 404s on fetch—cache only, or another artifact we haven’t copied? (Working from \`aaronduchateau.github.io\` + screenshot pack for now.)
2. Finish pixel-matching quote marks, employment/education three-column rows, and Fresco block against the 2026-08-09 screenshot pack.
3. At which iframe width should Bootstrap’s collapse hamburger take over vs tightened inline links—tune against the widened modal.

*Next:* Walk the screenshot pack section-by-section; keep this log updated as each region lands.
`;

const adaPerfectionMarkdown = `# ADA Guy as a living proof of concept

ADA Guy (\`ada-first\`) is not a skin swap. It is a **high-contrast, rules-engine-gated** surface: paper and ink, reduced chrome, and layout flags that strip decorative noise so text stays legible. This log archives the revision process—**newest steps at the top**.

Each step title names the **premise** (what we found). The body always splits:

- **ADA refinement issue** — the problem that motivated the work  
- **ADA refinement action** — what we shipped (or explicitly deferred)

Agents follow the same shape via \`.cursor/rules/ada-perfection-log.mdc\`.

---

# Revision steps

## 2026-09-19 — Picking ADA Guy from Options had no explanation of why the theme exists

### ADA refinement issue
ADA Guy can look like a segregated “accessible skin.” Separate is not equal, and a silent theme swap left that premise unsaid.

### ADA refinement action
A simple note model (\`adaGuyThemeNote\`) drives a modal when ADA Guy is chosen as the site theme from Options or the theme playground. Intro states the baseline-for-training intent; the body frames Muffin ADA as a future contrast demo. Intro skip and already-selected picks do not open it.

## 2026-09-19 — Career timeline dots stayed hollow while cycling employers on ADA Guy

### ADA refinement issue
Active and past stops used a dark fill plus cyan glow. ADA Guy inverts \`surface-950\` to white and strips shadows, so every dot looked empty while cycling the top bar.

### ADA refinement action
Named roles \`.theme-career-dot--on\` / \`--off\` in \`src/components/ui/advanced/CareerTimeline.tsx\`. ADA Guy fills visited stops black and leaves later stops as a white plate with a black ring (\`src/app/globals.css\`). Other themes keep the existing accent border and glow.

## 2026-09-19 — Career employer marks still painted a per-role linear gradient on ADA Guy

### ADA refinement issue
\`.theme-employer-mark\` set its fill with an inline \`linear-gradient\`, so the ADA gradient wipe never reached it. Colorful plates sat behind black initials and broke the paper/ink contract.

### ADA refinement action
The mark role now owns the fill via \`--employer-mark-from\` / \`--employer-mark-to\` (\`src/components/EmployerMark.tsx\`, \`src/app/globals.css\`). ADA Guy uses a solid white plate, hides the grid/blob overlays, and keeps black initials. Other themes keep the employer color gradient.

## 2026-09-19 — Opening a modal painted a focus ring on the first control in every theme

### ADA refinement issue
Programmatic autofocus on modal open showed a blue/white ring on the first button. That is useful in ADA Guy; on other themes it looked like a stuck selection and was not a keyboard user.

### ADA refinement action
\`useModalAccessibility\` now auto-focuses the first control only when \`data-theme\` is \`ada-first\` (or when a caller passes \`autoFocus: true\`). Tab still traps. Intro splash still passes \`autoFocus: false\`.

## 2026-09-19 — Repair album “Final result” badge read as a finished photo, including an AI mock

### ADA refinement issue
The last Camaro shots are an AI stand-in; the car was sold before final paint. A badge that said Final result implied those frames were the real finished car.

### ADA refinement action
The repairs badge now says Intended final result (\`src/components/MediaModal.tsx\`). Camaro copy after “the dragon” is bold: sold before final paint, AI used to show the intended outcome (\`src/data/content.ts\`).

## 2026-09-18 — Testimonial footer still showed the full legal name under a given-name intro

### ADA refinement issue
Intro copy and TTS use the first name. The letter footer still printed the JSON full name, so the play control’s visible byline and its accessible name disagreed with the intro.

### ADA refinement action
Footer byline and play/pause labels use \`testimonialFirstName\` in \`src/components/TestimonialSpeechFooter.tsx\`. Full name stays in JSON and on the portrait \`alt\`.

## 2026-09-17 — Intro announced the full legal name while the card only needed the given name

### ADA refinement issue
The intro live region and TTS read the JSON full name. Listeners heard a longer label than the large on-screen given name, and one letter was still titled Chris.

### ADA refinement action
Intro copy, Mimi’s name read, and the live region use the first token of \`name\` (\`src/lib/testimonialIntro.ts\`). Full name stays in JSON and on the letter footer. The Chris letter is labeled Adam. Doug’s quote includes “as a web developer” so karaoke and speech share the article.

## 2026-09-17 — Playlist jumps skipped a named introduction of the next letter

### ADA refinement issue
Auto-play and next/previous jumped straight into the quote. Screen-reader users never heard a labeled intro of who was speaking, and the portrait moved without a reduced-motion alternative.

### ADA refinement action
Each playback letter now opens on a character intro: name and credentials are the visible copy, announced as \`Introducing {name}, {title}\`. Take My Word plays, then the Mimi female voice reads name and title. The portrait drop is CSS-only and off under \`prefers-reduced-motion\` (photo is already in the karaoke slot). Footer play/pause still controls the intro; X still returns to the letter.

## 2026-09-17 — Male letters are trialing Google UK English Male (same engine class as Mimi)

### ADA refinement issue
Local male voices needed chunking and missed per-word callbacks. Google UK English Male is the Chrome counterpart to Mimi’s Google UK English Female (word boundaries, full sentences). We had skipped it for choppiness; this trial restores it with flat pitch so we can compare highlighting and timing without dropping the local-male chunk path.

### ADA refinement action
Male pick prefers Google UK English Male when installed. That Google male uses the full-sentence path (no 12-word pauses). Alex chunk / slash / early-\`end\` logic remains for non-Google male fallbacks. Revert steps are commented in \`src/lib/testimonialSpeech.ts\`.

## 2026-09-17 — Female karaoke picked up male TTS chunk pauses mid-sentence

### ADA refinement issue
Fixing local male voices by speaking 12-word chunks applied to every letter. Network female voices already spoke a full sentence cleanly, so listeners heard a random pause (e.g. between “for” and “bugs”) that was not in the quote.

### ADA refinement action
Speech strategy is split by gender: female letters speak the whole sentence again (same path that was working). Male letters keep short chunks, slash sanitizing, and early-\`end\` resume. Karaoke still holds the last word before the next sentence.

## 2026-09-17 — Male karaoke jumped to the last word after about twenty words

### ADA refinement issue
Long male utterances died mid-sentence (Chrome cutoff, local-voice pause/resume, or \`/\` tokens). We treated engine \`end\` as “go to the last word,” so the large sentence skipped ahead and the rest of the line was never highlighted. Comma and slash lists (e.g. React / Java) made the mismatch worse.

### ADA refinement action
TTS now speaks short chunks (preferring comma pauses) while the full sentence stays on screen. Slashes/pipes are spoken as commas; punctuation-only tokens attach to the previous word. Local voices disable EasySpeech \`infiniteResume\` so a pause does not fire \`end\`. Early \`end\` resumes from the next word instead of jumping to the last.

## 2026-09-17 — Engine \`end\` skipped the last spoken word before the next karaoke sentence

### ADA refinement issue
Chrome often fires SpeechSynthesis \`end\` at the start of the last word (timing varies by voice). We treated that as permission to swap the large sentence. Keyboard and low-vision users lost the last word on screen, and the next utterance cancelled the tail of the previous one.

### ADA refinement action
After \`end\`, karaoke holds on the last word for the remaining estimated audio (from the last word-boundary, not a fixed sleep). The next sentence or letter starts only after that hold. Chained utterances pass EasySpeech \`noStop\` so we do not \`cancel()\` the tail. Pause during the hold stays on the last word; resume continues to the next sentence.

## 2026-09-17 — Next/previous in karaoke dropped back to the letter, and a finished reading had no path to the next person

### ADA refinement issue
While speech was playing, the next and previous controls still reset to the readable letter, so keyboard users lost playback mode. Finishing a letter also dropped to idle with no announcement of the next speaker, so a playlist-style listen required hunting each card again.

### ADA refinement action
Playback mode now survives next/previous (and swipe): playing continues on the new letter, paused stays paused. When a letter finishes, reading advances to the next testimonial and a polite live region announces \`Reading {name}\`. The X stop control still returns to the letter. Prev/next names mention “keep reading” only while karaoke is on.

## 2026-09-17 — Karaoke pause under the sentence duplicated footer pause and left no way back to the letter

### ADA refinement issue
Playback added a second pause/resume control under the large sentence with the same name as the footer avatar control. Keyboard users could pause twice, but could not dismiss karaoke and return to the readable letter without waiting for speech to finish.

### ADA refinement action
The control under the sentence is a named stop (\`Stop reading and show the letter from …\`) that cancels speech and restores the transcript. Footer play/pause beside the portrait is unchanged. While playing, a low-alpha \`--accent-400\` wash fades in under the full-width divider and footer, then fades out to a flat seam when playback stops.

## 2026-09-16 — Testimonial playback hid the letter without a named mid-pause or reduced-motion word scale

### ADA refinement issue
Sentence karaoke replaces the full letter while speech plays. If the transcript disappeared from the accessibility tree without a labeled pause in that view, keyboard users could only stop from the footer. Per-word scale would also thrash under \`prefers-reduced-motion\`.

### ADA refinement action
The faded transcript is \`aria-hidden\` during play/pause; the large sentence is the visible copy (OS TTS already speaks). A second named pause/resume control sits under the sentence. Word scale is off when reduced motion is on; active words still use accent/heading tokens. Footer play/pause is unchanged.

## 2026-09-16 — Testimonial letters had no named control to hear the quote

### ADA refinement issue
The testimonial dialog only showed the letter as text. There was no labeled play/pause control, so keyboard and screen-reader users could not start or stop a reading of the quote. A dancing divider must stay decorative and respect reduced motion.

### ADA refinement action
The footer row is one named button (\`Play testimonial from …\` / pause / resume). A play circle sits beside the portrait (not an overlay). Playback uses client-side \`easy-speech\`. The footer seam reuses \`DividerWave\` (\`aria-hidden\`); reduced motion keeps a stationary tick. Word-level emphasis is deferred; \`boundary\` events are reserved on the speech helper.

## 2026-09-16 — Testimonial dialog still announced itself as Recommendation

### ADA refinement issue
The section eyebrow already said Testimonials, but the letter dialog heading and control names still said Recommendation. Keyboard and screen-reader users heard a different surface name than the in-page nav.

### ADA refinement action
The dialog title is Testimonials. Close, previous, next, and card open labels now say testimonial / testimonials. ADA Guy close hammers match \`Close testimonials dialog\`. Decorative hint class \`.theme-recommendation-hint\` is unchanged.

## 2026-09-15 — Heading, ghost, hairline, and success still used white/emerald utilities as the theme API

### ADA refinement issue
Section, card, and modal display headings were hardcoded \`#fff\`. Ghost buttons used \`text-white\` / \`bg-white/10\`. Quest complete and media “Final” badges used emerald utilities. ADA Guy’s \`--heading\` token (\`#000000\`) and paper/ink contract could not paint those roles without substring hammers.

### ADA refinement action
Added \`hairline\`, \`ghost-fill\` / \`ghost-ink\`, and \`success-fill\` / \`success-ink\` slots. ADA Guy overrides them to black. \`.section-display-heading\`, \`.card-display-heading\`, \`.modal-display-heading\`, and the full-screen quote now read \`var(--heading)\`. Ghost CTAs use \`.theme-ghost-cta\`; success pills/badges use \`.theme-success-badge\`. Existing ADA hammers remain as a backstop.

## 2026-09-14 — Theme-card CSS compact must not replace ADA list rows

### ADA refinement issue
Demo / video / article strips were collapsing to \`MobileContentList\` with JS. Unifying those plates onto \`Card\` and restyling the same DOM at 767px would have turned ADA Guy’s phone row (whole-row button, no cover, excerpt gone) into a CSS-squashed \`<article>\` whose only control is the CTA — the interaction model the 2026-08-11 card-top step rejected.

### ADA refinement action
Documented / no behavior change on ADA Guy. \`compactAtPhone\` and the CSS row restyle apply only when \`decorativeCardMedia\` is on. ADA still omits the cover, keeps the article + CTA shell on desktop, and keeps \`MobileContentList\` on phone (\`InteractiveDemoCardSection\`, \`YouTubeCardSection\`, \`MarkdownArticleCardSection\`).

## 2026-09-11 — Cyan/slate CSS aliases were still the apply path

### ADA refinement issue
After card/CTA roles landed, apply still copied accent/surface into \`--cyan-*\` / \`--slate-*\`. Seek bars, the theme-music wave, and contribution photo veils read those hue names. ADA Guy’s hammer still targeted \`bg-cyan-*\` / \`from-slate-*\` class substrings — a contract that would miss the new role classes and keep a fake hue in the pipeline.

### ADA refinement action
Dropped the shim (\`applyTheme\`, \`:root\`, Tailwind \`cyan\`/\`slate\` maps). Seek fill is \`.hero-video-seek\` + \`--seek-progress\`; contribution veils are \`.theme-card-photo-veil\`; the music wave reads \`--accent-400\`. ADA Guy wipes those roles and matches \`from-surface-*\` / \`bg-surface-950\` instead of cyan/slate class names.

## 2026-09-11 — Hue-named cyan utilities were the theme API

### ADA refinement issue
Card titles, eyebrows, CTAs, and the demo badge used \`text-cyan-*\` / \`bg-cyan-*\`. Those names are a lie — apply copied accent channels into \`--cyan-*\` so the old utilities still painted. ADA Guy then had to hammer substring selectors like \`[class*="bg-cyan"]\` to force paper/ink. Hover on \`.card-display-heading\` (\`group-hover:text-cyan-100\`) and primary fills would miss the contract if we only renamed the class.

### ADA refinement action
Slots now own those roles (\`card-title-hover\`, \`card-cta\`, \`card-meta\`, \`section-eyebrow\`, \`muted-copy\`, \`primary-cta-fill\`, \`demo-badge-*\`). Role CSS reads \`rgb(var(--slot-…) / alpha)\` — channels in the slot, wash on the role. ADA Guy paints the same roles black/white and \`.theme-primary-cta\` ink, instead of depending on a cyan class name. Leftover utilities are \`text-accent-*\` / \`bg-surface-*\` until those surfaces get roles too.

## 2026-09-10 — Prize toasts longer than five seconds need a named hide control

### ADA refinement issue
Lengthening the unlock toast and auto-queuing a card award puts moving information over the page for more than five seconds. A filling outline without a hide control would fail Pause, Stop, Hide, and a low-contrast cyan chase would fail ADA Guy’s paper/ink contract.

### ADA refinement action
Each toast has a named dismiss (\`.theme-prize-toast__dismiss\`) and Escape. The hold clock is \`.theme-prize-toast__chase\` along the silhouette (decorative; copy is \`aria-live\`). ADA Guy uses a white fill, black track/chase, and black type. \`prefers-reduced-motion\` skips the fly and the chase.

## 2026-09-10 — Locked gallery media must veil like quest cards

### ADA refinement issue
Locked Fun things photos used a thin overlay and grayscale only, so the main pane and thumbnails still read as the photo. ADA Guy also cannot rely on smear-blur to hide content without a named high-contrast veil.

### ADA refinement action
\`.theme-media-locked\` blurs the image on thumbs and the main pane the same way as \`.theme-quest-card--veiled img\`. ADA Guy drops the smear, uses a high-contrast grayscale veil, and \`.theme-media-lock-veil\` keeps a black lock on a light plate.

## 2026-09-10 — Watch on YouTube stays hidden until the modal strip is unlocked

### ADA refinement issue
Watch on YouTube jumped straight off-site, and a disabled lock-only CTA still announced a destination that was not available while other items in the strip were gated.

### ADA refinement action
The YouTube CTA is omitted until every item in the modal tree is unlocked (\`applyFeatureGates\`). Clicking it swaps the player for shared \`.theme-primary-cta\` leave-confirm (\`LeaveSiteConfirm\`, phase 2) — title, URL, Visit Site, and the leaving prompt — with the paddle X to cancel and the modal X to close. ADA Guy keeps the existing primary-CTA / black-type contract.

## 2026-09-10 — View unlocked content type must match Download

### ADA refinement issue
The board drill-down “View unlocked content” control inherited a smaller parent face, so it did not read at the same size as Download.

### ADA refinement action
\`.theme-quest-view-unlock\` now shares Download’s 0.75rem / 600 weight and adds 1rem space above the control. ADA Guy still uses black underlined type.

## 2026-09-10 — Easter-egg “View unlocked content” must stay a named control

### ADA refinement issue
Unlocked prizes (sounds, themes, gated clips) had no named way to open the granted content from the board drill-down. A color-only hint would fail if the destination were not tied to a control.

### ADA refinement action
\`.theme-quest-view-unlock\` is a real button that routes via query params (\`?options=\` or \`?modal=\` + \`item\`). ADA Guy uses black underlined type, same as the card download link.

## 2026-09-08 — Intro stats veil on every layout; lock glyph stays quiet color

### ADA refinement issue
Phone stats sat on a fade that lost to the portrait (and a full-plate lock overlay), while the desktop stats column had no named plate. The lock disc also competed with greyscale art.

### ADA refinement action
\`.theme-intro-character-stats-veil\` covers the phone overlay and the desktop stats column (\`--column\`). The lock is a small cyan glyph plus label, not a covering plate. ADA Guy uses a near-solid white stats plate and a black lock glyph.

## 2026-09-08 — Phone intro stats must sit on a dark veil over the portrait

### ADA refinement issue
On phone, character stats overlay the right half of the portrait. A thin fade left the bars competing with busy hero photos.

### ADA refinement action
\`.theme-intro-character-stats-veil\` is a substantial left-fading dark plate (\`pointer-events-none\`) behind the compact stat bars. ADA Guy uses a near-solid white plate instead of a dark fade.

## 2026-09-08 — Easter-egg intro software note must stay a real checkbox

### ADA refinement issue
The software-mode opt-in sat on splash Continue, so the easter-egg board intro had no named control to pick a theme and enter the game, and the limitation copy was easy to miss.

### ADA refinement action
\`.theme-software-mode-optin\` shows on the easter-egg board intro only for Software Guy in software-portfolio-only mode. Continue with the box checked opens the Try it yourself theme playground via \`?modal=demos:theme-playground\`. After a pick, the board returns at \`?modal=easter-eggs:board\` without the checkbox. ADA Guy keeps black type and a 2px black focus edge.

## 2026-09-08 — Recommendation close must sit on a readable plate at the top-right

### ADA refinement issue
On the wide recommendation dialog the close control sat on the title row, too low, and used a hollow ring over the faded portrait so the X could disappear into the photo.

### ADA refinement action
Desktop uses \`.theme-modal-close-plate\` — the same filled \`var(--background)\` circle as the major-projects expand close — pinned to the glass top-right. Phone keeps the inline close next to prev/next. ADA Guy uses a white plate, black X, and a black edge.

## 2026-09-08 — Software-only theme opt-in must stay a real checkbox

### ADA refinement issue
Software Portfolio Only skipped the intro game, so there was no labeled control to opt into picking a character. A color-only hint would also fail if the limitation copy were not tied to a name.

### ADA refinement action
\`.theme-software-mode-optin\` is a labeled checkbox above Continue, with a note that points still count and some content stays hidden. ADA Guy uses black type and a 2px black focus edge. The software-only layout fact is applied in the rules engine so other themes do not restore playful strips.

## 2026-09-08 — Section menu jumps must land on the labeled subtitle

### ADA refinement issue
Work / Education / Testimonials hash links targeted the section box. Combined with \`py-20\` and \`scroll-mt-24\`, the uppercase subtitle sat far below the sticky nav, so keyboard and in-page jumps did not show the section name at a predictable offset.

### ADA refinement action
Each jump id lives on the section eyebrow with \`.theme-section-anchor\` (\`scroll-margin-top: 72px\`) so the subtitle sits 72px from the viewport top on phone and desktop, just under the sticky nav.

## 2026-09-08 — Locked intro characters must stay previewable and clearly locked

### ADA refinement issue
Cycling a locked roster slot on \`/intro\` was snapped back to the default theme, so the lock state never stayed on screen. Enter portfolio also looked like a normal proceed CTA even when it opened the easter-egg board instead of the site.

### ADA refinement action
Intro may apply a locked theme for look + theme music. The portrait uses grayscale plus \`.theme-intro-character-lock\` (named lock plate, not \`theme-decorative\`). Enter portfolio stays a real control with a lock glyph and an aria-label that names the easter-egg board. ADA Guy uses a white plate and a 2px black edge. Main-site locked picks still open the board.

## 2026-09-08 — Recommendation modal portrait hint must stay decorative

### ADA refinement issue
A low-opacity background portrait in the recommendation modal would compete with quote text if it were treated as content, and it would fail paper/ink on ADA Guy.

### ADA refinement action
\`.theme-recommendation-hint\` is \`theme-decorative\` and \`aria-hidden\`. ADA Guy hides it. The footer portrait remains the identified photo with an accessible name.

## 2026-09-08 — Intro sound restore must stay a named, disabled-safe control

### ADA refinement issue
Restoring default click and content-window sounds from a tiny icon next to theme music can fail if the control has no name, or if the inactive state disappears into the header.

### ADA refinement action
\`.theme-sound-restore\` is a real button with an explicit aria-label. It is \`disabled\` until Base Clicks or Content Windows differ from first-load defaults. ADA Guy uses a white plate, black glyph, 2px black edge (dashed when inactive).

## 2026-09-08 — Veiled-card unlock hint must stay readable and centered

### ADA refinement issue
“Complete the task above to unlock the content” sits on the blurred prize photo. Left-aligned copy and no edge separation made the line hard to read on decorative themes. A splash-colored shadow on ADA Guy would also fail paper/ink.

### ADA refinement action
\`.theme-quest-card__lock-hint\` is centered with a short dark drop shadow so the sentence stays over the art. ADA Guy keeps black type and \`text-shadow: none\` on the mystery plate.

## 2026-09-05 — Phone flyout must name Themes, Options, and the easter board

### ADA refinement issue
The phone hamburger only listed section jumps. Themes, Options, and the easter-egg board were icon/text controls in a tighter header, easy to miss and unnamed as flyout destinations.

### ADA refinement action
The mobile flyout adds explicit **Themes** (theme playground modal), **Options** (same Options menu as the header), and **Easter egg board** buttons. Each has a visible label. Header clicks dismiss the flyout first so those controls are not trapped under an open dialog.

## 2026-09-05 — Phone section links must stay reachable from the top bar

### ADA refinement issue
Work, Education, and Testimonials disappeared on phone width (\`hidden\` below the old \`sm\` show). There was no labeled control to jump those sections, so keyboard and screen-reader users lost the same in-page nav desktop still had.

### ADA refinement action
A hamburger (left of Aaron) opens a left flyout with the same destinations. The control has \`aria-expanded\` / \`aria-controls\`; the panel is a named dialog. Choosing a link scrolls to the section and closes the menu. ADA Guy paints \`.theme-nav-hamburger\` and \`.theme-nav-flyout\` as paper/ink with a 2px black edge.

## 2026-09-05 — Phone trailer chooser heading must stay available to AT

### ADA refinement issue
The “Choose a viewing mode” line was eating vertical space on phones and pushing the mode buttons below the fold. Removing it from the accessibility tree would leave the chooser unlabeled.

### ADA refinement action
On phone width the heading is \`sr-only\` (visible from \`md\` up). The two mode buttons keep their own names. Play/pause on the trailer is a dedicated toggle and is ignored by the page-wide pause listener so a tap does not pause-then-play.

## 2026-09-05 — Modal info/back chrome must stay a real button

### ADA refinement issue
Phone and tablet modals used text “View context” / “Back” rows that cost height. Icon-only replacements can fail if they are unlabeled or low-contrast.

### ADA refinement action
\`.theme-modal-chrome-btn\` is the hamburger-sized control (info or back). It has an explicit \`aria-label\` (“View context” / “Back to media”). ADA Guy uses a white plate, black type, and a 2px black border. Laptop still shows both columns; the compact icons stay \`lg:hidden\`.

## 2026-09-05 — Drill-in close fill and mobile scroll must stay readable

### ADA refinement issue
A transparent close circle would hide the X over busy project photos, and an instant jump on expand would lose the close control under the nav.

### ADA refinement action
\`.theme-content-list__reveal-close\` fills with \`var(--background)\` (solid white on ADA Guy, black X). Phone-width expand smooth-scrolls the card to 150px from the top; \`prefers-reduced-motion: reduce\` uses an instant scroll instead.

## 2026-09-05 — Sibling project rows at 20% still cannot fade on ADA Guy

### ADA refinement issue
Decorative themes now dim non-expanded project rows to 20%. That would make ADA Guy list copy unreadable.

### ADA refinement action
\`.theme-content-list__item--dim\` is 20% opacity on decorative themes only. ADA Guy still forces full-opacity ink. The close control is 10% smaller and inset to the card’s visible corner; it remains the circular button role.

## 2026-09-05 — Expanded project close sits on the corner; siblings must stay readable

### ADA refinement issue
The drill-in close control moved to the true card corner and grew. Fading the other list rows to 50% would drop ADA Guy body copy below paper/ink contrast.

### ADA refinement action
Close stays the existing circular button role at \`lg\` (larger hit target). Sibling rows use \`.theme-content-list__item--dim\` at 50% opacity on decorative themes only; ADA Guy keeps full-opacity ink on every row.

## 2026-09-05 — Phone list rows are dividers, portraits stay identifiable

### ADA refinement issue
Boxed list rows added extra inset and chrome. Testimonial faces also need a circular, grayscale thumbnail so the person stays recognizable without looking like a full color card.

### ADA refinement action
\`.theme-content-list\` uses top padding (not jammed under the section lede) and flush rows with a bottom divider only. ADA Guy keeps a 2px black bottom rule, black type, and a 3px focus ring. Testimonial graphics use \`.theme-content-list__graphic--circle\` + grayscale. Major-project expand uses the existing close-button role on the original card.

## 2026-09-05 — Phone-width content list must stay a real control

### ADA refinement issue
Phone-width main-screen cards collapse to a compact list (date, title, graphic). A low-contrast row or a decorative-only target would fail paper/ink and hide the open action.

### ADA refinement action
\`.theme-content-list__row\` is a named button role (white plate, black type, 2px black border, 3px focus ring on ADA Guy). Date and title inherit ink. Decorative graphics hide when \`decorativeCardMedia\` is off; the row stays a full-width button. Modals are unchanged.

## 2026-09-05 — Quiz check-all questions need native checkboxes

### ADA refinement issue
Quiz Power now has “check all that apply” items. Fake toggle buttons would hide the multi-select pattern from assistive tech, and a low-contrast tip would fail paper/ink.

### ADA refinement action
Multi questions use a \`fieldset\` + \`legend\` (\`.theme-quiz-tip\`) and native checkboxes inside \`.theme-quiz-choice--multi\`. ADA Guy keeps white plates, black type, a 2px black border, and a black checkbox accent. Continue is the existing primary CTA role.

## 2026-09-05 — Quiz retake is a real text control under Download

### ADA refinement issue
Quiz Power can be retaken after a pass. A low-contrast “Retake quiz” line under Download would fail paper/ink, and a fail after a pass must not read as losing the prize.

### ADA refinement action
\`.theme-quest-quiz-retake\` is a named text-link role (black underline on ADA Guy). Fail copy after an earlier pass says the card stays unlocked. The unlock is still the one-time \`quiz.complete\` award — a later fail does not revoke it.

## 2026-09-04 — Locked card download must not look like a live link

### ADA refinement issue
Drill-down always offered “Download trading card.” If the prize is still veiled, a real download link would leak the art and read as an available action.

### ADA refinement action
Incomplete quests use a locked button (\`.theme-quest-card-download--locked\`) with \`SoundLockIcon\` and name “Download trading card (locked).” Click jiggles via \`animate-wiggle\` and does not download. ADA Guy keeps black type and no underline on the locked control. The real \`<a download>\` appears only after the quest is complete.

## 2026-09-04 — Board header score and flush drill bar need contrast

### ADA refinement issue
The easter-egg header now shows “Current score” beside the title, and drill-in chrome is a full-width bar above the scrollport. A same-color label/number pair or a translucent bar over paper would fail.

### ADA refinement action
\`.theme-quest-board-score__label\` is black regular-weight type; \`.theme-quest-board-score__value\` is black, extra-bold, underlined (distinct without color). \`.theme-quest-detail-bar\` stays a white plate with a 2px black border, flush to the modal, not inside the scroll region.

## 2026-09-04 — Quiz Power needs paper/ink controls

### ADA refinement issue
Quiz Power is a new board category with multiple-choice prompts, Right/Wrong results, and a decorative confetti burst. Cyan choice plates or a particle wash would fail ADA Guy’s reading surface, and confetti is noise.

### ADA refinement action
Named roles \`.theme-quiz-choice\` and \`.theme-quiz-result\` use a white plate, black type, and a 2px black border on ADA Guy. Confetti is \`.theme-decorative\` (hidden). Right vs Wrong is the text label only — the answer key is never shown.

## 2026-09-04 — Portfolio-game board intro must stay paper/ink

### ADA refinement issue
Every easter-egg board now opens on a themed intro (splash art + two actions). Decorative card-fan art and cyan title washes would fail ADA Guy’s paper/ink reading surface.

### ADA refinement action
\`.theme-quest-board-intro\` is a named role. ADA Guy uses a white plate, black title/copy, and a solid black action divider. The splash graphic is \`.theme-decorative\` so it hides with other chrome. Controls stay the existing ghost + primary CTA roles (Go back / Continue only).

## 2026-09-04 — Quest-detail card download needs a readable text control

### ADA refinement issue
Drill-down now offers a trading-card download in the copy column beside the prize. A low-contrast cyan link or a button that inherits menu/CTA chrome would fail paper/ink and blur into other controls.

### ADA refinement action
\`.theme-quest-card-download\` is a named text-link role. ADA Guy uses black underlined type on the white board. Other themes keep token cyan. The control is a real \`<a download>\` with an accessible name, only on quest detail (not the list).

## 2026-09-04 — Quest-row hover filters were flashing prize photos

### ADA refinement issue
Easter-board list rows used the shared \`theme-btn-shape\` hover contract (brightness/filter/transform). That painted the peeking animal card on hover and would also flash photos on ADA Guy’s paper plate.

### ADA refinement action
Rows are the \`.theme-quest-row\` role only. ADA Guy keeps a white plate, black 2px border, and black title/bounty/chip type (\`src/app/globals.css\`). Theme button hover filters no longer apply. The hover orb is a radial wash (no CSS \`filter\`) and stays \`theme-decorative\`.

## 2026-09-03 — Quest-row hover glow is the same decorative chrome as Education

### ADA refinement issue
Easter-board list hover now uses the University card orb (blurred corner gradient). On ADA Guy that wash is decorative noise over the status header and bounty copy.

### ADA refinement action
The orb is \`.theme-quest-row__glow.theme-decorative\`, so ADA Guy already hides it with other \`theme-decorative\` chrome. No extra splash motion remains.

## 2026-09-03 — Quest detail title bar needs ADA contrast

### ADA refinement issue
Quest drill-down now has a tinted title row (name, Available/Complete, close). A translucent cyan wash would fail paper/ink on ADA Guy.

### ADA refinement action
\`.theme-quest-detail-bar\` is a named role. ADA Guy uses a white plate with a 2px black border and no radius. Other themes keep a low-alpha accent fill from \`--cyan-400\`.

## 2026-09-03 — Mystery-card lock hint and mission underline need ADA contrast

### ADA refinement issue
Clicking a veiled prize card in quest detail now swaps the \`?\` for a lock plus “complete the task above…” and draws a line under the mission blurb. A decorative splash-colored underline or a low-contrast lock caption would fail paper/ink.

### ADA refinement action
Lock glyph and hint stay black on the mystery plate. Mission underline (\`.theme-quest-mission\`) is a solid 3px black bar on ADA Guy (no cyan/aura gradient). Hover splash stays hidden. The hint control is a real button with an accessible name.

## 2026-09-03 — Quest-card hover splash is decorative chrome

### ADA refinement issue
List rows now wash a theme-colored splash under the prize card on hover. On ADA Guy that motion and extra color would compete with the status header and the \`?\` on veiled cards.

### ADA refinement action
\`.theme-quest-card__splash\` is hidden on ADA Guy. Status headers stay black/white/grey (Available vs Complete still inverted so they are not the same color). Cards stay upright with no drill-in tilt.

## 2026-09-03 — Quest-row status bars and lighter veils still need ADA contrast

### ADA refinement issue
Easter-board list rows now use a full-width Available / Complete / Locked header, larger prize cards, and a lighter photo veil. Translucent cyan/slate bars, tilted motion, or a smear-blur that hides the \`?\` would fail ADA Guy’s paper/ink contract.

### ADA refinement action
Named \`.theme-quest-row__status\` roles: Complete is black on white-inverse (white type on black), Available is black type on white with a solid divider, Locked is black type on light grey with a dashed divider. Prize cards stay upright (no tilt). Veiled photos use a lighter blur so color/shape show, with a black \`?\` and no dark overlay (\`src/app/globals.css\`).

## 2026-09-03 — Veiled prize cards still need a readable mystery mark

### ADA refinement issue
Incomplete easter-board cards now show a blurred prize photo under a question mark. On ADA Guy a heavy veil or low-contrast \`?\` would hide whether the card is locked.

### ADA refinement action
Unrevealed cards keep the \`.theme-quest-card__mark\` \`?\` over a blurred image (\`.theme-quest-card--veiled\`). ADA Guy lightens the photo, drops the dark overlay, and keeps a black \`?\` on the white/dashed mystery plate.

## 2026-09-02 — Closing Fresco splash must not hide ADA type

### ADA refinement issue
The Fresco quote dropped its boxed plate for a decorative splash behind the copy. A theme-colored vector under the quote would be chrome on ADA Guy and could fight the paper/ink contrast.

### ADA refinement action
Quote shell is transparent (no card). Splash is the \`.theme-closing-quote__splash\` role and is hidden on ADA Guy with other decorative chrome. Quote and attribution stay black on the paper page; the photo ring stays black.

## 2026-09-02 — Easter-chest nav control used amber that failed theme contrast

### ADA refinement issue
The treasure-chest score control in the top nav used hardcoded amber icon/digits. On ADA Guy (and several other themes) that amber sat on a mismatched plate and was hard to read next to Options and Sound.

### ADA refinement action
Gave Options and the chest a shared \`.theme-nav-control\` role. Icon and score inherit the control color. ADA Guy paints that role white/black like other shaped nav buttons (\`src/app/globals.css\`).

## 2026-09-01 — Closing Fresco quote needed ADA contrast

### ADA refinement issue
The themed remake of the classic Jacque Fresco quote row uses display type and a cyan attribution color. On ADA Guy those would sit on a dark-tinted card and fail contrast.

### ADA refinement action
Added a named \`.theme-closing-quote\` role in \`src/app/globals.css\`. ADA Guy uses a solid white plate, black type for quote and attribution, and a black circular photo ring. Decorative aura stays off via existing \`theme-quote-aura\` hide.

## 2026-09-01 — Revealed quest-card captions needed ADA contrast

### ADA refinement issue
Revealed easter-board cards now overlay quest title + animal name on picsum photos. A dark gradient caption would fail contrast on ADA Guy’s white card surface.

### ADA refinement action
Extended the \`.theme-quest-card__caption\` role so ADA Guy uses a solid white bar and black type (\`src/app/globals.css\`). Other themes keep token-driven slate/cyan caption text.

## 2026-08-31 — Easter-board mystery prize cards needed ADA contrast

### ADA refinement issue
Incomplete easter-egg prizes used a dimmed mystery card. On ADA Guy that low-opacity treatment would fail contrast against the white board surface, and a decorative question mark could look like missing content.

### ADA refinement action
Added a named \`.theme-quest-card\` / \`.theme-quest-card--mystery\` role in \`src/app/globals.css\`. ADA Guy keeps solid white/black cards (dashed mystery border, full-opacity \`?\` in black). Other themes keep token-driven cyan/slate fills. Mystery mark is \`aria-hidden\`; claimed cards keep image alt text.

## 2026-08-17 — Intro splash Escape had no destination

### ADA refinement issue
On \`/intro/splash\`, Escape was swallowed by the modal focus trap with no close handler, so keyboard users who expect Escape to leave a dialog were stuck in the splash/intro path.

### ADA refinement action
Escape on splash now applies \`ada-first\`, marks intro complete, and routes to \`/\` (skips splash + character intro). Step indicator copy is \`Step N of M\` for the live region. Default/cyberpunk splash contrast and selected-row focus chrome left unchanged per maintainer request.

## 2026-08-17 — Intro splash radios needed Tab and arrow-key paths together

### ADA refinement issue
On \`/intro/splash\`, experience options either behaved like native radios (Tab only hit the checked option; arrows were the in-group path) or like plain buttons (Tab hit every option; arrows did nothing). ADA-minded keyboard use expects **both**: Tab to walk the three choices, and ↑/↓ (plus ←/→, Home/End) to move and select inside the group, with Enter/Space confirming.

### ADA refinement action
Updated \`ThemeRadioGroup\` / \`ThemeRadioOption\` so each option stays a tab stop, and arrow keys move focus + selection in a loop (WAI-ARIA APG radiogroup directions), with Home/End jumping to first/last.

## 2026-08-17 — Intro splash keyboard trap leaked into backdrop intro

### ADA refinement issue
\`/intro/splash\` layered \`IntroSplashModal\` over \`IntroGameModal\` with \`aria-hidden\` and \`pointer-events-none\` only. Backdrop controls stayed in the tab order, so keyboard users left the splash dialog and could not tab the experience radios / Continue / sound switches cleanly. Radio rows also used opacity-0 inputs with a tiny focus ring, so focus was easy to lose visually. Native radio inputs then only put the **checked** option in the tab sequence, so Tab toggled between one experience and Continue; Enter did not select.

### ADA refinement action
Marked the backdrop \`inert\` when \`backgroundOnly\`, strengthened \`useModalAccessibility\` to pull Tab focus back when it escapes the dialog, and rebuilt \`ThemeRadioOption\` as \`role="radio"\` buttons so **each option is its own tab stop** with Enter/Space selecting, plus a full-row focus ring. Advancing to Sound still moves focus to the first control.

## 2026-08-11 — Card tops and whole-card buttons fighting ADA tab order

### ADA refinement issue
Demo / video / article cards kept a decorative (or substitute) top plate under ADA, and the entire card was one giant \`<button>\`. That buried the real action (“Open demo”, “Play video”, “Read article”) inside a single control and added noise for keyboard and screen-reader users who only need title, description, and one clear action.

### ADA refinement action
When \`decorativeCardMedia\` is false (ADA Guy), React **does not render** the card top at all. The shell is an \`<article>\`; the unchanged CTA label becomes the sole focusable control. Other themes keep whole-card click with the CTA as visual text only (\`InteractiveDemoCardSection\`, \`YouTubeCardSection\`, \`MarkdownArticleCardSection\`; blog tops also omit under ADA).

## 2026-08-11 — Hero video progress unlabeled for assistive tech

### ADA refinement issue
On the top portfolio trailer (both **interactive** and **non-interactive** modes), playback progress was only a visual fill / range scrubber. There was no \`role="progressbar"\` with \`aria-valuenow\`, \`aria-valuemin\`, and \`aria-valuemax\`. The interactive cue segment band was \`aria-hidden\`, so screen readers could not track long-running motion/progress the way an ADA proof-of-concept should.

### ADA refinement action
Updated \`src/components/HeroVideoWidget.tsx\`: added a dedicated playback \`progressbar\` (both modes) alongside the seek \`range\` (\`Seek video timeline\`), and exposed the interactive cue fill as a \`progressbar\` with 0–100 values when visible. Parent \`aria-hidden\` only when the cue fill is not shown.

## 2026-08-11 — ADA perfection archive missing under How this site works

### ADA refinement issue
We were refining ADA Guy through chat and code, but had no durable, on-site place to archive issue → action pairs for auditors, future agents, or visitors who want the process story.

### ADA refinement action
Added this **ADA perfection** markdown card next to How this site works (\`MarkdownArticleCardSection\`), plus always-on Cursor rule \`.cursor/rules/ada-perfection-log.mdc\` requiring every future ADA refinement to append a step in **issue / action** form.

## 2026-08-11 — Card photos and gradients failing contrast on ADA Guy

### ADA refinement issue
Screenshots of Fun things, project/hackathon cards, interactive demos, and similar plates showed dark or washed type over busy photos and cyan gradients—obvious contrast failures for an ADA theme, while the hero video needed to stay untouched.

### ADA refinement action
Rules engine: \`decorativeCardMedia: false\` on \`ada-first\` (\`layout:ada-hide-hero-swoop\` / section visibility). Components read \`visibility.decorativeCardMedia\` and render solid meta/text plates instead of photos/gradients (\`GalleryStrip\`, \`ProjectContributionsSection\`, demo/article/blog/YouTube cards). Hero video left alone.

## 2026-08-11 — Sound menu too coarse for independent mutes

### ADA refinement issue
A single “turn off all sounds” control (and coupled SFX gate) did not match Options → Sound Effects “No Sound” picks per category, and lacked clear On/Off switches for theme music, click interactions, and content windows.

### ADA refinement action
Rebuilt \`SoundMenu\` with Theme music / Click interactions / Content windows switches plus master **All sounds**; syncs via \`NO_SOUND_ID\` + last-known restores in \`ThemeProvider\` (\`setClickInteractionsEnabled\`, \`setContentWindowSoundsEnabled\`, \`setAllSoundsEnabled\`).

## 2026-08-10 — Timeline paddles painted solid by over-broad ADA CSS

### ADA refinement issue
ADA CSS used substring matches like \`[class*="bg-cyan-500"]\`, which also hit \`hover:bg-cyan-500/10\` on career timeline paddles—turning hover chrome into solid black slabs and harming usability/contrast intent.

### ADA refinement action
Tightened ADA selectors to space-delimited solid fills (and similar paddle/chevron rules) so hover washes are no longer forced to ink fills.

## 2026-08-09 — Decorative Learn-more swoop on a high-contrast theme

### ADA refinement issue
The hero Learn-more ribbon/swoop is decorative motion/chrome. On ADA Guy it competed with the paper/ink proof and was inappropriate for the theme’s reduced-adornment goal.

### ADA refinement action
json-rules-engine layout rule for \`ada-first\` sets \`heroLearnMoreSwoop: false\` while keeping fun/animation sections available. \`HeroVideoWidget\` already gates the swoop on \`visibility.heroLearnMoreSwoop\`.

## 2026-07-19 — Dark-theme utilities fighting ADA paper/ink

### ADA refinement issue
Shared Tailwind utilities (\`text-white\`, \`bg-slate-950\`, glass, blurs, white borders) assumed a dark cyberpunk site. Dropping ADA tokens alone left washed type, translucent cards, and decorative glow that failed a high-contrast reading.

### ADA refinement action
\`ada-first\` palette (inverted slate, black cyan accents, \`heroImage: null\`, zero decorative opacity) plus globals under \`[data-theme="ada-first"]\` forcing white surfaces, black ink, no blurs/shadows/gradient utilities, and stronger focus outlines on cards and dialogs.

## Open scan notes (not yet closed)

These were noticed in thoughtful review; they are **not** claimed as fixed until a dated step appears above.

1. **Reduced motion** — confirm every auto-advancing or looping UI (career timer, theme music, trailer) fully respects \`prefers-reduced-motion\` under ADA Guy.  
2. **Focus order in armed Visit Site cards** — re-check keyboard path when contribution cards arm/disarm.  
3. **Modal scroll regions** — keep long copy in independent scrollports (existing video-modal rule); spot-check ADA ink on scrollable markdown/dialogs.  
4. **Color-only cues** — cyan → black remapping helps ink, but status that relies only on color still needs a non-color signal where applicable.

*Next:* Close open notes with issue/action steps as each item is remediated.
`;

const themeArchitectureMarkdown = `# Themes as a design contract

Every look on this site—Cyber Guy, ADA Guy, Dream Guy, and the rest—is not a pile of one-off CSS overrides. It is a **theme contract**: named colors, radii, glass, and control roles that resolve once and paint the whole page.

Selection is driven by [json-rules-engine](https://www.npmjs.com/package/json-rules-engine) on the client. Static export still ships Cyberpunk defaults in CSS so the first paint matches the original cyan glass before JavaScript runs.

## Pipeline (one paint path)

1. \`ThemeProvider\` (from \`layout.tsx\`) holds the active theme id and facts such as Software Portfolio Only.
2. Facts run through \`src/theme/engine.ts\` → \`src/theme/rules.ts\`. Rules emit events: which palette to apply, which sections to show or hide, and which sound / music defaults to use.
3. The winning token pack comes from \`src/theme/palettes.ts\`.
4. \`applyThemeTokens()\` writes CSS variables onto \`<html>\` and sets \`data-theme="…"\`.
5. Components do not hard-code “cyan” or “amber.” They use **role classes** (\`.theme-primary-cta\`, \`.theme-card\`, \`.theme-ghost-cta\`, …) that read \`--slot-*\`, \`--accent-*\`, and \`--surface-*\`.

Change a look by editing the contract—not by hunting one button in the DOM.

## Slots and swatches

- **Swatch** — a real Tailwind color id (\`amber-200\`, \`cyan-400\`). Defined in \`src/theme/swatches.ts\`. The name is the hue; \`amber-200\` always means real amber.
- **Slot** — a semantic role (\`accent.400\`, \`primary-cta-fill\`, \`muted-copy\`). Values are \`{ swatch }\`, \`{ ref }\`, or \`{ rgb }\`—never a Tailwind class string.
- Apply paints \`--accent-*\`, \`--surface-*\`, and \`--slot-*\`. Components prefer role classes that consume those variables.
- Alpha stays on the role (\`rgb(var(--slot-card-meta) / 0.9)\`) or a dedicated alpha token when it varies by theme.

If a role is missing, the contract is extended (types → palette → apply → CSS roles). Papering over unreadability with a one-line \`color:\` fix is how themes break each other.

## What a theme owns

Token packs are more than a color wheel:

- **Radii** — pill, card, media, control, play (\`rounded-xl\` / \`2xl\` / \`3xl\` in Tailwind map to these variables)
- **Hero** — photo plate, scrim opacities, accent wash
- **Glass** — fill alpha, blur, decorative aura
- **Cards & borders** — surface alpha, hairlines, hover rings
- **Type** — display / sans faces rebound via \`[data-theme]\` next/font slots (never through \`:root\` aliases that resolve before fonts load)
- **Layout gates** — e.g. hide Fun things, skip decorative card media on ADA Guy, soft-gate the theme game in Software mode
- **Sound** — theme music bed, click pack, content-window sting defaults from the same rules pass

## Control roles (why buttons stay distinct)

Themes must keep surfaces readable **and** visually different. The contract calls out roles such as:

- **Primary CTA** — Enter portfolio, LinkedIn, Visit Site (\`.theme-primary-cta\`)
- **Ghost / secondary** — outline, muted, “Go back”
- **Menu panel + items** — Options, Sound menu
- **Nav chrome** — links, sound toggle
- **Shape skin** — shared radius / border language without wiping fill and ink

A blanket \`[data-theme] .theme-btn-shape { … }\` skin is only acceptable if those variants stay distinct. If primary, menu, and ghost all look the same, the contract is wrong—split it, do not add another exception.

## Rules engine vs stylesheets

\`src/theme/rules.ts\` maps theme id → pack, visibility, and sound defaults. It is **not** a per-property stylesheet.

Per-theme flourishes that still live in \`globals.css\` (halftone, melt radii, CRT bevels, paper/ink hammers) are inventoried in \`src/theme/workaround-inventory.md\`. Those rows stay until a slot or role absorbs them without collapsing contrast.

## How to pick a theme

**Options → Themes** (and the intro / easter-egg roster). Some looks unlock from score milestones; the paint path is the same once the id is allowed.

ADA Guy is the high-contrast control look—paper and ink, not a second-class fork. Its living revision log sits in the **ADA example awareness** card next to this one.
`;

export const howThisSiteWorksCards = [
  {
    id: "how-this-site-works",
    title: "Porting the old site",
    date: "Architecture",
    excerpt:
      "How we turned the legacy aaronduchateau.com page into a nested document root hosted by a web component—plus a running port log of what we got wrong and what we fixed.",
    modal: {
      title: "How this site works",
      date: "Architecture",
      contextLabel: "Web component notes",
      intro:
        "Architecture notes for the V1 archive port, with a Port log at the bottom—decisions challenged, mistakes, and what we’re still fixing.",
      markdown: howThisSiteWorksMarkdown,
    },
  },
  {
    id: "theme-architecture",
    title: "How themes work",
    date: "Architecture",
    excerpt:
      "The design contract behind every look: rules engine, palettes, slots, CSS variables, and why primary / ghost / menu stay distinct across themes.",
    modal: {
      title: "How themes work",
      date: "Architecture",
      contextLabel: "Theme system",
      intro:
        "How this site paints a look: json-rules-engine selects a token pack, slots resolve to CSS variables, and components consume named control roles—not one-off color patches.",
      markdown: themeArchitectureMarkdown,
    },
  },
  {
    id: "ada-perfection",
    title: "ADA example awareness",
    date: "Accessibility",
    excerpt:
      "Living revision log for ADA Guy—each step pairs the issue we found with the action we shipped, as this theme becomes a high-contrast proof of concept.",
    modal: {
      title: "ADA example awareness",
      date: "Accessibility",
      contextLabel: "ADA Guy revision log",
      intro:
        "A running archive of ADA refinement: every entry starts with the issue (premise), then the action (what we changed). Newest steps first.",
      markdown: adaPerfectionMarkdown,
    },
  },
] as const;

export const howThisSiteWorksSection = {
  id: "how-this-site-works",
  eyebrow: "Building this thing",
  title: "How this site works",
  description:
    "Architecture notes for themes and the classic archive port, plus a living ADA Guy revision log pairing each issue with its fix.",
  cards: howThisSiteWorksCards,
} as const;

/** Shown when ADA Guy is picked as the site theme (Options / theme playground). */
export const adaGuyThemeNote: SimpleNoteModal = {
  id: "ada-guy-theme-note",
  eyebrow: "ADA Guy",
  title: "Why this look exists",
  intro:
    "I understand that separate is not equal. I still needed a high-contrast, simple baseline I could train a future product against — paper and ink, not a second-class “accessible” fork of the rest of this site.",
  intent:
    "Solving every ADA quirk is not the intention of this theme. ADA Guy is a measurable contrast element against the other looks: when chrome, color, and motion fall away, what still reads? That gap is the seed for a future interactive demo I have in mind.",
  featuredHeading: "Muffin ADA",
  featuredBody:
    "Muffin ADA is the proving ground I want to build next — not a PDF checklist, a live lab. You drop any theme on this roster onto a muffin tin of simultaneous trials. Each cup is its own oven: contrast that lights up in real time, focus order that walks the page like a ghost, motion that has to freeze when it should, reading order that refuses to hide behind decoration. ADA Guy sits in the center cup as the control. Every other look has to survive the same heat. Over-instrumented on purpose. A training opponent, not a participation trophy.",
  quote: "It's called muffin ADA because it is 'over the top'.",
};

export const gallery = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=75",
];

export const interactiveDemoCards = [
  {
    id: "npm-audit-dashboard",
    title: "NPM Audit Dashboard",
    date: "2026",
    excerpt:
      "Turn raw npm audit --json output into an actionable security report—KPIs, fix paths, and filterable advisories.",
    modal: {
      title: "NPM Audit Dashboard",
      date: "2026",
      contextLabel: "Interactive tool",
      intro:
        "npm audit --json dumps thousands of lines into audit.json—severities, CVEs, dependency paths, and remediation actions buried in nested JSON that is not visually parseable in a text editor.",
      detail:
        "This dashboard parses real npm audit output client-side: upload audit.json, paste JSON (with typo repair for common id field mistakes), or launch a demo sample. It surfaces risk assessment, easy vs breaking vs lockfile fixes, Chart.js severity charts, dependency health, and a sortable advisory table—all without a backend.",
      interactive: {
        type: "component",
        id: "interactive-npm-audit-panel",
        componentId: "npmAudit",
      },
    },
  },
  {
    id: "photo-critique",
    title: "Photo critique v1",
    date: "2026",
    excerpt:
      "Client-side pixel analysis to cut AI token waste—run the low-level pass in the browser before an image model ever sees the photo.",
    modal: {
      title: "Photo critique v1",
      date: "2026",
      contextLabel: "Interactive experiment",
      intro:
        "Concept: reduce token usage spent on pixel-based image improvement analysis by offsetting the initial analysis that generates the markdown instructions to the client (i.e. computing in the user’s browser). This kind of static analysis does not need the expensive overhead of a frontier model.",
      detail:
        "Baseline AI image analysis generally uses the following process.\n\nWhen analyzing a photo (rather than just describing what it contains), the first stage is effectively a low-level pixel analysis. That includes measurements like:\n\n• Luminance (brightness distribution)\n• Color histograms and saturation\n• Local contrast\n• Edge density (using gradient operators like Sobel/Canny)\n• Sharpness (variance of Laplacian, MTF-like measures)\n• Noise characteristics\n• Spatial frequency (fine vs. coarse detail)\n• Saliency maps (where an algorithm predicts the eye will look)\n• Connected components/blobs\n• Rule-of-thirds positioning\n• Balance and visual weight\n• Figure/ground separation\n\nThose are all derived directly from the pixels without any understanding of what the image depicts.\n\nThe idea behind this experiment is to see if we could save computing time by offsetting this common practice to the client—so AI would have to compute less and could deliver a superior result from the critique markdown that follows.\n\nA successful result will be a functional image analysis (without using AI at all) to generate markdown instructions, which will allow AI to skip token-expending “thought cycles” on something that the browser can handle on its own.\n\nOffsetting repetitive concerns like this to the client could substantially reduce token usage and (in theory) even make a small impact on environmental overhead associated with large data centers.",
      contextAction: {
        label: "Try your own photo",
        event: "photo-critique:try-yourself",
      },
      interactive: {
        type: "component",
        id: "interactive-photo-critique-panel",
        componentId: "photoCritique",
      },
    },
  },
  {
    id: "theme-playground",
    title: "Theme playground",
    date: "2026",
    excerpt:
      "Switch between Cyber Guy, Relic Guy, Groovy Guy, Empire Guy, and ADA Guy—same rules-engine themes as Options.",
    modal: {
      title: "Theme playground",
      date: "2026",
      contextLabel: "Interactive experiment",
      intro:
        "This portfolio’s look is maintained by a client-side json-rules-engine: each theme is a token pack (colors, radii, hero glass, type, and hero art) applied like a Material theme, with the rules engine as the arbiter.",
      detail:
        "Open a card to apply that theme across the whole site—including the hero unit photo for every theme except ADA First (which stays deliberately photo-free for max contrast).\n\nYou can also reach the same themes from Options → Themes in the nav. This playground is the visual, card-based way to try them.",
      interactive: {
        type: "component",
        id: "interactive-theme-picker-panel",
        componentId: "themePicker",
      },
    },
  },
  {
    id: "my-events",
    title: "My Events",
    date: "2026",
    excerpt:
      "Your local activity scoreboard—modals, themes, photos, clicks, and finished videos with points and a full event log.",
    modal: {
      title: "My Events",
      date: "2026",
      contextLabel: "Activity report",
      intro:
        "Every scored action on this site lands in a browser-local activity log. Points award once per unique action; the chronological log keeps every occurrence.",
      detail:
        "Open from Options → My Events or this card. The report shows a point legend, KPIs, awarded actions, the full log, and the raw localStorage object. Reset clears only this activity store.",
      interactive: {
        type: "component",
        id: "interactive-my-events-panel",
        componentId: "myEvents",
      },
    },
  },
  {
    id: "component-library",
    title: "Component library",
    date: "2026",
    excerpt:
      "A Storybook-style catalog of this site’s own controls, grouped as Simple (buttons, headings, badges) and Advanced (theme cards), with live prop knobs and an iframe preview.",
    modal: {
      title: "Component library",
      date: "2026",
      contextLabel: "Interactive experiment",
      intro:
        "If you set Tailwind aside, this portfolio’s UI is a ground-up component library written here—no MUI, no shadcn, no imported kit.",
      detail:
        "The visual language is a design contract: named control roles (primary CTA, ghost, nav chrome, cards), a rules-engine token pack per theme, and React primitives authored for this site. Tailwind is only layout utility. The look lives in the roles and tokens.\n\nThe catalog is split into Simple pieces (a button or heading that takes props and paints itself) and Advanced surfaces (a theme card that assembles covers, badges, and roles). Open a card to drill into that component. Radios and dropdowns change default props. JSON beside the story title opens a live overlay on the canvas — edit the same state, including demo `onClick` handlers (`() => alert(...)`). Values that are not a preset are added as a new option. Advanced stories also get Device size (Natural, Phone, Tablet, Full screen); Natural is centered, 400px wide and 400–800px tall, and device frames scale to fit. On phone width, Device size sits beside Prop Garden so the title row stays titles, JSON, and close.",
      interactive: {
        type: "component",
        id: "interactive-component-library-panel",
        componentId: "componentLibrary",
      },
    },
  },
] as const;

export const interactiveDemosSection = {
  id: "interactive-things",
  eyebrow: "Interactive tools",
  title: "Interactive things",
  description:
    "Client-side demos you can run in the browser—audit JSON, critique a photo, try themes, inspect the component library, or check your activity score.",
  cards: interactiveDemoCards,
} as const;

/** Matches on-disk photo/icon filenames under `public/` (excl. archive/audio). */
const PHOTO_FILENAME_PREFIX = "Aaron_DuChateau_";

/** Stem used for media ids / alts — strip rename prefix so unlocks & deep links stay stable. */
function photoIdStem(file: string): string {
  const base = file.replace(/\.[^.]+$/, "");
  return base.startsWith(PHOTO_FILENAME_PREFIX)
    ? base.slice(PHOTO_FILENAME_PREFIX.length)
    : base;
}

const funThingPhotos = (folder: string, files: readonly string[], idPrefix: string) =>
  files.map((file) => {
    const idStem = photoIdStem(file);
    return {
      type: "photo" as const,
      id: `${idPrefix}-${idStem}`,
      src: `/${folder}/${file}`,
      alt: idStem.replace(/_/g, " "),
    };
  });

const funThingPhotosPreferPng = (folder: string, files: readonly string[], idPrefix: string) => {
  const basesWithPng = new Set(
    files.filter((file) => /\.png$/i.test(file)).map((file) => file.replace(/\.[^.]+$/, "")),
  );
  const resolved = files.filter((file) => {
    if (/\.jpe?g$/i.test(file)) {
      const base = file.replace(/\.[^.]+$/, "");
      if (basesWithPng.has(base)) return false;
    }
    return true;
  });
  return funThingPhotos(folder, resolved, idPrefix);
};

const paintingFiles = ["Aaron_DuChateau_darthvadar.jpg", "Aaron_DuChateau_naomi.png", "Aaron_DuChateau_penguins.png"] as const;

const paintingMedia = [
  ...funThingPhotos("painting", ["Aaron_DuChateau_ship.jpg"] as const, "painting"),
  {
    type: "slideReveal" as const,
    id: "painting-patrick",
    before: { src: "/painting/Aaron_DuChateau_dog1.png", alt: "Patrick — blue period portrait" },
    after: { src: "/painting/Aaron_DuChateau_dog4.jpg", alt: "Patrick — reference photo" },
    intro:
      "Patrick was my boxer—a blocky-headed supervisor who believed every couch was his throne and every guest was there to pet him.",
    detail:
      "He had the classic boxer glower: jowls for days, one eye slightly more skeptical than the other, and a habit of looming over you from two inches away until you acknowledged his authority.\n\nThe painting started as a joke about his \"blue period\"—acrylic on canvas, yellow ground, tiny beret because he carried himself like a moody Parisian critic. The black-and-white photo is the source: Patrick doing what he did best, hanging over the camera and judging my life choices.\n\nSlide across to see reference versus finished portrait.",
  },
  {
    type: "slideReveal" as const,
    id: "painting-patrick-greyt",
    before: { src: "/painting/Aaron_DuChateau_dog2.jpg", alt: "Patrick — stretched snout study" },
    after: { src: "/painting/Aaron_DuChateau_dog3.jpg", alt: "Patrick — reference on the dog bed" },
    intro:
      "Same dog, different angle—Patrick lounging on his round grey bed like he pays the mortgage.",
    detail:
      "The reference photo caught him mid-goof: legs out, head tilted, two bottom teeth accidentally on display. Classic Patrick energy—90% dignity, 10% complete derp.\n\nThe painting leans into the snout. Maybe too much. Acrylic on canvas, yellow field again, because apparently I only own one tube of cadmium. The teeth stayed. Couldn't bring myself to give him a closed-mouth gravitas he never earned in real life.\n\nSlide across to compare the couch-potato original with the finished portrait.",
  },
  ...funThingPhotos("painting", paintingFiles, "painting"),
];

const randomPhotoFiles = [
  "Aaron_DuChateau_burn.jpg",
  "Aaron_DuChateau_bikes.jpg",
  "Aaron_DuChateau_pigs.jpg",
  "Aaron_DuChateau_patrick_hat.jpg",
  "Aaron_DuChateau_patrick_halo.jpg",
  "Aaron_DuChateau_swim_team.png",
  "Aaron_DuChateau_monkey_dog.png",
  "Aaron_DuChateau_mole_rat.png",
] as const;

const photographyFiles = [
  "Aaron_DuChateau_building.jpg",
  "Aaron_DuChateau_160562897_10105630261447836_1774623442205809767_n.jpg",
  "Aaron_DuChateau_bonkers.jpg",
  "Aaron_DuChateau_503854601_10108071122747226_4177639038338647699_n.jpg",
  "Aaron_DuChateau_109318380_10105239764471906_3762221443738793849_n.jpg",
  "Aaron_DuChateau_angus.png",
  "Aaron_DuChateau_band_og.png",
  "Aaron_DuChateau_cat.png",
  "Aaron_DuChateau_crank.jpg",
  "Aaron_DuChateau_eric.jpg",
  "Aaron_DuChateau_throne.png",
  "Aaron_DuChateau_mist.jpg",
  "Aaron_DuChateau_p_1.png",
  "Aaron_DuChateau_p_3.png",
  "Aaron_DuChateau_p_5.png",
  "Aaron_DuChateau_p_6.png",
  "Aaron_DuChateau_p_7.png",
  "Aaron_DuChateau_patrick.png",
  "Aaron_DuChateau_pup.png",
  "Aaron_DuChateau_tomatoes.png",
  "Aaron_DuChateau_anna_polish.png",
  "Aaron_DuChateau_astrounaught.jpg",
  "Aaron_DuChateau_refined_ben.png",
  "Aaron_DuChateau_charlie.png",
  "Aaron_DuChateau_egg.png",
  "Aaron_DuChateau_refined_grandma.png",
  "Aaron_DuChateau_patrick_brown.png",
  "Aaron_DuChateau_refined_tongue_p.png",
  "Aaron_DuChateau_refined_p_lights.png",
  "Aaron_DuChateau_patrick_laying_back.png",
  "Aaron_DuChateau_naomi_2.png",
] as const;

const cookingFiles = [
  "Aaron_DuChateau_101463414_10105137725952916_3626768786738118656_n.jpg",
  "Aaron_DuChateau_189916554_10105725990116816_3495702414781420756_n.jpg",
  "Aaron_DuChateau_503853998_10108066848103646_4696969961294788449_n.jpg",
  "Aaron_DuChateau_bazil.jpg",
  "Aaron_DuChateau_fish.jpg",
  "Aaron_DuChateau_home_tomatoes.jpg",
  "Aaron_DuChateau_keiche.jpg",
  "Aaron_DuChateau_lasagna.jpg",
  "Aaron_DuChateau_salad_1.jpg",
  "Aaron_DuChateau_sammich.jpg",
  "Aaron_DuChateau_spread.jpg",
  "Aaron_DuChateau_tomaotes.jpg",
  "Aaron_DuChateau_yard.jpg",
  "Aaron_DuChateau_garden_remote.jpg",
  "Aaron_DuChateau_patrick_yard.jpg",
  "Aaron_DuChateau_pies.jpg",
  "Aaron_DuChateau_sauce.jpg",
  "Aaron_DuChateau_sprinkler.jpg",
  "Aaron_DuChateau_thanks_giving.jpg",
  "Aaron_DuChateau_turkey.jpg",
  "Aaron_DuChateau_veggies.jpg",
] as const;

const cookingFromPhotography = [
  "Aaron_DuChateau_503854601_10108071122747226_4177639038338647699_n.jpg",
] as const;

const cookingKeicheIndex = cookingFiles.indexOf("Aaron_DuChateau_keiche.jpg");

const cookingMedia = [
  ...funThingPhotosPreferPng("cooking", cookingFiles.slice(0, cookingKeicheIndex + 1), "cooking"),
  ...funThingPhotos("photography", cookingFromPhotography, "cooking"),
  ...funThingPhotosPreferPng("cooking", cookingFiles.slice(cookingKeicheIndex + 1), "cooking"),
];

const travelFiles = [
  "Aaron_DuChateau_159294687_10105623752696426_6241550843032143195_n.jpg",
  "Aaron_DuChateau_503311532_10108065100126606_4211602079032127384_n.jpg",
  "Aaron_DuChateau_86478308_10104889935327316_757433945259245568_n.jpg",
  "Aaron_DuChateau_airplane.jpg",
  "Aaron_DuChateau_banksy.jpg",
  "Aaron_DuChateau_basketball.jpg",
  "Aaron_DuChateau_beach.jpg",
  "Aaron_DuChateau_beach3.jpg",
  "Aaron_DuChateau_beach_mural.jpg",
  "Aaron_DuChateau_bean.jpg",
  "Aaron_DuChateau_bean_2.jpg",
  "Aaron_DuChateau_belize.jpg",
  "Aaron_DuChateau_belize_1.jpg",
  "Aaron_DuChateau_bend.jpg",
  "Aaron_DuChateau_bendish.jpg",
  "Aaron_DuChateau_bike.jpg",
  "Aaron_DuChateau_boat.jpg",
  "Aaron_DuChateau_bangka_bow.jpg",
  "Aaron_DuChateau_building_empire_state.jpg",
  "Aaron_DuChateau_castle.jpg",
  "Aaron_DuChateau_cliff.jpg",
  "Aaron_DuChateau_coastline.jpg",
  "Aaron_DuChateau_cricket.jpg",
  "Aaron_DuChateau_dead.jpg",
  "Aaron_DuChateau_dead_3.jpg",
  "Aaron_DuChateau_dennis_rodman.jpg",
  "Aaron_DuChateau_dog.jpg",
  "Aaron_DuChateau_duck.jpg",
  "Aaron_DuChateau_flag.jpg",
  "Aaron_DuChateau_flag_2.jpg",
  "Aaron_DuChateau_florida.jpg",
  "Aaron_DuChateau_hellz.jpg",
  "Aaron_DuChateau_florida2.jpg",
  "Aaron_DuChateau_florida3.jpg",
  "Aaron_DuChateau_food.jpg",
  "Aaron_DuChateau_friends.jpg",
  "Aaron_DuChateau_fun_1.jpg",
  "Aaron_DuChateau_ghost.jpg",
  "Aaron_DuChateau_ghost_2.jpg",
  "Aaron_DuChateau_glass.jpg",
  "Aaron_DuChateau_god.jpg",
  "Aaron_DuChateau_group.jpg",
  "Aaron_DuChateau_house.jpg",
  "Aaron_DuChateau_hut.jpg",
  "Aaron_DuChateau_jambo.jpg",
  "Aaron_DuChateau_jeep.jpg",
  "Aaron_DuChateau_joke.jpg",
  "Aaron_DuChateau_joke_2.jpg",
  "Aaron_DuChateau_jump.jpg",
  "Aaron_DuChateau_jump_2.jpg",
  "Aaron_DuChateau_lion_guy.jpg",
  "Aaron_DuChateau_meal.jpg",
  "Aaron_DuChateau_mine.jpg",
  "Aaron_DuChateau_puertorico.jpg",
  "Aaron_DuChateau_puertorico2.jpg",
  "Aaron_DuChateau_puertorico3.jpg",
  "Aaron_DuChateau_puertorico4.jpg",
  "Aaron_DuChateau_puertorico5.jpg",
  "Aaron_DuChateau_puertorico6.jpg",
  "Aaron_DuChateau_pup.jpg",
  "Aaron_DuChateau_seattle.jpg",
  "Aaron_DuChateau_segway.jpg",
  "Aaron_DuChateau_sleep_pup.jpg",
  "Aaron_DuChateau_street_philipines.jpg",
  "Aaron_DuChateau_sunvalley.jpg",
  "Aaron_DuChateau_tourist.jpg",
  "Aaron_DuChateau_travel.jpg",
  "Aaron_DuChateau_waiter.jpg",
  "Aaron_DuChateau_washington.jpg",
  "Aaron_DuChateau_windmills.jpg",
  "Aaron_DuChateau_after_party.jpg",
  "Aaron_DuChateau_astronaught.jpg",
  "Aaron_DuChateau_beach_dog.jpg",
  "Aaron_DuChateau_belize_laptop.jpg",
  "Aaron_DuChateau_mushrooms.jpg",
  "Aaron_DuChateau_pearla.jpg",
  "Aaron_DuChateau_unfortunate_photos.jpg",
] as const;

const adventureFiles = [
  "Aaron_DuChateau_airplane.jpg",
  "Aaron_DuChateau_bike.jpg",
  "Aaron_DuChateau_bikes.jpg",
  "Aaron_DuChateau_crash.jpg",
  "Aaron_DuChateau_fishing.jpg",
  "Aaron_DuChateau_foraging.jpg",
  "Aaron_DuChateau_jump.jpg",
  "Aaron_DuChateau_jump_again.jpg",
  "Aaron_DuChateau_raft.jpg",
  "Aaron_DuChateau_raft_2.jpg",
  "Aaron_DuChateau_raft_3.jpg",
  "Aaron_DuChateau_slides.jpg",
  "Aaron_DuChateau_snow.jpg",
  "Aaron_DuChateau_startup.jpg",
  "Aaron_DuChateau_wipeout.jpg",
  "Aaron_DuChateau_coast.jpg",
  "Aaron_DuChateau_coast_2.jpg",
  "Aaron_DuChateau_coast_use.jpg",
  "Aaron_DuChateau_go_carts.jpg",
  "Aaron_DuChateau_guitar.jpg",
  "Aaron_DuChateau_head_cam.jpg",
  "Aaron_DuChateau_ice.jpg",
  "Aaron_DuChateau_river.jpg",
  "Aaron_DuChateau_wound.jpg",
] as const;

const repairMedia = [
  {
    type: "collection" as const,
    id: "repair-ceiling-fan",
    title: "Ceiling fan",
    cover: { src: "/repair/Aaron_DuChateau_fan_final_jars.jpg", alt: "Ceiling fan — mason jar lights" },
    contextLabel: "Repairs & Projects",
    intro:
      "A stock ceiling fan that traded frosted shades for colored mason jars and a four-color light kit overhead.",
    detail:
      "Start with the original fan, then follow the sockets, wiring, and jar globes through to the finished mason-jar light kit.",
    items: [
      ...funThingPhotos(
        "repair",
        ["Aaron_DuChateau_fan_original_first.jpg", "Aaron_DuChateau_fan_original_again.jpg"] as const,
        "repair-ceiling-fan",
      ),
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_fan_pint.jpg",
          "Aaron_DuChateau_fan_snip.jpg",
          "Aaron_DuChateau_fan_bulb.jpg",
          "Aaron_DuChateau_fan_jar_together.jpg",
          "Aaron_DuChateau_fan_good_final_ex.jpg",
          "Aaron_DuChateau_lamp_fan.png",
          "Aaron_DuChateau_fan_final_jars.jpg",
        ] as const,
        "repair-ceiling-fan",
      ),
    ],
  },
  {
    type: "collection" as const,
    id: "repair-tables",
    title: "Table builds",
    cover: { src: "/repair/Aaron_DuChateau_table_11.jpg", alt: "Stone-and-glass inlay table, finished" },
    contextLabel: "Repairs & Projects",
    intro:
      "A furniture sub-folder: a stone-and-blue-glass inlay table built from bare boards to a glossy finished top, in the order it actually came together.",
    detail:
      "No slider here—just the build log in sequence: raw staining, the assembled frame, the river-stone and blue-glass panels going in, then the finished piece. The last shots are the most complete the project ever looked.",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_table_1.jpg",
          "Aaron_DuChateau_table_4.jpg",
          "Aaron_DuChateau_table_10.jpg",
          "Aaron_DuChateau_table_6.jpg",
          "Aaron_DuChateau_table_2.jpg",
          "Aaron_DuChateau_table_11.jpg",
          "Aaron_DuChateau_table_outdoor_1.jpg",
          "Aaron_DuChateau_table_outdoor_2.jpg",
        ] as const,
        "repair-table",
      ),
      {
        type: "photo" as const,
        id: "repair-table-inlay",
        src: "/repair/Aaron_DuChateau_table_inlay.png",
        alt: "Finished inlay table — studio",
        intro:
          "The finished piece cleaned up: warm rosewood-toned top with river-stone and blue-glass inlay panels set under glass.",
      },
    ],
  },
  {
    type: "slideReveal" as const,
    id: "repair-roof",
    before: { src: "/repair/Aaron_DuChateau_good_roof.jpg", alt: "Roof and gutter — after" },
    after: { src: "/repair/Aaron_DuChateau_bad_roof.jpg", alt: "Roof and gutter — before" },
    intro:
      "The original problem: the trim was separating from the fascia, leaving a gap behind the boards and the gutter pulling away.",
    detail:
      "I hired an expert who identified that the sag was not foundational. It was the concrete stairs in front of the front door—a non-structural issue, just cosmetic settling of the concrete block in front of the house.\n\nI was quoted an exceptional amount to fix it. After that diagnosis I decided to do it myself, using hardware-store components to make a repair that looks acceptable to the naked eye.",
  },
  {
    type: "collection" as const,
    id: "repair-kawasaki",
    title: "Undouche the Kawasaki",
    openLabel: "Kawasaki black",
    cover: { src: "/repair/Aaron_DuChateau_bike_ninja_helmet_sunset.jpg", alt: "Kawasaki — helmet sunset" },
    contextLabel: "Repairs & Projects",
    intro:
      "Green wheels, Monster graphics, a zucchini for scale, and the long road from torn-apart project bike to something you could actually throw a leg over.",
    detail:
      "This album is the garage project from start to finish: the old green Monster, a zucchini for scale, the bike torn down, paint drying under the carport, then the rebuilt green bike and the black Ninja at a couple of shows, ending with the helmet-at-sunset shot.",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_old_bike_green_monster.jpg",
          "Aaron_DuChateau_motorcycle_zuchini.jpg",
          "Aaron_DuChateau_motorcycle_torn_apart.jpg",
          "Aaron_DuChateau_motorcyle_paint_dry.jpg",
          "Aaron_DuChateau_new_bike_green.jpg",
          "Aaron_DuChateau_bike_ninja_show_1.jpg",
          "Aaron_DuChateau_bike_ninja_show_2.jpg",
          "Aaron_DuChateau_bike_ninja_helmet_sunset.jpg",
        ] as const,
        "repair-kawasaki",
      ),
    ],
  },
  {
    type: "collection" as const,
    id: "repair-cbr-midnight",
    title: "CBR Midnight",
    cover: {
      src: "/photography/Aaron_DuChateau_109318380_10105239764471906_3762221443738793849_n.jpg",
      alt: "Honda CBR — black with underglow",
    },
    contextLabel: "Repairs & Projects",
    intro:
      "Silver CBR to black plastics, polish in the driveway, street portraits, and the purple underglow nights that made the plate worth keeping.",
    detail:
      "Slide the before/after refresh, then the detail work—front end, blinkers, exhaust—before the on-bike shots and the midnight underglow payoff.",
    items: [
      ...funThingPhotos(
        "repair",
        ["Aaron_DuChateau_portraight.jpg", "Aaron_DuChateau_on_bike.jpg"] as const,
        "repair-cbr",
      ),
      {
        type: "slideReveal" as const,
        id: "repair-motorcycle",
        before: { src: "/repair/Aaron_DuChateau_bike_2.jpg", alt: "Honda CBR — cleaned up" },
        after: { src: "/repair/Aaron_DuChateau_bike_1.png", alt: "Honda CBR — before refresh" },
        intro:
          "Same Oregon plate, same CBR—silver and tired in the driveway, then black and sorted under the carport.",
        detail:
          "Bike one is the work-in-progress rear-quarter view: CBR tail, under-tail exhaust, lawnmower and cardboard neighbors in the background.\n\nBike two is the payoff—fresh black plastics, high mount can, everything looking like it might actually start on the first try. Slide across for the garage-project glow-up.",
      },
      ...funThingPhotos(
        "repair",
        ["Aaron_DuChateau_bike_polish.jpg", "Aaron_DuChateau_bike_front.jpg", "Aaron_DuChateau_blink.jpg", "Aaron_DuChateau_backgood.jpg", "Aaron_DuChateau_portriaght_again.jpg"] as const,
        "repair-cbr",
      ),
      {
        type: "photo" as const,
        id: "repair-cbr-glow",
        src: "/photography/Aaron_DuChateau_109318380_10105239764471906_3762221443738793849_n.jpg",
        alt: "Honda CBR — black with underglow",
      },
    ],
  },
  {
    type: "collection" as const,
    id: "repair-honda-fairing",
    title: "Honda fairing rebuild",
    cover: { src: "/repair/Aaron_DuChateau_honda_black_driveway.png", alt: "Honda — black fairings finished" },
    contextLabel: "Repairs & Projects",
    intro:
      "From a scuffed blue Honda through fairings on the ground and bondo on the nose to a full black set that actually looked finished.",
    detail:
      "Street shots of the blue bike, night rides with the damage still showing, then the teardown: panels off, filler sanded, a TARGA nose waiting to go on, and the black bike when the bodywork finally closed up again.",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_honda_blue_street.png",
          "Aaron_DuChateau_honda_night_damage.png",
          "Aaron_DuChateau_honda_night_smile.png",
          "Aaron_DuChateau_honda_fairing_off.png",
          "Aaron_DuChateau_honda_fairing_filler.png",
          "Aaron_DuChateau_honda_targa_fairing.png",
          "Aaron_DuChateau_honda_black_side.png",
          "Aaron_DuChateau_honda_black_driveway.png",
        ] as const,
        "repair-honda",
      ),
    ],
  },
  {
    type: "collection" as const,
    id: "repair-cars",
    title: "Camaro restoration",
    cover: { src: "/repair/Aaron_DuChateau_camaro_wild_2.png", alt: "Red Camaro — finished" },
    contextLabel: "Repairs & Projects",
    intro:
      "The red third-gen Camaro arc: bondo and primer in the lot, buffing in the driveway, then the Idaho plate looking like it belongs in a magazine.",
    detail:
      "Same car from rough bodywork through garage nights to the finished shots at the end. Click through for the full restoration log.\n\nWe called her 'the dragon'. **She was sold before the final paint could be applied, so I used AI to show what the finished outcome would have been.**",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_car.jpg",
          "Aaron_DuChateau_old_car.jpg",
          "Aaron_DuChateau_car_2.jpg",
          "Aaron_DuChateau_sterio.jpg",
          "Aaron_DuChateau_car_back.jpg",
          "Aaron_DuChateau_buff_car.jpg",
          "Aaron_DuChateau_camaro_wild_1.png",
          "Aaron_DuChateau_camaro_wild_2.png",
        ] as const,
        "repair-car",
      ),
    ],
  },
  {
    type: "slideReveal" as const,
    id: "repair-wheels",
    before: { src: "/repair/Aaron_DuChateau_car_wheel_good.jpg", alt: "Wheel — polished and mounted" },
    after: { src: "/repair/Aaron_DuChateau_car_wheel_bad.jpg", alt: "Wheel — rusted lip" },
    intro: "Goodyear Wingfoot on a rim that went from corrosion chic to chrome lip and black center.",
    detail:
      "The bad wheel is orange rust bleeding through the lip, dull black center, tired finish all the way around.\n\nThe good wheel is the same tire lettered up—but the rim is chrome-bright with a clean black face and fresh Superior center cap. Slide across for the detail work that actually shows.",
  },
  {
    type: "collection" as const,
    id: "repair-deck",
    title: "Deck and hot tub",
    cover: { src: "/repair/Aaron_DuChateau_deck_final_night.jpg", alt: "Deck and hot tub — lit at night" },
    contextLabel: "Repairs & Projects",
    intro:
      "From a lumber run at the store to pier blocks beside the spa, a two-tier deck you can sit on—and eventually soak in after dark.",
    detail:
      "Materials first, then framing and the slide progression, framing details, the first soak, and the finished deck lit up at night.",
    items: [
      ...funThingPhotos("repair", ["Aaron_DuChateau_deck_wood.jpg", "Aaron_DuChateau_deck_1.jpg"] as const, "repair-deck"),
      {
        type: "slideReveal" as const,
        id: "repair-deck-build",
        before: { src: "/repair/Aaron_DuChateau_deck_2.jpg", alt: "Deck — framed and decked" },
        after: { src: "/repair/Aaron_DuChateau_deck_4.jpg", alt: "Deck — joists and pier blocks" },
        intro: "From bare floor joists on pier blocks beside the hot tub to a real two-tier deck with railing posts and solar caps.",
        detail:
          "The before shot is the skeleton: floor joists framed across concrete pier blocks, posts standing, the round spa still parked out in the dirt yard.\n\nThe after is further along—planks down, railings up, lower tier wrapped around, ladder still in the yard because the project is never quite done. Slide across for the build progression.",
      },
      ...funThingPhotos(
        "repair",
        ["Aaron_DuChateau_deck_3.jpg", "Aaron_DuChateau_in_tub.jpg", "Aaron_DuChateau_deck_night.png", "Aaron_DuChateau_deck_final_night.jpg"] as const,
        "repair-deck",
      ),
    ],
  },
  {
    type: "collection" as const,
    id: "repair-floors",
    title: "Flooring install",
    cover: { src: "/repair/Aaron_DuChateau_floors_final_living.jpg", alt: "Gray plank flooring — finished living room" },
    contextLabel: "Repairs & Projects",
    intro:
      "Goodbye plaid carpet and mosaic tile, hello gray wood-look planks—upstairs, downstairs, one row at a time.",
    detail:
      "From the old floors through staged tear-out, plank installs, and the finished rooms at the end.",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_floors.jpg",
          "Aaron_DuChateau_floors_down_staged.jpg",
          "Aaron_DuChateau_floors_2.jpg",
          "Aaron_DuChateau_floors3.jpg",
          "Aaron_DuChateau_floors5.jpg",
          "Aaron_DuChateau_floors6.jpg",
          "Aaron_DuChateau_floors_final_down.jpg",
          "Aaron_DuChateau_floors_final.jpg",
          "Aaron_DuChateau_floors_final_living.jpg",
        ] as const,
        "repair-floor",
      ),
    ],
  },
  {
    type: "collection" as const,
    id: "repair-counter",
    title: "Kitchen counters",
    cover: { src: "/repair/Aaron_DuChateau_counter_final.jpg", alt: "Live-edge wood counters — finished" },
    contextLabel: "Repairs & Projects",
    intro:
      "From speckled laminate and a tired double sink to thick live-edge slabs on black cabinets.",
    detail:
      "The counter swap in order: old top, tear-out and prep, then the finished wood you can actually chop on.",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_counter_1.jpg",
          "Aaron_DuChateau_counter_2.jpg",
          "Aaron_DuChateau_counter_3.jpg",
          "Aaron_DuChateau_counter_5.jpg",
          "Aaron_DuChateau_counter_6.jpg",
          "Aaron_DuChateau_counter_final.jpg",
        ] as const,
        "repair-counter",
      ),
    ],
  },
  {
    type: "collection" as const,
    id: "repair-built-in",
    title: "Built-in wall niche",
    cover: { src: "/repair/Aaron_DuChateau_built_in_styled_2.jpg", alt: "Built-in shelves — styled and lit" },
    contextLabel: "Repairs & Projects",
    intro:
      "A recessed shelf cut into the paneling, framed, shelved, and painted to match the wall.",
    detail:
      "From the first rectangular cutout through framing and shelves to the finished gray niche.",
    items: [
      ...funThingPhotos(
        "repair",
        [
          "Aaron_DuChateau_built_in_1.jpg",
          "Aaron_DuChateau_built_in2.jpg",
          "Aaron_DuChateau_built_in_4.jpg",
          "Aaron_DuChateau_built_in_final.jpg",
          "Aaron_DuChateau_built_in_styled_1.jpg",
          "Aaron_DuChateau_built_in_styled_2.jpg",
        ] as const,
        "repair-built-in",
      ),
    ],
  },
  {
    type: "slideReveal" as const,
    id: "repair-table-fire",
    before: { src: "/repair/Aaron_DuChateau_table_fire_2.jpg", alt: "Fire table — lit" },
    after: { src: "/repair/Aaron_DuChateau_table_fire_1.jpg", alt: "Fire table — build stage" },
    intro: "A coffee-table fire pit that went from framing and burner layout to flames you can sit around after dark.",
    detail:
      "Fire one is the build: box frame, burner hardware, the careful part where you measure twice because propane and wood are unforgiving neighbors.\n\nFire two is the first real burn—glass on, flame even, the backyard suddenly worth staying out for. Slide across for the project that doubles as a heater.",
  },
  {
    type: "slideReveal" as const,
    id: "repair-yard",
    before: { src: "/repair/Aaron_DuChateau_yard.jpg", alt: "Yard — cleared and planted" },
    after: { src: "/repair/Aaron_DuChateau_tarp_first.jpg", alt: "Yard — tarp phase" },
    intro: "Backyard rehab that started under blue tarps and ended with grass, beds, and fewer tripping hazards.",
    detail:
      "Tarp first is the messy middle—plastic everywhere, dirt moved, the yard looking worse before it gets better.\n\nThe finished yard shot is what all that digging and dragging was for: open space, growth coming back, no more construction-site aesthetic from the porch. Slide across for the long-game landscaping win.",
  },
];

const randomMedia = [
  {
    type: "video" as const,
    id: "random-video-2",
    youtubeId: "G-wHJ37Xau0",
    externalLink: youtubeLink("G-wHJ37Xau0"),
  },
  {
    type: "video" as const,
    id: "random-video",
    youtubeId: "kPYcVI7hMOs",
    externalLink: youtubeLink("kPYcVI7hMOs"),
  },
  {
    type: "video" as const,
    id: "random-video-3",
    youtubeId: "TtzYYVJnCoQ",
    externalLink: youtubeLink("TtzYYVJnCoQ"),
    gatedByFeature: RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID,
  },
  {
    type: "collection" as const,
    id: "random-avocado-incident",
    title: "The Avocado incident",
    cover: { src: "/photography/Aaron_DuChateau_avocado_knife.jpg", alt: "Avocado on a knife — the incident" },
    contextLabel: "Random Pins",
    intro:
      "A kitchen experiment that earned a name, a dog, stitches, and a Google search.",
    detail:
      "The avocado, the knife, the floor, the hand, the hospital, and the official term for what just happened.",
    items: [
      ...funThingPhotos(
        "photography",
        [
          "Aaron_DuChateau_avocado_knife.jpg",
          "Aaron_DuChateau_patrick_kitchen.jpg",
          "Aaron_DuChateau_stitched_hand.jpg",
          "Aaron_DuChateau_hospital.jpg",
          "Aaron_DuChateau_avocado_hand.jpg",
        ] as const,
        "random-avocado-incident",
      ),
    ],
  },
  ...funThingPhotos("photography", randomPhotoFiles, "random").map((item) => {
    if (item.id === "random-burn") return { ...item, locked: true as const };
    if (item.id === "random-monkey_dog") {
      return { ...item, gatedByFeature: RANDOM_MONKEY_DOG_FEATURE_ID };
    }
    return item;
  }),
];

const tshirtFiles = [
  "Aaron_DuChateau_skurttle.png",
  "Aaron_DuChateau_worn_skurttle.png",
  "Aaron_DuChateau_bear.jpg",
  "Aaron_DuChateau_worn_bear_storm.png",
  "Aaron_DuChateau_storm.jpg",
  "Aaron_DuChateau_giraffe.jpg",
  "Aaron_DuChateau_hippie.png",
  "Aaron_DuChateau_worn_triptych_color.png",
  "Aaron_DuChateau_machine.png",
  "Aaron_DuChateau_worn_triptych_white.png",
] as const;

export const funThingsSection = {
  title: "Fun things.",
  description:
    "Interesting snapshots and milestones archived throughout my life—small cross-sections of experiences worth revisiting.",
  cards: [
    {
      id: "t-shirt-designs",
      title: "T-shirt designs",
      imageSrc: "/tshirt/Aaron_DuChateau_cover-.png",
      modal: {
        title: "T-shirt designs",
        date: "2007–2009",
        intro:
          "I was the lead designer for a local t-shirt company in Eugene, Oregon—graphics that ended up on chests all over town for a couple of years.",
        detail:
          "From about 2007 through 2009 I owned the creative direction for a small Eugene shop printing tees for locals, campus crowds, and anyone who wanted something weird on cotton instead of another Ducks logo.\n\nThese are a handful of the designs that actually shipped. Walk around Eugene back then and you would spot them—on friends, strangers at coffee shops, people at shows. That was the payoff: not a portfolio PDF, but seeing your line work and type choices walking down Willamette Street.\n\nSwipe through the gallery for bears, storms, and whatever Skurttle was supposed to be.",
        contextLabel: "Fun things",
        media: funThingPhotos("tshirt", tshirtFiles, "tshirt"),
      },
    },
    {
      id: "painting",
      title: "Painting",
      imageSrc: "/painting/Aaron_DuChateau_penguins.png",
      modal: {
        title: "Painting",
        date: "Archive",
        intro:
          "Canvas and acrylic experiments over the years—pets, pop-culture nods, portraits, and whatever subject caught my eye between projects.",
        detail:
          "Not a gallery career, just painting because it is fun. Dogs, ships, penguins, people I know, and the occasional Darth Vader because why not.\n\nAcrylics are my favorite medium.\n\nThese are pieces that actually left the easel—unfinished sketches and abandoned canvases stay in the closet. Swipe through for the greatest hits.",
        contextLabel: "Fun things",
        media: paintingMedia,
      },
    },
    {
      id: "photography",
      title: "Photography",
      imageSrc: "/photography/Aaron_DuChateau_bonkers.jpg",
      modal: {
        title: "Photography",
        date: "Archive",
        intro:
          "Street scenes, family moments, concerts, and candid shots—mostly captured on whatever camera I had in my pocket at the time.",
        detail:
          "Photography has been a side thread forever: buildings in Eugene, family portraits, food on the table, DMB shows, cliff edges, bike piles, and strangers on the bus.\n\nThese are pulls from the hard drive—unfiltered snapshots rather than a curated portfolio shoot. Swipe through for the long tail of what caught my eye.",
        contextLabel: "Fun things",
        media: funThingPhotos("photography", photographyFiles, "photography"),
      },
    },
    {
      id: "cooking",
      title: "Cooking & Garden",
      imageSrc: "/cooking/Aaron_DuChateau_patrick_yard.jpg",
      modal: {
        title: "Cooking & Garden",
        date: "Archive",
        intro:
          "Food I've cooked, plated, and shared—home-kitchen experiments and spreads worth photographing before anyone grabbed a fork.",
        detail:
          "Cooking is another creative outlet when I am not behind a keyboard. Lasagna layers, fish dishes, basil from the garden, yard harvests, and feasts spread across the whole table.\n\nIf it looked good enough to snap before eating, it probably landed in this folder. Swipe through for the edible archive.",
        contextLabel: "Fun things",
        media: cookingMedia,
      },
    },
    {
      id: "travel",
      title: "Travel & Exploration",
      imageSrc: "/travel/Aaron_DuChateau_travel.jpg",
      modal: {
        title: "Travel & Exploration",
        date: "Archive",
        intro:
          "Trips and detours—Puerto Rico, Belize, Florida beaches, Sun Valley, Washington, and everywhere in between.",
        detail:
          "Travel photos from years of planes, boats, and bikes without much of an itinerary. Beaches, street art, wildlife, family vacations, Belize, the Philippines, Seattle, and random moments that only make sense if you were there.\n\nPuerto Rico alone could be its own album—here is the wider scatter plot. Swipe through.",
        contextLabel: "Fun things",
        media: funThingPhotos("travel", travelFiles, "travel"),
      },
    },
    {
      id: "adventure",
      title: "Adventure",
      imageSrc: "/adventure/Aaron_DuChateau_wipeout.jpg",
      modal: {
        title: "Adventure",
        date: "Archive",
        intro:
          "Rafts, bikes, snow, wipeouts, and the occasional crash—outdoor experiments where the story is usually more interesting than the landing.",
        detail:
          "Fishing trips, foraging walks, river runs, startup-weekend energy in the wild, and jumps that probably looked cooler in my head than in the photo.\n\nIf it involved motion, mild risk, or explaining later why that was a good idea, it probably ended up here. Swipe through.",
        contextLabel: "Fun things",
        media: funThingPhotos("adventure", adventureFiles, "adventure"),
      },
    },
    {
      id: "repairs",
      title: "Repairs & Projects",
      imageSrc: "/repair/Aaron_DuChateau_fan_final_jars.jpg",
      modal: {
        title: "Repairs & Projects",
        date: "Archive",
        structureId: "repairs",
        intro:
          "Before-and-after fixes around the house, yard, bikes, and cars—documented because future-me never remembers what already got solved.",
        detail:
          "Roof tarps, deck boards, lamp rewires, stereo resurrections, table refinishes, and the green bike that finally stopped squeaking. Some of these are triumphs; some are polite warnings to hire a pro next time.\n\nSwipe through for the home-lab repair and project log.",
        contextLabel: "Fun things",
        media: repairMedia,
      },
    },
    {
      id: "random",
      title: "Random Pins",
      imageSrc: "/photography/Aaron_DuChateau_pigs.jpg",
      modal: {
        title: "Random Pins",
        date: "Archive",
        intro:
          "A dump drawer for things I have observed or made that I think are interesting for one reason or another—no theme required.",
        detail:
          "This is just a new area to pin videos, photos, and stray moments that did not belong in the other albums but still felt worth keeping. Some of it I made; some of it I just ran into.\n\nSwipe through whatever landed here.",
        contextLabel: "Fun things",
        media: randomMedia,
        externalLink: youtubeLink("kPYcVI7hMOs"),
      },
    },
  ],
} as const;
