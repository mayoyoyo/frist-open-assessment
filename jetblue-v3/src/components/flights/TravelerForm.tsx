/**
 * TravelerForm -- step="traveler" view (state 47, 431 elements).
 *
 * PropertySpec exact structure (queried from PropertySpec.json state 47):
 *   left panel → 6 divs: [0] empty, [1] empty, [2] jb-traveler-details[P] (active),
 *     [3] mat-card "2. Seats & Extras", [4] empty, [5] mat-card "3. Review & Pay"
 *
 *   jb-traveler-details[P] → div(3 children):
 *     [0] div(440px, empty spacer)
 *     [1] div(552×238) → div(456) → [h1, div(instructions), div[P](privacy), div(passport)]
 *     [2] div(552×1647) → jb-accordion(456) → [jb-expansion-panel(expanded), jb-expansion-panel(collapsed)]
 *
 *   Expanded panel → section[P] → div → section → form → [
 *     jb-personal-info-section[P](inline) → jb-section(inline) → [label "Personal Information", div[P] → jb-personal-info(inline, 8 children)],
 *     jb-section(inline) → [label "Contact Info", div[P] → jb-trip-contact-details(inline, 4 children)],
 *     jb-section(inline) → [label "Additional Information", div[P] → jb-additional-info(inline, 4 children)],
 *     div(456×56) → [span(inline)→button(inline-flex)→span "Next: Seats & Extras", jb-button-loading-notifier]
 *   ]
 *
 * Form field structure (from PropertySpec):
 *   jb-select[P](flex) → div → [div→label, button(flex)→[div, jb-expandable-indicator[P]]]
 *   jb-form-input-field[P](inline) → jb-form-field-container → [div[P](flex)→div, jb-input(inline)→[jb-input-label→label, input(inline-block)], jb-error×N]
 *
 * Annotations: ann-20 (firstName), ann-21 (title dropdown), ann-22 (Ms option),
 *   ann-23 (email), ann-24 (gender dropdown), ann-25 (Female option),
 *   ann-26..31 (DOB dropdowns), ann-32 (Next button), ann-33 (address input),
 *   ann-34 (address autocomplete select), ann-35 (next seats extras 2)
 */
import { useSyncExternalStore } from 'react';
import { getState, subscribe, setState, setTravelerField, navigateToStep } from '../../main';
import CheckoutLayout from './CheckoutLayout';

// ---- Expandable indicator (chevron) ----
function ExpandableIndicator({ up }: { up?: boolean }) {
  return (
    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ transform: up ? 'rotate(180deg)' : undefined }}>
        <path d="M3 3V0h2v3h3v2H5v3H3V5H0V3h3z" fill="currentColor" />
      </svg>
    </div>
  );
}

// ---- jb-icon for learn-more (northeast arrow) and passport (down-pointing triangle) ----
function JbIcon({ width = 10, height = 20, type = 'arrow' }: { width?: number; height?: number; type?: 'arrow' | 'chevron-down' }) {
  if (type === 'chevron-down') {
    return (
      <span style={{ display: 'inline-block', width: `${width}px`, height: `${height}px`, verticalAlign: 'middle' }}>
        <svg width={width} height={height} viewBox="0 0 10 10" style={{ display: 'inline' }}>
          <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-block', width: `${width}px`, height: `${height}px`, verticalAlign: 'middle', marginLeft: '2px' }}>
      <svg width={width} height={height} viewBox="0 0 12 12" style={{ display: 'inline' }}>
        <path d="M3 9L9 3M9 3H4M9 3v5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ---- jb-select (PropertySpec exact structure) ----
// jb-select[P](flex) → div → [div→label, button(flex)→[div(text), jb-expandable-indicator[P]]]
function JbSelect({ label, value, options, onChange, width, ann, annOption }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  width?: number;
  ann?: string;
  annOption?: { id: string; value: string };
}) {
  const w = width || 456;
  const displayText = options.find(o => o.value === value)?.label || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${w}px` }}>
      <div style={{ width: `${w}px`, height: '56px' }}>
        <div style={{ width: `${w}px`, height: value ? '0px' : undefined }}>
          <label style={{ width: '33px', height: '24px', fontSize: '12px', color: 'rgb(117, 117, 117)' }}>{label}</label>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            data-ann={ann}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: `${w}px`,
              height: '56px',
              border: '1px solid rgb(189, 189, 189)',
              borderRadius: '4px',
              padding: '0 16px',
              fontSize: '16px',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              appearance: 'none',
              cursor: 'pointer',
              color: value ? 'rgb(33, 33, 33)' : 'rgb(117, 117, 117)',
            }}
          >
            <option value="">{label}</option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                data-ann={annOption && opt.value === annOption.value ? annOption.id : undefined}
              >
                {opt.label}
              </option>
            ))}
          </select>
          {/* jb-expandable-indicator overlay */}
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <ExpandableIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- jb-form-input-field (PropertySpec exact structure) ----
// jb-form-input-field[P](inline) → jb-form-field-container → [div[P](flex)→div(flex), jb-input(inline)→[jb-input-label→label, input(inline-block)], jb-error×4]
function JbFormInput({ label, value, onChange, ann, type }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ann?: string;
  type?: string;
}) {
  return (
    <div style={{ display: 'inline' }}>
      {/* jb-form-field-container */}
      <div style={{ width: '100%', height: '56px', position: 'relative' }}>
        {/* div[P](flex) → div(flex) - top border area */}
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ display: 'flex', width: '100%' }} />
        </div>
        {/* jb-input(inline) */}
        <div style={{ display: 'inline', width: '100%', height: '20px' }}>
          {/* jb-input-label */}
          <div style={{ width: '100%', position: 'absolute', top: value ? '-8px' : '18px', left: '16px', transition: 'top 0.2s', pointerEvents: 'none' }}>
            <label style={{ fontSize: value ? '12px' : '16px', color: 'rgb(117, 117, 117)', backgroundColor: 'white', padding: '0 4px' }}>
              {label}
            </label>
          </div>
          {/* input(inline-block) */}
          <input
            data-ann={ann}
            type={type || 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              display: 'inline-block',
              width: '100%',
              height: '56px',
              border: '1px solid rgb(189, 189, 189)',
              borderRadius: '4px',
              padding: '0 16px',
              fontSize: '16px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
        {/* jb-error placeholders (inline, 20px height each, empty) */}
        <div style={{ display: 'inline', height: '20px' }} />
        <div style={{ display: 'inline', height: '20px' }} />
        <div style={{ display: 'inline', height: '20px' }} />
        <div style={{ display: 'inline', height: '20px' }} />
      </div>
    </div>
  );
}

// ---- jb-expandable-sections[P] (disclosure button) ----
// jb-expandable-sections[P](inline) → ... → button with + icon and label text
function JbExpandableSection({ label }: { label: string }) {
  return (
    <div style={{ display: 'inline', width: '456px', height: '24px' }}>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          padding: '0',
          cursor: 'pointer',
          color: 'rgb(0, 51, 160)',
          fontSize: '14px',
          fontFamily: 'inherit',
          fontWeight: 500,
          height: '24px',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(0, 51, 160)', lineHeight: '24px' }}>+</span>
        <span style={{ fontSize: '14px', color: 'rgb(0, 51, 160)', lineHeight: '24px' }}>{label}</span>
      </button>
    </div>
  );
}

// ---- Data ----
const months = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const days = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1),
}));

const years = Array.from({ length: 100 }, (_, i) => {
  const y = String(2026 - i);
  return { value: y, label: y };
});

const titleOptions = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Dr', label: 'Dr' },
];

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Undisclosed', label: 'Undisclosed' },
  { value: 'Unspecified', label: 'Unspecified' },
];

export default function TravelerForm() {
  const state = useSyncExternalStore(subscribe, getState);
  const t = state.traveler;

  const leftContent = (
    <>
      {/* child[0]: empty spacer div */}
      <div style={{ width: '616px', height: '0px' }} />

      {/* child[1]: empty */}
      <div style={{ width: '616px', height: '0px' }} />

      {/* child[2]: jb-traveler-details [P] (active step) -- white card background */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgb(224, 224, 224)', padding: '32px 80px 32px 80px' }}>
        {/* jb-traveler-details → div (3 children) */}
        <div style={{ width: '456px' }}>

          {/* [0] empty spacer div */}
          <div style={{ width: '440px', height: '0px' }} />

          {/* [1] Header area: h1 + instructions + privacy + passport */}
          <div style={{ width: '456px' }}>
            <div style={{ width: '456px' }}>
              {/* h1 */}
              <h1 style={{
                width: '456px', height: '35px',
                fontSize: '32px', fontWeight: 400, lineHeight: '35px',
                margin: 0, color: 'rgb(0, 0, 0)',
              }}>
                1. Traveler Details
              </h1>

              {/* Instructions: div(456) → [p, a "Learn more" → jb-icon] */}
              <div style={{ width: '456px', marginTop: '32px', marginBottom: '16px' }}>
                <p style={{ width: '456px', fontSize: '16px', lineHeight: '24px', margin: '0 0 4px 0', color: 'rgb(66, 66, 66)' }}>
                  Please enter the following info as it appears on the government-issued ID or travel documents you'll be traveling with. This is a TSA secure flight.{' '}
                  <a href="#" style={{ color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none', display: 'inline', whiteSpace: 'nowrap' }}>
                    Learn more
                    <JbIcon width={12} height={12} type="arrow" />
                  </a>
                </p>
              </div>

              {/* Privacy notice: div[P](456) → p with link */}
              <div style={{ width: '456px', marginBottom: '16px' }}>
                <p style={{ width: '456px', fontSize: '16px', lineHeight: '24px', margin: 0, color: 'rgb(66, 66, 66)' }}>
                  Please see our{' '}
                  <a href="#" style={{ color: 'rgb(0, 51, 160)', textDecoration: 'none' }}>Privacy Policy</a>
                  {' '}for information on what personal information we collect and how we use such information.
                </p>
              </div>

              {/* Passport notice: div(456×24) → [div(text), jb-icon(10×20)] */}
              <div style={{ width: '456px', height: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(0, 51, 160)' }}>
                  Six months of passport validity for international travel
                </div>
                <JbIcon width={10} height={10} type="chevron-down" />
              </div>
            </div>
          </div>

          {/* [2] Accordion area: div(456) → jb-accordion(456) */}
          <div style={{ width: '456px' }}>
            {/* jb-accordion */}
            <div style={{ width: '456px' }}>

              {/* jb-expansion-panel 1 (expanded, 456×1581) */}
              <div style={{ width: '456px' }}>
                {/* jb-expansion-panel-header (456×57) */}
                <div style={{ width: '456px', height: '57px' }}>
                  <button style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '456px', height: '56px',
                    background: 'none', border: 'none', borderTop: '1px solid rgb(224, 224, 224)',
                    padding: '16px 0', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {/* span → div[P] with traveler info */}
                    <span style={{ height: '24px', whiteSpace: 'nowrap' }}>
                      <div style={{ height: '24px', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, lineHeight: '24px', whiteSpace: 'nowrap' }}>Traveler 1</span>
                        <span style={{ fontSize: '16px', fontWeight: 400, color: 'rgb(66, 66, 66)', lineHeight: '24px' }}>Adult</span>
                      </div>
                    </span>
                    <ExpandableIndicator up />
                  </button>
                </div>

                {/* section[P] → div → section → form (4 children) */}
                <section style={{ width: '456px' }}>
                  <div style={{ width: '456px' }}>
                    <section style={{ width: '456px' }}>
                      <form style={{ width: '456px' }} onSubmit={(e) => e.preventDefault()}>

                        {/* ===== jb-personal-info-section [P] (inline) → jb-section (inline) ===== */}
                        <div style={{ display: 'inline' }}>
                          <div style={{ display: 'inline' }}>
                            {/* label "Personal Information" */}
                            <label style={{ width: '456px', height: '28px', display: 'block', fontSize: '20px', fontWeight: 700, lineHeight: '28px', margin: '0 0 8px 0' }}>
                              Personal Information
                            </label>
                            {/* div[P] → jb-personal-info (inline, 8 children) */}
                            <div>
                              <div style={{ display: 'inline' }}>
                                {/* [0] "Full name" text */}
                                <div style={{ width: '456px', height: '18px', fontSize: '14px', color: 'rgb(66, 66, 66)', marginBottom: '8px' }}>
                                  Full name
                                </div>

                                {/* [1] Title + First Name row: div(flex, 456×56) */}
                                <div style={{ display: 'flex', width: '456px', height: '56px', gap: '8px', marginBottom: '16px' }}>
                                  {/* Title select: div[P] → jb-form-field-container[P] → jb-select[P](flex) */}
                                  <div style={{ width: '104px', flexShrink: 0 }}>
                                    <div>
                                      <JbSelect
                                        label="Title"
                                        value={t.title}
                                        options={titleOptions}
                                        onChange={(v) => setTravelerField('title', v)}
                                        width={104}
                                        ann="ann-21"
                                        annOption={{ id: 'ann-22', value: 'Ms' }}
                                      />
                                    </div>
                                  </div>
                                  {/* First Name: div[P] → div[P] → jb-form-input-field[P](inline) */}
                                  <div style={{ flex: 1 }}>
                                    <div>
                                      <JbFormInput
                                        label="First Name"
                                        value={t.firstName}
                                        onChange={(v) => setTravelerField('firstName', v)}
                                        ann="ann-20"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* [2] Middle Name: div[P] → jb-form-input-field[P](inline) */}
                                <div style={{ marginBottom: '16px' }}>
                                  <JbFormInput
                                    label="Middle (optional)"
                                    value={t.middleName}
                                    onChange={(v) => setTravelerField('middleName', v)}
                                  />
                                </div>

                                {/* [3] Last Name: div[P] → jb-form-input-field[P](inline) */}
                                <div style={{ marginBottom: '16px' }}>
                                  <JbFormInput
                                    label="Last Name"
                                    value={t.lastName}
                                    onChange={(v) => setTravelerField('lastName', v)}
                                  />
                                </div>

                                {/* [4] Add suffix: jb-expandable-sections[P] */}
                                <JbExpandableSection label="Add suffix like Jr. or Sr." />

                                {/* [5] Email: div[P] → jb-form-input-field[P](inline) */}
                                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                                  <JbFormInput
                                    label="Email"
                                    value={t.email}
                                    onChange={(v) => setTravelerField('email', v)}
                                    type="email"
                                    ann="ann-23"
                                  />
                                </div>

                                {/* [6] Gender: div[P] → jb-form-field-container[P] → jb-select[P] */}
                                <div style={{ marginBottom: '16px' }}>
                                  <div>
                                    <JbSelect
                                      label="Gender"
                                      value={t.gender}
                                      options={genderOptions}
                                      onChange={(v) => setTravelerField('gender', v)}
                                      ann="ann-24"
                                      annOption={{ id: 'ann-25', value: 'Female' }}
                                    />
                                  </div>
                                </div>

                                {/* [7] Date of Birth: fieldset → legend "Date of birth" + div(flex) → 3 selects */}
                                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px 0' }}>
                                  <legend style={{ display: 'table', fontSize: '14px', color: 'rgb(66, 66, 66)', marginBottom: '8px', padding: 0 }}>
                                    Date of Birth
                                  </legend>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <div><div>
                                      <JbSelect
                                        label="Month"
                                        value={t.birthMonth}
                                        options={months}
                                        onChange={(v) => setTravelerField('birthMonth', v)}
                                        width={200}
                                        ann="ann-26"
                                        annOption={{ id: 'ann-27', value: '03' }}
                                      />
                                    </div></div>
                                    <div><div>
                                      <JbSelect
                                        label="Day"
                                        value={t.birthDay}
                                        options={days}
                                        onChange={(v) => setTravelerField('birthDay', v)}
                                        width={120}
                                        ann="ann-28"
                                        annOption={{ id: 'ann-29', value: '02' }}
                                      />
                                    </div></div>
                                    <div><div>
                                      <JbSelect
                                        label="Year"
                                        value={t.birthYear}
                                        options={years}
                                        onChange={(v) => setTravelerField('birthYear', v)}
                                        width={120}
                                        ann="ann-30"
                                        annOption={{ id: 'ann-31', value: '1992' }}
                                      />
                                    </div></div>
                                  </div>
                                </fieldset>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===== jb-section "Contact Info" (inline) ===== */}
                        <div style={{ display: 'inline' }}>
                          <label style={{ width: '456px', height: '28px', display: 'block', fontSize: '20px', fontWeight: 700, lineHeight: '28px', margin: '24px 0 8px 0' }}>
                            Contact Info
                          </label>
                          <div>
                            {/* jb-trip-contact-details (inline, 4 children) */}
                            <div style={{ display: 'inline' }}>
                              {/* [0] Address: div(456×112) */}
                              <div style={{ width: '456px', marginBottom: '8px' }}>
                                <JbFormInput
                                  label="Start typing your address"
                                  value={t.address}
                                  onChange={(v) => setTravelerField('address', v)}
                                  ann="ann-33"
                                />
                                <div style={{ marginTop: '4px' }}>
                                  <a href="#" style={{ color: 'rgb(0, 51, 160)', fontSize: '14px', textDecoration: 'none' }}>
                                    Enter address manually
                                  </a>
                                </div>
                              </div>

                              {/* [1] Country/Phone row: div(flex, 456×72) */}
                              <div style={{ display: 'flex', width: '456px', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                  <JbSelect
                                    label="Country"
                                    value={t.country}
                                    options={[
                                      { value: 'US', label: 'United States' },
                                      { value: 'CA', label: 'Canada' },
                                      { value: 'MX', label: 'Mexico' },
                                      { value: 'GB', label: 'United Kingdom' },
                                    ]}
                                    onChange={(v) => setTravelerField('country', v)}
                                    width={224}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <JbFormInput
                                    label="Phone number"
                                    value={t.phone}
                                    onChange={(v) => setTravelerField('phone', v)}
                                    type="tel"
                                  />
                                </div>
                              </div>

                              {/* [2] T&C / Privacy: legend(table, 456×112) */}
                              <div style={{ display: 'table', width: '456px', fontSize: '12px', color: 'rgb(117, 117, 117)', lineHeight: '18px', marginBottom: '8px' }}>
                                By providing my phone number, I agree to receive automated marketing and booking-related text messages from JetBlue.{' '}
                                <a href="#" style={{ color: 'rgb(0, 51, 160)', fontSize: '12px' }}>Terms &amp; Conditions</a>{' '}
                                and{' '}
                                <a href="#" style={{ color: 'rgb(0, 51, 160)', fontSize: '12px' }}>Privacy Policy</a>
                              </div>

                              {/* [3] Add home phone: div(456×24) */}
                              <div style={{ width: '456px', height: '24px' }}>
                                <JbExpandableSection label="Add a home phone" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===== jb-section "Additional Information" (inline) ===== */}
                        <div style={{ display: 'inline' }}>
                          <label style={{ width: '456px', height: '28px', display: 'block', fontSize: '20px', fontWeight: 700, lineHeight: '28px', margin: '24px 0 8px 0' }}>
                            Additional Information
                          </label>
                          <div>
                            {/* jb-additional-info (inline, 4 children = 4 expandable sections) */}
                            <div style={{ display: 'inline' }}>
                              <JbExpandableSection label="Add frequent flyer number" />
                              <JbExpandableSection label="Add known traveler number or redress number" />
                              <JbExpandableSection label="Request wheelchair assistance" />
                              <JbExpandableSection label="Add special service request" />
                            </div>
                          </div>
                        </div>

                        {/* ===== Next button: div(456×56) → [span(inline)→button(inline-flex)→span, jb-button-loading-notifier] ===== */}
                        <div style={{ width: '456px', height: '56px', marginTop: '24px' }}>
                          <span style={{ display: 'inline' }}>
                            <button
                              data-ann="ann-32"
                              onClick={() => navigateToStep('seats')}
                              style={{
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '456px',
                                height: '56px',
                                backgroundColor: 'rgb(0, 51, 160)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              <span style={{ width: '160px', height: '24px', lineHeight: '24px' }}>
                                Next: Seats &amp; Extras
                              </span>
                            </button>
                          </span>
                          {/* jb-button-loading-notifier (inline, empty) */}
                          <div style={{ display: 'inline', height: '20px' }} />
                        </div>

                      </form>
                    </section>
                  </div>
                </section>
              </div>

              {/* jb-expansion-panel 2 (collapsed, 456×58): Emergency Contact */}
              <div style={{ width: '456px', height: '58px' }}>
                <div style={{ width: '456px', height: '57px' }}>
                  <button style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '456px', height: '56px',
                    background: 'none', border: 'none', borderTop: '1px solid rgb(224, 224, 224)',
                    padding: '16px 0', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <span style={{ width: '200px', height: '24px' }}>
                      <div style={{ width: '200px', height: '24px', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, lineHeight: '24px' }}>Emergency Contact</span>
                        <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgb(117, 117, 117)', lineHeight: '24px' }}>Optional</span>
                      </div>
                    </span>
                    <ExpandableIndicator />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* child[3]: mat-card "2. Seats & Extras" (collapsed step card) */}
      <div style={{ width: '616px', marginTop: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '616px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgb(224, 224, 224)' }}>
          <h2 style={{ width: '616px', fontSize: '20px', fontWeight: 400, margin: 0, padding: '24px 32px', color: 'rgb(117, 117, 117)', boxSizing: 'border-box' }}>
            2. Seats &amp; Extras
          </h2>
        </div>
      </div>

      {/* child[4]: empty */}
      <div style={{ width: '616px', height: '0px' }} />

      {/* child[5]: mat-card "3. Review & Pay" (collapsed step card) */}
      <div style={{ width: '616px', marginTop: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '616px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgb(224, 224, 224)' }}>
          <h2 style={{ width: '616px', fontSize: '20px', fontWeight: 400, margin: 0, padding: '24px 32px', color: 'rgb(117, 117, 117)', boxSizing: 'border-box' }}>
            3. Review &amp; Pay
          </h2>
        </div>
      </div>
    </>
  );

  return (
    <CheckoutLayout>
      {leftContent}
    </CheckoutLayout>
  );
}
