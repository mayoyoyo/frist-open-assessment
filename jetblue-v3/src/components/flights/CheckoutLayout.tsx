/**
 * CheckoutLayout -- shared checkout wrapper used by signin, traveler, and extras steps.
 * Structure from PropertySpec state 44:
 *   jb-checkout [P] (display:inline) -> div(1461px) -> div(1024px) -> div [P] (936px) -> div(grid,936px) -> [left(616px), right(296px)]
 *   Left panel: div [P] -> div -> {children}
 *   Right panel: div -> div -> PriceSummary
 */
import PriceSummary from './PriceSummary';

interface CheckoutLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export default function CheckoutLayout({ children, rightPanel }: CheckoutLayoutProps) {
  return (
    // jb-checkout [P] (display: inline)
    <div style={{ display: 'inline' }}>
      {/* div(1461px) */}
      <div style={{ width: '1461px', minHeight: '590px', paddingTop: '44px' }}>
        {/* div(1024px) */}
        <div style={{ width: '1024px', minHeight: '590px', margin: '0 auto' }}>
          {/* div [P] (936px) */}
          <div style={{ width: '936px', minHeight: '590px', margin: '0 auto' }}>
            {/* div(grid, 936px) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '616px 296px',
                gap: '24px',
                width: '936px',
                minHeight: '590px',
              }}
            >
              {/* Left panel: div [P] -> div -> children */}
              <div style={{ width: '616px' }}>
                <div style={{ width: '616px' }}>
                  {children}
                </div>
              </div>

              {/* Right panel: div -> div -> PriceSummary (or custom) */}
              <div style={{ width: '296px' }}>
                <div style={{ width: '296px' }}>
                  {rightPanel ?? <PriceSummary />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
