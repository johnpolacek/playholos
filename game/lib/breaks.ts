// Clean line breaks. A line ends at a sentence's end, never on the first word of the next one, as on ". We". Each
// sentence's first word is held to its second by a space that doesn't break, so the two wrap together. Not when the
// pair would be too long to fit a narrow line, nor in what we type or code.
const END = /[.!?…][”’")\]]*$/;
const LONGEST = 26;
const SKIP = "script, style, textarea, input, code, pre, [contenteditable]";

function hold(text: string) {
  const words = text.split(" ");
  // A first word that is a whole sentence, as "Yes.", leaves the hold to the next.
  const held = (i: number) =>
    i > 0 &&
    END.test(words[i - 1]) &&
    !!words[i] &&
    !!words[i + 1] &&
    !END.test(words[i]) &&
    words[i].length + words[i + 1].length < LONGEST;
  return words.reduce((all, word, i) => all + (held(i - 1) ? "\u00A0" : " ") + word);
}

function tidy(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue ?? "";
    if (!text.includes(" ") || node.parentElement?.closest(SKIP)) return;
    const held = hold(text);
    if (held !== text) node.nodeValue = held;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE || (node as Element).closest(SKIP))
    return;
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let text = walk.nextNode(); text; text = walk.nextNode()) tidy(text);
}

/** Holds every sentence's first word to its second across the page, now and as it changes. */
export function holdSentenceStarts() {
  tidy(document.body);
  new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "characterData") tidy(change.target);
      else change.addedNodes.forEach(tidy);
    }
  }).observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}
