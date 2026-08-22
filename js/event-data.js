/* ============================================================
   Event data — the reusable part of the event-page template.
   To publish a new event: duplicate this file's contents (or the
   whole file) and change the values below. Nothing in event.html,
   event.css, or event.js needs to change — they just render
   whatever is in window.EVENT_DATA.

   Replace every asset path with real photos/video from the event;
   the ones below reuse existing site placeholders.
   ============================================================ */
window.EVENT_DATA = {

  meta: {
    title: 'Janapadha Kala Vaibhavam — Abhay Productions',
    description: 'Janapadha Kala Vaibhavam by Abhay Productions — a visual look back at the night: highlights, films, and the gallery.'
  },

  hero: {
    badge: '✓ Event Concluded',
    name: 'Janapadha Kala Vaibhavam',
    tagline: 'A cinematic celebration of folk art and tradition, told in one night.',
    date: '21 July 2026',
    location: 'Sri Kanti Theatre',
    media: { type: 'image', src: 'assets/poster-janapadha-full.png' }
  },

  highlights: [
    { type: 'image', image: 'assets/poster-janapadha.jpg', title: 'Opening Ceremony' },
    { type: 'video', image: 'assets/poster-janapadha-full.png', video: 'assets/hero-video.mp4', title: 'Folk Dance Showcase' },
    { type: 'image', image: 'assets/poster-enjoy-every-moment.jpg', title: 'Crowd & Atmosphere' },
    { type: 'video', image: 'assets/poster-prayatnam.jpg', video: 'assets/hero-video.mp4', title: 'Grand Finale' },
    { type: 'image', image: 'assets/poster-hbkt.jpg', title: 'Behind The Scenes' },
    { type: 'image', image: 'assets/poster-oohalo-telalala.jpg', title: 'Guest Moments' }
  ],

  videos: {
    featured: {
      poster: 'assets/poster-janapadha-full.png',
      video: 'assets/hero-video.mp4',
      title: 'The Full Event Recap',
      meta: '4 Min Watch'
    },
    thumbs: [
      { poster: 'assets/poster-janapadha.jpg', video: 'assets/hero-video.mp4', title: 'Opening Ceremony' },
      { poster: 'assets/poster-prayatnam.jpg', video: 'assets/hero-video.mp4', title: 'Dance Finale' },
      { poster: 'assets/poster-uthuku-pindu-aarey.jpg', video: 'assets/hero-video.mp4', title: 'Crowd Reactions' }
    ]
  },

  gallery: [
    { image: 'assets/poster-janapadha-full.png', alt: 'Opening ceremony crowd' },
    { image: 'assets/poster-janapadha.jpg', alt: 'Folk dance performance' },
    { image: 'assets/poster-enjoy-every-moment.jpg', alt: 'Guests arriving' },
    { image: 'assets/poster-prayatnam.jpg', alt: 'Drummers at the finale' },
    { image: 'assets/poster-hbkt.jpg', alt: 'Stage decor and lighting' },
    { image: 'assets/poster-oohalo-telalala.jpg', alt: 'Performers backstage' },
    { image: 'assets/poster-uthuku-pindu-aarey.jpg', alt: 'Audience reactions' },
    { image: 'assets/poster-black-sheep.jpg', alt: 'Closing ceremony' },
    { image: 'assets/poster-megastar-car-garage.jpg', alt: 'Guests of honour' },
    { image: 'assets/poster-young-talent-show.jpg', alt: 'Young performers' }
  ],

  stats: [
    { value: 50, suffix: 'K+', label: 'Audience' },
    { value: 20, suffix: '+', label: 'Performances' },
    { value: 15, suffix: '+', label: 'Artists' },
    { value: 10, suffix: '+', label: 'Sponsors' }
  ],

  sponsors: [
    { name: 'Nova Studios', icon: 'circle' },
    { name: 'Vertex Media', icon: 'triangle' },
    { name: 'Aurum Events', icon: 'hexagon' },
    { name: 'Solstice Films', icon: 'diamond' },
    { name: 'Meridian Arts', icon: 'wave' },
    { name: 'Lumen Productions', icon: 'square' },
    { name: 'Zenith Collective', icon: 'star' }
  ],

  closing: {
    media: { type: 'image', src: 'assets/poster-janapadha-full.png' },
    statement: 'Thank you for being part of <span class="text-gold">Janapadha Kala Vaibhavam</span>.',
    ctaText: 'Explore More Events',
    ctaHref: 'index.html#events'
  }

};
