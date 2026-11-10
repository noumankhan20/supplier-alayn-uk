import { Assemble } from "../motion/primitives";

const CATEGORIES = [
  "Dairy",
  "Vegetables & produce",
  "Meat & poultry",
  "Dry goods & grains",
  "Oils & condiments",
  "Spices & seasonings",
  "Bakery & bread",
  "Beverages",
  "Packaging & disposables",
  "Cleaning & hygiene",
];

// Divider tabs cycle through the pad's three papers
const PAPERS = ["var(--pad-paper)", "var(--carbon-yellow)", "var(--carbon-pink)"];

export default function WhoItsFor() {
  return (
    <section
      id="who-its-for"
      aria-labelledby="who-heading"
      className="scroll-mt-20 overflow-hidden bg-[#1B2A4A] px-4 py-24 text-white sm:px-6 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Assemble as="div">
          <h2
            id="who-heading"
            className="font-display text-balance text-[clamp(2rem,4.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.02em]"
          >
            Anyone who keeps a restaurant kitchen stocked
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[#C9D3E5]">
            Distributors, wholesalers and local vendors supplying restaurants, cafés, cloud kitchens and bakeries,
            whether you serve three outlets or three hundred.
          </p>
        </Assemble>

        {/* The edge of a binder full of divider sheets, one tab per category */}
        <Assemble as="div" delay={0.08}>
          <ul className="relative space-y-[3px]">
            {CATEGORIES.map((c, i) => (
              <li
                key={c}
                className="index-tab flex h-11 items-center rounded-l-md pl-5 pr-4 text-[15px] font-semibold text-[#1B2A4A] shadow-[0_6px_10px_-6px_rgba(0,0,0,0.45)]"
                style={{
                  background: PAPERS[i % PAPERS.length],
                  marginLeft: `calc(${(i % 5) * 1.25}rem)`,
                  marginRight: "-2rem",
                }}
              >
                {c}
              </li>
            ))}
          </ul>
        </Assemble>
      </div>
    </section>
  );
}
