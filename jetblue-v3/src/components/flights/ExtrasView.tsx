/**
 * ExtrasView -- step="extras" view (state 103, 2160 elements).
 *
 * Structure from PropertySpec deep-state103.txt:
 *   Uses CheckoutLayout. Left panel has 6-div structure.
 *   Content: collapsed traveler summary + seat selection summary + inline seat map
 *     + extras cards (Checked Bags, Priority Security, Pets) + car rental offers.
 *   Right panel: PriceSummary with extras expansion panel.
 *
 * Annotations: ann-39 (Next button)
 */
import { useSyncExternalStore } from 'react';
import { getState, subscribe, setState } from '../../main';
import CheckoutLayout from './CheckoutLayout';
import { SeatGrid } from './SeatMapView';

// ---- Extras PriceSummary with extras expansion panel ----
function ExtrasPriceSummary() {
  return (
    <div style={{ display: 'inline' }}>
      <section style={{ width: '294px' }}>
        {/* Header */}
        <header style={{ width: '246px', height: '46.3906px' }}>
          <h4 id="price-summary-heading" style={{ width: '246px', height: '26.3906px', margin: 0, fontSize: '24px', fontWeight: 700, lineHeight: '26px' }}>
            Price Summary
          </h4>
          <div style={{ width: '246px', height: '4px', backgroundColor: 'rgb(0, 51, 160)' }} />
        </header>

        {/* Flights label */}
        <article style={{ display: 'flex', width: '246px', height: '48px' }}>
          <h5 style={{ width: '53.8906px', height: '40px', margin: 0, fontSize: '18px', fontWeight: 700, lineHeight: '40px' }}>Flights</h5>
        </article>

        {/* Flight details */}
        <section style={{ width: '246px', height: '84px' }}>
          <div style={{ width: '246px', height: '12px', fontSize: '12px', lineHeight: '12px' }}>PBI-JFK, feb 18 6:00am</div>
          <div style={{ width: '246px', height: '12px', fontSize: '12px', lineHeight: '12px' }}>JFK-PBI, feb 20 8:15am</div>
          <article style={{ display: 'flex', width: '246px', height: '44px', justifyContent: 'space-between', alignItems: 'center' }}>
            <section style={{ display: 'flex', width: '181.562px', height: '32px', gap: '8px', alignItems: 'center' }}>
              <span style={{ width: '5.78125px', height: '32px', fontSize: '14px', lineHeight: '32px' }}>1</span>
              <span style={{ width: '159.781px', height: '32px', fontSize: '14px', lineHeight: '16px' }}>Round-trip ticket (1 Adult)</span>
            </section>
            <aside style={{ width: '48.4375px', height: '32px', fontSize: '14px', lineHeight: '32px', textAlign: 'right' }}>$386.23</aside>
          </article>
        </section>

        {/* Fare restrictions */}
        <button style={{ display: 'inline-block', width: '99.625px', height: '24px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '12px', lineHeight: '24px', textAlign: 'left', fontFamily: 'inherit' }}>
          Fare restrictions
        </button>

        {/* ======= Extras expansion panel (25 children in section) ======= */}
        <section style={{ width: '246px', height: '127.391px' }}>
          {/* jb-expansion-panel */}
          <div id="jb-expansion-panel-id-12" style={{ width: '246px', height: '111.391px' }}>
            {/* jb-expansion-panel-header */}
            <div style={{ display: 'flex', width: '246px', height: '50.3906px', alignItems: 'center', cursor: 'pointer' }}>
              <button style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '246px',
                height: '50.3906px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <span style={{ width: '77.375px', height: '18.3906px', fontSize: '16px', fontWeight: 700 }}>
                  Extras (3)
                </span>
                {/* jb-expandable-indicator [P] - expanded (pointing down) */}
                <div style={{ width: '16px', height: '16px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="rgb(66, 66, 66)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Expansion panel content (expanded) */}
            <section id="jb-expansion-panel-content-id-13" style={{ width: '246px', height: '60px' }}>
              {/* jb-expansion-panel-row */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '246px', height: '56px' }}>
                <section style={{ width: '246px', height: '56px' }}>
                  {/* Line item 1: 2 EvenMore */}
                  <article style={{ display: 'flex', justifyContent: 'space-between', width: '246px', height: '16px', alignItems: 'center' }}>
                    <section style={{ display: 'flex', gap: '4px', width: '95.2344px', height: '16px', alignItems: 'center' }}>
                      <span style={{ width: '7.09375px', height: '16px', fontSize: '12px', lineHeight: '16px' }}>2</span>
                      <span style={{ width: '72.1406px', height: '16px' }}>
                        <span style={{ display: 'inline', fontSize: '12px', lineHeight: '16px' }}>EvenMore&reg;</span>
                      </span>
                    </section>
                    <aside style={{ width: '34.3906px', height: '16px', fontSize: '12px', lineHeight: '16px', textAlign: 'right' }}>$0.00</aside>
                  </article>
                  {/* Line item 2: 1 Priority Security */}
                  <article style={{ display: 'flex', justifyContent: 'space-between', width: '246px', height: '16px', alignItems: 'center', marginTop: '8px' }}>
                    <section style={{ display: 'flex', gap: '4px', width: '185.484px', height: '16px', alignItems: 'center' }}>
                      <span style={{ width: '5.78125px', height: '16px', fontSize: '12px', lineHeight: '16px' }}>1</span>
                      <span style={{ width: '163.703px', height: '16px' }}>
                        <span style={{ display: 'inline', fontSize: '12px', lineHeight: '16px' }}>Priority Security (included)</span>
                      </span>
                    </section>
                    <aside style={{ width: '34.3906px', height: '16px', fontSize: '12px', lineHeight: '16px', textAlign: 'right' }}>$0.00</aside>
                  </article>
                </section>
              </div>
            </section>
          </div>
          {/* jb-extras placeholder */}
          <div style={{ display: 'flex', width: '246px', height: '0px' }} />
        </section>

        {/* 18px spacer */}
        <div style={{ width: '246px', height: '18px' }} />

        {/* Taxes & Fees */}
        <section style={{ width: '246px', height: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ display: 'inline-block', width: '78.8594px', height: '16px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '12px', lineHeight: '16px', textAlign: 'left', fontFamily: 'inherit' }}>
            Taxes &amp; Fees
          </button>
          <aside style={{ width: '40.3594px', height: '16px', fontSize: '12px', lineHeight: '16px', textAlign: 'right' }}>$59.77</aside>
        </section>

        {/* 18px spacer */}
        <div style={{ width: '246px', height: '18px' }} />

        {/* Total */}
        <section style={{ display: 'flex', width: '246px', height: '48.7969px' }}>
          <article style={{ width: '246px', height: '36px' }}>
            <header style={{ width: '246px', height: '0px', overflow: 'visible' }}>
              <span style={{ width: '41.6875px', height: '20px', fontSize: '14px', lineHeight: '20px' }}>Total:</span>
            </header>
            <main style={{ width: '246px', height: '36px' }}>
              <strong style={{ display: 'inline', fontSize: '28px', fontWeight: 700, lineHeight: '36px', color: 'rgb(0, 51, 160)' }}>$446.00</strong>
            </main>
          </article>
        </section>

        {/* View in another currency */}
        <nav style={{ display: 'flex', width: '246px', height: '24px' }}>
          <aside style={{ width: '150.812px', height: '24px' }}>
            <button style={{ width: '150.812px', height: '16px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgb(0, 51, 160)', fontSize: '12px', lineHeight: '16px', textAlign: 'left', fontFamily: 'inherit' }}>
              View in another currency
            </button>
          </aside>
        </nav>

        {/* Bottom */}
        <div style={{ width: '246px', height: '2px' }} />
        <section style={{ display: 'flex', width: '246px', height: '0px' }} />
        <footer style={{ width: '246px', height: '0px' }} />
      </section>
    </div>
  );
}

// ---- Baggage icon SVG (circular with light bg) ----
function BaggageIcon() {
  return (
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgb(240, 244, 255)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="7" width="14" height="14" rx="2" stroke="rgb(0, 51, 160)" strokeWidth="1.5" fill="none" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="rgb(0, 51, 160)" strokeWidth="1.5" fill="none" />
        <line x1="5" y1="13" x2="19" y2="13" stroke="rgb(0, 51, 160)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ---- Shield icon SVG for Priority Security (circular with light bg) ----
function ShieldIcon() {
  return (
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgb(240, 244, 255)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l8 4v6c0 5.5-3.5 10-8 12-4.5-2-8-6.5-8-12V6l8-4z" stroke="rgb(0, 51, 160)" strokeWidth="1.5" fill="none" />
        <path d="M8 12l3 3 5-5" stroke="rgb(0, 51, 160)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ---- Paw icon SVG for Pets (circular with light bg) ----
function PawIcon() {
  return (
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgb(240, 244, 255)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <ellipse cx="8" cy="7" rx="2" ry="2.5" stroke="rgb(0, 51, 160)" strokeWidth="1.5" />
        <ellipse cx="16" cy="7" rx="2" ry="2.5" stroke="rgb(0, 51, 160)" strokeWidth="1.5" />
        <ellipse cx="5" cy="12" rx="2" ry="2.5" stroke="rgb(0, 51, 160)" strokeWidth="1.5" />
        <ellipse cx="19" cy="12" rx="2" ry="2.5" stroke="rgb(0, 51, 160)" strokeWidth="1.5" />
        <path d="M8 17c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z" stroke="rgb(0, 51, 160)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

// ---- Extras card component ----
function ExtrasCard({ icon, title, description, priceLabel, priceAmount, actionLabel, included }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  priceLabel?: string;
  priceAmount?: string;
  actionLabel?: string;
  included?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      border: '1px solid rgb(224, 224, 224)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'white',
      alignItems: 'flex-start',
      gap: '16px',
    }}>
      {/* Icon */}
      {icon}
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgb(33, 33, 33)' }}>{title}</span>
        <span style={{ fontSize: '14px', color: 'rgb(66, 66, 66)', lineHeight: '20px' }}>{description}</span>
      </div>
      {/* Price / Action */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '80px' }}>
        {included ? (
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(0, 128, 0)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Included
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill="rgb(0, 128, 0)" />
              <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <>
            <span style={{ fontSize: '12px', color: 'rgb(66, 66, 66)' }}>{priceLabel}</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(33, 33, 33)' }}>{priceAmount}</span>
          </>
        )}
        {actionLabel && (
          <button style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'rgb(0, 51, 160)',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {actionLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block' }}>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Car rental package card ----
function CarRentalPackage({ pointsBadge, carName, carType, features, baseRate, totalWithTaxes }: {
  pointsBadge: string;
  carName: string;
  carType: string;
  features: string;
  baseRate: string;
  totalWithTaxes: string;
}) {
  return (
    <div style={{
      width: '100%',
      border: '1px solid rgb(224, 224, 224)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'white',
    }}>
      <div style={{ fontSize: '12px', color: 'rgb(0, 51, 160)', fontWeight: 700, marginBottom: '8px' }}>{pointsBadge}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(33, 33, 33)', marginBottom: '4px' }}>{carName}</div>
      <div style={{ fontSize: '14px', color: 'rgb(66, 66, 66)', marginBottom: '4px' }}>{carType}</div>
      <div style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginBottom: '8px' }}>{features}</div>
      <div style={{ fontSize: '14px', color: 'rgb(33, 33, 33)' }}>{baseRate}</div>
      <div style={{ fontSize: '14px', color: 'rgb(33, 33, 33)', fontWeight: 700 }}>{totalWithTaxes}</div>
    </div>
  );
}

// ---- Collapsed step cards ----
function CollapsedStepCards() {
  return (
    <>
      <div style={{ width: '616px', height: '0px' }}><div style={{ width: '616px', height: '0px' }} /></div>
      <div style={{ width: '616px', height: '0px' }}><div style={{ width: '616px', height: '0px' }} /></div>
      <div style={{ width: '616px', height: '0px' }}><div style={{ width: '616px', height: '0px' }} /></div>
      <div style={{ width: '616px', height: '0px' }}><div style={{ width: '616px', height: '0px' }} /></div>
      <div style={{ width: '616px', height: '0px' }}><div style={{ width: '616px', height: '0px' }} /></div>
    </>
  );
}

export default function ExtrasView() {
  const state = useSyncExternalStore(subscribe, getState);

  const handleSeatSelect = (seatId: string) => {
    // In extras, seat selection is view-only
  };

  const leftContent = (
    <>
      {/* Active step content */}
      <div style={{ width: '616px' }}>
        {/* ======= Collapsed traveler summary (38 elements) ======= */}
        <div style={{
          width: '616px',
          border: '1px solid rgb(224, 224, 224)',
          borderRadius: '8px',
          padding: '16px 24px',
          marginBottom: '16px',
          backgroundColor: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Blue checkmark */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5 6.5-6.5" stroke="rgb(0, 51, 160)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'rgb(66, 66, 66)' }}>
                1. Traveler Details
              </h2>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'rgb(0, 51, 160)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: 0 }}>
              Edit
            </button>
          </div>
          <div style={{ marginLeft: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(33, 33, 33)', marginBottom: '4px' }}>
              {state.traveler.firstName || 'Jane'} {state.traveler.lastName || 'Doe'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginBottom: '2px' }}>Adult</div>
            <div style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginBottom: '12px' }}>
              {state.traveler.email || 'jane@example.com'}
            </div>
            {/* Emergency Contact */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgb(224, 224, 224)', paddingTop: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(33, 33, 33)' }}>Emergency Contact (optional)</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="rgb(0, 51, 160)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ======= Seats & Extras section ======= */}
        <div style={{
          width: '616px',
          border: '1px solid rgb(224, 224, 224)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '16px',
          backgroundColor: 'white',
        }}>
          {/* Section header */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 400,
            lineHeight: '40px',
            margin: '0 0 24px 0',
            color: 'rgb(0, 0, 0)',
          }}>
            2. Seats &amp; Extras
          </h1>

          {/* Seat selection summary + inline seat map */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            {/* Left: traveler seat assignments */}
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(0, 51, 160)' }}>
                {state.traveler.firstName ? `${state.traveler.firstName.charAt(0)}${state.traveler.lastName?.charAt(0) || ''}.` : 'Jane D.'}
              </div>
              <div style={{ fontSize: '14px', color: 'rgb(66, 66, 66)' }}>
                PBI-JFK : Seat {state.outboundSeat || '1A'}
              </div>
              <div style={{ fontSize: '14px', color: 'rgb(66, 66, 66)' }}>
                JFK-PBI : Seat {state.returnSeat || '2E'}
              </div>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Edit seats button */}
              <button style={{
                width: '120px',
                height: '40px',
                border: '1px solid rgb(200, 200, 200)',
                borderRadius: '20px',
                backgroundColor: 'white',
                color: 'rgb(0, 51, 160)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                Edit seats
              </button>

              {/* Seat note */}
              <div style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', lineHeight: '16px', marginTop: '8px' }}>
                Note: Your seat is selected but not guaranteed
              </div>
            </div>

            {/* Right: inline seat map (compact) */}
            <div style={{ flex: 1, overflow: 'hidden', maxHeight: '340px', position: 'relative' }}>
              <div style={{ transform: 'scale(0.6)', transformOrigin: 'top right', width: '468px' }}>
                <div style={{ position: 'relative', backgroundColor: 'rgb(225, 235, 245)', borderRadius: '8px', padding: '8px' }}>
                  <SeatGrid onSelect={handleSeatSelect} selectedSeat={state.outboundSeat} compact />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======= Extras cards (133 elements) ======= */}
        <div style={{ width: '616px', marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 400,
            lineHeight: '32px',
            margin: '0 0 16px 0',
            color: 'rgb(0, 0, 0)',
          }}>
            Add extras to your trip
          </h3>

          {/* Checked Bags (52 elements) */}
          <ExtrasCard
            icon={<BaggageIcon />}
            title="Checked Bags"
            description="Add before check-in to save time & money."
            priceLabel="Starting at"
            priceAmount="$40"
            actionLabel="Add Bags"
          />

          {/* Priority Security (31 elements) */}
          <ExtrasCard
            icon={<ShieldIcon />}
            title="Priority Security"
            description="Access to expedited lanes (select airports)."
            included
          />

          {/* Pets (45 elements) */}
          <ExtrasCard
            icon={<PawIcon />}
            title="Pets"
            description="Dogs or cats, 20 lbs or less, 1 per traveler"
            priceLabel="Starting at"
            priceAmount="$150"
            actionLabel="Add Pets"
          />
        </div>

        {/* ======= Car rental offers (115 elements) ======= */}
        <div style={{ width: '616px', marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: 400,
            lineHeight: '36px',
            margin: '0 0 24px 0',
            color: 'rgb(0, 0, 0)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
          }}>
            Add a car rental &amp; save up to 35% with TrueBlue Travel
          </h3>

          <CarRentalPackage
            pointsBadge="Earn 200 points & 1 tile"
            carName="Economy Car"
            carType="Hyundai Venue or Similar"
            features="4-5 V ECVT Automatic"
            baseRate="$140/day base rate"
            totalWithTaxes="$210/total w/ taxes & fees"
          />
          <CarRentalPackage
            pointsBadge="Earn 200 points & 1 tile"
            carName="Compact Car"
            carType="Kia Soul or Similar"
            features="4-5 V Automatic"
            baseRate="$145/day base rate"
            totalWithTaxes="$217/total w/ taxes & fees"
          />

          <div style={{ marginTop: '8px' }}>
            <button style={{
              border: '1px solid rgb(200, 200, 200)',
              borderRadius: '20px',
              backgroundColor: 'white',
              color: 'rgb(0, 51, 160)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '8px 16px',
            }}>
              View all car rentals
            </button>
          </div>
        </div>

        {/* Next button */}
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>
          <button
            data-ann="ann-39"
            onClick={() => {
              // Advance to next step (would be payment in full flow)
            }}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'rgb(0, 51, 160)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Next: Review &amp; Pay
          </button>
        </div>
      </div>

      {/* 5 collapsed step cards (including "3. Review & Pay") */}
      <CollapsedStepCards />

      {/* Collapsed "3. Review & Pay" card */}
      <div style={{
        width: '616px',
        marginTop: '24px',
      }}>
        <div style={{
          width: '616px',
          border: '1px solid rgb(224, 224, 224)',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 400, margin: 0, color: 'rgb(0, 0, 0)', lineHeight: '40px' }}>
            3. Review &amp; Pay
          </h2>
        </div>
      </div>
    </>
  );

  return (
    <CheckoutLayout rightPanel={<ExtrasPriceSummary />}>
      {leftContent}
    </CheckoutLayout>
  );
}
