import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Hotel, BedDouble, CalendarCheck, Users, BarChart3, 
  Shield, TrendingUp, PieChart, Sparkles, MessageSquare, 
  ArrowRight, CheckCircle2 
} from 'lucide-react';

const coreFeatures = [
  { icon: BedDouble, title: 'Room Management', desc: 'Track all rooms, types, pricing & real-time availability in one intuitive dashboard.' },
  { icon: CalendarCheck, title: 'Smart Booking System', desc: 'Create and track bookings seamlessly. Manage Adults/Children counts effortlessly.' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Your data is safe with one-click export and restore capabilities.' },
];

const advancedFeatures = [
  { icon: TrendingUp, title: 'Expense & Profit Tracking', desc: 'Monitor daily expenses across categories (Salary, Electricity, etc.) and view monthly P/L.' },
  { icon: PieChart, title: 'Booking Source Analytics', desc: 'Track where guests come from (Walk-in, OYO, Booking.com) with visual pie charts.' },
  { icon: Sparkles, title: 'Housekeeping Cycle', desc: 'Manage room status (Clean, Dirty, Inspected) with a single click to maintain top-notch hygiene.' },
  { icon: MessageSquare, title: 'Special Requests & Notes', desc: 'Keep track of guest preferences and room-specific notes to deliver a personalized experience.' },
  { icon: Users, title: 'Detailed Guest Insights', desc: 'Maintain extensive guest records, track repeat visitors, and enhance your hospitality.' },
  { icon: BarChart3, title: 'Comprehensive Reports', desc: 'Export detailed reports for revenue, occupancy, and business growth tracking.' }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-primary/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 border-b border-border/40 backdrop-blur-md z-50 bg-background/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Hotel className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              HotelManager
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex font-medium" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105" asChild>
              <Link to="/auth?tab=signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
            <Sparkles className="h-4 w-4" />
            <span>Now with Expense & Housekeeping Tracking</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
            Manage Your Hotel <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
              Like a Pro
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform built for modern hoteliers. Track bookings, manage expenses, monitor housekeeping, and analyze your profits — effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1" asChild>
              <Link to="/auth?tab=signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all" asChild>
              <Link to="/auth">Login to Dashboard</Link>
            </Button>
          </div>

          {/* Abstract Dashboard Preview */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl p-2 md:p-4 rotate-x-12 scale-95 hover:scale-100 transition-transform duration-700 ease-out">
              <div className="rounded-lg overflow-hidden border border-border bg-background shadow-inner flex flex-col h-[300px] md:h-[500px]">
                {/* Mock Header */}
                <div className="h-12 border-b border-border flex items-center px-4 gap-4 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-6 w-48 bg-muted rounded-md hidden sm:block"></div>
                </div>
                {/* Mock Body */}
                <div className="flex-1 p-4 md:p-6 flex gap-6">
                  {/* Sidebar */}
                  <div className="w-48 hidden md:flex flex-col gap-3">
                    <div className="h-8 bg-muted rounded-md w-full"></div>
                    <div className="h-8 bg-muted/50 rounded-md w-3/4"></div>
                    <div className="h-8 bg-muted/50 rounded-md w-5/6"></div>
                    <div className="h-8 bg-muted/50 rounded-md w-4/6"></div>
                  </div>
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 h-20 sm:h-24 bg-primary/10 rounded-xl border border-primary/20"></div>
                      <div className="flex-1 h-20 sm:h-24 bg-blue-500/10 rounded-xl border border-blue-500/20 hidden sm:block"></div>
                      <div className="flex-1 h-20 sm:h-24 bg-green-500/10 rounded-xl border border-green-500/20 hidden lg:block"></div>
                    </div>
                    <div className="flex-1 bg-muted/20 rounded-xl border border-border/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-24 bg-muted/30 border-y border-border/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful New Capabilities</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We've recently added game-changing features to give you absolute control over your property's operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((f, i) => (
              <div key={i} className="group relative bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3">
              <div className="w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Simplify your daily operations.</h2>
                <p className="text-primary-foreground/80 text-lg mb-8">
                  Stop using spreadsheets and paper notes. Digitize everything from guest details to daily electricity bills, all in one secure platform.
                </p>
                <ul className="space-y-4">
                  {[
                    "Zero setup fees, instant access",
                    "Real-time profit & loss calculations",
                    "Mobile-friendly dashboard",
                    "One-click database backup"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="bg-white/20 p-1.5 rounded-full"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="text-4xl font-extrabold mb-2 text-white">100%</div>
                  <div className="text-primary-foreground/90 font-medium">Control over your property data.</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="text-4xl font-extrabold mb-2 text-white">24/7</div>
                  <div className="text-primary-foreground/90 font-medium">Access from anywhere, anytime.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">HotelManager</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                The ultimate property management system designed to make running your hotel, motel, or guesthouse effortless.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} HotelManager. All rights reserved.</p>
            <p>Designed with excellence for modern hoteliers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
