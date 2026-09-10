import Image from "next/image";
import type { CmsSection } from "@/lib/cmsContentApi";

/**
 * ADR-0012's block registry: a Cms-authored section's `type` maps to
 * exactly one React component here — the entire mechanism by which
 * Lakbay.Cms's Content-tree content reaches the screen (no Razor
 * involved, ADR-0006). Adding a new section type in Lakbay.Cms's
 * ContentTreeSeeder without adding its component here leaves editors
 * able to author a block that renders as nothing on the live site — see
 * that file's own comment.
 */

function HeroSection({ section }: { section: Extract<CmsSection, { type: "hero" }> }) {
  return (
    <section className="relative overflow-hidden border-b border-teal-line px-6 py-16 text-center text-white">
      <Image
        src={section.imageUrl}
        alt={section.heading}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-3xl font-semibold text-balance">{section.heading}</h2>
        <p className="mt-3 text-white/90">{section.subtext}</p>
      </div>
    </section>
  );
}

function ImageTextSection({ section }: { section: Extract<CmsSection, { type: "imageText" }> }) {
  const imageFirst = section.imagePosition !== "right";

  return (
    <section className="border-b border-teal-line px-6 py-14">
      <div
        className={`mx-auto grid max-w-4xl items-center gap-8 sm:grid-cols-2 ${
          imageFirst ? "" : "sm:[&>*:first-child]:order-2"
        }`}
      >
        <div className="relative h-56 overflow-hidden rounded-xl sm:h-64">
          <Image src={section.imageUrl} alt={section.heading} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-teal-deep">{section.heading}</h3>
          <p className="mt-3 text-foreground-soft">{section.text}</p>
        </div>
      </div>
    </section>
  );
}

// A plain Record, not a per-key-mapped type: TypeScript can't preserve
// the hero/imageText discriminant through a homomorphic mapped type here
// (it collapses to `never` across the union) — each Block component
// below still gets its own precise, narrowed prop type; only this
// registry's lookup step is untyped, matching what's actually true at
// runtime (the section's own `type` field is the only thing selecting
// which component runs).
const REGISTRY: Record<string, (props: { section: never }) => React.ReactElement> = {
  hero: HeroSection as (props: { section: never }) => React.ReactElement,
  imageText: ImageTextSection as (props: { section: never }) => React.ReactElement,
};

export function CmsSections({ sections }: { sections: CmsSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        const Block = REGISTRY[section.type];

        if (!Block) {
          // Matches ADR-0012's own warning: an unregistered type renders
          // as nothing, not a crash — an editor's typo shouldn't 500 the
          // page, but it also shouldn't fail silently in dev.
          if (process.env.NODE_ENV === "development") {
            console.warn(`CmsSections: no block registered for type "${section.type}"`);
          }
          return null;
        }

        return <Block key={i} section={section as never} />;
      })}
    </>
  );
}
