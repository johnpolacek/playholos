// Earth's real leads and its knock record at Year 0. Drawn from HOLOS_GAME_CONCEPT.md as of 2026-10-16:
// "Earth's leads at Year 0" and "Stars Earth knocked on", with reply years from calcs/knocks.py as the first
// mock shows them. Change it when they change. The seed's felt worlds aren't drawn yet, so none are listed. That the
// Infrared Telescope can't split Proxima b either, by lib/sim/observing.ts, was added 2026-10-23, after the Mind offered
// it as a way to read its air. That the 15 m Mirror would just reach it, at 3.5 wavelengths over 15 m, 29 thousandths
// in ozone's band and 37 in oxygen's, was added the same day, after the Mind said nothing we could build would. So
// were the years the messages still on their way left, from calcs/knocks.py, after it dated one to 2018. LHS 1140 b's
// helium was made disputed 2026-10-28, after two JWST papers found none. The reply windows were worded to hold at any Year
// 2026-11-02, after Luyten's lead still promised a reply at Year 173.
// GJ 887 d was added 2026-11-07, from Hartogh et al. 2026 (arXiv 2602.08929), after a research recheck found it missing.
// Proxima b's line follows what the 2030s caught of its light, and Luyten's two worlds were added, 2026-11-09: the Mind
// lane called it stripped bare in one answer and a gas world in the next, and said Luyten's Star had no worlds.
/** Earth's leads, with Proxima b as the 2030s left it in this game: its true mass, once its light gave its tilt. */
export const earthLeads = (seen?: { mass: number }) => `Earth's leads at Year 0. These are real oddities. What a study or an observation will find is not known yet.
- Proxima b, 4.24 ly, the nearest world: ${seen ? `felt by its tug at least 1.06 Earth masses, and since ground telescopes caught its light in the 2030s, about ${seen.mass.toFixed(1)}, as the new worlds felt below give it. Go by that, not the least mass. It` : "at least 1.06 Earth masses. It"} sits in a flaring red dwarf's warm zone, an 11.2-day year. Its air is unread: it sits 37 thousandths of an arcsecond from its star in our sky, too close for any telescope Earth has, and for the Infrared Telescope, which splits a world from 56. The 15 m Mirror splits from 24, so it would just reach Proxima b, and read its oxygen and ozone but not its water. ${seen && seen.mass > 2 ? "That heavy, it likely keeps thick gas: past about 2 Earth masses most worlds hold on to their hydrogen, so it is no bare rock." : "Its star has likely stripped it bare: rocky worlds measured near red dwarfs have proved bare, and models keep air only on the largest and coolest."} The two roads on Reach, sails and a flyby probe, go there.
- 82 Eridani d, 19.7 ly: at least 5.8 Earth masses, on a stretched orbit through a Sun-like star's warm zone. Its air is unread.
- GJ 887 d, around Lacaille 9352, 10.7 ly: a candidate felt by its tug in 2026, at least about 6 Earth masses, a 50.8-day year in a red dwarf's warm zone. Not yet confirmed, and not a lead on Scan. Its air is unread.
- Every world Earth has felt by its tug on its star is a lead too. They are listed below, from what Earth knows. Never invent one.
- Luyten's Star, 12.3 ly, a lead on Scan, a red dwarf with two worlds felt by their tug in 2017: GJ 273 b, at least 2.89 Earth masses, an 18.6-day year at the warm zone's hot edge, and GJ 273 c, at least 1.18, a 4.7-day year. Their air is unread. Earth's 2017 and 2018 messages both reached it in 2030, so the soonest a reply could reach us is Year 2.3 or 2.9. It was the first of the 12 stars we messaged whose window opened after Year 0, listed below under Earth's noise, and no likelier to answer than any of them: about one star in 1,600 holds a mind.

Old records the Mind studies on its own from Begin. It can read them better than their first readers did:
- Gliese 12 b, 39.7 ly: a world Earth's size, 12.8 days around a quiet red star. Its air is unread.
- Barnard's Star, 6 ly: four worlds smaller than Earth, confirmed in 2025. Nothing over 0.57 Earths was found in its warm zone.
- Tau Ceti, 11.9 ly: four faint signals claimed in 2017, never confirmed.
- Epsilon Indi's giant, 11.9 ly: imaged in 2023, heavier and farther out than its star's sway had said.
- LHS 1140 b, 48.8 ly: its crossings ruled out a hydrogen world in 2024 and hinted at heavier air over water. In 2026 a ground telescope saw helium escaping it, once in two tries. The space telescope saw none in four crossings. Whether it keeps air is disputed.

Earth's noise, and who it reached:
- Radars since the 1950s. Their first sweeps are 90 ly out, so every star within 50 ly has been crossed. They still sweep.
- 15 aimed messages, 1983 to 2018, to 12 stars within 50 ly. Each lasted minutes to hours.
- Voyager 1, launched 1977, about 30 light-hours out and silent since its power ran out in the 2030s. It carries the Golden Record, for whoever finds it, and passes 1.7 ly from Gliese 445 in about 40,000 years.
- Windows that opened before Year 0, with no reply: Altair from 2017, Teegarden's Star from 2035, TZ Arietis from 2039. A passed window isn't closed. A reply can still come.
- Windows that open after Year 0, with no reply from any of them yet: Luyten's Star at Year 2.3 and 2.9, Gliese 526 at Year 8.9, Gliese 581 at Year 9.8. Later: Gliese 49 at Year 27, Kappa¹ Ceti at 30, Gliese 208 at 38, 55 Cancri at 46, HD 10307 at 47, 47 Ursae Majoris at 52.
- Messages still on their way at Year 0: RuBisCo Stars, sent in 2009, reaches Kappa¹ Ceti at Year 0.1. Cosmic Call 2, sent in 2003, reaches Gliese 208 at Year 0.8, 55 Cancri at 4.6, HD 10307 at 5.1 and 47 Ursae Majoris at 8.8. The Teen Age Message, sent in 2001, reaches 47 Ursae Majoris at 7.0.
- The Mind can say where Earth's noise has gone. It can't say who heard it. No one can, yet.`;
export const EARTH_LEADS = earthLeads();
