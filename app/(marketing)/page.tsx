"use client";

import { LandingHero } from "@/components/marketing/landing-hero";
import { FeatureSpotlight } from "@/components/marketing/feature-spotlight";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { EducationSection } from "@/components/marketing/education-section";
import { FeatureDetails } from "@/components/marketing/feature-details";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TrustSection } from "@/components/marketing/trust-section";
import { FinalCTA } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-8 pt-0 lg:pb-10">
      <LandingHero />
      <TrustSection />
      <FeatureSpotlight />
      <HowItWorks />
      <EducationSection />
      <FeatureDetails />

      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <PricingSection />
        <FinalCTA />
      </div>
    </div>
  );
}
