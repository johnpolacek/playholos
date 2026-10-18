"use server";

import { cookies } from "next/headers";
import { isAnthropicKey, KEY_COOKIE } from "@/lib/access";

// The player's own Anthropic key, for the menu and the Mind tab. The cookie hides it from the page, so they ask here.

/** Whether this browser asks the Mind with the player's own key. */
export async function keyInUse() {
  return isAnthropicKey((await cookies()).get(KEY_COOKIE)?.value);
}

export async function forgetKey() {
  (await cookies()).delete(KEY_COOKIE);
}
