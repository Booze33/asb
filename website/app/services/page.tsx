import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scissors, Droplets, Brush, Sparkles, Heart, Gem, Phone } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Haircuts & Styling",
    desc: "Our expert stylists in Austin deliver precision cuts and custom blowouts tailored to your face shape, lifestyle, and texture. Whether you want a bold new look or a clean refresh, we've got you.",
    items: ["Women's & men's cuts", "Blowouts & thermal styling", "Special occasion updos", "Keratin smoothing treatments", "Scalp health consultations"],
  },
  {
    icon: Droplets,
    title: "Color & Highlights",
    desc: "From lived-in balayage to vivid fashion color, our Austin colorists use premium, gentle formulas to achieve rich, dimensional results that last — and keep your hair healthy.",
    items: ["Balayage & ombre", "Full color & root touch-up", "Highlights & lowlights", "Color correction", "Toning & glossing treatments"],
  },
  {
    icon: Brush,
    title: "Makeup Artistry",
    desc: "Our certified makeup artists in Austin create flawless looks for every occasion. We enhance your natural features with techniques tailored to your skin tone, style, and event.",
    items: ["Bridal & bridesmaid makeup", "Editorial & photoshoot looks", "Everyday & natural glam", "Airbrush application", "Makeup lessons & tutorials"],
  },
  {
    icon: Sparkles,
    title: "Facials & Skincare",
    desc: "Rejuvenate your skin with our curated facial treatments. Our Austin estheticians customize every session to your skin type and concerns, leaving you glowing from the inside out.",
    items: ["Hydrating & brightening facials", "Chemical peels", "Acne & blemish treatments", "Anti-aging & firming facials", "LED light therapy"],
  },
  {
    icon: Heart,
    title: "Nail Services",
    desc: "Treat yourself to beautiful nails in a relaxing Austin salon environment. From classic manicures to intricate nail art, our nail techs deliver flawless results every time.",
    items: ["Classic & gel manicures", "Pedicures & spa soaks", "Nail art & designs", "Dip powder & acrylics", "Nail repair & strengthening"],
  },
  {
    icon: Gem,
    title: "Bridal Packages",
    desc: "Your wedding day deserves perfection. Our Austin bridal team coordinates everything — from trial runs to the big day — so you can relax knowing you'll look absolutely stunning.",
    items: ["Bridal hair & makeup trials", "Day-of full glam packages", "Bridesmaid group bookings", "On-location services", "Skincare prep consultations"],
  },
];

const Services = () => (
  <Layout>
    <FloatingCTA />

    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mb-16">
            <h1 className="text-fluid-3xl font-display font-bold text-foreground mb-4">
              Beauty Services in Austin, TX
            </h1>
            <p className="text-fluid-base text-muted-foreground leading-relaxed">
              GlowStudio offers a full menu of beauty services for individuals and groups across Austin. Whether you&apos;re stopping in for a quick trim or preparing for your wedding day, our team is here to make you shine.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-12">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="bg-card rounded-xl p-8 lg:p-10 border border-border hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <s.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-fluid-xl font-display font-bold text-foreground">{s.title}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6 font-body">{s.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {s.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-foreground font-body">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button variant="default" asChild>
                      <Link href="/contact">Book This Service</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sidebar CTA */}
        <ScrollReveal delay={200}>
          <div className="mt-16 bg-primary/5 rounded-xl p-8 text-center border border-primary/10">
            <h3 className="font-display text-fluid-lg font-semibold text-foreground mb-2">Not sure what you need?</h3>
            <p className="text-muted-foreground mb-4 font-body">
              Call us at{" "}
              <a href="tel:+15125550199" className="text-primary font-semibold hover:underline">(512) 555-0199</a>{" "}
              or book a free style consultation.
            </p>
            <Button variant="hero" asChild>
              <Link href="/contact">
                <Phone className="w-4 h-4 mr-2" />
                Schedule a Consultation
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </Layout>
);

export default Services;