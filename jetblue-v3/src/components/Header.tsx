/**
 * Header -- the full JetBlue header with 4 mega-menu dropdowns.
 * Structure matches PropertySpec exactly:
 *   header [288els]
 *     div [287els] -- wrapper, max-w-1024, centered
 *       a > img [2els] -- JetBlue logo
 *       div > div > div [278els] -- nav container with 4 span sections
 *         span "Book" [38els]
 *         span "My Trips" [76els]
 *         span "Travel Info" [85els]
 *         span "TrueBlue" [76els]
 *       div [1el] -- spacer
 *       span > button > (span>img + span"Sign in") [5els]
 *
 * Mega-menus are present in the DOM but collapsed (grid height:0, overflow hidden).
 * Each nav button has a span with text + SVG chevron.
 */

// ---- Chevron SVG (12x12, white in header, reused by all 4 nav buttons) ----
function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 60 60"
      fill="transparent"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <path
        d="M10 20 L 30 40 L 50 20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </svg>
  );
}

// ---- External link SVG (10x10, used by "Best Vacation Finder" and "Ground Transfers") ----
function ExternalLinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', marginLeft: '4px' }}
    >
      <path
        d="m.5 6.5 6-6M2 .5h4.5V5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Data: mega-menu content for all 4 navs ----

interface SubItem {
  label: string;
  external?: boolean;
}

interface Category {
  label: string;
  items: SubItem[];
}

interface NavSection {
  label: string;
  col0: Category[];
  col1: Category[];
  /** Book menu col0 uses row layout with icons; others use column layout */
  col0Layout: 'row-icons' | 'column';
}

const navData: NavSection[] = [
  {
    label: 'Book',
    col0Layout: 'row-icons',
    col0: [
      { label: 'Flights', items: [] },
      { label: 'Packages', items: [] },
      { label: 'Cars, stays & activities', items: [] },
    ],
    col1: [
      { label: 'Best Fare Finder', items: [] },
      { label: 'Best Vacation Finder', items: [] },
      { label: 'Route Map', items: [] },
    ],
  },
  {
    label: 'My Trips',
    col0Layout: 'column',
    col0: [
      { label: 'Manage Trips', items: [
        { label: 'Manage Your Trip Help' },
        { label: 'Accessibility Assistance' },
      ]},
      { label: 'Check-In', items: [
        { label: 'How to Check In' },
        { label: 'TSA PreCheck' },
      ]},
      { label: 'Flying With Us', items: [
        { label: 'Inflight Experience' },
        { label: 'Mint\u00ae' },
        { label: 'Wi-Fi' },
        { label: 'EvenMore\u00ae' },
        { label: 'BlueHouse' },
      ]},
      { label: 'Customer Assurance', items: [
        { label: 'Delays & Cancellations' },
        { label: 'Travel Insurance' },
      ]},
    ],
    col1: [
      { label: 'Travel Alerts', items: [] },
      { label: 'Flight Tracker', items: [] },
      { label: 'Bag Tracker', items: [] },
      { label: 'Request a Receipt', items: [] },
    ],
  },
  {
    label: 'Travel Info',
    col0Layout: 'column',
    col0: [
      { label: 'Booking Travel', items: [
        { label: 'Our Fares' },
        { label: 'Ground Transfers', external: true },
        { label: 'Group Bookings' },
      ]},
      { label: 'Bag Info', items: [
        { label: 'Carry-on Bags' },
        { label: 'Checked Bags' },
        { label: 'Prohibited Items' },
        { label: 'Bag Claims' },
      ]},
      { label: 'Travel Requirements', items: [
        { label: 'International Travel' },
        { label: 'Immigration Forms' },
        { label: 'REAL ID' },
      ]},
      { label: 'Traveling Together', items: [
        { label: 'Group Travel' },
        { label: 'Traveling with Kids' },
        { label: 'Traveling with Pets' },
      ]},
    ],
    col1: [
      { label: 'Destinations', items: [] },
      { label: 'At The Airport', items: [] },
      { label: 'Travel credits', items: [] },
      { label: 'More Help', items: [] },
    ],
  },
  {
    label: 'TrueBlue',
    col0Layout: 'column',
    col0: [
      { label: 'Discover TrueBlue', items: [
        { label: 'TrueBlue Perks' },
        { label: 'Tiles' },
        { label: 'Mosaic Status Match' },
      ]},
      { label: 'Earn TrueBlue Points', items: [
        { label: 'Pool Points' },
        { label: 'Air Partners' },
        { label: 'Shop, Dine & More' },
        { label: 'JetBlue x United' },
      ]},
      { label: 'Use TrueBlue Points', items: [
        { label: 'TrueBlue Deals' },
        { label: 'Buy, Gift & Transfer Points' },
      ]},
      { label: 'JetBlue Card', items: [
        { label: 'U.S. Credit Cards' },
        { label: 'International Credit Cards' },
      ]},
    ],
    col1: [
      { label: 'TrueBlue FAQ', items: [] },
      { label: 'My Account', items: [] },
      { label: 'My Perks', items: [] },
      { label: 'Join Now', items: [] },
    ],
  },
];

// ---- Sub-item rendering (li > a > span) = 3 els, or (li > a > span + svg>g>path) = 6 els if external ----
function SubItemLink({ item }: { item: SubItem }) {
  return (
    <li style={{ width: '247px', height: '24px' }}>
      <a
        href="#"
        style={{
          color: 'rgb(0, 51, 160)',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          display: 'inline',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: '18px' }}>
          {item.label}
        </span>
        {item.external && <ExternalLinkIcon />}
      </a>
    </li>
  );
}

// ---- Col0 category (li > a>span + ul>sub-items) for column-layout menus ----
function CategoryItem({ cat }: { cat: Category }) {
  return (
    <li
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '247px',
      }}
    >
      <a
        href="#"
        style={{
          color: 'rgb(0, 51, 160)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          width: '247px',
          height: '27px',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 500, lineHeight: '27px' }}>
          {cat.label}
        </span>
      </a>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          margin: '8px 0',
          padding: 0,
          listStyle: 'none',
          width: '247px',
          height: cat.items.length > 0 ? 'auto' : '0px',
        }}
      >
        {cat.items.map((item, j) => (
          <SubItemLink key={j} item={item} />
        ))}
      </ul>
    </li>
  );
}

// Icon images for the Book menu (Flights, Packages, Cars stays & activities)
const bookIconImages: Record<string, string> = {
  'Flights': '/images/img-4.svg',
  'Packages': '/images/img-5.svg',
  'Cars, stays & activities': '/images/img-6.svg',
};

// ---- Col0 icon item for Book menu (li > a > span>img + span) = 5 els ----
function BookIconItem({ label }: { label: string }) {
  return (
    <li style={{ width: '112px', height: '155px' }}>
      <a
        href="#"
        style={{
          color: 'rgb(0, 51, 160)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '112px',
          height: '155px',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        <span style={{ display: 'block', margin: '0 8px 16px', width: '96px', height: '96px' }}>
          <img
            src={bookIconImages[label] || '/images/img-4.svg'}
            alt=""
            style={{ width: '96px', height: '96px', maxWidth: '100%', display: 'block' }}
          />
        </span>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: '27px',
            textAlign: 'center',
            color: 'rgb(0, 51, 160)',
            maxWidth: '224px',
          }}
        >
          {label}
        </span>
      </a>
    </li>
  );
}

// ---- Col1 standalone item for non-Book menus (li > a>span + ul(empty)) = 4 els ----
function StandaloneItem({ cat }: { cat: Category }) {
  return (
    <li
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '247px',
        height: '43px',
      }}
    >
      <a
        href="#"
        style={{
          color: 'rgb(0, 51, 160)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          width: '247px',
          height: '27px',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 500, lineHeight: '27px' }}>
          {cat.label}
        </span>
      </a>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          margin: '8px 0',
          padding: 0,
          listStyle: 'none',
          width: '247px',
          height: '0px',
        }}
      />
    </li>
  );
}

// ---- Col1 item for Book menu (li > a > span) = 3 els, or 6 if external ----
function BookCol1Item({ cat }: { cat: Category }) {
  const isVacation = cat.label === 'Best Vacation Finder';
  return (
    <li style={{ width: '303px', height: '43px' }}>
      <a
        href="#"
        style={{
          color: 'rgb(0, 51, 160)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: '27px',
          }}
        >
          {cat.label}
          {isVacation && <ExternalLinkIcon />}
        </span>
      </a>
    </li>
  );
}

// ---- Mega-menu panel (div > div > div > div(cols) > ul + ul) ----
function MegaMenu({ nav }: { nav: NavSection }) {
  const isBook = nav.col0Layout === 'row-icons';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '100vw',
        width: '100%',
        height: '0px',
        overflow: 'hidden',
        position: 'absolute',
        left: 0,
        top: '56px',
        boxShadow: 'rgba(0,0,0,0.1) 0px 1px 3px 0px, rgba(0,0,0,0.1) 0px 1px 2px -1px',
        backgroundColor: 'white',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'block', width: '100%' }}>
        <div style={{ display: 'block', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isBook ? 'row' : 'column',
              gap: isBook ? '24px' : '12px',
              padding: '40px 44px',
              margin: '0 auto',
              maxWidth: '1024px',
              width: '1024px',
            }}
          >
            {/* Column 0 */}
            {isBook ? (
              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  gap: '8px',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none',
                  borderRight: '2px solid rgb(211, 211, 211)',
                  flex: '2 1 0',
                }}
              >
                {nav.col0.map((cat, i) => (
                  <BookIconItem key={i} label={cat.label} />
                ))}
              </ul>
            ) : (
              <ul
                style={{
                  display: 'block',
                  columnCount: 4,
                  columnGap: '12px',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none',
                  borderBottom: '2px solid rgb(211, 211, 211)',
                  width: '1024px',
                }}
              >
                {nav.col0.map((cat, i) => (
                  <CategoryItem key={i} cat={cat} />
                ))}
              </ul>
            )}

            {/* Column 1 */}
            {isBook ? (
              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0px',
                  padding: 0,
                  margin: '12px 0',
                  listStyle: 'none',
                  flex: '1 1 0',
                }}
              >
                {nav.col1.map((cat, i) => (
                  <BookCol1Item key={i} cat={cat} />
                ))}
              </ul>
            ) : (
              <ul
                style={{
                  display: 'block',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none',
                }}
              >
                {nav.col1.map((cat, i) => (
                  <StandaloneItem key={i} cat={cat} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Nav button (span > button > span(text + chevron) + MegaMenu) ----
function NavButton({ nav }: { nav: NavSection }) {
  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        color: 'rgb(255, 255, 255)',
        height: '56px',
        position: 'relative',
      }}
    >
      <button
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          height: '56px',
          padding: 0,
          margin: 0,
          border: 'none',
          background: 'none',
          color: 'rgb(255, 255, 255)',
          fontSize: '18px',
          fontWeight: 500,
          lineHeight: '27px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: '27px',
          }}
        >
          {nav.label}
          <ChevronDown />
        </span>
      </button>
      <MegaMenu nav={nav} />
    </span>
  );
}

// ---- Main Header component ----
export default function Header() {
  return (
    <header
      className="flex"
      style={{
        backgroundColor: 'rgb(0, 32, 91)',
        padding: '0 16px',
        height: '56px',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="flex items-center"
        style={{
          margin: '0 auto',
          maxWidth: '1024px',
          width: '1024px',
          height: '56px',
          gap: '28px',
        }}
      >
        {/* Logo: a > img */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', height: '32px', cursor: 'pointer', textDecoration: 'none' }}>
          <img src="/images/jetblue.svg" alt="JetBlue" style={{ height: '14px', width: '44px' }} />
        </a>

        {/* Nav container: div > div > div(4 spans) */}
        <div
          style={{
            display: 'flex',
            color: 'rgb(255, 255, 255)',
            height: '56px',
          }}
        >
          <div style={{ display: 'flex', height: '56px' }}>
            <div style={{ display: 'flex', height: '56px', gap: '8px' }}>
              {navData.map((nav, i) => (
                <NavButton key={i} nav={nav} />
              ))}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: '1 1 auto', height: '0px' }} />

        {/* Sign in: span > button > (span>img + span"Sign in") */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '56px',
            gap: '16px',
          }}
        >
          <button
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              height: '56px',
              padding: '0 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'center',
            }}
          >
            <span style={{ display: 'block', width: '24px', height: '24px' }}>
              <img
                src="/images/img-7.svg"
                alt=""
                style={{ width: '24px', height: '24px', display: 'block' }}
              />
            </span>
            <span
              style={{
                display: 'block',
                color: 'rgb(255, 255, 255)',
                fontSize: '16px',
                lineHeight: '24px',
              }}
            >
              Sign in
            </span>
          </button>
        </span>
      </div>
    </header>
  );
}
