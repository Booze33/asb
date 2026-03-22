'use client';

import { useState } from "react";
import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const posts = [
  {
    title: "5 Hair Care Habits Every Austin Woman Should Start This Year",
    category: "Hair Tips",
    date: "February 18, 2026",
    excerpt: "Great hair starts with great habits. Here are the five most impactful changes Austin clients can make to keep their hair healthy, shiny, and strong all year long.",
  },
  {
    title: "How Austin's Heat & Humidity Affects Your Hair — And What To Do About It",
    category: "Wellness",
    date: "January 25, 2026",
    excerpt: "Austin summers are no joke. Learn how to protect your color, manage frizz, and keep your style intact even in Central Texas heat — straight from our GlowStudio stylists.",
  },
  {
    title: "How to Choose the Right Hair Salon in Austin",
    category: "Client Guide",
    date: "January 8, 2026",
    excerpt: "Not all salons are created equal. Here's exactly what Austin clients should look for — and the red flags to avoid — when choosing a stylist they can trust.",
  },
];

const Blog = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Subscribed!", description: "You'll receive our latest beauty tips via email." });
    setEmail("");
    setName("");
  };

  return (
    <Layout>
      <FloatingCTA />

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <h1 className="text-fluid-3xl font-display font-bold text-foreground mb-4">
              Beauty Tips & Trends from Our Austin Salon
            </h1>
            <p className="text-muted-foreground text-fluid-base mb-12 max-w-2xl font-body">
              Stay inspired with the latest beauty insights, seasonal style advice, and expert tips from the GlowStudio team in Austin, TX.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Posts */}
            <div className="lg:col-span-2 space-y-6">
              {posts.map((post, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <article className="bg-card rounded-xl border border-border p-7 hover-lift hover:shadow-md transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 font-body">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                    </div>
                    <h2 className="text-fluid-lg font-display font-semibold text-foreground mb-3 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-body">{post.excerpt}</p>
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-teal-light transition-colors font-body">
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ScrollReveal delay={200}>
                <div className="bg-card rounded-xl border border-border p-7 sticky top-28">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">Subscribe for Beauty Tips</h3>
                  <p className="text-sm text-muted-foreground mb-5 font-body">
                    Get expert style advice and exclusive offers delivered to your inbox from our Austin beauty team.
                  </p>
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button variant="default" type="submit" className="w-full">
                      Subscribe
                    </Button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;