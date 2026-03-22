import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground font-body">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground font-display font-bold text-sm">G</span>
              </div>
              <span className="font-display text-lg font-semibold">GlowStudio</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Luxury hair, makeup, and skincare services for Austin clients since 2014.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" aria-label="Facebook" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/about", label: "About Us" },
                { to: "/blog", label: "Beauty Blog" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="hover:text-secondary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {["Haircuts & Styling", "Color & Highlights", "Makeup Artistry", "Facials & Skincare", "Nail Services", "Bridal Packages"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="hover:text-secondary transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 - NAP */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <span>1803 South Congress Ave, Suite 200<br />Austin, TX 78704</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-secondary" />
                <a href="tel:+15125550199" className="hover:text-secondary transition-colors">(512) 555-0199</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-secondary" />
                <a href="mailto:hello@glowstudioatx.com" className="hover:text-secondary transition-colors">hello@glowstudioatx.com</a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <span>Mon–Fri: 9am–7pm<br />Sat: 9am–5pm<br />Sun: Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 rounded-lg overflow-hidden border border-primary-foreground/10">
          <iframe
            title="GlowStudio Location in Austin TX"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.0!2d-97.7426!3d30.3074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDE4JzI2LjYiTiA5N8KwNDQnMzMuNCJX!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <span>© 2024 GlowStudio. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-foreground/80 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground/80 transition-colors">Sitemap</a>
            <a href="https://g.page/glowstudioatx" className="hover:text-primary-foreground/80 transition-colors" aria-label="Google Reviews">Google Reviews</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;