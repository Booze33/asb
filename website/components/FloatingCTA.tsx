import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";

const FloatingCTA = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden">
      <Button variant="cta" size="lg" className="rounded-full shadow-2xl gap-2 px-6" asChild>
        <Link href="/contact" aria-label="Book an appointment">
          <Calendar className="w-5 h-5" />
          <span>Book Now</span>
        </Link>
      </Button>
    </div>
  );
};

export default FloatingCTA;
