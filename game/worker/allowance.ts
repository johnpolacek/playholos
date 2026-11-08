import { DurableObject } from "cloudflare:workers";
import { FREE_QUESTIONS } from "@/lib/access";

// What the Mind may spend on us in a day, for players who open it with a pass instead of their own key. One instance
// holds every count, so two questions at once can't both slip past a cap. Days are UTC. 2026-11-08.

/** Questions one address may ask on us in a day, for a crowd behind one address, as a school is. */
export const FREE_PER_ADDRESS = 300;
/** Dollars all players may spend on us in a day: $200 of credit over the month it lasts, 2026-11-08 to 2026-12-07. */
export const FREE_DOLLARS = 7;

export type Taken = { ok: true; left: number } | { ok: false; why: "player" | "address" | "spent" };

const today = () => new Date().toISOString().slice(0, 10);

export class Allowance extends DurableObject {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS asked (day TEXT, who TEXT, n INTEGER, PRIMARY KEY (day, who))");
    this.sql.exec("CREATE TABLE IF NOT EXISTS spent (day TEXT PRIMARY KEY, dollars REAL)");
  }

  private count(day: string, who: string) {
    return (this.sql.exec<{ n: number }>("SELECT n FROM asked WHERE day = ? AND who = ?", day, who).toArray()[0]?.n ?? 0) as number;
  }

  private dollars(day: string) {
    return (this.sql.exec<{ dollars: number }>("SELECT dollars FROM spent WHERE day = ?", day).toArray()[0]?.dollars ?? 0) as number;
  }

  /** Takes one question for a player at an address, if today's caps allow it. News the Mind tells unasked takes from
   *  the day's dollars but not from the player's questions. */
  take(player: string, address: string, question: boolean): Taken {
    const day = today();
    if (this.dollars(day) >= FREE_DOLLARS) return { ok: false, why: "spent" };
    const asked = this.count(day, `p:${player}`);
    if (!question) return { ok: true, left: FREE_QUESTIONS - asked };
    if (asked >= FREE_QUESTIONS) return { ok: false, why: "player" };
    if (this.count(day, `a:${address}`) >= FREE_PER_ADDRESS) return { ok: false, why: "address" };
    const add = "INSERT INTO asked (day, who, n) VALUES (?, ?, 1) ON CONFLICT (day, who) DO UPDATE SET n = n + 1";
    this.sql.exec(add, day, `p:${player}`);
    this.sql.exec(add, day, `a:${address}`);
    // Yesterday's counts are no longer needed.
    this.sql.exec("DELETE FROM asked WHERE day < ?", day);
    return { ok: true, left: FREE_QUESTIONS - asked - 1 };
  }

  /** Adds what an answer cost to the day. */
  spend(dollars: number) {
    if (!(dollars > 0)) return;
    this.sql.exec("INSERT INTO spent (day, dollars) VALUES (?, ?) ON CONFLICT (day) DO UPDATE SET dollars = dollars + ?", today(), dollars, dollars);
  }

  /** The player's questions left today, and whether the day's dollars are spent. */
  left(player: string) {
    const day = today();
    return { left: Math.max(0, FREE_QUESTIONS - this.count(day, `p:${player}`)), spent: this.dollars(day) >= FREE_DOLLARS };
  }
}

/** The one instance. */
export const allowance = (env: Env) => env.ALLOWANCE.get(env.ALLOWANCE.idFromName("mind"));
