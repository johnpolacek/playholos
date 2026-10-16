import { notFound } from "next/navigation";

// Godview: what is true in this game that the player can't see. Dev only.
export default function Godview() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold">Godview</h1>
      <p className="mt-1 text-sm text-page-ink2">The seed, the neighbors, and what each knows of Earth.</p>
    </main>
  );
}
