import { DocBody, PageHead } from "@/components/about/doc-page";
import doc from "../../../HOLOS_GAME_CONCEPT.md?doc";

export default function Design() {
  const settled = doc.html.match(/\b(Settled|settled) 20\d\d-\d\d-\d\d/g)?.length ?? 0;
  return (
    <main>
      <title>Design · Holos</title>
      <PageHead
        kicker="THE DESIGN"
        title="The rules, one question at a time"
        stats={[
          [doc.toc.length, "sections"],
          [settled, "dated answers"],
        ]}
      >
        The game&rsquo;s design document, as it stands today. Each rule is a question answered from the evidence, and
        each answer is dated. A limit on what Earth can do comes from physics or cost, never from a game rule. Some
        links point to private working files and show as plain text.
      </PageHead>
      <DocBody doc={doc} />
    </main>
  );
}
