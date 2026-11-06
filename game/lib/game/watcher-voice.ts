// The watcher's rule as it speaks it: one line in eleven of our languages, learned from our broadcasts, English last.
// The audio is made once by scripts/watcher-voice.mjs, which holds the same lines. 2026-11-05.

export type Spoken = { lang: string; name: string; text: string; rtl?: boolean };

export const WATCHER_VOICE: Spoken[] = [
  { lang: "zh", name: "中文", text: "看吧，听吧，随意说话。不要在别的恒星建造。" },
  { lang: "hi", name: "हिन्दी", text: "देखो, सुनो और जैसा चाहो बोलो। किसी और तारे पर निर्माण मत करो।" },
  { lang: "es", name: "Español", text: "Mirad, escuchad y hablad como queráis. No construyáis en ninguna otra estrella." },
  { lang: "ar", name: "العربية", text: "انظروا واستمعوا وتكلموا كما تشاؤون. لا تبنوا عند أي نجم آخر.", rtl: true },
  { lang: "fr", name: "Français", text: "Regardez, écoutez et parlez comme vous voulez. Ne bâtissez près d’aucune autre étoile." },
  { lang: "ru", name: "Русский", text: "Смотрите, слушайте и говорите как хотите. Не стройте ни у какой другой звезды." },
  { lang: "pt", name: "Português", text: "Olhem, ouçam e falem como quiserem. Não construam em nenhuma outra estrela." },
  { lang: "ja", name: "日本語", text: "見よ、聞け、好きに話せ。ほかの星で築くな。" },
  { lang: "sw", name: "Kiswahili", text: "Tazameni, sikilizeni na semeni mpendavyo. Msijenge kwenye nyota nyingine yoyote." },
  { lang: "de", name: "Deutsch", text: "Schaut, hört und sprecht, wie ihr wollt. Baut bei keinem anderen Stern." },
  { lang: "en", name: "English", text: "Look, listen and speak as you like. Build at no other star." },
];

/** The readings that carry the voice. */
export const VOICED = new Set(["watcher-answer", "watcher-warning"]);
