/**
 * FlightsFooter -- compact help footer used on all /booking/flights states.
 * Matches PropertySpec jb-footer structure exactly: 43 elements.
 *
 * jb-footer [P] (43 children)
 *   div#footer-div-element (42)
 *     jb-help-and-faq [P] (41) {inline}
 *       div [P] (40) [936px]
 *         div (39) [936px]
 *           div (22) {flex} -- top row: Popular Help Topics + links + language
 *             div "Popular Help Topics"
 *             div (20) {flex} -- links area
 *               ul (4) -- Privacy Policy + Submit feedback (2 li > a)
 *               div (14) {flex} -- icon + language selector
 *                 jb-icon (2) > svg (1) > path
 *                 jb-form-field-container [P] (10)
 *                   jb-select [P] (9) {flex,col}
 *                     div (8)
 *                       div (0px height)
 *                       button (6) {flex} -- "English" + expandable indicator
 *           div (15) {flex} -- bottom row: Our Fares + Bag Info + ... + copyright
 *             div (13) -- links container
 *               ul (12) -- 4 li items
 *             div "©2026. All rights reserved"
 */
export default function FlightsFooter() {
  return (
    <div style={{ display: 'inline' }}>
      {/* jb-footer [P] */}
      <div style={{ width: '1461px', height: '101px', borderTop: '1px solid rgb(211, 211, 211)' }}>
        {/* div#footer-div-element */}
        <div style={{ display: 'inline' }}>
          {/* jb-help-and-faq */}
          <div style={{ width: '936px', margin: '0 auto' }}>
            {/* div [P] wrapper */}
            <div style={{ width: '936px', height: '100px' }}>
              {/* Top row: Popular Help Topics + links + language selector */}
              <div style={{ display: 'flex', width: '936px', height: '32px' }}>
                <div style={{ width: '173.453px', height: '24px', fontWeight: 700, fontSize: '16px' }}>Popular Help Topics</div>
                <div style={{ display: 'flex', width: '343.25px', height: '32px' }}>
                  <ul style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, width: '258.234px', height: '24px', gap: '8px' }}>
                    <li style={{ width: '111.891px', height: '20px' }}>
                      <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</a>
                    </li>
                    <li style={{ width: '134.344px', height: '20px' }}>
                      <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>Submit feedback</a>
                    </li>
                  </ul>
                  <div style={{ display: 'flex', width: '85.0156px', height: '20px', alignItems: 'center', gap: '4px' }}>
                    {/* jb-icon: globe SVG */}
                    <div style={{ width: '14px', height: '20px' }}>
                      <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline' }}>
                        <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm-2 35.86c-7.9-.98-14-7.7-14-15.86 0-1.24.16-2.42.42-3.58L18 30v2c0 2.2 1.8 4 4 4v3.86zm13.8-5.08c-.52-1.62-2-2.78-3.8-2.78h-2v-6c0-1.1-.9-2-2-2H16v-4h4c1.1 0 2-.9 2-2V14h4c2.2 0 4-1.8 4-4v-.82c5.86 2.38 10 8.12 10 14.82 0 4.16-1.6 7.94-4.2 10.78z" fill="currentColor" style={{ display: 'inline' }} />
                      </svg>
                    </div>
                    {/* jb-form-field-container [P] > jb-select [P] > div > (div + button) */}
                    <div style={{ width: '67.0156px', height: '20px' }}>
                      {/* jb-select [P] */}
                      <div style={{ display: 'flex', flexDirection: 'column', width: '67.0156px', height: '20px' }}>
                        <div style={{ width: '67.0156px', height: '20px' }}>
                          <div style={{ width: '67.0156px', height: '0px' }} />
                          <button style={{ display: 'flex', width: '67.0156px', height: '20px', border: 'none', background: 'none', cursor: 'pointer', padding: 0, alignItems: 'center', fontFamily: 'inherit', fontSize: '14px' }}>
                            <div style={{ width: '51.0156px', height: '20px' }}>English</div>
                            {/* jb-expandable-indicator [P] > div {flex} > span > (span + span) */}
                            <div style={{ width: '8px', height: '8px' }}>
                              <div style={{ display: 'flex', width: '8px', height: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ width: '8px', height: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{ width: '5px', height: '1.59375px', backgroundColor: 'currentColor', transform: 'rotate(-45deg)', transformOrigin: 'top right' }} />
                                  <span style={{ width: '5px', height: '1.59375px', backgroundColor: 'currentColor', transform: 'rotate(45deg)', transformOrigin: 'top left' }} />
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom row: Our Fares + Bag Info + Travel Credit + See all + copyright */}
              <div style={{ display: 'flex', width: '936px', height: '20px' }}>
                <div style={{ width: '415.484px', height: '20px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '415.484px', height: '0px', display: 'flex', gap: '8px' }}>
                    <li style={{ width: '76.0781px', height: '20px' }}>
                      <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>Our Fares</a>
                    </li>
                    <li style={{ width: '74.2969px', height: '20px' }}>
                      <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>Bag Info</a>
                    </li>
                    <li style={{ width: '104.906px', height: '20px' }}>
                      <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>Travel Credit</a>
                    </li>
                    <li style={{ width: '152.203px', height: '20px' }}>
                      <a href="#" style={{ display: 'inline', color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>
                        See all help topics
                        {/* jb-icon > svg [P] > g [P] > polygon */}
                        <span style={{ display: 'inline' }}>
                          <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', marginLeft: '4px' }}>
                            <g style={{ display: 'inline' }}>
                              <polygon points="0,0 4,4 0,8" fill="currentColor" style={{ display: 'inline' }} />
                            </g>
                          </svg>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div style={{ width: '157.344px', height: '20px', fontSize: '12px', color: 'rgb(117, 117, 117)' }}>
                  &copy;2026. All rights reserved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
