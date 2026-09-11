/**
 * Next.js App Router's 404 page (file-convention, rendered automatically
 * for any unmatched route or a manual notFound() call). A Server
 * Component is fine here - unlike error.tsx, there's no error object or
 * reset() callback to wire up, just a plain link back home.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-foreground-faint">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-foreground-soft">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-mid px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-deep"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
