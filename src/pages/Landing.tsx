import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hotel, BedDouble, CalendarCheck, Users, BarChart3, Shield } from 'lucide-react';

const features = [
  { icon: BedDouble, title: 'Room Management', desc: 'Track all rooms, types, pricing & availability in one place.' },
  { icon: CalendarCheck, title: 'Booking System', desc: 'Create, manage and track bookings with calendar views.' },
  { icon: Users, title: 'Guest Records', desc: 'Maintain detailed guest profiles and history.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue insights, occupancy rates, and trends.' },
  { icon: Shield, title: 'Secure Backup', desc: 'Export & restore your data anytime with one click.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Hotel className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Hotel Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Manage Your Hotel<br />
          <span className="text-primary">Effortlessly</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern, all-in-one hotel management system. Handle rooms, bookings, guests, and reports — all from a single dashboard.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/auth?tab=signup">Start Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hotel Manager. Built with Lovable.
      </footer>
    </div>
  );
};

export default Landing;
