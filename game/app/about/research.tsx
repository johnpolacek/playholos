import { DocBody, PageHead } from "@/components/about/doc-page";
import doc from "../../../HOLOS_RESEARCH.md?doc";
import { sources } from "../../../HOLOS_RESEARCH.md?stats";

export default function Research() {
  return (
    <main>
      <title>Research · Holos</title>
      <PageHead
        kicker="THE RESEARCH"
        title="Every source the game rests on"
        stats={[
          [sources, "sources"],
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
