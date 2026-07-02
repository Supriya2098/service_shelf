require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('./database');

initDatabase();

const categories = [
  { name: 'Home Services', slug: 'home-services', icon: '🏠', description: 'Cleaning, repairs and maintenance for your home' },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: '🔧', description: 'AC, fridge, washing machine and more' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: '💆', description: 'Salon, spa and wellness at your doorstep' },
  { name: 'Electrical & Plumbing', slug: 'electrical-plumbing', icon: '⚡', description: 'Licensed electricians and plumbers' },
  { name: 'Pest Control', slug: 'pest-control', icon: '🐛', description: 'Safe and effective pest management' },
];

const services = [
  { cat: 'home-services', name: 'Deep Home Cleaning', slug: 'deep-home-cleaning', short: 'Full home deep clean with sanitization', desc: 'Professional deep cleaning for 2BHK/3BHK homes. Includes kitchen, bathrooms, living areas, and balcony. Eco-friendly products used. Perfect before festivals or moving in.', price: 2499, duration: 180, rating: 4.8, reviews: 342, features: ['Kitchen deep clean', 'Bathroom sanitization', 'Floor mopping & dusting', 'Balcony cleaning', 'Eco-friendly products'] },
  { cat: 'home-services', name: 'Sofa & Carpet Shampooing', slug: 'sofa-carpet-shampooing', short: 'Professional upholstery cleaning', desc: 'Expert sofa and carpet shampooing service. Removes stains, dust mites and allergens. Dry within 4-6 hours.', price: 1299, duration: 120, rating: 4.6, reviews: 198, features: ['Stain removal', 'Dust mite treatment', 'Quick dry formula', 'All fabric types'] },
  { cat: 'home-services', name: 'House Painting', slug: 'house-painting', short: 'Interior & exterior painting', desc: 'Premium quality painting for homes and offices. Includes surface preparation, primer and 2 coats of paint. Asian Paints & Berger options available.', price: 8999, duration: 480, rating: 4.7, reviews: 156, features: ['Surface preparation', 'Premium paints', '2-year warranty', 'Free colour consultation'] },
  { cat: 'appliance-repair', name: 'AC Service & Repair', slug: 'ac-service-repair', short: 'Split & window AC servicing', desc: 'Complete AC service including filter cleaning, gas check, coil cleaning and performance optimization. All major brands: Voltas, Daikin, LG, Samsung.', price: 599, duration: 90, rating: 4.9, reviews: 567, features: ['Filter cleaning', 'Gas level check', 'Coil cleaning', 'All brands supported', '90-day warranty'] },
  { cat: 'appliance-repair', name: 'Washing Machine Repair', slug: 'washing-machine-repair', short: 'Front & top load repair', desc: 'Expert washing machine repair for all brands. Drum issues, motor problems, water leakage and more. Genuine spare parts.', price: 449, duration: 60, rating: 4.5, reviews: 234, features: ['All brands', 'Genuine parts', 'Same-day service', '30-day warranty'] },
  { cat: 'appliance-repair', name: 'Refrigerator Repair', slug: 'refrigerator-repair', short: 'Fridge cooling & compressor repair', desc: 'Refrigerator not cooling? Our technicians fix compressor issues, gas refill, thermostat problems for all single and double door fridges.', price: 499, duration: 75, rating: 4.6, reviews: 189, features: ['Cooling issues', 'Gas refill', 'Compressor repair', 'All major brands'] },
  { cat: 'beauty-wellness', name: 'Salon at Home (Women)', slug: 'salon-at-home-women', short: 'Hair, skin & nail services at home', desc: 'Full salon experience at your home. Haircut, colouring, facial, manicure, pedicure and threading. Hygienic tools and premium products.', price: 999, duration: 120, rating: 4.7, reviews: 423, features: ['Haircut & styling', 'Facial & cleanup', 'Manicure & pedicure', 'Threading', 'Premium products'] },
  { cat: 'beauty-wellness', name: 'Massage Therapy', slug: 'massage-therapy', short: 'Relaxing full body massage', desc: 'Certified therapists for Swedish, deep tissue and Ayurvedic massage. Reduces stress, relieves muscle pain. Organic oils used.', price: 1499, duration: 90, rating: 4.8, reviews: 312, features: ['Swedish massage', 'Deep tissue', 'Ayurvedic options', 'Organic oils', 'Certified therapists'] },
  { cat: 'electrical-plumbing', name: 'Electrician on Call', slug: 'electrician-on-call', short: 'Wiring, switches & fan installation', desc: 'Licensed electrician for all home electrical work. Fan installation, switchboard repair, wiring, MCB issues and light fittings.', price: 349, duration: 60, rating: 4.6, reviews: 445, features: ['Fan installation', 'Wiring repair', 'Switchboard fix', 'Licensed electrician', 'Safety certified'] },
  { cat: 'electrical-plumbing', name: 'Plumbing Services', slug: 'plumbing-services', short: 'Tap, pipe & drainage repair', desc: 'Expert plumbers for tap leakage, pipe burst, blocked drainage, toilet repair and geyser installation. Available across major Indian cities.', price: 399, duration: 60, rating: 4.5, reviews: 378, features: ['Leak repair', 'Drainage unblocking', 'Geyser installation', 'Toilet repair', '24/7 emergency'] },
  { cat: 'electrical-plumbing', name: 'CCTV Installation', slug: 'cctv-installation', short: 'Home & office security cameras', desc: 'Professional CCTV camera installation with DVR/NVR setup, mobile app configuration and 1-year service warranty.', price: 2999, duration: 180, rating: 4.7, reviews: 167, features: ['HD cameras', 'Mobile app setup', 'DVR/NVR config', '1-year warranty', 'Night vision'] },
  { cat: 'pest-control', name: 'Cockroach & Ant Control', slug: 'cockroach-ant-control', short: 'Gel treatment for cockroaches & ants', desc: 'Odourless gel treatment effective for 3-6 months. Safe for kids and pets. Covers kitchen, bathrooms and entire home.', price: 899, duration: 60, rating: 4.6, reviews: 289, features: ['Odourless gel', '3-6 month protection', 'Kid & pet safe', 'Full home coverage'] },
  { cat: 'pest-control', name: 'Termite Treatment', slug: 'termite-treatment', short: 'Anti-termite drilling treatment', desc: 'Comprehensive anti-termite treatment with drilling and chemical barrier. Protects wooden furniture and structure. 5-year warranty.', price: 4999, duration: 240, rating: 4.8, reviews: 134, features: ['Drilling treatment', 'Chemical barrier', 'Wood protection', '5-year warranty', 'Free inspection'] },
];

const insertCat = db.prepare('INSERT OR IGNORE INTO service_categories (name, slug, icon, description) VALUES (?, ?, ?, ?)');
const insertSvc = db.prepare(`
  INSERT OR IGNORE INTO services (category_id, name, slug, description, short_description, price, duration_minutes, rating, review_count, features)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const catMap = {};
for (const c of categories) {
  insertCat.run(c.name, c.slug, c.icon, c.description);
  const row = db.prepare('SELECT id FROM service_categories WHERE slug = ?').get(c.slug);
  catMap[c.slug] = row.id;
}

for (const s of services) {
  insertSvc.run(catMap[s.cat], s.name, s.slug, s.desc, s.short, s.price, s.duration, s.rating, s.reviews, JSON.stringify(s.features));
}

const adminHash = bcrypt.hashSync('admin123', 10);
db.prepare(`INSERT OR IGNORE INTO users (name, email, password, phone, role, city) VALUES (?, ?, ?, ?, 'admin', 'Mumbai')`)
  .run('Admin User', 'admin@sevasetu.in', adminHash, '+91 9876543210');

const demoHash = bcrypt.hashSync('demo123', 10);
db.prepare(`INSERT OR IGNORE INTO users (name, email, password, phone, address, city) VALUES (?, ?, ?, ?, ?, ?)`)
  .run('Priya Sharma', 'priya@demo.com', demoHash, '+91 9876543211', 'Flat 402, Andheri West', 'Mumbai');

console.log('Database seeded successfully!');
console.log('Admin login: admin@sevasetu.in / admin123');
console.log('Demo customer: priya@demo.com / demo123');
console.log(`Categories: ${categories.length}, Services: ${services.length}`);
