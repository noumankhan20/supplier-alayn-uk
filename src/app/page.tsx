import React from "react";
import type { Metadata } from "next";
import { socialMetadata } from "@/lib/socialMetadata";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import IntroReveal from "@/components/landing/IntroReveal";
import SupplierHero from "@/components/landing/supplier/SupplierHero";
import HowItWorks from "@/components/landing/supplier/HowItWorks";
import Features from "@/components/landing/supplier/Features";
import WhoItsFor from "@/components/landing/supplier/WhoItsFor";
import Faq from "@/components/landing/supplier/Faq";
import FinalCta from "@/components/landing/supplier/FinalCta";
import { InkDefs } from "@/components/landing/supplier/pad/OrderPad";

const title = "Alayn Suppliers | Take purchase orders from restaurants";
const description =
  "List your products and rates once. Restaurants on Alayn find you, compare prices and send purchase orders. Pack, dispatch in full or in part, and keep every order on track from one screen.";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "https://suppliers.alaynai.com",
  },
  ...socialMetadata({ title, description, path: "" }),
};

export default function SupplierLandingPage() {
  return (
    <>
      <IntroReveal />
      <div className="landing-root">
        <InkDefs />
        <LandingNav />
        <main>
          <SupplierHero />
          <HowItWorks />
          <Features />
          <WhoItsFor />
          <Faq />
          <FinalCta />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
