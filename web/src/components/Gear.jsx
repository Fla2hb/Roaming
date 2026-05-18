// Affiliate tag — replace 'roaming-20' with your Amazon Associates tag once approved
const AFFILIATE_TAG = 'roaming-20';
const amz = (query) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;

const GEAR = [
  {
    category: 'Footwear',
    items: [
      {
        name: 'Trail Running Shoes',
        desc: 'Lightweight and grippy — ideal for groomed paths and well-maintained trails.',
        for: 'Easy / Moderate',
        price: '$120 – $160',
        url: amz('trail running shoes hiking'),
      },
      {
        name: 'Waterproof Hiking Boots',
        desc: 'Ankle support and waterproof lining for longer, rougher terrain and creek crossings.',
        for: 'Moderate / Hard',
        price: '$140 – $210',
        url: amz('waterproof hiking boots ankle support'),
      },
      {
        name: 'Mountaineering Boots',
        desc: 'Crampon-compatible, insulated boots for technical ascents and snow routes.',
        for: 'Expert',
        price: '$300 – $550',
        url: amz('mountaineering boots crampon compatible'),
      },
    ],
  },
  {
    category: 'Carry & Hydration',
    items: [
      {
        name: 'Hydration Pack (2L)',
        desc: 'Hands-free water reservoir so you can keep drinking without stopping.',
        for: 'All trails',
        price: '$50 – $110',
        url: amz('hydration pack hiking 2L reservoir'),
      },
      {
        name: 'Trekking Poles',
        desc: 'Reduce knee strain on steep descents and add stability on loose or icy ground.',
        for: 'Moderate+',
        price: '$60 – $140',
        url: amz('collapsible trekking poles carbon'),
      },
    ],
  },
  {
    category: 'Safety & Navigation',
    items: [
      {
        name: 'Compact First Aid Kit',
        desc: 'Wilderness-ready with blister treatment, bandages, and trauma supplies.',
        for: 'All trails',
        price: '$20 – $45',
        url: amz('wilderness first aid kit hiking'),
      },
      {
        name: 'GPS Watch',
        desc: 'Track elevation, route, and heart rate without draining your phone.',
        for: 'Hard / Expert',
        price: '$250 – $600',
        url: amz('garmin gps hiking watch'),
      },
      {
        name: 'Rechargeable Headlamp',
        desc: 'Essential for alpine starts, summit pushes, or any hike that runs long.',
        for: 'Hard / Expert',
        price: '$35 – $80',
        url: amz('rechargeable headlamp hiking 300 lumen'),
      },
    ],
  },
  {
    category: 'Layers & Protection',
    items: [
      {
        name: 'Packable Rain Jacket',
        desc: 'Stuffs into its own pocket — California weather can change fast above treeline.',
        for: 'All trails',
        price: '$80 – $180',
        url: amz('packable rain jacket hiking waterproof'),
      },
      {
        name: 'Insulation Layer',
        desc: 'Lightweight down or synthetic mid-layer for high-elevation and shaded canyons.',
        for: 'Moderate+',
        price: '$80 – $180',
        url: amz('lightweight down jacket hiking puffy'),
      },
    ],
  },
  {
    category: 'Technical — Expert Trails',
    items: [
      {
        name: 'Microspikes',
        desc: 'Critical traction for icy ridges and snow-covered Sierra routes in spring.',
        for: 'Expert',
        price: '$70 – $130',
        url: amz('microspikes traction hiking ice'),
      },
      {
        name: 'Emergency Bivvy',
        desc: 'Compact survival shelter that reflects body heat — pack one on any remote route.',
        for: 'Expert',
        price: '$20 – $50',
        url: amz('emergency bivvy survival shelter hiking'),
      },
    ],
  },
];

export default function Gear() {
  return (
    <div className="gear">

      {/* ── Coming Soon Banner ── */}
      <div className="gear__coming-soon">
        <div className="gear__cs-badge">Coming Soon</div>
        <h2 className="gear__cs-title">Trail Gear</h2>
        <p className="gear__cs-desc">
          Curated gear recommendations for every trail type — from easy day hikes to expert mountaineering expeditions. Shop directly through the app and support Roaming.
        </p>
        <div className="gear__cs-categories">
          {GEAR.map(section => (
            <span key={section.category} className="gear__cs-tag">{section.category}</span>
          ))}
        </div>
        <p className="gear__cs-note">
          Affiliate partnerships are being set up. Check back once the site goes live.
        </p>
      </div>

      {/* ── Blurred Preview ── */}
      <div className="gear__preview-wrap">
        {GEAR.slice(0, 2).map(section => (
          <div key={section.category} className="gear__section">
            <div className="gear__section-title">{section.category}</div>
            <div className="gear__grid">
              {section.items.slice(0, 2).map(item => (
                <div key={item.name} className="gear-card gear-card--locked">
                  <div className="gear-card__top">
                    <div className="gear-card__name">{item.name}</div>
                    <span className="gear-card__for">{item.for}</span>
                  </div>
                  <p className="gear-card__desc">{item.desc}</p>
                  <div className="gear-card__bottom">
                    <span className="gear-card__price">{item.price}</span>
                    <span className="gear-card__btn gear-card__btn--disabled">Coming Soon</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
