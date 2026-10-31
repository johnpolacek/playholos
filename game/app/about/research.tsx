import { Ages } from "@/components/about/ages";
import { Dials } from "@/components/about/dials";
import { Quiet } from "@/components/about/quiet";
import { DocBody, PageHead } from "@/components/about/doc-page";
import doc from "../../../HOLOS_RESEARCH.md?doc";

// The contents, by the page's big questions. Each names the doc's own sections that bear on it, by their headings. A
// section the page draws links to it. Any heading left out falls under the last group.
const GROUPS = [
  {
    title: "How common are minds?",
    href: "#dials",
    sections: [
      "How common minds are",
      "Kinds of worlds",
      "Where neighbors can live",
    ],
  },
  {
    title: "How old are they?",
    href: "#ages",
    sections: ["Elders", "Other worlds’ starting points"],
  },
  {
    title: "Why is the sky quiet?",
    href: "#quiet",
    sections: [
      "Why the sky is quiet",
      "Hearing technology by radio",
      "Black holes",
    ],
  },
  {
    title: "How far can we reach?",
    sections: [
      "Travel, sails and lenses",
      "Outposts and colonies",
      "The drift",
      "Real masses behind the projects",
      "Industry and big works",
      "Builds we lack",
    ],
  },
  {
    title: "What can we see?",
    sections: ["Seeing worlds", "Reading air", "The leads", "Earth’s leads"],
  },
  {
    title: "Earth and us",
    sections: [
      "Earth to Year 0",
      "Earth’s character",
      "Sending messages",
      "Hostility",
      "Running the neighbors",
    ],
  },
  { title: "Keeping current", sections: ["Watch list", "To check"] },
];

export default function Research() {
  return (
    <main>
      <title>Research · Holos</title>
      <PageHead kicker="THE RESEARCH">
        Holos starts from real data and the newest published research, and only
        then speculates, from the best evidence there is.
      </PageHead>
      <Dials />
      <Ages />
      <Quiet />
      <DocBody doc={doc} groups={GROUPS} />
    </main>
  );
}
