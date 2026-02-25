export default function DealsSection() {
  return (
    <div>
      <section style={{ backgroundColor: 'rgb(255, 255, 255)', padding: '32px 40px', textAlign: 'center' }}>
        {/* Heading: div > h2 */}
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, lineHeight: '48px', color: 'rgb(0, 32, 91)', margin: 0 }}>Today's travel deals</h2>
        </div>

        {/* Top promo card: div > div > div[a, div>img, div>content] = 21 els */}
        <div style={{ maxWidth: '1024px', margin: '24px auto 0', textAlign: 'left' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', backgroundColor: 'rgb(246, 246, 246)', borderRadius: '6px', overflow: 'hidden', height: '326px' }}>
              <a href="#" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                <h3><p>Bye, 15 degrees. Hi, 15% off.<br /></p></h3>
              </a>
              <div style={{ gridColumn: '7 / 13' }}>
                <img src="/images/gif-of-snow-to-beach.gif" alt="Gif of snow to beach." style={{ width: '100%', height: '326px', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ gridColumn: '1 / 7', gridRow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 32px 16px' }}>
                <div>
                  <div style={{ display: 'inline-block', backgroundColor: 'rgb(0, 32, 91)', color: '#fff', fontSize: '16px', fontWeight: 800, lineHeight: '20px', padding: '4px 16px', borderRadius: '0 0 8px', marginBottom: '8px' }}>FORECAST: IT'S ON!</div>
                  <h3 style={{ fontSize: '32px', fontWeight: 700, lineHeight: '36px', color: 'rgb(0, 32, 91)', margin: '0 0 16px' }}>
                    <p style={{ margin: 0 }}>Bye, 15 degrees. Hi, 15% off.<br /></p>
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: '24px', color: 'rgb(48, 50, 52)', margin: '0 0 16px', maxWidth: '448px' }}>Trade salted roads for salted rims with a hot deal to somewhere warm—or just somewhere else.</p>
                </div>
                <div>
                  <span style={{ display: 'inline-block', backgroundColor: 'rgb(0, 51, 160)', borderRadius: '12px', padding: '16px 24px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '16px', fontWeight: 700, lineHeight: '24px' }}>Get promo code</div>
                  </span>
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', lineHeight: '18px', color: 'rgb(117, 117, 117)', margin: 0 }}>Promotion terms and exclusions apply.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom two cards: div > div > [card0, card1] = 38 els */}
        <div style={{ maxWidth: '1024px', margin: '24px auto 0', textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Card 1: Credit card - div[a>h3>p, div>img, div[div[h3>p, p], div[span>div[text, svg>g>path], div>p]]] = 19 els */}
            <div style={{ backgroundColor: 'rgb(246, 246, 246)', borderRadius: '6px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <a href="#" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                <h3><p>Earn 60,000 bonus TrueBlue points.</p></h3>
              </a>
              <div style={{ height: '281px', flexShrink: 0 }}>
                <img src="/images/jetblue-plus-card.jpg" alt="JetBlue Plus Card." style={{ width: '100%', height: '281px', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 32px 16px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 500, lineHeight: '36px', color: 'rgb(0, 32, 91)', margin: '0 0 8px' }}>
                    <p style={{ margin: 0 }}>Earn 60,000 bonus TrueBlue points.</p>
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: '24px', color: 'rgb(48, 50, 52)', margin: 0 }}>Redeem for award travel on 6 continents with partner airlines. See if you're pre-qualified with no impact to your credit score.</p>
                </div>
                <div>
                  <span style={{ display: 'inline-block', backgroundColor: 'rgb(0, 51, 160)', borderRadius: '12px', padding: '16px 24px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '16px', fontWeight: 700, lineHeight: '24px' }}>
                      Pre-qualify now
                      <svg width="14" height="14" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m.5 6.5 6-6M2 .5h4.5V5" /></svg>
                    </div>
                  </span>
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ fontSize: '12px', lineHeight: '18px', color: 'rgb(117, 117, 117)', margin: 0 }}>Terms apply.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Holiday - div[a>h3>p, div>img, div[div[h3>p, p], div[span>div[text, svg>g>path]]]] = 17 els */}
            <div style={{ backgroundColor: 'rgb(246, 246, 246)', borderRadius: '6px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <a href="#" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                <h3><p>Two holidays. One long weekend.</p></h3>
              </a>
              <div style={{ height: '281px', flexShrink: 0 }}>
                <img src="/images/2-people-sitting-on-lounge-chairs-overlo.jpg" alt="2 people sitting on lounge chairs overlooking the ocean." style={{ width: '100%', height: '281px', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 32px 16px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 500, lineHeight: '36px', color: 'rgb(0, 32, 91)', margin: '0 0 8px' }}>
                    <p style={{ margin: 0 }}>Two holidays. One long weekend.</p>
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: '24px', color: 'rgb(48, 50, 52)', margin: 0 }}>Valentine's Day and President's Day land on the same weekend this year. Check out these low fares for your next getaway.</p>
                </div>
                <div>
                  <span style={{ display: 'inline-block', backgroundColor: 'rgb(0, 51, 160)', borderRadius: '12px', padding: '16px 24px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '16px', fontWeight: 700, lineHeight: '24px' }}>
                      Explore flights
                      <svg width="14" height="14" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m.5 6.5 6-6M2 .5h4.5V5" /></svg>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
