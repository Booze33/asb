import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { Heart, Sparkles, Award } from "lucide-react";
import Image from 'next/image';

const team = [
  { name: "Sofia Reyes", title: "Founder & Lead Stylist", bio: "A certified master stylist with over 15 years of experience transforming hair across Austin. Sofia founded GlowStudio in 2014 with one goal: make luxury beauty accessible to every woman in the community.", img: "/girl-2.png" },
  { name: "Marcus Diallo", title: "Color Specialist", bio: "Trained in Paris and rooted in Austin, Marcus brings an artistic eye and technical precision to every color service. His balayage work has earned him a loyal following across the city.", img: "/guy-1.png" },
  { name: "Ava Brooks", title: "Lead Makeup Artist & Esthetician", bio: "With a decade of bridal and editorial experience, Ava creates looks that feel effortless and last all day. She is equally passionate about skincare and helping clients build routines that truly work.", img: "/girl1.png" },
];

const values = [
  { icon: Heart, title: "Confidence", desc: "We believe beauty is about how you feel — we're here to help you feel incredible." },
  { icon: Sparkles, title: "Artistry", desc: "Every service is crafted with intention, creativity, and an eye for detail." },
  { icon: Award, title: "Excellence", desc: "We never stop learning, training, and raising the bar for our Austin clients." },
];

const About = () => (
  <Layout>
    <FloatingCTA />

    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Story */}
        <ScrollReveal>
          <div className="max-w-3xl mb-20">
            <h1 className="text-fluid-3xl font-display font-bold text-foreground mb-6">
              About GlowStudio — Austin&apos;s Favorite Beauty Salon
            </h1>
            <div className="space-y-4 text-muted-foreground leading-relaxed font-body">
              <p>
                Founded in 2014 in the heart of Austin, TX, GlowStudio was born from a simple belief: that every person deserves access to exceptional beauty services in a space that feels like home.
              </p>
              <p>
                What started as a small studio near South Congress has grown into a beloved beauty destination for over 3,000 Austin clients. Our roots in this community run deep — we live here, celebrate here, and are committed to helping our neighbors look and feel their very best.
              </p>
              <p>
                At GlowStudio, we combine modern beauty techniques with a personal touch. We know your name, we remember your style, and we&apos;re here for every chapter of your beauty journey.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Team */}
        <ScrollReveal>
          <h2 className="text-fluid-2xl font-display font-bold text-foreground mb-10">Meet the Team</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {team.map((member, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="bg-card rounded-xl border border-border overflow-hidden hover-lift">
                <div className="relative w-full aspect-[4/3] bg-muted">
                  <Image
                    src={member.img}
                    alt={`${member.name} — ${member.title}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3 font-body">{member.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">{member.bio}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Values */}
        <ScrollReveal>
          <h2 className="text-fluid-2xl font-display font-bold text-foreground mb-10 text-center">Our Values</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {values.map((v, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Accreditations */}
        <ScrollReveal>
          <div className="bg-muted rounded-xl p-8 text-center mb-20">
            <h3 className="font-display text-lg font-semibold mb-4">Certifications & Affiliations</h3>
            <div className="flex flex-wrap justify-center gap-8">
              {["Wella Professionals Certified", "Redken Elite Salon", "NAHA Member", "Austin Beauty Council"].map((a) => (
                <div key={a} className="bg-background rounded-lg px-6 py-3 text-sm text-muted-foreground font-body border border-border">{a}</div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Community */}
        <ScrollReveal>
          <div className="max-w-3xl">
            <h2 className="text-fluid-xl font-display font-bold text-foreground mb-4">We Believe in Austin</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed font-body">
              <p>
                Community is at the heart of everything we do. From sponsoring local fashion events to offering complimentary styling booths at the Mueller Farmers Market, we&apos;re committed to showing up for the neighborhoods we call home.
              </p>
              <p>
                Our annual back-to-school glam drive offers free haircuts and styling to underserved youth in East Austin. Because when our community feels confident, we all shine brighter.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </Layout>
);

export default About;