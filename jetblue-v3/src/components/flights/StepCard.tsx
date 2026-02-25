/**
 * StepCard -- collapsed accordion step header.
 * Structure from PropertySpec state 44:
 *   div [P] -> mat-card(flex,col,616px) -> h2 "N. Step Name"
 *
 * The last card (Review & Pay) uses div#auto-checkout-payment-container as its wrapper.
 */

interface StepCardProps {
  label: string;
  id?: string;
}

export default function StepCard({ label, id }: StepCardProps) {
  return (
    // div [P]
    <div id={id} style={{ width: '616px', marginBottom: '16px' }}>
      {/* mat-card(flex, col) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '616px',
          height: '96px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
          padding: '0 32px',
          boxSizing: 'border-box',
          justifyContent: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 300,
            lineHeight: '96px',
            color: 'rgb(120, 120, 120)',
          }}
        >
          {label}
        </h2>
      </div>
    </div>
  );
}
