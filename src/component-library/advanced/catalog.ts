import { INTRO_SIDE_QUESTS } from "@/data/introScreen";
import { education, testimonials, workHistory } from "@/data/content";
import type { LibraryStory } from "../types";
import { COMPARE_SLIDER_SAMPLES } from "../compareSliderStory";
import { THEME_CARD_SAMPLES } from "../themeCardStory";
import { LEAVE_SITE_LIBRARY_PROJECTS } from "../leaveSiteConfirmStory";

const digitalArts = education[0];
const firstLetter = testimonials[0];

export const ADVANCED_STORIES: readonly LibraryStory[] = [
  {
    id: "education-card",
    kind: "advanced",
    name: "Education card",
    summary:
      "Same EducationCard as the homepage. Degree is a parent lookup; the card only consumes years, school, detail, and splash colors.",
    controls: [
      {
        key: "educationId",
        label: "Degree (parent lookup)",
        type: "select",
        defaultValue: digitalArts.degree,
        options: education.map((row) => ({
          value: row.degree,
          label: row.degree,
        })),
      },
    ],
  },
  {
    id: "testimonial-card",
    kind: "advanced",
    name: "Testimonial card",
    summary:
      "Same TestimonialCard as the homepage. Letter is a parent lookup; the card only consumes name, title, quote text, and photo.",
    controls: [
      {
        key: "letterId",
        label: "Letter (parent lookup)",
        type: "select",
        defaultValue: firstLetter.id,
        options: testimonials.map((row) => ({
          value: row.id,
          label: row.name,
        })),
      },
    ],
  },
  {
    id: "full-screen-quote",
    kind: "advanced",
    name: "Full screen quote",
    summary:
      "Same FullScreenQuote as the bottom of the homepage. Parent looks up copy and photo; the plate only consumes quote, attribution, and portrait.",
    controls: [],
  },
  {
    id: "compare-slider",
    kind: "advanced",
    name: "Compare slider",
    summary:
      "Same before/after slide-reveal as Photo Critique visual weight. Parent looks up a sample pair; the plate only consumes before/after images and labels. Drag or use the range input to reveal.",
    controls: [
      {
        key: "sampleId",
        label: "Sample (parent lookup)",
        type: "select",
        defaultValue: COMPARE_SLIDER_SAMPLES[0]?.id ?? "gardenTomatoes",
        options: COMPARE_SLIDER_SAMPLES.map((row) => ({
          value: row.id,
          label: row.label,
        })),
      },
    ],
  },
  {
    id: "career-timeline",
    kind: "advanced",
    name: "Career timeline",
    summary:
      "Same CareerTimeline plate as the homepage. Parent looks up the roster; the plate only consumes items, the active index, and timer flags. Phone hides side paddles and swipes the role panel; tablet and full screen show paddles.",
    controls: [
      {
        key: "workHistoryId",
        label: "Role (parent lookup)",
        type: "select",
        defaultValue: workHistory[0]?.id ?? "1",
        options: workHistory.map((row) => ({
          value: row.id,
          label: `${row.employer} · ${row.role}`,
        })),
      },
      {
        key: "paused",
        label: "Timer",
        type: "radio",
        defaultValue: "true",
        options: [
          { value: "true", label: "Paused" },
          { value: "false", label: "Running" },
        ],
      },
    ],
  },
  {
    id: "leave-site-confirm",
    kind: "advanced",
    name: "Leave site confirm",
    summary:
      "Same Visit Site arming plate as major projects. Rest is the project card plus chevron; confirm asks “Are we sure we are Leaving?” Phone stacks the paddle under the card; tablet and full screen put it on the side.",
    controls: [
      {
        key: "projectId",
        label: "Project (parent lookup)",
        type: "select",
        defaultValue: LEAVE_SITE_LIBRARY_PROJECTS[0]?.id ?? "idx-broker-elite",
        options: LEAVE_SITE_LIBRARY_PROJECTS.map((row) => ({
          value: row.id,
          label: row.company,
        })),
      },
      {
        key: "armed",
        label: "Confirm leaving",
        type: "radio",
        defaultValue: "false",
        options: [
          { value: "false", label: "Resting" },
          { value: "true", label: "Are we sure?" },
        ],
      },
    ],
  },
  {
    id: "quiz-player",
    kind: "advanced",
    name: "Quiz",
    summary:
      "Same QuizPlayer as the easter-egg board. Pass a quiz JSON object (four sample questions by default). alreadyUnlocked is the retake state — Complete badge plus fail copy that keeps the card. Right answers play the bound click plus confetti; misses wiggle and play skip-the-fun.",
    controls: [
      {
        key: "alreadyUnlocked",
        label: "Already unlocked",
        type: "radio",
        defaultValue: "false",
        options: [
          { value: "false", label: "Not yet" },
          { value: "true", label: "Unlocked" },
        ],
      },
    ],
  },
  {
    id: "quest-board-card",
    kind: "advanced",
    name: "Easter-egg board card",
    summary:
      "Same quest row as the easter-egg board. Quest is a parent lookup; the card only consumes complete, title, bounty, chips, and the trading-card face.",
    controls: [
      {
        key: "questId",
        label: "Quest (parent lookup)",
        type: "select",
        defaultValue: INTRO_SIDE_QUESTS[0]?.id ?? "quiz-caveman",
        options: INTRO_SIDE_QUESTS.map((row) => ({
          value: row.id,
          label: row.title,
        })),
      },
      {
        key: "complete",
        label: "Complete",
        type: "radio",
        defaultValue: "false",
        options: [
          { value: "false", label: "Not complete" },
          { value: "true", label: "Complete" },
        ],
      },
    ],
  },
  {
    id: "theme-card",
    kind: "advanced",
    name: "Theme card",
    summary:
      "Same Card as the homepage. Card is a parent lookup; the plate only consumes title, excerpt, CTA, date, and a cover object.",
    controls: [
      {
        key: "cardId",
        label: "Card (parent lookup)",
        type: "select",
        defaultValue: THEME_CARD_SAMPLES[0]?.id ?? "vvxlxbaitge",
        options: THEME_CARD_SAMPLES.map((row) => ({
          value: row.id,
          label: row.title,
        })),
      },
    ],
  },
];
