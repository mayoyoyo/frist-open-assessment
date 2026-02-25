/**
 * FlightResultHeader -- results header with title, Cash/Points toggle, filters (43 elements).
 *
 * Structure from PropertySpec:
 *   cb-flight-result-header [P] (inline) > div [936px×150px] >
 *     div (flex, 904px×68px) >
 *       div (716.891px) > [h2 + h3]                     -- title + subtitle
 *       div (flex, 187.109px) >                          -- Cash/Points toggle
 *         cb-dollar-points-toggle [P] > div [P] >
 *           jb-segmented-control (inline) > fieldset > [legend + div(inline-flex) > 2×jb-segment]
 *     cb-filters [P] (inline) > div#filters (flex, 904px×34px) >
 *       div [P] > jb-chip [P] (inline) > div [P] (flex) > button(flex) > [jb-icon [P] > svg > g > 2×path, div "All filters"]
 *       div (flex,col) > form [P] > jb-select [P] (flex,col) > div > [div(0px), button(flex) > span "Sort: Best match" + div + jb-expandable-indicator]
 */

export default function FlightResultHeader() {
  return (
    <div style={{ display: 'inline' }}>
      {/* cb-flight-result-header [P] */}
      <div style={{ width: '936px', padding: '16px 0', backgroundColor: 'rgb(255, 255, 255)', borderRadius: '4px 4px 0 0' }}>
        {/* Title row */}
        <div style={{ display: 'flex', width: '904px', height: '68px', margin: '0 auto', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: title + subtitle */}
          <div style={{ width: '716.891px', height: '52px' }}>
            <h2
              style={{
                width: '716.891px',
                height: '32px',
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: '32px',
                color: 'rgb(0, 0, 0)',
                margin: 0,
              }}
            >
              Results for New York, NY (JFK) to Miami area
            </h2>
            <h3
              style={{
                width: '716.891px',
                height: '16px',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '16px',
                color: 'rgb(51, 51, 51)',
                margin: 0,
              }}
            >
              Departing: Feb 20
            </h3>
          </div>

          {/* Right: Cash/Points toggle */}
          <div style={{ display: 'flex', width: '187.109px', height: '29px' }}>
            {/* cb-dollar-points-toggle [P] */}
            <div style={{ width: '179.109px', height: '29px' }}>
              {/* div [P] */}
              <div style={{ display: 'inline-block', width: '179.109px', height: '29px' }}>
                {/* jb-segmented-control (inline) */}
                <div style={{ display: 'inline' }}>
                  <fieldset
                    style={{
                      width: '175.109px',
                      height: '29px',
                      border: '1px solid rgb(0, 51, 160)',
                      borderRadius: '4px',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <legend style={{ width: '4px', height: '4px', overflow: 'hidden', position: 'absolute', clip: 'rect(0 0 0 0)' }}>View by</legend>
                    <div style={{ display: 'inline-flex', width: '173.109px', height: '24px' }}>
                      {/* Cash segment (selected) */}
                      <div style={{ display: 'flex', width: '85px', height: '24px', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgb(0, 51, 160)' }}>
                        <input type="radio" name="viewBy" id="jb-segment-2" defaultChecked style={{ width: '4px', height: '4px', position: 'absolute', opacity: 0 }} />
                        <label htmlFor="jb-segment-2" style={{ display: 'flex', width: '31.4062px', height: '16px', fontSize: '14px', fontWeight: 700, color: 'rgb(0, 51, 160)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>Cash</label>
                      </div>
                      {/* Points segment */}
                      <div style={{ display: 'flex', width: '88.1094px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                        <input type="radio" name="viewBy" id="jb-segment-3" style={{ width: '4px', height: '4px', position: 'absolute', opacity: 0 }} />
                        <label htmlFor="jb-segment-3" style={{ display: 'flex', width: '39.1094px', height: '16px', fontSize: '14px', fontWeight: 500, color: 'rgb(0, 51, 160)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>Points</label>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: 'inline' }}>
          {/* cb-filters [P] */}
          <div id="filters" style={{ display: 'flex', width: '904px', height: '34px', margin: '0 auto', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* All filters chip */}
            <div style={{ width: '114.031px', height: '34px' }}>
              {/* jb-chip [P] (inline) */}
              <div style={{ display: 'inline' }}>
                {/* div [P] (flex) */}
                <div style={{ display: 'flex', width: '114.031px', height: '34px' }}>
                  <button
                    style={{
                      display: 'flex',
                      width: '114.031px',
                      height: '34px',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgb(0, 51, 160)',
                      borderRadius: '20px',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '0 8px',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {/* jb-icon [P] > svg > g > 2×path — slider/filter icon */}
                    <div style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                      <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '32px', height: '32px' }}>
                        <g>
                          <path d="M8 12h32M8 24h32M8 36h32" stroke="rgb(0, 51, 160)" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="16" cy="12" r="3" fill="rgb(0, 51, 160)" />
                          <circle cx="32" cy="24" r="3" fill="rgb(0, 51, 160)" />
                          <circle cx="20" cy="36" r="3" fill="rgb(0, 51, 160)" />
                        </g>
                      </svg>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(0, 51, 160)', lineHeight: '20px' }}>All filters</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sort dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '133.391px', height: '34px', justifyContent: 'center' }}>
              {/* form [P] */}
              <div style={{ width: '133.391px', height: '20px' }}>
                {/* jb-select [P] (flex, col) */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '133.391px', height: '20px' }}>
                  <div style={{ width: '133.391px', height: '20px' }}>
                    <div style={{ width: '133.391px', height: '0px' }} />
                    <button
                      style={{
                        display: 'flex',
                        width: '133.391px',
                        height: '20px',
                        alignItems: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ width: '117.391px', height: '20px', fontSize: '14px', fontWeight: 500, lineHeight: '20px', color: 'rgb(0, 51, 160)' }}>Sort: Best match</span>
                      <div style={{ width: '4px', height: '20px' }} />
                      {/* jb-expandable-indicator [P] — downward chevron */}
                      <div style={{ width: '10px', height: '10px' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 3.5L5 6.5L8 3.5" stroke="rgb(0, 51, 160)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
