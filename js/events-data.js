/**
 * ============================================================================
 * INTERNWELL SLIET - OFFICIAL EVENTS DATA REPOSITORY
 * ============================================================================
 * How to add or edit events:
 * Simply edit or add objects to the `INTERNWELL_EVENTS` array below.
 * Everything on `events.html` and `index.html` updates automatically!
 * 
 * Fields for each event:
 * - id: unique identifier string (e.g. "iw-talks-2024")
 * - title: Event name
 * - category: "Hackathon" | "Guidance & Seminar" | "Aptitude Exam" | "Bootcamp" | "Social Awareness"
 * - status: "Upcoming" | "Past"
 * - date: Human-readable date
 * - dateFormatted: Short date string for badges
 * - time: Event timings
 * - venue: Location on SLIET campus or online
 * - image: Path to banner image
 * - shortDesc: 1-2 sentence overview for cards
 * - fullDesc: Detailed event description
 * - tags: Array of highlight tags
 * - registrationLink: URL or modal trigger (e.g. "#induction-modal" or external form)
 * - registrationText: Button label (e.g. "Register Now", "View Recap")
 */

const INTERNWELL_EVENTS = [
  {
    id: "iw-talks-2024",
    title: "IW TALKS — Career & Tech Guidance Series",
    category: "Guidance & Seminar",
    status: "Upcoming",
    date: "November 2024",
    dateFormatted: "Nov 2024",
    time: "4:00 PM – 6:30 PM IST",
    venue: "Main Auditorium, SLIET Longowal",
    image: "./assets/images/speaker.jpg",
    shortDesc: "Interactive seminar-cum-guidance session connecting SLIET students with industry leaders and distinguished alumni.",
    fullDesc: "IW TALKS is a seminar cum guidance session that helps students not only to pave their path but also gives them motivation to achieve something. IW talk sessions are the only ones where students can ask their doubts about life, corporate careers, technical roadmaps, and entrepreneurship directly from distinguished mentors.",
    tags: ["Career Guidance", "Tech Seminar", "Alumni AMA", "Mentorship"],
    registrationLink: "#induction-modal",
    registrationText: "Register Now"
  },
  {
    id: "internship-prep-bootcamp",
    title: "Internship Accelerator & Resume Review Sprint",
    category: "Bootcamp",
    status: "Upcoming",
    date: "December 2024",
    dateFormatted: "Dec 2024",
    time: "Weekend Intensive",
    venue: "Hybrid / Central Computing Center",
    image: "./assets/images/events/motiveimg.png",
    shortDesc: "Hands-on preparation sprint: 1-on-1 resume optimization, portfolio reviews, and mock technical interview rounds.",
    fullDesc: "Dedicated upskilling sprint to help SLIET sophomores and pre-final year students secure paid summer internships at product companies and funded tech startups. Includes live freelancing opportunities on real SME digital deliverables.",
    tags: ["Resume Review", "Mock Interviews", "SME Projects", "Placement Prep"],
    registrationLink: "#induction-modal",
    registrationText: "Join Bootcamp"
  },
  {
    id: "coding-spardha-2023",
    title: "CODING SPARDHA — Annual Flagship Hackathon",
    category: "Hackathon",
    status: "Past",
    date: "25 February 2023",
    dateFormatted: "25 Feb 2023",
    time: "10:00 AM – 8:00 PM",
    venue: "Central Computing Center, SLIET",
    image: "./assets/images/hackathon.jpg",
    shortDesc: "Annual coding hackathon organized in collaboration with the SLIET Software Development Club (SSDC) featuring Web-O-Design, Code Manthan, and Dark Code.",
    fullDesc: "Coding Spardha is our annual inter-college coding festival featuring 3 signature tracks: Web-O-Design (rapid UI/UX web development challenge), Code Manthan (algorithmic DSA contest), and Dark Code (blindfolded / dimmed screen coding showdown testing syntax intuition and logical speed).",
    tags: ["Web-O-Design", "Code Manthan", "Dark Code", "Hackathon"],
    registrationLink: "",
    registrationText: "Recap & Winners"
  },
  {
    id: "imat-2022",
    title: "I-MAT — InternWell Mental Ability Test",
    category: "Aptitude Exam",
    status: "Past",
    date: "24 September 2022",
    dateFormatted: "24 Sep 2022",
    time: "2:00 PM – 5:00 PM",
    venue: "Academic Block, SLIET Longowal",
    image: "./assets/images/events/imat.jpg",
    shortDesc: "100-question competitive aptitude test sourced from rigorous national and international exam patterns.",
    fullDesc: "IMAT is an objective-type competitive exam which consists of 100 aptitude questions from different tough exams in India and globally. This exam tests students on many levels, from fundamental mental agility to high-level problem-solving, building placement exam stamina.",
    tags: ["Aptitude", "Mental Ability", "Exam Stamina", "100 Questions"],
    registrationLink: "",
    registrationText: "Completed"
  },
  {
    id: "constitution-awareness-drive",
    title: "Constitution Awareness Program & Quiz",
    category: "Social Awareness",
    status: "Past",
    date: "26 November 2023",
    dateFormatted: "26 Nov 2023",
    time: "3:30 PM – 5:30 PM",
    venue: "EIE Seminar Hall, SLIET",
    image: "./assets/images/events/aboutimg.png",
    shortDesc: "Campus-wide awareness quiz featuring fast buzzer rounds on fundamental rights and civic consciousness.",
    fullDesc: "Organized under the patronage of the Dean (Student-Faculty Welfare), this buzzer-round quiz challenged students on constitutional literacy, civic awareness, and social initiatives, cultivating active and informed student citizenship.",
    tags: ["Buzzer Quiz", "Constitution", "Awareness", "SLIET Campus"],
    registrationLink: "",
    registrationText: "Completed"
  }
];

// Helper to get all events or filter by status/category
function getEvents(filter = "all") {
  if (filter === "all") return INTERNWELL_EVENTS;
  if (filter === "upcoming") return INTERNWELL_EVENTS.filter(e => e.status.toLowerCase() === "upcoming");
  if (filter === "past") return INTERNWELL_EVENTS.filter(e => e.status.toLowerCase() === "past");
  return INTERNWELL_EVENTS.filter(e => e.category.toLowerCase().includes(filter.toLowerCase()));
}
