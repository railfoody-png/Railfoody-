import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, HelpCircle, MessageCircle, ShieldCheck, 
  Clock, Train, Search, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'delivery' | 'hygiene' | 'cancellation' | 'ordering' | 'jain';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'delivery',
    question: 'How will the delivery executive find my berth inside the train?',
    answer: 'When placing an order, you provide your Coach (e.g. B2, S4) and Seat/Berth number. Our verified delivery executive tracks your train in real-time, positions themselves on the platform right outside your specific coach 10 minutes before arrival, and delivers your sealed meal directly to your seat or coach window.'
  },
  {
    id: 'faq-2',
    category: 'cancellation',
    question: 'What happens if my train is delayed or arrives late at the station?',
    answer: 'No worries at all! Our kitchen and logistics team monitors official live train running status. If your train is delayed by 30 minutes, 2 hours, or more, our kitchen times the cooking so your food is prepared fresh right before the revised arrival time. It will always reach you steaming hot.'
  },
  {
    id: 'faq-3',
    category: 'hygiene',
    question: 'Are the restaurants FSSAI certified and how is food packed?',
    answer: 'Yes, 100% of our partner restaurants hold active FSSAI hygiene licenses. Food is packaged in airtight, food-grade, leak-proof containers and sealed with tamper-evident security tape. Warm rotis and parathas are wrapped in food-safe silver foil to retain crispness and heat.'
  },
  {
    id: 'faq-4',
    category: 'cancellation',
    question: 'Can I cancel or modify my train food order? What about refunds?',
    answer: 'You can cancel or modify your order for free up to 45-60 minutes before the train reaches the delivery station. If Indian Railways diverts or cancels your train, we issue a 100% full instant refund to your original payment method with zero cancellation penalty.'
  },
  {
    id: 'faq-5',
    category: 'delivery',
    question: 'What if the train stops at my station for only 2 or 3 minutes?',
    answer: 'Our station delivery partners are stationed directly at your coach marker on the platform before the train halts. The handover takes less than 30 seconds at the door or window. Even on short 2-minute stoppages, our successful delivery rate exceeds 99.4%.'
  },
  {
    id: 'faq-6',
    category: 'ordering',
    question: 'Can I order directly on WhatsApp instead of the website?',
    answer: 'Yes! Tap the "Order on WhatsApp" button or message us directly at +91 9752693979. Simply send your Train number or PNR and what dishes you want. Our dedicated railway concierge will confirm your order in under 2 minutes.'
  },
  {
    id: 'faq-7',
    category: 'jain',
    question: 'Do you offer authentic Jain and pure Satvik meals without onion & garlic?',
    answer: 'Yes! We have dedicated pure vegetarian and certified Jain partner kitchens. Jain meals are prepared in separate cooking vessels with zero onion, garlic, or root vegetables. Each Jain meal is packed with a distinct green Jain seal for complete peace of mind.'
  },
  {
    id: 'faq-8',
    category: 'ordering',
    question: 'What payment modes are accepted? Is Cash on Delivery available?',
    answer: 'We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit cards, as well as Cash on Delivery (COD) directly to the delivery partner at your train berth.'
  }
];

interface FaqSectionProps {
  whatsappNumber?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ whatsappNumber = '9752693979' }) => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2']);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cleanWa = whatsappNumber.replace(/\D/g, '');

  const toggleFaq = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-stone-50 border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Everything you need to know about getting fresh, hygienic restaurant food delivered directly to your train berth.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. delay, hygiene, Jain food, refund, WhatsApp)..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-900 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 hover:text-stone-800 bg-stone-100 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'delivery', label: 'Berth Delivery' },
              { id: 'hygiene', label: 'Hygiene & FSSAI' },
              { id: 'cancellation', label: 'Delays & Refunds' },
              { id: 'ordering', label: 'WhatsApp & Pay' },
              { id: 'jain', label: 'Jain & Satvik' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-stone-200">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-stone-800 font-bold">No questions found matching "{searchQuery}"</p>
              <p className="text-stone-500 text-xs mt-1">Try another keyword or reach out on WhatsApp directly.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-300 transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                    aria-expanded={isOpen}
                  >
                    <span className="font-heading font-bold text-stone-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-xl shrink-0 transition-all ${
                      isOpen ? 'bg-amber-400 text-stone-950 rotate-180' : 'bg-stone-100 text-stone-600'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-3">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Live WhatsApp Help Banner */}
        <div className="mt-10 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <MessageCircle className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                Have a special request or custom query?
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                Our Railway Concierge is active 24/7 on WhatsApp for live order assistance.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/91${cleanWa}?text=Hi%20Railfoody,%20I%20have%20a%20question%20regarding%20train%20food%20delivery`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-amber-400/30 transition-all shrink-0 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-stone-950 text-stone-950" />
            <span>Chat on WhatsApp: +91 {whatsappNumber}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
