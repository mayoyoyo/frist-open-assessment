/**
 * CheckoutSignIn -- top-level view for step="signin".
 * Uses CheckoutLayout. Left panel content from PropertySpec state 44:
 *
 *   Left panel has children:
 *   - div[0]: sign-in card (div [P] -> jb-sign-in [P] (inline) -> div(flex,616px) -> div(616px) -> [text, buttons])
 *   - div[1]: Step card "1. Traveler Details"
 *   - div[2]: Step card "2. Seats & Extras"
 *   - div[3]: Step card "3. Review & Pay" (div#auto-checkout-payment-container [P] -> mat-card -> h2)
 *
 *   Sign-in card inner:
 *     div(552px,78px) -> [p "Sign in" (inline-block,75x28), p "Access your JetBlue..." (552x42)]
 *     div(flex,414px,56px) -> [button#sign-in(flex,200x56) -> span "Sign in",
 *                               button#continue-as-guest(flex,198x56) -> span -> span "Continue as guest" (inline)]
 */
import { navigateToStep } from '../../main';
import CheckoutLayout from './CheckoutLayout';
import StepCard from './StepCard';

export default function CheckoutSignIn() {
  return (
    <CheckoutLayout>
      {/* div[0]: Sign-in card */}
      <div style={{
        width: '616px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
        marginBottom: '16px',
      }}>
        {/* jb-sign-in [P] (display: inline) */}
        <div style={{ display: 'inline' }}>
          {/* div(flex, 616px) */}
          <div style={{ display: 'flex', width: '616px' }}>
            {/* div(616px) - content wrapper */}
            <div style={{ width: '616px', padding: '24px 32px 32px' }}>
              {/* Text section */}
              <div>
                <p
                  style={{
                    display: 'inline-block',
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: '28px',
                  }}
                >
                  Sign in
                </p>
                <p
                  style={{
                    margin: '8px 0 0 0',
                    fontSize: '14px',
                    lineHeight: '21px',
                    color: 'rgb(51, 51, 51)',
                  }}
                >
                  Access your JetBlue Travel Credits. TrueBlue members save time, earn points, and collect tiles toward Mosaic Status.
                </p>
              </div>

              {/* Button section */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '24px',
                }}
              >
                {/* Sign in button */}
                <button
                  id="auto-checkout-sign-in-button"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '199.547px',
                    height: '56px',
                    backgroundColor: 'rgb(0, 32, 91)',
                    color: 'rgb(255, 255, 255)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '16px',
                    padding: 0,
                  }}
                >
                  <span style={{ lineHeight: '24px' }}>
                    Sign in
                  </span>
                </button>

                {/* Continue as guest button */}
                <button
                  id="auto-checkout-continue-as-guest-button"
                  data-ann="ann-19"
                  onClick={() => navigateToStep('traveler')}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '198.453px',
                    height: '56px',
                    backgroundColor: 'transparent',
                    color: 'rgb(0, 32, 91)',
                    border: '2px solid rgb(0, 32, 91)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '16px',
                    padding: 0,
                  }}
                >
                  <span style={{ lineHeight: '24px' }}>
                    <span style={{ display: 'inline' }}>Continue as guest</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step cards */}
      <StepCard label="1. Traveler Details" />
      <StepCard label="2. Seats & Extras" />
      <StepCard label="3. Review & Pay" id="auto-checkout-payment-container" />
    </CheckoutLayout>
  );
}
