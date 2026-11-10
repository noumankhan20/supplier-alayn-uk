import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono, Playfair_Display, Big_Shoulders, Kalam } from "next/font/google";
import "./globals.css";
import "@/styles/transitions.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Rubber-stamp lettering on the landing page's order pad.
const bigShoulders = Big_Shoulders({
  variable: "--font-stamp",
  subsets: ["latin"],
  weight: ["700", "800"],
  // next/font has no metrics for this face; fall back to a narrow system sans
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "sans-serif"],
});

// Shopkeeper's handwriting: notes written onto the pad ("Rest on 14 Nov").
const kalam = Kalam({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});

// Design direction contract for the landing page (impeccable). Kept in the
// emitted HTML so the finish review can audit the build against it.
const directionContract = `<!--
THESIS: The supplier's own purchase-order pad, made digital. Refuses the SaaS hero + icon-grid template.
OWN-WORLD: Off-white pad paper #FBFAF6 over pink and yellow carbon copies, navy binding strip, perforated tear line, torn bottom edge, Geist Mono line items, pre-printed crimson order numbers, rubber stamps in crimson and navy ink, Kalam handwritten notes; grey desk, navy bands.
STORY: A restaurant's PO lands on your pad; you stamp it through packing and dispatch; you set the rates; join free.
FIRST VIEWPORT: Phone: H1, short sub, Join CTA, then the pad filling the rest, lines typing in and a NEW ORDER stamp landing. Desktop: copy left, pad tilted -2deg right.
FORM: user-pinned order pad (overrides the roll); seed e575cec5.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export const metadata: Metadata = {
  metadataBase: new URL("https://suppliers.alaynai.com"),
  title: "Alayn Suppliers",
  description:
    "The supplier portal for Alayn: take purchase orders from restaurants, keep your price list current, and track every delivery.",
};

const introScript = `(function(){if(typeof window==='undefined')return;if(window.location.pathname!=='/')return;var d=document.documentElement,k='alayn-intro-seen';try{if(sessionStorage.getItem(k)||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-seen');return;}sessionStorage.setItem(k,'1');}catch(e){}window.__alaynIntro='play';d.classList.add('intro-wait');var go=function(){requestAnimationFrame(function(){d.classList.remove('intro-wait');});};setTimeout(go,1200);(function wait(){var o=document.querySelector('.alayn-intro');if(!o)return requestAnimationFrame(wait);Promise.all([].map.call(o.querySelectorAll('img'),function(i){return i.decode().catch(function(){});})).then(go);})();})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="alayn-intro-decide"
          dangerouslySetInnerHTML={{ __html: introScript }}
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${geistMono.variable} ${playfair.variable} ${bigShoulders.variable} ${kalam.variable} antialiased min-h-screen`}
      >
        <div hidden dangerouslySetInnerHTML={{ __html: directionContract }} />
        <ReduxProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
