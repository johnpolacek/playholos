import { Link } from "react-router";

// An address the game doesn't have.
export default function NotFound() {
  return (
    <main className="grid h-dvh place-items-center bg-paper px-4 text-center">
      <title>Not found · Holos</title>
      <div>
        <p className="font-mono text-[10.5px] tracking-[.1em] text-muted">404</p>
        <p className="mt-3 text-[15px] text-page-ink2">We have nothing at this address.</p>
        <Link to="/" className="mt-5 inline-block text-[13px] text-ink underline underline-offset-2">
          Back to the game
        </Link>
      </div>
    </main>
  );
}
