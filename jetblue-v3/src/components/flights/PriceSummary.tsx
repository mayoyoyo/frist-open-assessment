/**
 * PriceSummary -- right sidebar price summary panel.
 * Structure from PropertySpec state 44:
 *   cb-price-summary [P] (inline) -> section(294px) -> [
 *     header -> [h4 "Price Summary", div(4px spacer)],
 *     article(flex) -> h5 "Flights",
 *     section -> [div "PBI-JFK...", div "JFK-PBI...", article(flex) -> [section(flex) -> [span "1", span "Round-trip..."], aside "$386.23"]],
 *     button "Fare restrictions",
 *     div(18px spacer),
 *     section -> [button "Taxes & Fees", aside "$59.77"],
 *     div(18px spacer),
 *     section(flex) -> article -> [header -> span "Total:", main -> strong "$446.00"],
 *     nav(flex) -> aside -> button "View in another currency",
 *     div(2px spacer),
 *     section(flex, 0px height),
 *     footer(0px height)
 *   ]
 */
import { useSyncExternalStore } from 'react';
import { getState, subscribe } from '../../main';

export default function PriceSummary() {
  const state = useSyncExternalStore(subscribe, getState);
  const farePrice = state.farePrice || 386.23;
  const taxesAndFees = state.taxesAndFees || 59.77;
  const total = state.cartTotal || (farePrice + taxesAndFees);

  return (
    // cb-price-summary [P] (display: inline)
    <div style={{ display: 'inline' }}>
      {/* section(294px) */}
      <section style={{
        width: '294px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
        padding: '24px',
        boxSizing: 'border-box',
      }}>
        {/* header */}
        <header style={{ width: '246px' }}>
          <h4
            id="price-summary-heading"
            style={{ width: '246px', margin: 0, fontSize: '24px', fontWeight: 700, lineHeight: '26px' }}
          >
            Price Summary
          </h4>
          {/* Blue line under Price Summary */}
          <div style={{ width: '246px', height: '4px', backgroundColor: 'rgb(0, 51, 160)', marginTop: '12px' }} />
        </header>

        {/* article(flex) -> h5 "Flights" */}
        <article style={{ display: 'flex', width: '246px', height: '48px' }}>
          <h5 style={{ width: '53.8906px', height: '40px', margin: 0, fontSize: '18px', fontWeight: 700, lineHeight: '40px', color: 'rgb(0, 32, 91)' }}>
            Flights
          </h5>
        </article>

        {/* Flight details section */}
        <section style={{ width: '246px', height: '84px' }}>
          <div style={{ width: '246px', height: '12px', fontSize: '12px', lineHeight: '12px' }}>
            PBI-JFK, Feb 18 6:00am
          </div>
          <div style={{ width: '246px', height: '12px', fontSize: '12px', lineHeight: '12px' }}>
            JFK-PBI, Feb 20 8:15am
          </div>
          {/* article(flex) -> [section(flex) -> [span "1", span "Round-trip..."], aside "$386.23"] */}
          <article style={{ display: 'flex', width: '246px', height: '44px', justifyContent: 'space-between', alignItems: 'center' }}>
            <section style={{ display: 'flex', width: '181.562px', height: '32px', gap: '8px', alignItems: 'center' }}>
              <span style={{ width: '5.78125px', height: '32px', fontSize: '14px', lineHeight: '32px' }}>1</span>
              <span style={{ width: '159.781px', height: '32px', fontSize: '14px', lineHeight: '16px' }}>
                Round-Trip Ticket (1 Adult)
              </span>
            </section>
            <aside style={{ width: '48.4375px', height: '32px', fontSize: '14px', lineHeight: '32px', textAlign: 'right' }}>
              ${farePrice.toFixed(2)}
            </aside>
          </article>
        </section>

        {/* Fare restrictions button */}
        <button
          style={{
            display: 'inline-block',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'rgb(0, 51, 160)',
            fontSize: '12px',
            lineHeight: '24px',
            textAlign: 'left',
            fontFamily: 'inherit',
          }}
        >
          Fare restrictions
        </button>

        {/* Divider */}
        <div style={{ width: '246px', height: '1px', backgroundColor: 'rgb(211, 211, 211)', margin: '16px 0' }} />

        {/* Taxes & Fees section */}
        <section style={{ width: '246px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            style={{
              display: 'inline-block',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'rgb(0, 51, 160)',
              fontSize: '12px',
              lineHeight: '16px',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            Taxes &amp; Fees
          </button>
          <aside style={{ fontSize: '12px', lineHeight: '16px', textAlign: 'right' }}>
            ${taxesAndFees.toFixed(2)}
          </aside>
        </section>

        {/* Spacer */}
        <div style={{ width: '246px', height: '16px' }} />

        {/* Total section */}
        <section style={{ display: 'flex', width: '246px', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
          <article style={{ width: '246px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <header>
              <span style={{ fontSize: '14px', lineHeight: '20px' }}>
                Total:
              </span>
            </header>
            <main>
              <strong style={{ display: 'inline', fontSize: '28px', fontWeight: 700, lineHeight: '36px' }}>
                ${total.toFixed(2)}
              </strong>
            </main>
          </article>
        </section>

        {/* View in another currency */}
        <nav style={{ display: 'flex', width: '246px', height: '24px', justifyContent: 'center', marginTop: '4px' }}>
          <aside>
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'rgb(0, 51, 160)',
                fontSize: '12px',
                lineHeight: '16px',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            >
              View in another currency
            </button>
          </aside>
        </nav>

        {/* Divider */}
        <div style={{ width: '246px', height: '1px', backgroundColor: 'rgb(211, 211, 211)', marginTop: '16px' }} />
      </section>
    </div>
  );
}
