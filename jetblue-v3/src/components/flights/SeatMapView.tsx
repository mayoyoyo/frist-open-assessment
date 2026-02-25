/**
 * SeatMapView -- step="seats" view (state 88, 1945 elements).
 *
 * FULL-WIDTH layout (no CheckoutLayout). Structure from deep-state88.txt:
 *   jb-seat-selection [P] (inline) -> div(1461px) -> cb-seat-map [P] (inline)
 *     -> div[P](flex,col,1461px) -> div[P] -> cb-seat-map-section [P] (inline)
 *       -> div(flex,col,1461px) -> [header(16), seatArea(1864), travelerPanel(30)]
 *
 * Header: flight selector "PBI to JFK" + "Flight 1054"
 * Seat area: left info panel + right aircraft SVG + 27 rows of seats
 * Traveler panel: avatar card "JD Jane Doe" + "Next flight: JFK - PBI" button
 *
 * Annotations: ann-36 (seat 1A), ann-37 (Next flight button), ann-38 (seat 2E disabled)
 */
import { useSyncExternalStore } from 'react';
import { getState, subscribe, setState, navigateToStep } from '../../main';

// ---- Seat grid configuration ----
// Rows 1-9: EvenMore (rows 1 is 92px, rows 2-9 are 60px)
// Rows 10-11: Exit rows (60px, 9 children with Exit labels)
// Rows 12-27: Core (48px)
const SEAT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface SeatConfig {
  row: number;
  type: 'evenmore-first' | 'evenmore' | 'exit' | 'core';
  height: number;
}

const ROW_CONFIGS: SeatConfig[] = [
  { row: 1, type: 'evenmore-first', height: 92 },
  ...Array.from({ length: 8 }, (_, i) => ({
    row: i + 2, type: 'evenmore' as const, height: 60,
  })),
  { row: 10, type: 'exit', height: 60 },
  { row: 11, type: 'exit', height: 60 },
  ...Array.from({ length: 16 }, (_, i) => ({
    row: i + 12, type: 'core' as const, height: 48,
  })),
];

// Seats that are available (have price "$0") vs occupied (show X)
// From the source screenshot state-88
const AVAILABLE_SEATS = new Set([
  '1A', '3B', '3E', '4B', '4C',
  '5A', '5B', '5D', '5E', '5F',
]);

const OCCUPIED_SEATS = new Set([
  '1B', '1C', '1D', '1E', '1F',
  '2A', '2B', '2C', '2D', '2E', '2F',
  '3A', '3C', '3D', '3F',
  '4A', '4D', '4E', '4F',
  '5C',
  '6A', '6B', '6C', '6D', '6E', '6F',
]);

function isSeatAvailable(row: number, col: string): boolean {
  return AVAILABLE_SEATS.has(`${row}${col}`);
}

function isSeatOccupied(row: number, col: string): boolean {
  if (OCCUPIED_SEATS.has(`${row}${col}`)) return true;
  // Default: available for rows > 6 if not specifically occupied
  if (row <= 6) return !AVAILABLE_SEATS.has(`${row}${col}`);
  return false;
}

// ---- Seat SVG (rounded rectangle matching source) ----
// Source seats use viewBox "0 0 40 60" (EvenMore) or "0 0 40 48" (Core)
// with fill="none" on the top-level SVG and internal structure.
function SeatSvg({ available, selected, showPrice, seatType }: {
  available: boolean;
  selected: boolean;
  showPrice?: boolean;
  seatType: 'evenmore' | 'core';
}) {
  const fillColor = selected ? 'rgb(0, 51, 160)' : available ? 'rgb(255, 255, 255)' : 'rgb(224, 224, 224)';
  const stroke = available ? 'rgb(208, 96, 0)' : 'rgb(189, 189, 189)';
  const strokeWidth = available ? '2' : '1';
  // Use GT-matching viewBox dimensions
  const w = 40;
  const h = seatType === 'evenmore' ? 60 : 48;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ display: 'block' }}>
      <rect x="2" y="2" width={w - 4} height={h - 4} rx="4" ry="4" fill={fillColor} stroke={stroke} strokeWidth={strokeWidth} />
      {available && !selected && (
        <>
          <line x1={w / 2} y1={h < 50 ? 12 : 16} x2={w / 2} y2={h < 50 ? 24 : 30} stroke="rgb(208, 96, 0)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={w / 2 - 6} y1={h < 50 ? 18 : 23} x2={w / 2 + 6} y2={h < 50 ? 18 : 23} stroke="rgb(208, 96, 0)" strokeWidth="2.5" strokeLinecap="round" />
          {showPrice && (
            <text x={w / 2} y={h - 9} textAnchor="middle" fontSize="10" fill="rgb(66, 66, 66)" fontFamily="inherit">$0</text>
          )}
        </>
      )}
    </svg>
  );
}

// ---- Individual seat element ----
function Seat({ row, col, height, onSelect, selectedSeat, seatType }: {
  row: number;
  col: string;
  height: number;
  onSelect: (seatId: string) => void;
  selectedSeat: string | null;
  seatType: 'evenmore' | 'core';
}) {
  const seatId = `${row}${col}`;
  const available = isSeatAvailable(row, col);
  const occupied = isSeatOccupied(row, col);
  const selected = selectedSeat === seatId;
  const showPrice = available && !occupied;
  const isDisabled = occupied;

  // Determine annotation
  let ann: string | undefined;
  if (row === 1 && col === 'A') ann = 'ann-36';
  if (row === 2 && col === 'E') ann = 'ann-38';

  // Occupied seat dimensions match GT viewBox
  const occW = 40;
  const occH = seatType === 'evenmore' ? 60 : 48;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '40px', height: `${height}px`, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: `${Math.min(height, 60)}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button
          data-ann={ann}
          data-seat={seatId}
          disabled={isDisabled}
          onClick={() => !isDisabled && onSelect(seatId)}
          style={{
            display: 'inline-block',
            width: '40px',
            border: 'none',
            background: 'none',
            padding: '0',
            cursor: isDisabled ? 'default' : 'pointer',
            position: 'relative',
          }}
        >
          {occupied ? (
            // Occupied seat shows X -- use GT-matching viewBox
            <svg width={occW} height={occH} viewBox={`0 0 ${occW} ${occH}`} fill="none" style={{ display: 'block' }}>
              <rect x="2" y="2" width={occW - 4} height={occH - 4} rx="4" fill="rgb(245, 245, 245)" stroke="rgb(189, 189, 189)" strokeWidth="1" />
              <line x1={occW * 0.3} y1={occH * 0.3} x2={occW * 0.7} y2={occH * 0.7} stroke="rgb(189, 189, 189)" strokeWidth="2" strokeLinecap="round" />
              <line x1={occW * 0.7} y1={occH * 0.3} x2={occW * 0.3} y2={occH * 0.7} stroke="rgb(189, 189, 189)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <SeatSvg available={available} selected={selected} showPrice={showPrice} seatType={seatType} />
          )}
          {selected && (
            <div style={{ textAlign: 'center', marginTop: '1px' }}>
              <span style={{ fontSize: '10px', color: 'rgb(0, 51, 160)', fontWeight: 700 }}>{col}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ---- Column header labels (A B C  D E F) ----
function ColumnHeaders() {
  return (
    <div style={{ display: 'flex', width: '307.797px', height: '28px', alignItems: 'center' }}>
      {SEAT_COLS.map((col, i) => (
        <div key={col} style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40px',
          height: '28px',
          marginRight: i === 2 ? '27.797px' : '0px',
          fontSize: '14px',
          fontWeight: 700,
          color: 'rgb(66, 66, 66)',
        }}>
          {col}
        </div>
      ))}
    </div>
  );
}

// ---- Row number element ----
function RowNumber({ num, height }: { num: number; height: number }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '27.797px',
      height: `${height}px`,
      fontSize: '14px',
      fontWeight: 700,
      color: 'rgb(66, 66, 66)',
    }}>
      {num}
    </div>
  );
}

// ---- Regular row (7 children: 3 seats + row number + 3 seats) ----
function SeatRow({ config, onSelect, selectedSeat }: {
  config: SeatConfig;
  onSelect: (seatId: string) => void;
  selectedSeat: string | null;
}) {
  const { row, height, type } = config;
  const seatType: 'evenmore' | 'core' = (type === 'evenmore' || type === 'evenmore-first' || type === 'exit') ? 'evenmore' : 'core';

  return (
    <div style={{ display: 'flex', width: '307.797px', height: `${height}px` }}>
      {/* Left seats: A, B, C */}
      {SEAT_COLS.slice(0, 3).map((col) => (
        <Seat key={col} row={row} col={col} height={height} onSelect={onSelect} selectedSeat={selectedSeat} seatType={seatType} />
      ))}
      {/* Row number */}
      <RowNumber num={row} height={height} />
      {/* Right seats: D, E, F */}
      {SEAT_COLS.slice(3).map((col) => (
        <Seat key={col} row={row} col={col} height={height} onSelect={onSelect} selectedSeat={selectedSeat} seatType={seatType} />
      ))}
    </div>
  );
}

// ---- Exit row (9 children: Exit + 3 seats + row number + 3 seats + Exit) ----
function ExitRow({ config, onSelect, selectedSeat }: {
  config: SeatConfig;
  onSelect: (seatId: string) => void;
  selectedSeat: string | null;
}) {
  const { row, height } = config;

  return (
    <div style={{ display: 'flex', width: '307.797px', height: `${height}px` }}>
      <span style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '31.5px',
        height: '24px',
        fontSize: '10px',
        color: 'rgb(117, 117, 117)',
        alignSelf: 'center',
      }}>
        Exit
      </span>
      {SEAT_COLS.slice(0, 3).map((col) => (
        <Seat key={col} row={row} col={col} height={height} onSelect={onSelect} selectedSeat={selectedSeat} seatType="evenmore" />
      ))}
      <span style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '19.7969px',
        height: `${height}px`,
        fontSize: '14px',
        fontWeight: 700,
        color: 'rgb(66, 66, 66)',
      }}>
        {row}
      </span>
      {SEAT_COLS.slice(3).map((col) => (
        <Seat key={col} row={row} col={col} height={height} onSelect={onSelect} selectedSeat={selectedSeat} seatType="evenmore" />
      ))}
      <span style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '31.5px',
        height: '24px',
        fontSize: '10px',
        color: 'rgb(117, 117, 117)',
        alignSelf: 'center',
      }}>
        Exit
      </span>
    </div>
  );
}

// ---- Aircraft SVG (body, wings) ----
function AircraftSvg() {
  return (
    <div style={{ width: '3234px', height: '3526px', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <svg width="3234" height="3520" viewBox="0 0 3234 3520" style={{ display: 'inline' }}>
        <g id="Symbols">
          <g id="Airbus-A320">
            <g>
              {/* Wing left */}
              <g id="Wing_left">
                <polygon points="0,1400 200,1200 200,1800 0,1600" fill="rgb(200, 220, 240)" opacity="0.3" />
                <path d="M200,1200 L200,1800" stroke="rgb(180, 200, 220)" strokeWidth="2" fill="none" />
                <path d="M0,1400 L200,1200" stroke="rgb(180, 200, 220)" strokeWidth="2" fill="none" />
              </g>
              {/* Wing right */}
              <g id="Wing_right">
                <polygon points="3234,1400 3034,1200 3034,1800 3234,1600" fill="rgb(200, 220, 240)" opacity="0.3" />
                <path d="M3034,1200 L3034,1800" stroke="rgb(180, 200, 220)" strokeWidth="2" fill="none" />
                <path d="M3234,1400 L3034,1200" stroke="rgb(180, 200, 220)" strokeWidth="2" fill="none" />
              </g>
              {/* Rear wing */}
              <path id="Rear-Wing" d="M1200,3200 Q1617,3100 2034,3200" stroke="rgb(180, 200, 220)" strokeWidth="2" fill="none" />
              {/* Body */}
              <g id="Body">
                <path d="M1417,100 Q1617,0 1817,100 L1817,3400 Q1617,3520 1417,3400 Z" fill="rgb(225, 235, 245)" stroke="rgb(200, 215, 230)" strokeWidth="2" />
                <path d="M1417,100 Q1617,0 1817,100" fill="none" stroke="rgb(200, 215, 230)" strokeWidth="2" />
                <path d="M1417,3400 Q1617,3520 1817,3400" fill="none" stroke="rgb(200, 215, 230)" strokeWidth="2" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

// ---- Expandable indicator (chevron for flight selector) ----
function ExpandableIndicator() {
  return (
    <div style={{ width: '8px', height: '8px' }}>
      <div style={{ display: 'flex', width: '8px', height: '8px' }}>
        <span style={{ display: 'flex', flexDirection: 'column', width: '8px', height: '5px' }}>
          <span style={{ width: '5px', height: '1.59375px', backgroundColor: 'rgb(66, 66, 66)', transform: 'rotate(45deg)', transformOrigin: 'left center' }} />
          <span style={{ width: '5px', height: '1.59375px', backgroundColor: 'rgb(66, 66, 66)', transform: 'rotate(-45deg)', transformOrigin: 'left center' }} />
        </span>
      </div>
    </div>
  );
}

// ---- Chevron down icon for info cards ----
function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <path d="M6 9l6 6 6-6" stroke="rgb(0, 51, 160)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Right arrow icon for "Next flight" button ----
function ArrowRightIcon() {
  return (
    <div style={{ width: '8px', height: '14.3906px' }}>
      <svg width="8" height="14.3906" viewBox="0 0 8 14" style={{ display: 'inline' }}>
        <path d="M1 1l6 6-6 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 1l6 6-6 6" stroke="white" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

// ---- Left arrow icon for "Previous flight" button ----
function ArrowLeftIcon() {
  return (
    <div style={{ width: '8px', height: '14.3906px' }}>
      <svg width="8" height="14.3906" viewBox="0 0 8 14" style={{ display: 'inline' }}>
        <path d="M7 1l-6 6 6 6" stroke="rgb(0, 51, 160)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ---- Seat legend icon (small seat square for the info panel) ----
function SeatLegendIcon({ fill, stroke, label }: { fill: string; stroke: string; label?: string }) {
  return (
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      border: `2px solid ${stroke}`,
      backgroundColor: fill,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {label && (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M2 7h10M7 2v10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// ---- Left info panel (EvenMore card, JetBlue Experience card, seat legends) ----
function InfoPanel() {
  return (
    <div style={{ width: '468px', height: '512px', overflow: 'auto', paddingTop: '20px' }}>
      <div style={{ width: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px' }}>
        {/* EvenMore card */}
        <div style={{
          borderLeft: '4px solid rgb(0, 114, 206)',
          borderRadius: '4px',
          padding: '20px 24px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(0, 32, 91)', marginBottom: '8px' }}>
                EvenMore&reg;
              </div>
              <div style={{ fontSize: '14px', color: 'rgb(66, 66, 66)', lineHeight: '20px', marginBottom: '4px' }}>
                Includes premium perks at the airport and on board.
              </div>
              <a href="#" style={{ fontSize: '14px', color: 'rgb(0, 51, 160)', textDecoration: 'none', fontWeight: 500 }}>
                Learn more
              </a>
            </div>
            <ChevronDownIcon />
          </div>
        </div>

        {/* The JetBlue experience card */}
        <div style={{
          borderLeft: '4px solid rgb(0, 114, 206)',
          borderRadius: '4px',
          padding: '20px 24px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgb(0, 32, 91)', marginBottom: '8px' }}>
                The JetBlue experience
              </div>
              <div style={{ fontSize: '14px', color: 'rgb(66, 66, 66)', lineHeight: '20px', marginBottom: '4px' }}>
                Make time fly with free high-speed wi-fi*, live TV* &amp; movies at every seat, and more.{' '}
                <a href="#" style={{ color: 'rgb(0, 51, 160)', textDecoration: 'none', fontWeight: 500 }}>Learn more</a>
              </div>
            </div>
            <ChevronDownIcon />
          </div>

          {/* Seat type legends */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {/* Extra legroom */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <SeatLegendIcon fill="rgb(0, 51, 160)" stroke="rgb(0, 51, 160)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(33, 33, 33)' }}>Extra legroom</div>
                <div style={{ fontSize: '13px', color: 'rgb(66, 66, 66)', lineHeight: '18px' }}>
                  Stretch out in an exit-row or over-wing location. On E190s, extra legroom seats are also located in the first row.
                </div>
              </div>
            </div>
            {/* Preferred */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <SeatLegendIcon fill="white" stroke="rgb(0, 51, 160)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(33, 33, 33)' }}>Preferred</div>
                <div style={{ fontSize: '13px', color: 'rgb(66, 66, 66)', lineHeight: '18px' }}>
                  Get on your way faster with a seat in the first few rows of Core.
                </div>
              </div>
            </div>
            {/* Core */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <SeatLegendIcon fill="white" stroke="rgb(117, 117, 117)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(33, 33, 33)' }}>Core</div>
                <div style={{ fontSize: '13px', color: 'rgb(66, 66, 66)', lineHeight: '18px' }}>
                  Free Fly-Fi&reg; and seatback entertainment, plus snacks + drinks.
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'rgb(117, 117, 117)', marginTop: '16px' }}>
            * Availability and coverage area may vary by aircraft.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main seat grid component (reusable for SeatMapView and ExtrasView) ----
export function SeatGrid({ onSelect, selectedSeat, compact }: {
  onSelect: (seatId: string) => void;
  selectedSeat: string | null;
  compact?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '307.797px' }}>
      {/* EvenMore header */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '81.9062px', height: '60px' }}>
        <span style={{ width: '81.9062px', height: '20px', fontSize: '14px', fontWeight: 700, color: 'rgb(0, 51, 160)' }}>
          EvenMore&reg;
        </span>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          width: '63.8125px',
          height: '40px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: '14px', color: 'rgb(0, 51, 160)', fontWeight: 500 }}>details</span>
        </button>
      </div>

      {/* Column headers */}
      <ColumnHeaders />

      {/* Seat rows */}
      {ROW_CONFIGS.map((config) => {
        if (config.type === 'exit') {
          return <ExitRow key={config.row} config={config} onSelect={onSelect} selectedSeat={selectedSeat} />;
        }
        return <SeatRow key={config.row} config={config} onSelect={onSelect} selectedSeat={selectedSeat} />;
      })}
    </div>
  );
}

export default function SeatMapView() {
  const state = useSyncExternalStore(subscribe, getState);
  const selectedSeat = state.currentSeatLeg === 'outbound' ? state.outboundSeat : state.returnSeat;
  const isReturn = state.currentSeatLeg === 'return';

  const handleSeatSelect = (seatId: string) => {
    if (state.currentSeatLeg === 'outbound') {
      setState({ outboundSeat: seatId });
    } else {
      setState({ returnSeat: seatId });
    }
  };

  const handleNextFlight = () => {
    if (state.currentSeatLeg === 'outbound') {
      setState({ currentSeatLeg: 'return' });
    } else {
      navigateToStep('extras');
    }
  };

  const handlePreviousFlight = () => {
    setState({ currentSeatLeg: 'outbound' });
  };

  return (
    // jb-seat-selection [P] (inline)
    <div style={{ display: 'inline' }}>
      {/* div(1461px) */}
      <div style={{ width: '1461px', height: '718px' }}>
        {/* cb-seat-map [P] (inline) */}
        <div style={{ display: 'inline' }}>
          {/* div[P](flex,col,1461px) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '1461px', height: '718px' }}>
            {/* div[P] */}
            <div style={{ width: '1461px', height: '718px' }}>
              {/* cb-seat-map-section [P] (inline) */}
              <div style={{ display: 'inline' }}>
                {/* div(flex,col,1461px) */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '1461px', height: '718px' }}>

                  {/* ======= HEADER (16 elements) ======= */}
                  <div style={{ display: 'flex', width: '1461px', height: '76px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', width: '936px', height: '36px', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto' }}>
                      {/* Flight selector */}
                      <div style={{ width: '250px', height: '36px' }}>
                        <div style={{ width: '250px', height: '20px' }}>
                          {/* jb-select [P] (flex,col) */}
                          <div style={{ display: 'flex', flexDirection: 'column', width: '250px', height: '20px' }}>
                            <div style={{ width: '250px', height: '20px' }}>
                              <div style={{ width: '250px', height: '0px' }} />
                              <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '88.8906px',
                                height: '20px',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}>
                                <span style={{ width: '72.8906px', height: '20px', fontSize: '14px', fontWeight: 500, color: 'rgb(0, 51, 160)', whiteSpace: 'nowrap' }}>
                                  {isReturn ? 'JFK to PBI' : 'PBI to JFK'}
                                </span>
                                <div style={{ width: '0px', height: '20px' }} />
                                {/* jb-expandable-indicator [P] */}
                                <div style={{ width: '8px', height: '8px' }}>
                                  <ExpandableIndicator />
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Flight number */}
                      <div style={{ display: 'flex', width: '72px', height: '36px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'rgb(66, 66, 66)', whiteSpace: 'nowrap' }}>
                          {isReturn ? 'Flight 1153' : 'Flight 1054'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ======= SEAT AREA (1864 elements) ======= */}
                  <div id="cb-seat-map-scrollable-container" style={{ display: 'flex', width: '1461px', height: '512px', overflow: 'auto' }}>
                    <div style={{ display: 'flex', width: '936px', height: '512px', margin: '0 auto' }}>
                      {/* Left info panel */}
                      <InfoPanel />
                      {/* Seat grid container */}
                      <div style={{ display: 'grid', width: '468px', height: '512px', position: 'relative' }}>
                        {/* Aircraft SVG background */}
                        <AircraftSvg />
                        {/* Seats overlay */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ width: '307.797px', height: '1688px', margin: '0 auto' }}>
                            {/* cb-seats [P] (flex) */}
                            <div style={{ display: 'flex', width: '307.797px', height: '1688px' }}>
                              {/* div#cb-seat-map-seats-container [P] */}
                              <div style={{ width: '307.797px', height: '1688px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '307.797px', height: '1688px' }}>
                                  <SeatGrid onSelect={handleSeatSelect} selectedSeat={selectedSeat} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ======= TRAVELER PANEL (30 elements) ======= */}
                  <div style={{ width: '1461px', height: '130px' }}>
                    {/* cb-seat-map-traveler-panel [P] (inline) */}
                    <div style={{ display: 'inline' }}>
                      {/* div#bottom-toolbar (flex) */}
                      <div id="bottom-toolbar" style={{
                        display: 'flex',
                        width: '1461px',
                        height: '130px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgb(240, 244, 248)',
                        borderTop: '1px solid rgb(224, 224, 224)',
                      }}>
                        <div style={{ display: 'flex', width: '936px', height: '106px', justifyContent: 'space-between', alignItems: 'center' }}>
                          {/* Left: traveler card */}
                          <div style={{ width: '580.312px', height: '106px' }}>
                            {/* jb-horizontal-scroller [P] (inline) */}
                            <div style={{ display: 'inline', width: '100%' }}>
                              <div style={{ display: 'flex', width: '580.312px', height: '82px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', width: '580.312px', height: '82px', alignItems: 'center' }}>
                                  {/* jb-horizontal-scroller-button (left) */}
                                  <div style={{ width: '0px', height: '82px' }} />
                                  {/* Scroller content */}
                                  <div style={{ width: '580.312px', height: '82px' }}>
                                    <div style={{ width: '580.312px', height: '82px' }}>
                                      {/* jb-avatar-card */}
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        width: '154.297px',
                                        height: '66px',
                                        padding: '8px 16px',
                                        border: '2px solid rgb(0, 51, 160)',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                      }}>
                                        {/* Avatar circle */}
                                        <div style={{
                                          width: '40px',
                                          height: '40px',
                                          borderRadius: '50%',
                                          backgroundColor: 'rgb(0, 51, 160)',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          color: 'white',
                                          fontSize: '14px',
                                          fontWeight: 700,
                                          flexShrink: 0,
                                        }}>
                                          JD
                                        </div>
                                        {/* Name */}
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(33, 33, 33)', whiteSpace: 'nowrap' }}>
                                          Jane Doe
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* jb-horizontal-scroller-button (right) */}
                                  <div style={{ width: '0px', height: '82px' }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: action buttons */}
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {isReturn && (
                              <button
                                onClick={handlePreviousFlight}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  gap: '8px',
                                  height: '56px',
                                  padding: '0 24px',
                                  backgroundColor: 'white',
                                  color: 'rgb(0, 51, 160)',
                                  border: '2px solid rgb(0, 51, 160)',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <ArrowLeftIcon />
                                <span>Previous flight</span>
                              </button>
                            )}
                            <button
                              data-ann="ann-37"
                              onClick={handleNextFlight}
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '210.266px',
                                height: '56px',
                                backgroundColor: 'rgb(0, 51, 160)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: '16px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ lineHeight: '24px' }}>
                                    {isReturn ? 'Next: Select extras' : 'Next flight: JFK \u2013 PBI'}
                                  </span>
                                  {/* jb-icon [P] */}
                                  <ArrowRightIcon />
                                </div>
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
