import type { Metadata } from "next";
import { DocBody, PageHead } from "@/components/about/doc-page";
import { renderDoc, sourceCount } from "@/lib/about/docs";

export const metadata: Metadata = {
  title: "Research",
  description: "Every source Holos rests on: what it found, why it matters, and where the game uses it.",
};

export default function Research() {
  const doc = renderDoc("HOLOS_RESEARCH.md");
  return (
    <main>
      <PageHead
        kicker="THE RESEARCH"
        title="Every source the game rests on"
        stats={[
          [sourceCount(), "sources"],
          [doc.toc.length, "questions"],
        ]}
      >
        Holos starts from real data and the newest published research, and only then speculates, from the best evidence
        there is. Each source below says what it found, why it matters to the game, and where the design uses it. A
        newer result never deletes an older one: the older is marked superseded.
      </PageHead>
      <DocBody doc={doc} />
    </main>
  );
}
