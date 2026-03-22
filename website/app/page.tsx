import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import { Star, Users, Building2, Clock, Sparkles, Scissors, Heart, Smile, Brush, Droplets, Gem } from "lucide-react";
import styles from './home.module.css';

const services = [
  { icon: Scissors, title: "Haircuts & Styling", desc: "Precision cuts, blowouts, and custom styling for every hair type. Our Austin stylists craft looks that turn heads." },
  { icon: Droplets, title: "Color & Highlights", desc: "Balayage, ombre, full color, and creative tinting. We use only premium, gentle formulas for vibrant, lasting results." },
  { icon: Brush, title: "Makeup Artistry", desc: "Bridal, editorial, or everyday glam. Our makeup artists enhance your natural beauty for any occasion in Austin." },
  { icon: Sparkles, title: "Facials & Skincare", desc: "Rejuvenating facials, peels, and personalized skincare treatments to leave your skin glowing and refreshed." },
  { icon: Heart, title: "Nail Services", desc: "Manicures, pedicures, gel, and nail art. Relax and leave with flawless nails every single time." },
  { icon: Gem, title: "Bridal Packages", desc: "Full-day bridal beauty experiences including hair, makeup, and skincare consultations tailored for your big day." },
];

const testimonials = [
  { stars: 5, quote: "GlowStudio completely transformed my hair. My stylist listened to exactly what I wanted and delivered something even better than I imagined.", name: "Sarah M.", area: "South Congress" },
  { stars: 5, quote: "Same-day appointment for a blowout before my event. The team was warm, fast, and absolutely talented.", name: "James L.", area: "Mueller" },
  { stars: 5, quote: "Finally found a salon in Austin that truly listens. The bilingual staff made my mom feel so welcome.", name: "Maria G.", area: "East Austin" },
];

const Home = () => {
  return (
    <Layout>
      <FloatingCTA />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-28">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">
            <div className="lg:w-[55%] space-y-6">
              <div className="space-y-4">
                <h1 className={`text-fluid-hero font-display font-bold text-foreground leading-tight opacity-0 ${styles.animate_fade_in_up}`} style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
                  Your Beauty,
                </h1>
                <h1 className={`text-fluid-hero font-display font-bold text-primary leading-tight opacity-0 ${styles.animate_fade_in_up}`} style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
                  Elevated in Austin.
                </h1>
              </div>
              <p className={`text-fluid-base text-muted-foreground max-w-lg leading-relaxed opacity-0 ${styles.animate_fade_in_up}`} style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
                Luxury hair, makeup, and skincare services for every Austin woman — right in the heart of South Austin. Crafting beauty since 2014.
              </p>
              <div className={`flex flex-wrap gap-4 opacity-0 ${styles.animate_fade_in_up}`} style={{ animationDelay: "450ms", animationFillMode: "forwards" }}>
                <Button variant="hero" asChild>
                  <Link href="/contact">Book an Appointment</Link>
                </Button>
                <Button variant="heroGhost" asChild>
                  <Link href="/services">Explore Our Services</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-[45%] w-full">
              <div className={`relative opacity-0 ${styles.animate_fade_in}`} style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl -rotate-3" />
                <div className="relative bg-card rounded-2xl overflow-hidden aspect-4/3">
                  <Image
                    src="/hero-beauty2.png"
                    alt="GlowStudio interior in Austin TX — chic, modern beauty salon"
                    fill
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-primary section-divider py-16 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-primary-foreground text-center">
            {[
              { icon: Star, stat: "4.9", label: "Google Rating" },
              { icon: Users, stat: "3,000+", label: "Happy Clients" },
              { icon: Building2, stat: "10+", label: "Years in Austin" },
              { icon: Clock, stat: "Same-Day", label: "Bookings Available" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="flex flex-col items-center gap-2">
                  <item.icon className="w-7 h-7 text-secondary" />
                  <span className="text-fluid-xl font-display font-bold">{item.stat}</span>
                  <span className="text-sm text-primary-foreground/70 font-body">{item.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services Teaser */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-fluid-2xl font-display font-bold text-foreground mb-3">What We Offer</h2>
              <p className="text-muted-foreground text-fluid-base max-w-2xl mx-auto">
                From everyday styling to full bridal transformations, GlowStudio delivers the complete beauty experience Austin deserves.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-card rounded-xl p-7 hover-lift border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                  <Link href="/services" className="text-sm font-medium text-primary hover:text-teal-light transition-colors font-body">
                    Learn More →
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted section-divider-reverse py-24 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <ScrollReveal className="lg:w-1/2 space-y-8">
              <h2 className="text-fluid-2xl font-display font-bold text-foreground">
                Why Austin Clients Choose GlowStudio
              </h2>
              {[
                { title: "Welcoming New Clients", desc: "We're always excited to meet new faces and help you discover your best look." },
                { title: "Same-Day Availability", desc: "Last-minute event? We offer same-day bookings — because you deserve to look great, always." },
                { title: "Bilingual Staff", desc: "Our team speaks English and Spanish so every Austin client feels right at home." },
                { title: "Premium Products Only", desc: "We use top-tier, cruelty-free brands so your hair and skin get only the very best." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Smile className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </ScrollReveal>
            <ScrollReveal className="lg:w-1/2" delay={200}>
              <div className="relative">
                <div className="absolute -inset-6 bg-primary/10 rounded-3xl rotate-2" />
                <div className="relative bg-card rounded-2xl aspect-3/4 max-h-112.5 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <Image
                    src="/hero-beauty.png"
                    alt="GlowStudio interior in Austin TX — chic, modern beauty salon"
                    fill
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                    <p className="text-muted-foreground text-sm font-body">GlowStudio team in Austin TX</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-fluid-2xl font-display font-bold text-foreground mb-3">What Our Clients Say</h2>
              <p className="text-muted-foreground text-fluid-base">Trusted by over 3,000 clients across Austin, TX.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="bg-card rounded-xl p-7 border border-border hover-lift">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-5 italic font-body">&quot;{t.quote}&quot;</p>
                  <div className="text-sm font-body">
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-muted-foreground"> · {t.area}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Local Trust Banner */}
      <section className="bg-primary py-14">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-primary-foreground text-fluid-lg font-display font-semibold leading-relaxed">
              Proudly serving Austin, South Congress, Mueller, East Austin, and surrounding areas since 2014.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Home;