import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { BriefcaseIcon, UsersIcon, DocumentReportIcon, ChevronDownIcon } from './icons/OutlineIcons';
import { SparklesIcon, CheckIcon } from './icons/SolidIcons';
import { FacebookIcon, TwitterIcon, GoogleIcon } from './icons/SocialIcons';

interface LandingPageProps {
  onShowLogin: () => void;
  appName: string;
}

const useIntersectionObserver = (options: IntersectionObserverInit) => {
    const containerRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = containerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [containerRef, options]);

    return [containerRef, isVisible] as const;
};

// FIX: Add `id` to the component's props to allow passing it to the underlying `section` element.
const AnimatedSection: React.FC<{children: React.ReactNode, className?: string, delay?: string, id?: string}> = ({ children, className, delay, id }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    const delayClass = delay ? `animation-delay-${delay}` : '';

    return (
        <section ref={ref} id={id} className={`${className} ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            {children}
        </section>
    );
};


const QuoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="35" height="28" viewBox="0 0 35 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M11.25 27.25C8.9375 27.25 6.89583 26.5521 5.125 25.1562C3.35417 23.7604 2.46875 21.9792 2.46875 19.8125C2.46875 17.5 3.32292 15.3646 5.03125 13.4062C6.73958 11.4479 8.80208 9.96875 11.2188 8.96875L13.125 11.8438C11.5 12.5625 10.1562 13.5 9.125 14.6562C8.09375 15.8125 7.59375 17.0625 7.625 18.4062C7.625 18.9375 7.73958 19.4688 7.96875 20C8.19792 20.5312 8.5 20.9375 8.875 21.2188C9.25 21.5 9.65625 21.7188 10.0938 21.875C10.5312 22.0312 10.9375 22.125 11.3125 22.1562L10.25 27.0625C10.5625 27.1875 10.8958 27.25 11.25 27.25ZM29.5 27.25C27.1875 27.25 25.1458 26.5521 23.375 25.1562C21.6042 23.7604 20.7188 21.9792 20.7188 19.8125C20.7188 17.5 21.5729 15.3646 23.2812 13.4062C24.9896 11.4479 27.0521 9.96875 29.4688 8.96875L31.375 11.8438C29.75 12.5625 28.4062 13.5 27.375 14.6562C26.3438 15.8125 25.8438 17.0625 25.875 18.4062C25.875 18.9375 25.9896 19.4688 26.2188 20C26.4479 20.5312 26.75 20.9375 27.125 21.2188C27.5 21.5 27.9062 21.7188 28.3438 21.875C28.7812 22.0312 29.1875 22.125 29.5625 22.1562L28.5 27.0625C28.8125 27.1875 29.1458 27.25 29.5 27.25Z" fill="currentColor"/>
    </svg>
);


const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin, appName }) => {
    
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const appShortName = appName.replace(' Task Manager', '');
    
    const faqData = [
        { q: "What is Zenith Task Manager?", a: `${appName} is a comprehensive project management tool designed to help teams organize, track, and collaborate on tasks efficiently. It combines task management, team chat, reporting, and an AI assistant into one seamless platform.` },
        { q: "Who is this platform for?", a: "Our platform is designed for teams of all sizes, from small startups to large enterprises. It's ideal for any organization looking to improve productivity, streamline workflows, and enhance team collaboration." },
        { q: "Can I integrate with other tools?", a: "We are actively working on integrations with popular tools like Slack, Google Calendar, and GitHub. Stay tuned for announcements about new integrations coming soon!" },
        { q: "Is there a free trial available?", a: "Yes! You can sign up for our 'Basic' plan which is free forever for small teams. For larger teams wanting to try our 'Pro' features, we offer a 14-day free trial, no credit card required." }
    ];

    return (
        <div className="bg-slate-900 text-white selection:bg-indigo-500 selection:text-white">
            <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4f46e5 100%)' }}>
                 <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                {/* Header */}
                <header className="py-4 px-6 md:px-12 flex justify-between items-center fixed top-0 left-0 w-full z-20 bg-slate-900/30 backdrop-blur-sm">
                    <div className="flex items-center">
                        <LogoIcon className="h-8 w-8 mr-2 text-indigo-400"/>
                        <span className="text-xl font-bold">{appShortName}</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-6">
                       <a href="#features" className="font-semibold text-gray-300 hover:text-white transition-colors">Features</a>
                       <a href="#pricing" className="font-semibold text-gray-300 hover:text-white transition-colors">Pricing</a>
                       <a href="#faq" className="font-semibold text-gray-300 hover:text-white transition-colors">FAQ</a>
                    </nav>
                    <div className="space-x-4">
                        <button onClick={onShowLogin} className="font-semibold hover:text-gray-300 transition-colors">Login</button>
                        <button onClick={onShowLogin} className="bg-indigo-600 font-semibold px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors shadow-lg">Sign Up</button>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="min-h-screen pt-32 pb-20 text-center flex flex-col items-center justify-center px-4 relative z-10">
                    <AnimatedSection>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-shadow">
                            The Future of Team Productivity is Here.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 text-shadow-sm">
                            {appName} provides an intelligent, all-in-one workspace to manage projects, collaborate with your team, and achieve your goals with unprecedented speed and clarity.
                        </p>
                        <div className="flex justify-center items-center gap-4">
                             <button onClick={onShowLogin} className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-lg text-lg hover:bg-gray-200 transition-all shadow-xl transform hover:scale-105">
                                Get Started For Free
                            </button>
                        </div>
                    </AnimatedSection>
                    <AnimatedSection delay="200">
                        <div className="mt-16 w-full max-w-5xl mx-auto">
                            <img src="https://placehold.co/1024x576/4f46e5/ffffff?text=App+Screenshot" alt="App Screenshot" className="rounded-xl shadow-2xl ring-1 ring-white/10"/>
                        </div>
                    </AnimatedSection>
                </main>
            </div>
            
             {/* Social Proof */}
            <AnimatedSection className="py-16 bg-slate-800">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Trusted by the world's most innovative teams</h3>
                    <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 mt-6">
                        {['Stripe', 'Netflix', 'Shopify', 'Google', 'Amazon'].map(name => (
                             <p key={name} className="text-2xl font-semibold text-gray-500">{name}</p>
                        ))}
                    </div>
                </div>
            </AnimatedSection>
            
            {/* Features Section */}
            <AnimatedSection id="features" className="py-24 px-6 md:px-12 bg-slate-900">
                <div className="max-w-6xl mx-auto space-y-20">
                     <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <h2 className="text-3xl font-bold mb-4">Powerful Task Management, Simplified.</h2>
                            <p className="text-gray-400 mb-6">Create, assign, and track tasks with customizable statuses, priorities, and deadlines. Use dependencies to map out project workflows and ensure nothing slips through the cracks.</p>
                            <button onClick={onShowLogin} className="text-indigo-400 font-semibold hover:text-indigo-300">Learn More &rarr;</button>
                        </div>
                        <img src="https://placehold.co/600x400/6366f1/ffffff?text=Feature+Visual+1" alt="Task Management Visual" className="rounded-lg shadow-xl"/>
                    </div>
                     <div className="grid md:grid-cols-2 gap-12 items-center">
                         <img src="https://placehold.co/600x400/059669/ffffff?text=Feature+Visual+2" alt="Collaboration Visual" className="rounded-lg shadow-xl md:order-last"/>
                        <div className="text-left">
                            <h2 className="text-3xl font-bold mb-4">Collaborate in Real-Time.</h2>
                            <p className="text-gray-400 mb-6">Communicate seamlessly with built-in team chat, share files, and get instant updates with a centralized activity log. Keep everyone in the loop, without the noise.</p>
                            <button onClick={onShowLogin} className="text-indigo-400 font-semibold hover:text-indigo-300">Learn More &rarr;</button>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
            
            {/* Testimonials */}
            <AnimatedSection className="py-24 bg-slate-800">
                 <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Loved by Teams Everywhere</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-12">Don't just take our word for it. Here's what our customers have to say about their experience.</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[{name: 'Sara K.', role: 'Project Manager', quote: `${appName} has revolutionized how we manage projects. Our efficiency has skyrocketed!`}, {name: 'Ali R.', role: 'Lead Developer', quote: `The best task manager I've ever used. The UI is clean, intuitive, and incredibly powerful.`}, {name: 'Fatima Z.', role: 'Marketing Head', quote: `Cross-department collaboration has never been easier. The reporting tools are a game-changer for us.`}].map((t, i) => (
                            <div key={i} className="bg-slate-700 p-8 rounded-lg text-left relative transform hover:scale-105 transition-transform duration-300 shadow-lg">
                                <QuoteIcon className="absolute top-6 left-6 text-slate-600"/>
                                <p className="text-gray-300 mt-8 mb-6">{t.quote}</p>
                                <div className="flex items-center">
                                    <img src={`https://picsum.photos/seed/testi-${i}/40`} className="w-10 h-10 rounded-full" alt={t.name}/>
                                    <div className="ml-4">
                                        <p className="font-semibold">{t.name}</p>
                                        <p className="text-sm text-gray-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>
            
            {/* Pricing */}
            <AnimatedSection id="pricing" className="py-24 px-6 md:px-12 bg-slate-900">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Flexible Pricing for Teams of All Sizes</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">Choose the plan that fits your needs. Start for free and upgrade as you grow.</p>
                    <div className="flex justify-center items-center space-x-4 mb-10">
                        <span className={billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}>Monthly</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" onChange={() => setBillingCycle(p => p === 'monthly' ? 'yearly' : 'monthly')} />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <span className={billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}>Yearly <span className="text-xs text-emerald-400">(Save 20%)</span></span>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Pricing Cards */}
                        <PricingCard plan="Basic" price={billingCycle === 'monthly' ? '0' : '0'} features={['Up to 5 users', 'Basic task management', 'Team chat', '1GB Storage']} onShowLogin={onShowLogin} />
                        <PricingCard plan="Pro" price={billingCycle === 'monthly' ? '12' : '9.6'} features={['Unlimited users', 'Advanced task features', 'Reporting & Analytics', 'AI Assistant', '10GB Storage']} isFeatured onShowLogin={onShowLogin} />
                        <PricingCard plan="Enterprise" price="Contact Us" features={['All Pro features', 'Custom permissions', 'Dedicated support', 'SSO & Security', 'Unlimited Storage']} onShowLogin={onShowLogin} />
                    </div>
                </div>
            </AnimatedSection>
            
            {/* FAQ */}
            <AnimatedSection id="faq" className="py-24 bg-slate-800">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqData.map((item, index) => (
                             <div key={index} className="bg-slate-700/50 rounded-lg">
                                <h2>
                                    <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex items-center justify-between w-full p-6 font-semibold text-left">
                                        <span>{item.q}</span>
                                        <ChevronDownIcon className={`w-5 h-5 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}/>
                                    </button>
                                </h2>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-screen' : 'max-h-0'}`}>
                                    <div className="p-6 pt-0">
                                        <p className="text-gray-400">{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>
            
            {/* Final CTA */}
             <AnimatedSection className="py-24 bg-indigo-700">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
                    <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">Join thousands of productive teams who use {appName} to get things done. Sign up is free and takes less than a minute.</p>
                    <button onClick={onShowLogin} className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-lg text-lg hover:bg-gray-200 transition-colors shadow-xl transform hover:scale-105">
                        Start For Free Today
                    </button>
                </div>
            </AnimatedSection>
            
            {/* Footer */}
            <footer className="bg-slate-900 py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
                     <div className="col-span-2 md:col-span-2">
                        <div className="flex items-center mb-2">
                            <LogoIcon className="h-8 w-8 mr-2 text-indigo-400"/>
                            <span className="text-xl font-bold">{appShortName}</span>
                        </div>
                        <p className="text-gray-400 pr-8">The all-in-one platform for modern teams.</p>
                     </div>
                     <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#features" className="hover:text-white">Features</a></li>
                            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                            <li><a href="#" className="hover:text-white">Updates</a></li>
                        </ul>
                     </div>
                      <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white">About Us</a></li>
                            <li><a href="#" className="hover:text-white">Careers</a></li>
                            <li><a href="#" className="hover:text-white">Contact</a></li>
                        </ul>
                     </div>
                      <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white">Blog</a></li>
                            <li><a href="#" className="hover:text-white">Help Center</a></li>
                            <li><a href="#" className="hover:text-white">Security</a></li>
                        </ul>
                     </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <a href="#" className="hover:text-white"><TwitterIcon className="w-5 h-5"/></a>
                        <a href="#" className="hover:text-white"><FacebookIcon className="w-5 h-5"/></a>
                        <a href="#" className="hover:text-white"><GoogleIcon className="w-5 h-5"/></a>
                    </div>
                </div>
            </footer>
             <style>{`
                .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
                .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
            `}</style>
        </div>
    );
};

const PricingCard: React.FC<{
    plan: string;
    price: string | number;
    features: string[];
    isFeatured?: boolean;
    onShowLogin: () => void;
}> = ({ plan, price, features, isFeatured, onShowLogin }) => (
    <div className={`border rounded-lg p-8 text-left h-full flex flex-col ${isFeatured ? 'border-indigo-500 bg-slate-800' : 'border-slate-700'}`}>
        {isFeatured && <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider mb-2">Most Popular</span>}
        <h3 className="text-2xl font-bold mb-4">{plan}</h3>
        <div className="mb-6">
            {typeof price === 'number' ? (
                <>
                    <span className="text-4xl font-extrabold">${price}</span>
                    <span className="text-gray-400">/ user / month</span>
                </>
            ) : (
                <span className="text-3xl font-bold">{price}</span>
            )}
        </div>
        <ul className="space-y-3 text-gray-300 mb-8 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-emerald-500 mr-2 mt-1 flex-shrink-0"/>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button onClick={onShowLogin} className={`w-full py-3 font-semibold rounded-lg transition-colors ${isFeatured ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
            Get Started
        </button>
    </div>
);


export default LandingPage;