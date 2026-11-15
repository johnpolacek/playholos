import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible";
import { useState } from "react";
import { Dials } from "@/components/icons";
import { TabHead } from "@/components/tab-head";

/** The Mind tab, drawn: its head, the dials that fold its settings open over the talk, and the talk. The model, effort,
 *  cost and key sit behind one button, so play never shows them unasked. The route feeds it, and /ui/mind. 2026-11-15. */
export function MindTab({ locked = false, settings, children }: { locked?: boolean; settings?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="contents">
      <TabHead
        title="MIND"
        right={locked ? "LOCKED" : undefined}
        tool={
          settings ? (
            <CollapsibleTrigger aria-label="Mind settings" className="p-2.5 transition-colors hover:text-ink data-open:text-ink">
              <Dials />
            </CollapsibleTrigger>
          ) : undefined
        }
      />
      {settings && <CollapsiblePanel className="contents">{settings}</CollapsiblePanel>}
      {children}
    </Collapsible>
  );
}
