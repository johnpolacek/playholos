// How long each craft takes to cross the light-years: the one place the game works it out, so no screen, no word of
// the Mind's and no other mind's craft keeps its own copy. Step 1 of setting speed by physics, 2026-11-11: each craft
// still flies as it has, a cruise at its own fixed speed with its burn and its braking added. calcs/speeds.py holds
// what physics gives for each trip, and this module follows it next.
import catalog from "../../data/works.json" with { type: "json" };

const { probe: PROBE, sentinel: SENTINEL, seedShip: SHIP, speeds: SPEEDS } = catalog;

/** Sails of a few grams, pushed by our Laser Sail Array: a fifth of light speed, Starshot's. */
export const SAIL_C = SPEEDS.sail;
/** Our bullets, as a share of light speed: thrown by fusion, which holds them to a tenth. */
export const BULLET_C = SPEEDS.bullet;
/** What another mind sends, as a share of light speed: calcs/minds.py's REPLY_C. */
export const THEIR_C = SPEEDS.theirs;

/** Years for our sails to pass a star `ly` away. */
export const sailYears = (ly: number) => ly / SAIL_C;
/** Years for a flyby probe to pass a star `ly` away: its cruise, and what its burn adds. */
export const flybyYears = (ly: number) => ly / PROBE.speed + PROBE.burn;
/** Years for a sentinel to reach a place `ly` away and stop: its cruise, its burn, and braking on its magnetic sail. */
export const sentinelYears = (ly: number) => ly / SENTINEL.speed + SENTINEL.burns + SENTINEL.brake;
/** A sentinel's cruise alone, with no burn or braking counted. */
export const sentinelCruise = (ly: number) => ly / SENTINEL.speed;
/** Years for a seed ship or a seed probe to land `ly` away: its cruise, its start, and braking on its magnetic sail.
 *  `start` is the Years its start costs where our Ship Beam pushed it, in place of its burn's. */
export const shipYears = (ly: number, start: number = SHIP.burn) => ly / SHIP.speed + start + SHIP.brake;
/** Years for a bullet of ours to land `ly` away. It never brakes. */
export const bulletYears = (ly: number) => ly / BULLET_C;
/** Years for what another mind sends to cross `ly`. */
export const theirYears = (ly: number) => ly / THEIR_C;
