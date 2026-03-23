'use client';

import { useState } from "react";
import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, ExternalLink, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bookAppointment, validateAppointmentData, type AppointmentData } from "@/lib/api";

const faqs = [
  { q: "Do you accept walk-ins?", a: "Yes! While we recommend booking ahead, we do accept walk-ins based on stylist availability. Same-day bookings are often possible — call us at (512) 555-0199 to check." },
  { q: "How far in advance should I book a bridal package?", a: "We recommend booking bridal packages at least 3–6 months in advance to secure your date and schedule a trial run. Popular spring and fall dates fill up fast." },
  { q: "What products do you use?", a: "We use only premium, cruelty-free brands including Wella Professionals, Redken, and Dermalogica. We're happy to discuss product options during your consultation." },
  { q: "Do you offer virtual style consultations?", a: "Yes! We offer virtual consultations for new clients who want to discuss hair goals, color ideas, or skincare concerns before their first visit. Book one through our contact form." },
  { q: "Where are you located relative to UT Austin?", a: "We're located on South Congress Ave, about 10 minutes south of the UT Austin campus near the SoCo neighborhood. Easy access from MoPac and Lamar Blvd." },
];

const Contact = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Extract and convert duration to number
    const durationValue = formData.get('duration');
    const duration = durationValue ? parseInt(durationValue.toString(), 10) : 0;
    
    const appointmentData: AppointmentData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      date_time: formData.get('date_time') as string,
      duration: duration.toString(), // Keep as string for API call, backend will validate as number
      service: formData.get('service') as string || 'General Appointment',
    };

    // Validate form data
    const validationErrors = validateAppointmentData(appointmentData);
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join('. '),
        variant: "destructive",
      });
      return;
    }

    // Book appointment using the API
    const result = await bookAppointment(appointmentData);

    if (result.success) {
      toast({
        title: "Booking Request Received",
        description: result.message || "We'll confirm your appointment within 2 hours during business hours.",
      });
      // Reset form on success
      (e.target as HTMLFormElement).reset();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit your appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <FloatingCTA />

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <h1 className="text-fluid-3xl font-display font-bold text-foreground mb-4">
              Book an Appointment in Austin, TX
            </h1>
            <p className="text-muted-foreground text-fluid-base mb-12 max-w-2xl font-body">
              Ready to glow? Fill out the form below or give us a call. We&apos;ll get you in as soon as possible.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Form */}
            <ScrollReveal>
              <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8 space-y-5">
                <div>
                  <Label htmlFor="name" className="font-body">Full Name</Label>
                  <Input id="name" name="name" placeholder="Jane Doe" required className="mt-1.5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="font-body">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="(512) 555-0000" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-body">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="you@email.com" required className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="font-body">Address</Label>
                  <Input id="address" name="address" placeholder="123 Main St, Austin, TX 78704" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="date_time" className="font-body">Preferred Date & Time</Label>
                  <Input id="date_time" name="date_time" type="datetime-local" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="duration" className="font-body">Estimated Duration (minutes)</Label>
                  <Input id="duration" name="duration" type="number" min="15" step="15" placeholder="60" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="service" className="font-body">Service Needed</Label>
                  <select
                    id="service"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1.5 font-body"
                  >
                    <option value="">Select a service...</option>
                    <option>Haircut & Styling</option>
                    <option>Color & Highlights</option>
                    <option>Makeup Artistry</option>
                    <option>Facial & Skincare</option>
                    <option>Nail Services</option>
                    <option>Bridal Package</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="message" className="font-body">Message / Notes</Label>
                  <Textarea id="message" placeholder="Tell us about the look you're going for..." rows={4} className="mt-1.5" />
                </div>
                <Button variant="hero" type="submit" className="w-full">
                  Request My Appointment
                </Button>
                <p className="text-xs text-muted-foreground text-center font-body">
                  We&apos;ll confirm your booking within 2 hours during business hours.
                </p>
              </form>
            </ScrollReveal>

            {/* Contact Info */}
            <ScrollReveal delay={150}>
              <div className="space-y-8">
                <div className="bg-card rounded-xl border border-border p-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground font-body">GlowStudio</p>
                      <p className="text-sm text-muted-foreground font-body">1803 South Congress Ave, Suite 200<br />Austin, TX 78704</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-sm text-muted-foreground font-body">
                      <p>Mon–Fri: 9:00 AM – 7:00 PM</p>
                      <p>Saturday: 9:00 AM – 5:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <a href="tel:+15125550199" className="text-foreground font-semibold hover:text-primary transition-colors font-body">(512) 555-0199</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <a href="mailto:hello@glowstudioatx.com" className="text-foreground hover:text-primary transition-colors font-body">hello@glowstudioatx.com</a>
                  </div>
                  <a
                    href="https://maps.google.com/?q=1803+South+Congress+Ave+Austin+TX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline font-body"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>

                <div className="rounded-xl overflow-hidden border border-border">
                  <iframe
                    title="GlowStudio location map in Austin TX"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.0!2d-97.7426!3d30.3074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDE4JzI2LjYiTiA5N8KwNDQnMzMuNCJX!5e0!3m2!1sen!2sus!4v1"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* FAQ */}
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-fluid-2xl font-display font-bold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left min-h-12"
                      aria-label={faq.q}
                    >
                      <span className="font-display font-semibold text-foreground pr-4">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5">
                        <p className="text-sm text-muted-foreground leading-relaxed font-body">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;