/**
 * ShoppingCartView -- top-level view for step="cart".
 * Rebuilt from canonical SETTLED state 42 (NOT skeleton state 40).
 *
 * Structure from PropertySpec state 42:
 *   cb-cart [P] (inline) -> div(1461px) -> div(936px) -> div(grid,888px,12col) -> [left(584px), right(280px)]
 *
 *   Left column:
 *     div(584x104) -> [h2 "Shopping Cart", div(flex) -> [div "Non-refundable...", button > span "Remove"]]
 *     cb-flight-selections (inline) -> div(584x684) -> [card1(departing), card2(return)]
 *     cb-cart-promo (inline) -> div(grid,584x436) -> [cb-refundable-card, jtp-xsell-card]
 *
 *   Right column:
 *     div(280x519) -> cb-price-summary (inline) -> section(12 children, standard layout + footer with "Next: Traveler Details" button)
 *     cb-cart-barclays (inline) -> aside -> article(col,232px) -> [img, h3, p, p, button "Apply now"]
 *
 *   Each flight card (cb-itinerary-panel inside cb-flight-selections):
 *     h2 "West Palm Beach, FL (PBI) to New York, NY (JFK)" + p "Feb 18 2026"
 *     itinerary panel: stops, times, airports, flight number, Details/Seats links
 *     fare type: "EvenMore" label + "Change" button
 */
import { useSyncExternalStore } from 'react';
import { getState, subscribe, setState, navigateToStep } from '../../main';

// ---- Flight card with itinerary (from settled state 42) ----
function FlightCard({ route, date, stops, duration, departTime, departCode, arriveTime, arriveCode, flightNumber, fareType }: {
  route: string;
  date: string;
  stops: string;
  duration: string;
  departTime: string;
  departCode: string;
  arriveTime: string;
  arriveCode: string;
  flightNumber: string;
  fareType: string;
}) {
  return (
    <div style={{ width: '584px', marginBottom: '8px', border: '1px solid rgb(224, 224, 224)', borderRadius: '8px', backgroundColor: 'white' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '550px', padding: '17px' }}>
        {/* Route header */}
        <div style={{ width: '550px', height: '48px' }}>
          <h2 style={{ width: '550px', height: '24px', margin: 0, fontSize: '18px', fontWeight: 500, lineHeight: '24px', color: 'rgb(0, 32, 91)' }}>
            {route}
          </h2>
          <p style={{ width: '550px', height: '16px', margin: 0, fontSize: '12px', lineHeight: '16px', color: 'rgb(48, 50, 52)' }}>
            {date}
          </p>
        </div>

        {/* Separator */}
        <div style={{ width: '550px', height: '1px', backgroundColor: 'rgb(224, 224, 224)', marginTop: '16px' }} />

        {/* Itinerary panel */}
        <div style={{ width: '550px', marginTop: '16px' }}>
          {/* cb-itinerary-panel [P] (inline) */}
          <div style={{ display: 'inline' }}>
            <div style={{ width: '550px', height: '150px' }}>
              {/* Stops and duration row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '550px', height: '19px' }}>
                <div style={{ width: '68px', height: '19px' }}>
                  <span style={{ width: '68px', height: '20px', fontSize: '16px', color: 'rgb(48, 50, 52)' }}>{stops}</span>
                </div>
                <div style={{ width: '56px', height: '19px' }}>
                  <span style={{ width: '56px', height: '20px', fontSize: '16px', color: 'rgb(48, 50, 52)' }}>{duration}</span>
                </div>
              </div>

              {/* Separator line */}
              <div style={{ width: '550px', height: '1px', backgroundColor: 'rgb(224, 224, 224)', margin: '8px 0' }} />

              {/* Times and airports row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '550px', height: '50px', marginTop: '8px' }}>
                <div style={{ width: '64px', height: '50px' }}>
                  <div style={{ width: '64px', height: '22px', fontSize: '18px', fontWeight: 600, color: 'rgb(0, 32, 91)' }}>{departTime}</div>
                  <div style={{ width: '64px', height: '24px', fontSize: '16px', color: 'rgb(48, 50, 52)' }}>{departCode}</div>
                </div>
                <div style={{ flex: 1, height: '3px', margin: '0 16px' }}>
                  <div style={{ width: '100%', height: '3px', backgroundColor: 'rgb(141, 200, 232)' }} />
                </div>
                <div style={{ width: '64px', height: '50px', textAlign: 'right' }}>
                  <div style={{ width: '64px', height: '22px', fontSize: '18px', fontWeight: 600, color: 'rgb(0, 32, 91)' }}>{arriveTime}</div>
                  <div style={{ width: '64px', height: '24px', fontSize: '16px', color: 'rgb(48, 50, 52)' }}>{arriveCode}</div>
                </div>
              </div>

              {/* Airline and flight number row */}
              <div style={{ width: '550px', height: '57px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '550px', height: '24px', gap: '8px' }}>
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='16' viewBox='0 0 46 16'%3E%3Ctext x='2' y='12' font-size='10' font-family='Arial' fill='%2300205b' font-weight='bold' font-style='italic'%3EjetBlue%3C/text%3E%3C/svg%3E"
                    alt=""
                    style={{ width: '46px', height: '16px' }}
                  />
                  <div style={{ width: '123px', height: '24px' }}>
                    <span style={{ width: '123px', height: '20px', fontSize: '16px', color: 'rgb(48, 50, 52)' }}>
                      JetBlue{' '}
                      <span style={{ fontSize: '16px', color: 'rgb(117, 117, 117)' }}>B6 {flightNumber}</span>
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '550px', height: '25px', marginTop: '8px', gap: '0' }}>
                  <button style={{ display: 'inline-block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '14px', color: 'rgb(0, 51, 160)', fontFamily: 'inherit' }}>
                    Details
                  </button>
                  <span style={{ width: '2px', height: '16px', margin: '0 8px', backgroundColor: 'rgb(189, 189, 189)', display: 'inline-block' }} />
                  <button style={{ display: 'inline-block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '14px', color: 'rgb(0, 51, 160)', fontFamily: 'inherit' }}>
                    Seats
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator line */}
        <div style={{ width: '550px', height: '1px', backgroundColor: 'rgb(224, 224, 224)' }} />

        {/* Fare type + Change */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '550px', height: '49px', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '86px', height: '24px' }}>
            <div style={{ width: '3px', height: '24px', backgroundColor: 'rgb(255, 100, 0)', borderRadius: '2px' }} />
            <span style={{ fontSize: '16px', color: 'rgb(0, 32, 91)' }}>{fareType}</span>
          </div>
          <div style={{ width: '54px', height: '32px' }}>
            <div style={{ width: '54px', height: '32px' }}>
              <button style={{ display: 'inline-block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '14px', color: 'rgb(0, 51, 160)' }}>Change</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Refundable card promo ----
function RefundableCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '280px', height: '436px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '8px', border: '1px solid rgb(224, 224, 224)', padding: '16px' }}>
      <div style={{ width: '248px', height: '24px', fontSize: '14px', fontWeight: 700, color: 'rgb(0, 32, 91)' }}>
        Add peace of mind
      </div>
      <p style={{ width: '248px', fontSize: '14px', color: 'rgb(48, 50, 52)', lineHeight: '20px', margin: '8px 0' }}>
        Upgrade to a refundable fare for added flexibility. Cancel for any reason and get a full refund.
      </p>
      <button style={{
        width: '248px',
        height: '40px',
        border: '1px solid rgb(0, 51, 160)',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: 'rgb(0, 51, 160)',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        marginTop: '8px',
      }}>
        Make refundable
      </button>
    </div>
  );
}

// ---- XSell / bundle card ----
function XSellCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '280px', height: '436px', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '8px', border: '1px solid rgb(224, 224, 224)', padding: '16px' }}>
      <div style={{ width: '248px', height: '24px', fontSize: '14px', fontWeight: 700, color: 'rgb(0, 32, 91)' }}>
        Bundle & save
      </div>
      <p style={{ width: '248px', fontSize: '14px', color: 'rgb(48, 50, 52)', lineHeight: '20px', margin: '8px 0' }}>
        Upgrade your fare and add extras like checked bags, extra legroom, and priority boarding for one low price.
      </p>
      <button style={{
        width: '248px',
        height: '40px',
        border: '1px solid rgb(0, 51, 160)',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: 'rgb(0, 51, 160)',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        marginTop: '8px',
      }}>
        View bundles
      </button>
    </div>
  );
}

// ---- Barclays credit card offer ----
function BarclaysCard() {
  return (
    <div style={{ display: 'inline' }}>
      <aside style={{ width: '280px', marginTop: '16px' }}>
        <article
          id="barclay-card-offer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '280px',
            alignItems: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(224, 224, 224)',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', width: '200px', height: '69px', justifyContent: 'center' }}>
            <button style={{ width: '100px', height: '69px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='63' viewBox='0 0 100 63'%3E%3Crect width='100' height='63' rx='6' fill='%23003' /%3E%3Ctext x='50' y='36' text-anchor='middle' font-size='10' fill='white' font-family='Arial'%3EJetBlue Card%3C/text%3E%3C/svg%3E"
                alt=""
                style={{ display: 'inline', width: '100px', height: '63px' }}
              />
            </button>
          </div>
          <h3 style={{ width: '200px', height: '48px', margin: '16px 0 0 0', fontSize: '16px', fontWeight: 500, lineHeight: '24px', textAlign: 'center', color: 'rgb(0, 32, 91)' }}>
            Take off with the JetBlue Plus Card
          </h3>
          <p style={{ width: '200px', height: '48px', margin: '8px 0 0 0', fontSize: '16px', lineHeight: '24px', textAlign: 'center', color: 'rgb(48, 50, 52)' }}>
            $300 Statement Credit plus 20,000 Bonus Points
          </p>
          <p style={{ width: '200px', height: '32px', margin: '0', fontSize: '12px', lineHeight: '16px', textAlign: 'center', color: 'rgb(48, 50, 52)' }}>
            both after qualifying account activity. Terms apply.
          </p>
          <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '110px', height: '56px', background: 'rgb(255, 255, 255)', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ width: '94px', height: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', fontWeight: 700, lineHeight: '24px', color: 'rgb(0, 51, 160)' }}>
              Apply now
              <span style={{ display: 'inline' }}>
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', width: '7px', height: '7px' }}>
                  <g style={{ display: 'inline' }}>
                    <path d="m.5 6.5 6-6M2 .5h4.5V5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline' }} />
                  </g>
                </svg>
              </span>
            </span>
          </button>
        </article>
      </aside>
    </div>
  );
}

// ---- Cart Price Summary (with Next: Traveler Details button in footer) ----
function CartPriceSummary() {
  const state = useSyncExternalStore(subscribe, getState);
  const farePrice = state.farePrice || 386.23;
  const taxesAndFees = state.taxesAndFees || 59.77;
  const total = state.cartTotal || (farePrice + taxesAndFees);

  return (
    <div>
      <section>
        <header style={{ height: '46px' }}>
          <h4 id="price-summary-heading" style={{ margin: 0, fontSize: '24px', fontWeight: 700, lineHeight: '26px' }}>
            Price Summary
          </h4>
          <div style={{ height: '4px', backgroundColor: 'rgb(0, 51, 160)', marginTop: '8px' }} />
        </header>

        <article style={{ display: 'flex', height: '48px', alignItems: 'center', marginTop: '8px' }}>
          <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 700, lineHeight: '40px' }}>Flights</h5>
        </article>

        <section>
          <div style={{ fontSize: '12px', lineHeight: '16px', color: 'rgb(48, 50, 52)' }}>PBI-JFK, Feb 18 6:00am</div>
          <div style={{ fontSize: '12px', lineHeight: '16px', color: 'rgb(48, 50, 52)' }}>JFK-PBI, Feb 20 8:15am</div>
          <article style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <section style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', lineHeight: '20px' }}>1</span>
              <span style={{ fontSize: '14px', lineHeight: '16px' }}>Round-Trip Ticket (1 Adult)</span>
            </section>
            <aside style={{ fontSize: '14px', lineHeight: '20px', textAlign: 'right', whiteSpace: 'nowrap' }}>${farePrice.toFixed(2)}</aside>
          </article>
        </section>

        <button style={{ display: 'inline-block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '12px', lineHeight: '24px', textAlign: 'left', fontFamily: 'inherit', marginTop: '8px' }}>
          Fare restrictions
        </button>

        <div style={{ height: '1px', backgroundColor: 'rgb(224, 224, 224)', margin: '12px 0' }} />

        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ display: 'inline-block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '12px', lineHeight: '16px', textAlign: 'left', fontFamily: 'inherit' }}>
            Taxes &amp; Fees
          </button>
          <aside style={{ fontSize: '12px', lineHeight: '16px', textAlign: 'right' }}>${taxesAndFees.toFixed(2)}</aside>
        </section>

        <div style={{ height: '1px', backgroundColor: 'rgb(224, 224, 224)', margin: '12px 0' }} />

        <section style={{ marginTop: '4px' }}>
          <article style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '14px', lineHeight: '20px', color: 'rgb(48, 50, 52)' }}>Total:</span>
            <strong style={{ fontSize: '32px', fontWeight: 800, lineHeight: '41px', color: 'rgb(0, 32, 91)' }}>${total.toFixed(2)}</strong>
          </article>
        </section>

        <nav style={{ marginTop: '4px', textAlign: 'right' }}>
          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '12px', lineHeight: '16px', fontFamily: 'inherit' }}>
            View in another currency
          </button>
        </nav>

        <div style={{ height: '2px', margin: '8px 0' }} />

        {/* Footer with Next: Traveler Details button */}
        <footer style={{ marginTop: '16px' }}>
          <button
            data-ann="ann-18"
            onClick={() => navigateToStep('signin')}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '56px',
              backgroundColor: 'rgb(0, 51, 160)',
              color: 'rgb(255, 255, 255)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            <span style={{ lineHeight: '24px' }}>
              Next: Traveler Details
            </span>
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function ShoppingCartView() {
  const state = useSyncExternalStore(subscribe, getState);

  return (
    // cb-cart [P] (display: inline)
    <div style={{ display: 'inline' }}>
      {/* div(1461px) */}
      <div style={{ width: '1461px' }}>
        {/* div(936px) */}
        <div style={{ width: '936px', margin: '0 auto' }}>
          {/* div(grid, 888px, 2-col layout) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '584px 280px',
              gap: '24px',
              width: '888px',
              padding: '24px 0',
            }}
          >
            {/* Left column (584px) */}
            <div style={{ width: '584px' }}>
              {/* Header: h2 "Shopping Cart" + subtitle */}
              <div style={{ width: '584px', height: '104px' }}>
                <h2 style={{ width: '552px', height: '40px', margin: 0, fontSize: '32px', fontWeight: 700, lineHeight: '40px', padding: '16px 16px 0', color: 'rgb(0, 32, 91)' }}>
                  Shopping Cart
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '552px', height: '16px', padding: '16px 16px 0' }}>
                  <div style={{ fontSize: '12px', lineHeight: '16px', color: 'rgb(48, 50, 52)' }}>
                    Non-refundable Roundtrip, 1 Adult
                  </div>
                  <button style={{ display: 'block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <span style={{ display: 'inline', fontSize: '12px', lineHeight: '15px', color: 'rgb(0, 51, 160)' }}>Remove</span>
                  </button>
                </div>
              </div>

              {/* cb-flight-selections (inline) -- 2 flight cards */}
              <div style={{ display: 'inline' }}>
                <div style={{ width: '584px' }}>
                  {/* Departing flight card */}
                  <FlightCard
                    route="West Palm Beach, FL (PBI) to New York, NY (JFK)"
                    date="Feb 18 2026"
                    stops="Nonstop"
                    duration="2h 40m"
                    departTime="6:00am"
                    departCode="PBI"
                    arriveTime="8:40am"
                    arriveCode="JFK"
                    flightNumber="1054"
                    fareType="EvenMore"
                  />
                  {/* Return flight card */}
                  <FlightCard
                    route="New York, NY (JFK) to West Palm Beach, FL (PBI)"
                    date="Feb 20 2026"
                    stops="Nonstop"
                    duration="3h 11m"
                    departTime="8:15am"
                    departCode="JFK"
                    arriveTime="11:26am"
                    arriveCode="PBI"
                    flightNumber="1153"
                    fareType="EvenMore"
                  />
                </div>
              </div>

              {/* cb-cart-promo (inline) -- grid with 2 promo cards */}
              <div style={{ display: 'inline' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 280px', gap: '24px', width: '584px', height: '436px' }}>
                  <RefundableCard />
                  <XSellCard />
                </div>
              </div>
            </div>

            {/* Right column (280px) */}
            <div style={{ width: '280px' }}>
              {/* Price summary */}
              <div style={{ width: '280px', border: '1px solid rgb(224, 224, 224)', borderRadius: '8px', backgroundColor: 'white', padding: '24px' }}>
                <CartPriceSummary />
              </div>
              {/* Barclays promo */}
              <BarclaysCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
