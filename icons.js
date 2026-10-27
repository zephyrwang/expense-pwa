// Doodle icons for subcategories, drawn on a 24×24 grid. Fills are CSS classes
// (f-*) mapped to theme tokens in style.css; outlines come from .cat-badge rules.
// Keyed by subcategory name — keep in sync with TAXONOMY in taxonomy.js.

const STAR = 'M12 8.2 l1.2 2.5 2.7.3 -2 1.9 .6 2.7 -2.5-1.4 -2.5 1.4 .6-2.7 -2-1.9 2.7-.3 Z';
const CAR_BODY = 'M3 16 V13 L5.5 8.5 a2 2 0 0 1 1.8-1 H16.7 a2 2 0 0 1 1.8 1 L21 13 V16 Z';
const CAR_REST = '<path class="f-white" d="M7 12 L8.3 9.5 H15.7 L17 12 Z"/><circle class="f-ink" cx="7.5" cy="17" r="2"/><circle class="f-ink" cx="16.5" cy="17" r="2"/>';
const SHIELD = 'M12 2.5 L20 5.5 V11 c0 5 -3.5 8.5 -8 10.5 C7.5 19.5 4 16 4 11 V5.5 Z';
const PAW_PADS = '<ellipse class="f-pink" cx="11" cy="15" rx="5" ry="4.2"/><circle class="f-pink" cx="5.5" cy="9.5" r="2"/><circle class="f-pink" cx="9" cy="6" r="2"/><circle class="f-pink" cx="13.5" cy="6" r="2"/><circle class="f-pink" cx="17" cy="9.5" r="2"/>';

export const SUB_ICONS = {
  // Housing
  'Rent/mortgage': '<path class="f-yellow" d="M4 11 L12 4 L20 11 V20 H4 Z"/><path class="f-red" d="M2.5 11.8 L12 3.2 L21.5 11.8 L19.5 12.8 L12 6.2 L4.5 12.8 Z"/><rect class="f-brown" x="10" y="14" width="4" height="6" rx="1"/>',
  'Property tax': '<path class="f-white" d="M6 3 H15 L19 7 V21 H6 Z"/><path d="M15 3 V7 H19"/><path d="M9.5 17 L15.5 10"/><circle cx="10" cy="11" r="1.4"/><circle cx="15" cy="16" r="1.4"/>',
  'HOA fees': '<rect class="f-blue" x="5" y="3" width="14" height="18" rx="1.5"/><path class="thick" d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/><rect class="f-brown" x="10.5" y="17" width="3" height="4"/>',
  'Maintenance/repair': '<path class="f-gray" d="M14.5 3.5 a5 5 0 0 0 -5.3 6.7 L3.6 15.8 a2 2 0 0 0 2.8 2.8 L12 13 a5 5 0 0 0 6.7-5.3 l-3 3 -2.6-0.8 -0.8-2.6 Z"/>',
  'Home supplies': '<circle class="f-white" cx="9" cy="6" r="2.2"/><circle class="f-white" cx="14.5" cy="4.5" r="1.6"/><circle class="f-white" cx="17.5" cy="7.5" r="1.2"/><rect class="f-yellow" x="4" y="10" width="16" height="9" rx="3"/><path class="thick" d="M7.5 13.5h.01M11 15.5h.01M15 13h.01M17 16h.01"/>',
  'Furniture/appliances': '<path class="f-pink" d="M5 12 V8 a2 2 0 0 1 2-2 H17 a2 2 0 0 1 2 2 V12"/><path class="f-pink" d="M3 12 a2 2 0 0 1 4 0 V14 H17 V12 a2 2 0 0 1 4 0 V18 H3 Z"/><path d="M6 18 v2 M18 18 v2"/>',
  // Utilities
  'Electricity': '<path class="f-yellow" d="M13.5 2.5 L5.5 13.5 H11 L10 21.5 L18.5 10 H13 Z"/>',
  'Water/gas': '<path class="f-blue" d="M12 3 C12 3 5.5 10.5 5.5 15 a6.5 6.5 0 0 0 13 0 C18.5 10.5 12 3 12 3 Z"/><path d="M9 15.5 a3 3 0 0 0 2.5 2.8"/>',
  'Internet': '<path d="M3 9.5 a13 13 0 0 1 18 0 M6 12.8 a8.5 8.5 0 0 1 12 0 M9 16 a4 4 0 0 1 6 0"/><circle class="f-ink" cx="12" cy="19" r="1.4"/>',
  'Mobile phone plan': '<rect class="f-purple" x="7" y="2.5" width="10" height="19" rx="2.5"/><rect class="f-white" x="8.8" y="5" width="6.4" height="12" rx="1"/><path d="M11 19.2h2"/>',
  // Eating
  'Groceries/supermarket': '<circle class="f-red" cx="9" cy="8" r="2.6"/><path class="f-green" d="M14 9 C14 5 16 3.5 18 3 C18 6 17 8 14 9 Z"/><path class="f-brown" d="M3 10 H21 L19 20 H5 Z"/><path d="M8 13 v4 M12 13 v4 M16 13 v4"/>',
  'Restaurant': '<path d="M8 3 L11 11 M11.5 3 L13 11"/><path class="f-white" d="M3 11 H21 a9 8 0 0 1 -18 0 Z"/><path d="M6 14 q2 1.5 4 0 q2 1.5 4 0 q2 1.5 4 0"/><path d="M9 20.5 h6"/>',
  'Coffee/bar/drinks': '<path class="f-pink" d="M13 1.5 L14.8 1.5 L13.6 8.5 H11.8 Z"/><path class="f-tan" d="M6.5 8 H17.5 L16 21 H8 Z"/><path class="f-white" d="M5.5 8 H18.5 A6.5 4 0 0 0 5.5 8 Z"/><circle class="f-ink" cx="9.6" cy="18.6" r="1"/><circle class="f-ink" cx="12" cy="19.2" r="1"/><circle class="f-ink" cx="14.4" cy="18.5" r="1"/><circle class="f-ink" cx="11" cy="16.6" r="1"/><circle class="f-ink" cx="13.4" cy="16.4" r="1"/>',
  'Bakery': '<path class="f-green" d="M10.5 4.5 L12 3 L13.5 4.5 Z"/><path class="f-red" d="M12 4.5 c2.5 0 3.5 2.5 2 4.5 q-2 2.5 -4 0 c-1.5-2 -.5-4.5 2-4.5 Z"/><rect class="f-yellow" x="4" y="11" width="16" height="9" rx="2"/><path class="f-pink" d="M4 13 a2 2 0 0 1 2-2 H18 a2 2 0 0 1 2 2 v1.5 q-1.5 2 -3 0 q-1.5 2 -3 0 q-1.5 2 -3 0 q-1.5 2 -3 0 q-1.5 2 -3 0 Z"/>',
  'Takeout/delivery': '<path d="M9 4.5 a3 3 0 0 1 6 0"/><path class="f-white" d="M5 8 L8 4 H16 L19 8 Z"/><path class="f-white" d="M5 8 H19 L17 20 H7 Z"/><circle class="f-red" cx="12" cy="14" r="2.2"/>',
  // Transportation
  'Car payment': `<path class="f-blue" d="${CAR_BODY}"/>${CAR_REST}`,
  'Fuel/EV charging': '<rect class="f-red" x="4" y="4" width="10" height="17" rx="1.5"/><rect class="f-white" x="6" y="6.5" width="6" height="4" rx=".8"/><path d="M14 9 H16 a2 2 0 0 1 2 2 V16 a1.5 1.5 0 0 0 3 0 V8 L18.5 5.5"/><path d="M3 21 h12"/>',
  'Public transit': '<rect class="f-green" x="4" y="3" width="16" height="16" rx="3"/><rect class="f-white" x="6" y="6" width="12" height="6" rx="1"/><circle class="f-ink" cx="8" cy="15.5" r="1.1"/><circle class="f-ink" cx="16" cy="15.5" r="1.1"/><path d="M7 19 v2 M17 19 v2"/>',
  'Rideshare/taxi': `<rect class="f-white" x="10" y="4.5" width="4" height="2.5" rx=".6"/><path class="f-yellow" d="${CAR_BODY}"/>${CAR_REST}`,
  'Parking/tolls': '<rect class="f-blue" x="4" y="4" width="16" height="16" rx="3.5"/><path class="thick" d="M10 17 V8 H13 a2.6 2.6 0 0 1 0 5.2 H10"/>',
  'Expressway fees': '<path class="f-gray" d="M9 3 H15 L20 21 H4 Z"/><path class="dash" d="M12 5.5 v2 M12 10.5 v2.5 M12 16 v3"/>',
  'Car registration': '<rect class="f-white" x="2.5" y="7" width="19" height="10" rx="2"/><path class="thick" d="M6 12.5 h3 M11 12.5 h2 M15 12.5 h3"/><circle class="f-ink" cx="5" cy="9.2" r=".6"/><circle class="f-ink" cx="19" cy="9.2" r=".6"/>',
  'Car maintenance': '<circle class="f-ink" cx="12" cy="12" r="9"/><circle class="f-gray" cx="12" cy="12" r="4.5"/><circle class="f-ink" cx="12" cy="12" r="1.2"/>',
  'Car insurance': `<path class="f-blue" d="${SHIELD}"/><path class="thick" d="M8.5 12 l2.5 2.5 L15.5 9.5"/>`,
  // Pet
  'Pet food': '<path class="f-blue" d="M5 9 c2-3 7-3 9 0 c-2 3-7 3-9 0 Z M14 9 l3-2.5 v5 Z"/><circle class="f-ink" cx="7.5" cy="8.6" r=".5"/><path class="f-red" d="M3 13 H21 L19 20 H5 Z"/>',
  'Vet/medical': `${PAW_PADS}<circle class="f-white" cx="18" cy="18" r="4"/><path d="M18 16 v4 M16 18 h4"/>`,
  'Grooming': '<path class="f-purple" d="M3 8 H21 V12 H3 Z"/><path d="M5 12 v6 M8 12 v6 M11 12 v6 M14 12 v6 M17 12 v6 M20 12 v4"/>',
  'Toys/supplies': '<circle class="f-pink" cx="11" cy="12" r="7.5"/><path d="M5 9 c4 1 8 5 9 10 M7 5.5 c4 2 8 7 9 11 M10.5 4.6 c3 2 6 6 7.5 10"/><path d="M17 17 c2 1 3 3 4.5 2.5"/>',
  // Kids
  'Childcare/daycare': '<path class="f-pink" d="M10.5 2.5 h3 l1 3 h-5 Z"/><rect class="f-blue" x="8.5" y="5.5" width="7" height="2" rx=".6"/><rect class="f-white" x="8" y="7.5" width="8" height="13.5" rx="2.5"/><path d="M10.5 12 h3 M10.5 15 h3"/>',
  'School tuition/fees': '<path d="M10 4.5 a2 2 0 0 1 4 0"/><path class="f-orange" d="M6 10 a6 6 0 0 1 12 0 V19 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 Z"/><rect class="f-yellow" x="8.5" y="13" width="7" height="5" rx="1.2"/>',
  'Kids clothing': '<path class="f-blue" d="M8 3 H16 L20 7 L17.5 9.5 L16 8.5 V18 L14 21 H10 L8 18 V8.5 L6.5 9.5 L4 7 Z"/><path d="M10 3 a2 2 0 0 0 4 0"/>',
  'Toys/activities': '<rect class="f-red" x="3" y="12" width="8" height="8" rx="1"/><rect class="f-blue" x="13" y="12" width="8" height="8" rx="1"/><rect class="f-yellow" x="8" y="4" width="8" height="8" rx="1"/>',
  'Kids health': '<g transform="rotate(-35 12 12)"><rect class="f-tan" x="2.5" y="8.5" width="19" height="7" rx="3.5"/><rect class="f-white" x="9" y="9.5" width="6" height="5" rx="1"/></g>',
  // Clothing & Personal Care
  'Clothes/shoes': '<path class="f-green" d="M8 3.5 L4 6 L2.5 10 L6 11.5 V20.5 H18 V11.5 L21.5 10 L20 6 L16 3.5 Q12 7 8 3.5 Z"/>',
  'Haircut/salon': '<path d="M8.6 14.8 L17 3.5 M15.4 14.8 L7 3.5"/><circle class="f-pink" cx="6.5" cy="17" r="3"/><circle class="f-pink" cx="17.5" cy="17" r="3"/>',
  'Personal care products': '<path d="M12 6 V4 H17 V5.5"/><path class="f-white" d="M10.5 9 V6 H13.5 V9"/><rect class="f-purple" x="7" y="9" width="10" height="12" rx="2.5"/><rect class="f-white" x="9" y="13" width="6" height="4" rx="1"/>',
  // Health & Medical
  'Doctor/dental': '<path class="f-white" d="M7.5 4 c2 0 3 1 4.5 1 s2.5-1 4.5-1 c3 0 4 3 3.5 6 c-.5 3-1.5 4-2 7 c-.4 2.5-1 4-2 4 c-1.5 0-1.5-5-4-5 s-2.5 5-4 5 c-1 0-1.6-1.5-2-4 c-.5-3-1.5-4-2-7 C3.5 7 4.5 4 7.5 4 Z"/>',
  'Pharmacy/medicine': '<g transform="rotate(-40 12 12)"><path class="f-red" d="M12 7 H8 a5 5 0 0 0 0 10 H12 Z"/><path class="f-white" d="M12 7 H16 a5 5 0 0 1 0 10 H12 Z"/></g>',
  'Health insurance': `<path class="f-pink" d="${SHIELD}"/><path class="thick" d="M12 8.5 v7 M8.5 12 h7"/>`,
  'Gym/fitness': '<path class="thick" d="M8.5 12 h7 M3.5 10 v4 M20.5 10 v4"/><rect class="f-blue" x="5.5" y="6" width="3" height="12" rx="1"/><rect class="f-blue" x="15.5" y="6" width="3" height="12" rx="1"/>',
  // Subscriptions
  'Streaming': '<path d="M9 3 L12 6 L15 3 M8 21 h8"/><rect class="f-blue" x="3" y="6" width="18" height="12" rx="2.5"/><path class="f-white" d="M10.5 9.5 L15 12 L10.5 14.5 Z"/>',
  'Software/apps': '<rect class="f-pink" x="4" y="4" width="7" height="7" rx="2"/><rect class="f-blue" x="13" y="4" width="7" height="7" rx="2"/><rect class="f-yellow" x="4" y="13" width="7" height="7" rx="2"/><rect class="f-green" x="13" y="13" width="7" height="7" rx="2"/>',
  'Memberships': `<rect class="f-purple" x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path class="f-yellow" d="${STAR}"/>`,
  // Shopping
  'Electronics': '<rect class="f-gray" x="5" y="5" width="14" height="10" rx="1.5"/><rect class="f-blue" x="6.8" y="6.8" width="10.4" height="6.4" rx=".6"/><path class="f-gray" d="M2.5 17 H21.5 L20 19.5 H4 Z"/>',
  'Home decor': '<path class="f-green" d="M12 13 C8 13 5 10 5 6 C9 6 12 9 12 13 Z M12 13 C12 8 15 5 19 5 C19 9 16 13 12 13 Z"/><path class="f-orange" d="M6.5 13 H17.5 L16 21 H8 Z"/>',
  'General merchandise': '<path d="M9 10 V6.5 a3 3 0 0 1 6 0 V10"/><path class="f-pink" d="M5 8 H19 L18 21 H6 Z"/><path d="M9 10 V11 M15 10 V11"/>',
  // Entertainment
  'Movie/event tickets': '<path class="f-yellow" d="M3 7 H21 V10 a2 2 0 0 0 0 4 V17 H3 V14 a2 2 0 0 0 0 -4 Z"/><path d="M15 8 v1.5 M15 11.2 v1.6 M15 14.5 v1.5"/>',
  'Hobbies': '<path class="f-tan" d="M12 3 a9 9 0 0 0 0 18 c1.5 0 2-1 1.5-2.2 c-.6-1.4.4-2.8 2-2.8 H18 a3 3 0 0 0 3-3 C21 7 17 3 12 3 Z"/><circle class="f-red" cx="8" cy="10" r="1.5"/><circle class="f-blue" cx="11.5" cy="7" r="1.5"/><circle class="f-green" cx="16" cy="8.5" r="1.5"/><circle class="f-yellow" cx="7.5" cy="14.5" r="1.5"/>',
  'Vacation': '<path class="f-white" d="M21 4 c-1-1-2.6-.6-3.6.4 L13.5 8.3 5 6 3.5 7.5 10.5 11.3 7.5 14.5 4.5 14 3.5 15 7 17 9 20.5 10 19.5 9.5 16.5 12.7 13.5 16.5 20.5 18 19 15.7 10.5 19.6 6.6 C20.6 5.6 22 5 21 4 Z"/>',
  // Education
  'Courses': '<path class="f-blue" d="M6 11 V16 c0 1.5 3 3 6 3 s6-1.5 6-3 V11"/><path class="f-blue" d="M12 4 L22 9 L12 14 L2 9 Z"/><path d="M20 9.5 V15"/><circle class="f-yellow" cx="20" cy="16" r="1.2"/>',
  'Books': '<rect class="f-red" x="4" y="15" width="16" height="5" rx="1"/><rect class="f-blue" x="5.5" y="10" width="13" height="5" rx="1"/><rect class="f-green" x="4.5" y="5" width="15" height="5" rx="1"/>',
  'Certifications': `<path class="f-blue" d="M8 2.5 H11 L13 9 H10 Z M16 2.5 H13 L11 9 H14 Z"/><circle class="f-yellow" cx="12" cy="15" r="6"/><path class="f-white" transform="translate(0 3.3)" d="${STAR}"/>`,
  // Gifts & Donations
  'Gifts': '<rect class="f-pink" x="4" y="10" width="16" height="11" rx="1.5"/><rect class="f-red" x="3" y="7" width="18" height="4" rx="1"/><path d="M12 7 V21"/><path class="f-yellow" d="M12 7 C10 3 6.5 4 8 6.5 C9 7.5 12 7 12 7 Z M12 7 C14 3 17.5 4 16 6.5 C15 7.5 12 7 12 7 Z"/>',
  'Charity/donations': '<path class="f-red" d="M12 20 C5 15 3 12 3 8.8 A4.3 4.3 0 0 1 12 6.5 A4.3 4.3 0 0 1 21 8.8 C21 12 19 15 12 20 Z"/><path d="M19.5 2 v3 M18 3.5 h3"/>',
  // Financial
  'Bank fees': '<path class="f-tan" d="M3 9 L12 3.5 L21 9 Z"/><path class="thick" d="M6 10.5 v7 M10 10.5 v7 M14 10.5 v7 M18 10.5 v7"/><rect class="f-tan" x="3" y="18" width="18" height="3" rx=".8"/>',
  'Credit card fees': '<rect class="f-green" x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path class="thick" d="M2.5 9.5 h19"/><rect class="f-yellow" x="5" y="12" width="4" height="3" rx=".6"/>',
  'Life insurance': '<path d="M12 3 V4"/><path d="M12 12 V18.5 a2 2 0 0 1 -4 0"/><path class="f-purple" d="M3 12 a9 8 0 0 1 18 0 q-1.5-1.5-3 0 q-1.5-1.5-3 0 q-1.5-1.5-3 0 q-1.5-1.5-3 0 q-1.5-1.5-3 0 Z"/>',
  'Taxes': '<path class="f-white" d="M6 2.5 H18 V21.5 L16 20 14 21.5 12 20 10 21.5 8 20 6 21.5 Z"/><path d="M9 7 h6 M9 10.5 h6 M9 14 h4"/>',
  // Other keeps the theme's cat head
  'Uncategorized': '<path class="f-white" d="M5 11 L5.5 3.5 L10 7 Z M19 11 L18.5 3.5 L14 7 Z"/><circle class="f-white" cx="12" cy="13.5" r="7.5"/><circle class="f-ink" cx="9.3" cy="13" r=".9"/><circle class="f-ink" cx="14.7" cy="13" r=".9"/><path d="M11 15.5 q1 1 2 0"/>'
};

// Paw print for any subcategory without its own icon (e.g. renamed ones).
export const FALLBACK_ICON = PAW_PADS;
