/**
 * FlightResultItem -- individual flight card (53 elements collapsed, ~117 expanded).
 *
 * Collapsed structure from PropertySpec:
 *   cb-flight-result-item [P] (inline) > div [936px] >
 *     div (grid, 904px, 2 cols: 532.797px 355.203px) >
 *       div [P] > cb-itinerary-panel [P] (inline) > ItineraryPanel (27 nodes)
 *       cb-fare-cards [P] > div [P] (flex, gap 8px) > div [P] (flex, col) >
 *         jb-card [P] (flex, col) > div (flex, col) > div (flex, col) >
 *           [div > b "Core", div > span "Options from",
 *            div (flex, col) > div [P] > cb-bundle-price (flex) > div > div > span "$79",
 *            div (flex) > jb-expandable-indicator [P] > div (flex) > span > 2×span]
 *
 * Expanded adds:
 *   div (904px) >
 *     div (flex, 920px, gap 16px) > 4×div(230px) >
 *       cb-fare-type-tile [P] (inline) > div [P] (flex) > div (flex, col) > div (flex, col) >
 *         [h3, div > ul > 4×li(flex) > img + div, div > cb-bundle-price [P] > div > span, button > span "Select"]
 *     div > a "Compare Fares"
 */
import { useSyncExternalStore } from 'react';
import { getState, setState, subscribe, navigateToStep } from '../../main';
import ItineraryPanel from './ItineraryPanel';

interface FlightData {
  stops: string;
  duration: string;
  departTime: string;
  departCode: string;
  arriveTime: string;
  arriveCode: string;
  flightNumber: string;
  price: number;
  bluePrice: number;
  blueExtraPrice: number;
  evenMorePrice: number;
}

// Checkmark SVG for positive features
const checkSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='8' fill='%2300a651'/%3E%3Cpath d='M5 9l3 3 5-5' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";
// X SVG for negative features
const xSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='8' fill='%23d32f2f'/%3E%3Cpath d='M6 6l6 6M12 6l-6 6' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

interface FareTileProps {
  name: string;
  features: { text: string; positive: boolean }[];
  price: number;
  bottomColor: string;
  onSelect: () => void;
  annId?: string;
}

function FareTypeTile({ name, features, price, bottomColor, onSelect, annId }: FareTileProps) {
  return (
    <div style={{ width: '230px', height: '317px' }}>
      {/* cb-fare-type-tile [P] (inline) */}
      <div style={{ display: 'inline' }}>
        {/* div [P] (flex) */}
        <div style={{ display: 'flex', width: '214px', height: '317px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '214px', height: '317px', border: '1px solid rgb(211, 211, 211)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '212px', height: '307px', padding: '16px' }}>
              <h3 style={{ width: '180px', height: '24px', fontSize: '18px', fontWeight: 700, lineHeight: '24px', color: 'rgb(0, 0, 0)', margin: '0 0 16px 0' }}>
                {name}
              </h3>
              {/* Features list */}
              <div style={{ width: '180px', height: '150px' }}>
                <ul style={{ width: '180px', height: '84px', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', width: '180px', height: '18px', alignItems: 'center', gap: '8px' }}>
                      <img src={f.positive ? checkSvg : xSvg} alt="" style={{ width: '18px', height: '18px' }} />
                      <div style={{ width: '133.453px', height: '18px', fontSize: '12px', lineHeight: '18px', color: 'rgb(51, 51, 51)' }}>{f.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Price */}
              <div style={{ width: '180px', height: '85px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ width: '180px', height: '25px' }}>
                  {/* cb-bundle-price [P] (inline) */}
                  <div style={{ display: 'inline' }}>
                    <span style={{ display: 'inline', fontSize: '24px', fontWeight: 700, lineHeight: '25px', color: 'rgb(0, 0, 0)' }}>${price}</span>
                  </div>
                </div>
                <button
                  onClick={onSelect}
                  data-ann={annId}
                  data-fare={name.toLowerCase().replace(/\s+/g, '-')}
                  style={{
                    display: 'inline-flex',
                    width: '180px',
                    height: '40px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgb(0, 51, 160)',
                    borderRadius: '4px',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ width: '44.9531px', height: '20px', fontSize: '14px', fontWeight: 500, lineHeight: '20px', color: 'rgb(0, 51, 160)' }}>Select</span>
                </button>
              </div>
            </div>
            {/* Bottom color bar */}
            <div style={{ width: '214px', height: '8px', background: bottomColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const fareData = [
  {
    name: 'Blue Basic',
    features: [
      { text: 'No free seat selection', positive: false },
      { text: 'No changes allowed', positive: false },
      { text: 'Cancel for a fee', positive: false },
      { text: 'Carry-on bag included', positive: true },
    ],
    priceOffset: 0,
    bottomColor: 'linear-gradient(90deg, rgb(0, 114, 206), rgb(0, 51, 160))',
  },
  {
    name: 'Blue',
    features: [
      { text: 'Free seat selection', positive: true },
      { text: 'No fee to change/cancel', positive: true },
      { text: 'General boarding', positive: true },
      { text: 'Carry-on bag included', positive: true },
    ],
    priceOffset: 35,
    bottomColor: 'linear-gradient(90deg, rgb(0, 51, 160), rgb(0, 114, 206))',
  },
  {
    name: 'Blue Extra',
    features: [
      { text: 'Everything in Blue, plus:', positive: true },
      { text: 'Free same-day switches', positive: true },
      { text: 'Early boarding', positive: true },
      { text: 'Priority security (if avail)', positive: true },
    ],
    priceOffset: 60,
    bottomColor: 'linear-gradient(90deg, rgb(0, 114, 206), rgb(0, 180, 230))',
  },
  {
    name: 'EvenMore',
    features: [
      { text: 'Extra legroom seat', positive: true },
      { text: 'No fee to change/cancel', positive: true },
      { text: 'Early boarding', positive: true },
      { text: 'Dedicated bin space for your free carry-on bag', positive: true },
      { text: "Free alcoholic drinks* & more", positive: true },
    ],
    priceOffset: 109,
    bottomColor: 'linear-gradient(90deg, rgb(255, 100, 0), rgb(255, 50, 50))',
  },
];

export default function FlightResultItem({ flight, index }: { flight: FlightData; index: number }) {
  const state = useSyncExternalStore(subscribe, getState);
  const isExpanded = state.expandedFlightIndex === index;

  const handleToggle = () => {
    setState({ expandedFlightIndex: isExpanded ? null : index });
  };

  const handleSelectFare = (fareName: string, price: number) => {
    setState({
      selectedOutboundFlight: flight,
      selectedOutboundFare: fareName,
      farePrice: price,
      taxesAndFees: Math.round(price * 0.15),
      cartTotal: price + Math.round(price * 0.15),
      expandedFlightIndex: null,
    });
    navigateToStep('cart');
  };

  return (
    <div style={{ display: 'inline' }}>
      {/* cb-flight-result-item [P] */}
      <div style={{
        width: '936px',
        minHeight: isExpanded ? '562.797px' : '181.797px',
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        marginBottom: '4px',
        overflow: 'hidden',
      }}>
        {/* Main grid row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '532.797px 355.203px',
            gap: '16px',
            width: '904px',
            height: '149.797px',
            margin: '0 auto',
            padding: '16px 0',
          }}
        >
          {/* Left: Itinerary panel [P] wrapper */}
          <div style={{ width: '532.797px', height: '149.797px' }}>
            <ItineraryPanel
              stops={flight.stops}
              duration={flight.duration}
              departTime={flight.departTime}
              departCode={flight.departCode}
              arriveTime={flight.arriveTime}
              arriveCode={flight.arriveCode}
              flightNumber={flight.flightNumber}
              width={532}
            />
          </div>

          {/* Right: Fare card */}
          <div style={{ width: '355.203px', height: '149.797px' }}>
            {/* cb-fare-cards [P] */}
            <div style={{ display: 'flex', width: '355.203px', height: '149.797px', gap: '8px' }}>
              {/* div [P] (flex, col) */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '355.203px', height: '149.797px' }}>
                {/* jb-card [P] (flex, col) */}
                <div
                  data-ann={index === 0 ? 'ann-09' : undefined}
                  onClick={handleToggle}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '355.203px',
                    height: '149.797px',
                    border: isExpanded ? '2px solid rgb(0, 114, 206)' : '1px solid rgb(211, 211, 211)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '12px 16px' }}>
                    {/* "Core" label */}
                    <div style={{ textAlign: 'center' }}>
                      <b style={{ fontSize: '18px', fontWeight: 700, lineHeight: '24px', color: 'rgb(0, 0, 0)' }}>Core</b>
                    </div>
                    {/* "Options from" */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', lineHeight: '20px', color: 'rgb(51, 51, 51)' }}>Options from</span>
                    </div>
                    {/* Price */}
                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                      <span
                        data-ann={index === 0 ? 'ann-14' : undefined}
                        style={{ fontSize: '28px', fontWeight: 700, lineHeight: '32px', color: 'rgb(0, 0, 0)' }}
                      >
                        ${flight.price}
                      </span>
                    </div>
                    {/* Chevron indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <path d="M4 6L8 10L12 6" stroke="rgb(117, 117, 117)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {/* Bottom colored bar */}
                  <div style={{ width: '100%', height: '3px', flexShrink: 0, background: 'linear-gradient(90deg, rgb(255, 100, 0), rgb(255, 50, 50), rgb(0, 114, 206), rgb(0, 51, 160))' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded: Fare tiles */}
        {isExpanded && (
          <div style={{ width: '904px', height: '381px', margin: '0 auto' }}>
            {/* Fare tile row */}
            <div style={{ display: 'flex', width: '920px', height: '341px', gap: '16px 0px', justifyContent: 'space-between' }}>
              {fareData.map((fare, fi) => (
                <FareTypeTile
                  key={fi}
                  name={fare.name}
                  features={fare.features}
                  price={flight.price + fare.priceOffset}
                  bottomColor={fare.bottomColor}
                  onSelect={() => handleSelectFare(fare.name, flight.price + fare.priceOffset)}
                  annId={fi === 0 ? 'ann-15' : fi === 3 ? 'ann-17' : undefined}
                />
              ))}
            </div>
            {/* Compare Fares link */}
            <div style={{ width: '904px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href="#" style={{ fontSize: '14px', color: 'rgb(0, 51, 160)', textDecoration: 'underline' }}>Compare Fares</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Flight data for 11 result items
export const flightData: FlightData[] = [
  { stops: 'Nonstop', duration: '2h 40m', departTime: '6:00am', departCode: 'JFK', arriveTime: '8:40am', arriveCode: 'PBI', flightNumber: '1054', price: 79, bluePrice: 114, blueExtraPrice: 139, evenMorePrice: 188 },
  { stops: 'Nonstop', duration: '3h 5m', departTime: '7:00am', departCode: 'JFK', arriveTime: '10:05am', arriveCode: 'FLL', flightNumber: '2201', price: 283, bluePrice: 318, blueExtraPrice: 343, evenMorePrice: 392 },
  { stops: 'Nonstop', duration: '3h 11m', departTime: '8:15am', departCode: 'JFK', arriveTime: '11:26am', arriveCode: 'PBI', flightNumber: '1153', price: 259, bluePrice: 294, blueExtraPrice: 319, evenMorePrice: 368 },
  { stops: 'Nonstop', duration: '3h 5m', departTime: '11:15am', departCode: 'JFK', arriveTime: '2:20pm', arriveCode: 'PBI', flightNumber: '53', price: 229, bluePrice: 264, blueExtraPrice: 289, evenMorePrice: 338 },
  { stops: 'Nonstop', duration: '3h 15m', departTime: '11:30am', departCode: 'JFK', arriveTime: '2:45pm', arriveCode: 'FLL', flightNumber: '1201', price: 178, bluePrice: 213, blueExtraPrice: 238, evenMorePrice: 287 },
  { stops: 'Nonstop', duration: '3h 2m', departTime: '12:15pm', departCode: 'JFK', arriveTime: '3:17pm', arriveCode: 'PBI', flightNumber: '917', price: 99, bluePrice: 134, blueExtraPrice: 159, evenMorePrice: 208 },
  { stops: '1 Stop', duration: '5h 45m', departTime: '1:30pm', departCode: 'JFK', arriveTime: '7:15pm', arriveCode: 'MIA', flightNumber: '415', price: 149, bluePrice: 184, blueExtraPrice: 209, evenMorePrice: 258 },
  { stops: 'Nonstop', duration: '3h 10m', departTime: '3:45pm', departCode: 'JFK', arriveTime: '6:55pm', arriveCode: 'FLL', flightNumber: '687', price: 199, bluePrice: 234, blueExtraPrice: 259, evenMorePrice: 308 },
  { stops: 'Nonstop', duration: '3h 5m', departTime: '5:30pm', departCode: 'JFK', arriveTime: '8:35pm', arriveCode: 'PBI', flightNumber: '1387', price: 119, bluePrice: 154, blueExtraPrice: 179, evenMorePrice: 228 },
  { stops: 'Nonstop', duration: '3h 15m', departTime: '7:00pm', departCode: 'JFK', arriveTime: '10:15pm', arriveCode: 'FLL', flightNumber: '2063', price: 159, bluePrice: 194, blueExtraPrice: 219, evenMorePrice: 268 },
  { stops: '1 Stop', duration: '6h 20m', departTime: '9:15pm', departCode: 'JFK', arriveTime: '3:35am', arriveCode: 'MIA', flightNumber: '773', price: 129, bluePrice: 164, blueExtraPrice: 189, evenMorePrice: 238 },
];
