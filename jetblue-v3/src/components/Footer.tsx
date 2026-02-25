export default function Footer() {
  const externalLinks = new Set(["JetBlue Swag", "Investor Relations", "Careers", "Press Room", "Do not sell my info"]);
  const columns = [
    { title: "Get To Know Us", links: ["Credit Cards", "JetBlue Swag", "Our Planes", "Our Company", "Partner Airlines", "Travel Agents", "Investor Relations", "Careers", "Site Map", "Contact Us"] },
    { title: "Policies", links: ["Legal", "Accessibility", "Contract of Carriage", "Tarmac Delay Plan", "Customer Service Plan", "Privacy", "Modern Slavery", "Optional Services and Fees", "Canada Customer Rights", "Do not sell my info"] },
    { title: "JetBlue In Action", links: ["JetBlue for Good", "Sustainability", "Business With Purpose", "Military", "Press Room"] },
  ];
  return (
    <footer>
      <div className="flex max-w-[1024px] mx-auto" style={{ padding: "32px 44px 0" }}>
        <div className="flex max-w-[1024px]" style={{ flex: 1, gap: "32px" }}>
          {columns.map(col => (
            <section key={col.title} className="flex flex-col" style={{ flex: "1 1 0", minWidth: 0 }}>
              <h2 className="text-[#00205b] text-[16px]" style={{ lineHeight: "24px", padding: "0 0 4px", fontWeight: 700 }}>{col.title}</h2>
              <div className="flex flex-col"><div><nav>
                {col.links.map(link => (
                  <a key={link} href="#" className="text-[14px] text-[#0033a0] block" style={{ lineHeight: "24px", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
                    {link}
                    {externalLinks.has(link) && (
                      <svg width="10" height="10" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m.5 6.5 6-6M2 .5h4.5V5" /></svg>
                    )}
                  </a>
                ))}
              </nav></div></div>
            </section>
          ))}
        </div>
        <div style={{ maxWidth: "1024px", padding: "0 16px", width: "280px" }}>
          <section>
            <h2 className="text-[#00205b] text-[16px]" style={{ lineHeight: "24px", fontWeight: 700 }}>Stay Connected</h2>
            <div className="flex items-center" style={{ marginTop: "12px", gap: "4px" }}>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: "4px" }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="rgb(0,51,160)" strokeWidth="1.5" fill="none" /><path d="M22 6l-10 7L2 6" stroke="rgb(0,51,160)" strokeWidth="1.5" fill="none" /></svg>
                <span className="text-[14px] text-[#0033a0]" style={{ fontWeight: 700 }}>Join our email list</span>
                <svg width="10" height="10" viewBox="0 0 7 7" fill="none" stroke="rgb(0,51,160)" strokeLinecap="round" strokeLinejoin="round"><path d="m.5 6.5 6-6M2 .5h4.5V5" /></svg>
              </a>
            </div>
            <div className="flex items-center" style={{ marginTop: "12px", gap: "4px" }}>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: "4px" }}><rect x="5" y="2" width="14" height="20" rx="3" stroke="rgb(0,51,160)" strokeWidth="1.5" /><circle cx="12" cy="18" r="1" fill="rgb(0,51,160)" /></svg>
                <span className="text-[14px] text-[#0033a0]" style={{ fontWeight: 700 }}>Download the JetBlue mobile app</span>
              </a>
            </div>
            <div className="flex" style={{ marginTop: "16px", gap: "12px" }}>
              {["f", "ig", "tw", "yt"].map((icon, i) => (
                <a key={i} href="#" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgb(0,32,91)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", cursor: "pointer" }}>
                  <span style={{ color: "rgb(0,32,91)", fontSize: "14px", fontWeight: 700 }}>{icon}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="max-w-[1024px] mx-auto" style={{ padding: "16px 44px 0" }}>
        <a href="#" className="text-[14px] text-[#0033a0]" style={{ fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          See help topics
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" fill="currentColor" /></svg>
        </a>
      </div>
      <hr style={{ border: 0, borderTop: "1px solid #d3d3d3", margin: "16px 0 0" }} />
      <div className="flex max-w-[1024px] mx-auto" style={{ padding: "16px 44px" }}>
        <div className="text-[12px] text-[#757575]" style={{ lineHeight: "18px" }}>
          <div>&copy;2026 JetBlue Airways</div>
        </div>
      </div>
    </footer>
  );
}