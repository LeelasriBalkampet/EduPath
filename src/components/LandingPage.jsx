import React from 'react';
import {
    GraduationCap,
    Target,
    MessageCircle,
    TrendingUp,
    ArrowRight,
    BookOpen,
    Zap,
    Globe,
    Shield,
    ChevronRight,
    Search,
    Bell
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin }) {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30 overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Navbar */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">EduPath</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-12 lg:py-16">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h1 className="text-4xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight animate-slide-up">
                        Master Any Topic with <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-accent">
                            AI-Powered
                        </span> Personalized Path
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed animate-slide-up [animation-delay:200ms] max-w-2xl mx-auto">
                        Stop guessing. EduPath analyzes your performance to create a custom learning journey tailored exactly to your strengths and weaknesses.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up [animation-delay:400ms]">
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all group"
                        >
                            Start Your Journey
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="bg-muted/10 py-12 lg:py-16">
                <div className="container mx-auto px-6">
                    <div className="text-center space-y-3 mb-12 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-extrabold tracking-tight">Personalized Learning, Redefined.</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Stop wasting time on content you already know. EduPath builds your education around your unique performance data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Target}
                            title="Custom Learning Paths"
                            description="AI-driven curriculum generation that automatically pivots based on your strengths and weaknesses."
                            color="bg-blue-500"
                        />
                        <FeatureCard
                            icon={MessageCircle}
                            title="24/7 AI Tutor"
                            description="Get expert-level explanations for any topic in English, Hindi, or Telugu."
                            color="bg-primary"
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Granular Progress"
                            description="Real-time analytics that show you exactly where you stand on every sub-topic in your course."
                            color="bg-green-500"
                        />
                        <FeatureCard
                            icon={BookOpen}
                            title="Curated Expert Resources"
                            description="Hand-picked tutorials and articles recommended by administrators to fill your specific knowledge gaps."
                            color="bg-purple-500"
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Multilingual Support"
                            description="Native language support ensures language is never a barrier to mastering technical concepts."
                            color="bg-orange-500"
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Guided Mastery"
                            description="Admin-to-student direct suggestions ensure you're always following the most effective track."
                            color="bg-red-500"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="container mx-auto px-6 py-12 lg:py-16 text-center">
                <div className="max-w-5xl mx-auto rounded-[2.5rem] p-10 lg:p-16 relative overflow-hidden gradient-primary shadow-2xl shadow-primary/30">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight">
                            Ready to transform your <br /> educational experience?
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={onGetStarted}
                                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-primary font-black text-xl shadow-2xl hover:bg-white/90 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                Get Started Free
                                <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={onLogin}
                                className="w-full sm:w-auto px-8 py-5 rounded-2xl border-2 border-white/40 text-white font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all"
                            >
                                Sign In Now
                            </button>
                        </div>

                        <p className="text-white/70 text-sm font-medium">
                            Join the next generation of learners. No credit card required.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="border-t py-8">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 scale-75">
                            <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">EduPath</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">© 2026 EduPath.</p>
                    <div className="flex gap-8 text-sm text-muted-foreground font-semibold">
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, color }) {
    return (
        <div className="p-10 rounded-[2.5rem] border bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group ring-1 ring-border/50">
            <div className={`w-16 h-16 rounded-2xl ${color}/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                <Icon className={`w-9 h-9 ${color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
                {description}
            </p>
        </div>
    );
}

