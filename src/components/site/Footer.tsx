import { Link } from "@tanstack/react-router";
import logo from "@/assets/vaaskar-logo.png";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="IndusWork logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
            <div>
              <div className="font-display text-2xl font-extrabold leading-none">Indus<span className="text-gold">Work</span></div>
              <div className="text-xs text-white/60 mt-1">— One fix for every Home —</div>
            </div>
          </div>
          <p className="text-sm text-white/70 mt-4 leading-relaxed">
            India's trusted home service platform. Verified experts, fixed prices,
            100% satisfaction guaranteed across 8+ cities.
          </p>
          <div className="flex gap-2 mt-4">
            {["📘","📸","🐦","💬","▶"].map((e,i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gold flex items-center justify-center transition">{e}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/services">⚡ Electrical Repair</Link></li>
            <li><Link to="/services">🔧 Plumbing Repair</Link></li>
            <li><Link to="/services">🎨 Painting</Link></li>
            <li><Link to="/services">🧹 Deep Cleaning</Link></li>
            <li><Link to="/services">🏗️ Renovation</Link></li>
            <li><Link to="/services">👷 Labour Work</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/joinus">Join as Provider</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold mb-4">Contact</h4>
          <div className="text-sm text-white/70 space-y-3">
            <div>👤 <strong className="text-white">Dev Sharma</strong> <span className="text-white/50">— Partner with Vivek Sharma</span></div>
            <div>📞 <strong className="text-white">+91 86839 79659</strong></div>
            <div>✉️ <strong className="text-white">support@induswork.in</strong></div>
            <div>📍 <strong className="text-white">3rd Floor, 44, Regal Building, 69, Connaught Cir, Hanuman Road Area, Connaught Place, New Delhi, Delhi 110001</strong></div>
          </div>
          <div className="flex gap-2 mt-4">
            <a href="https://wa.me/918683979659" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-3 py-2 rounded-lg text-xs font-bold">💬 WhatsApp</a>
            <a href="tel:+918683979659" className="bg-gold text-white px-3 py-2 rounded-lg text-xs font-bold">📞 Call</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
          <p>© 2025 IndusWork Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-3">
            <span>🔒 Secure</span><span>✅ Verified</span><span>🇮🇳 Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
