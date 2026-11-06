/** The watcher's word, said plainly: what it is, and what it means for us. Shared by the Mind's note and the jump's report.
 *  2026-11-05. */
export function watcherWords(lead: { star: string }, warned: boolean) {
  const head = lead.star === "A signal from close by"
    ? "Something saw our ship leave, and answered."
    : "Something has been watching us from close by.";
  const tail = warned
    ? "It is warning us: another seed of ours sent out could draw its makers’ reply."
    : "Whoever left it has watched us a long time, and could be the nearest mind there is.";
  return { head, tail };
}
