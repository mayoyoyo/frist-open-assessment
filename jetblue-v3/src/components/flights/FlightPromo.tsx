/**
 * FlightPromo -- tax info text + credit card promo card (42 elements).
 *
 * Structure from PropertySpec:
 *   cb-flight-promo (inline) >
 *     div "Prices displayed..." (2 children) > [a "taxes & fees", a "bag fees"]
 *     div [P] >
 *       jb-card-promotion-flight-results [P] (inline) >
 *         div (grid, 848px, 2 cols) >
 *           div [P] > div >
 *             div [P] (flex) > a [P] > div > img       -- promo image
 *             div (flex) > div >
 *               h3 "$300 Statement Credit..."
 *               div "After qualifying..."
 *               div (spacer)
 *               div > a "Apply Now" > jb-icon > svg [P] > g[P] > polygon (not visible but in DOM)
 *           div (flex) > div#jtp-packages (flex) >
 *             div#vacations-cross-sell (flex) >
 *               button (flex) >
 *                 div (image area)
 *                 div > h2 + div > p > span + div [P] > p + div [P] > div > span "Save now" > svg
 */

// Placeholder promo image
const promoImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='412' height='256' viewBox='0 0 412 256'%3E%3Crect width='412' height='256' fill='%23003087'/%3E%3Ctext x='206' y='128' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3EJetBlue Card%3C/text%3E%3C/svg%3E";
const vacationImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='412' height='256' viewBox='0 0 412 256'%3E%3Crect width='412' height='256' fill='%230072ce'/%3E%3Ctext x='206' y='128' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3EVacation Package%3C/text%3E%3C/svg%3E";

export default function FlightPromo() {
  return (
    <div style={{ display: 'inline' }}>
      {/* cb-flight-promo */}
      {/* Tax info text */}
      <div style={{ width: '936px', height: '48px', fontSize: '12px', lineHeight: '16px', color: 'rgb(117, 117, 117)', padding: '16px 0' }}>
        Prices displayed are one-way per person including{' '}
        <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '12px' }}>taxes &amp; fees</a>
        . The price you see isn&apos;t guaranteed until you complete your purchase.{' '}
        <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '12px' }}>bag fees</a>
      </div>

      {/* Promo card [P] wrapper */}
      <div style={{ width: '936px', height: '498px' }}>
        {/* jb-card-promotion-flight-results [P] (inline) */}
        <div style={{ display: 'inline' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              width: '848px',
              height: '498px',
              margin: '0 auto',
              gap: '16px',
              padding: '0 44px',
            }}
          >
            {/* Left: Credit card promo */}
            <div style={{ width: '412px', height: '498px' }}>
              {/* div [P] */}
              <div style={{ width: '412px', height: '498px' }}>
                {/* Image section: div [P] (flex) > a [P] > div > img */}
                <div style={{ display: 'flex', width: '412px', height: '256px' }}>
                  <a href="#" style={{ display: 'block', width: '412px', height: '256px' }}>
                    <div style={{ width: '412px', height: '256px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                      <img
                        src={promoImg}
                        alt=""
                        style={{ display: 'inline', width: '411.984px', height: '269.297px', objectFit: 'cover' }}
                      />
                    </div>
                  </a>
                </div>
                {/* Text section */}
                <div style={{ display: 'flex', width: '412px', height: '242px', padding: '16px', boxSizing: 'border-box' }}>
                  <div style={{ width: '412px', height: '212.781px' }}>
                    <h3
                      style={{
                        width: '380px',
                        height: '52.7812px',
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: '26px',
                        color: 'rgb(0, 0, 0)',
                        margin: '0 0 8px 0',
                      }}
                    >
                      $300 Statement Credit + 20,000 Bonus Points
                    </h3>
                    <div style={{ width: '380px', height: '24px', fontSize: '14px', lineHeight: '24px', color: 'rgb(51, 51, 51)' }}>
                      After qualifying account activity.
                    </div>
                    <div style={{ width: '380px', height: '16px' }} />
                    <div style={{ width: '380px', height: '40px', display: 'flex', alignItems: 'center' }}>
                      <a
                        href="#"
                        style={{
                          display: 'inline',
                          width: '87.1094px',
                          height: '20px',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '20px',
                          color: 'rgb(0, 51, 160)',
                          textDecoration: 'none',
                        }}
                      >
                        Apply Now
                        {/* jb-icon > svg [P] > g [P] > polygon -- arrow icon (not visible from specs) */}
                        <span style={{ display: 'inline', marginLeft: '4px' }}>
                          <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline' }}>
                            <g style={{ display: 'inline' }}>
                              <polygon points="0,0 4,4 0,8" fill="currentColor" style={{ display: 'inline' }} />
                            </g>
                          </svg>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Vacation cross-sell */}
            <div style={{ display: 'flex', width: '412px', height: '498px' }}>
              <div id="jtp-packages" style={{ display: 'flex', width: '412px', height: '508px' }}>
                <div id="vacations-cross-sell" style={{ display: 'flex', width: '412px', height: '496px' }}>
                  <button
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '412px',
                      height: '496px',
                      border: '1px solid rgb(211, 211, 211)',
                      borderRadius: '8px',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      overflow: 'hidden',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    {/* Image area (uses background-image to match GT) */}
                    <div style={{ width: '412px', height: '256px', overflow: 'hidden', backgroundImage: `url(${vacationImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    {/* Text area */}
                    <div style={{ width: '403.781px', height: '228px', padding: '16px' }}>
                      <h2
                        style={{
                          width: '371.781px',
                          height: '64px',
                          fontSize: '20px',
                          fontWeight: 700,
                          lineHeight: '26px',
                          color: 'rgb(0, 0, 0)',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Up to 50% off flights to New York City with a package.
                      </h2>
                      <div style={{ width: '371.781px', height: '96px' }}>
                        <p style={{ width: '371.781px', height: '48px', fontSize: '14px', lineHeight: '20px', color: 'rgb(51, 51, 51)', margin: 0 }}>
                          <span style={{ display: 'inline' }}>
                            For a limited time, save big on the flight portion of your vacation package.
                          </span>
                        </p>
                        {/* div [P] > p */}
                        <div style={{ width: '371.781px', height: '16px' }}>
                          <p style={{ width: '371.781px', height: '16px', margin: 0 }} />
                        </div>
                      </div>
                      {/* Save now CTA */}
                      <div style={{ width: '371.781px', height: '20px' }}>
                        <div style={{ width: '371.781px', height: '20px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              width: '79.9844px',
                              height: '20px',
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '20px',
                              color: 'rgb(0, 51, 160)',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            Save now
                            <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline' }}>
                              <polygon points="0,0 4,4 0,8" fill="currentColor" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
