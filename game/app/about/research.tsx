import { Ages } from "@/components/about/ages";
import { Dials } from "@/components/about/dials";
import { DocBody, PageHead } from "@/components/about/doc-page";
import doc from "../../../HOLOS_RESEARCH.md?doc";

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
      <DocBody doc={doc} />
    </main>
  );
}
