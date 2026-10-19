path = "src/storefront/components/StorefrontLayout.jsx"
with open(path,'r',encoding='utf-8') as f:
    s = f.read()
# simpler replacement
old = """            <span>© 2026 Pistachio Café. All rights reserved.</span>
            <span>Made with care, one plate at a time.</span>"""
new = """            <div style={{display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'center'}}>
              <span>© 2026 Pistachio Café. All rights reserved.</span>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/delivery-info">Delivery info</a>
            </div>
            <span>Made with care, one plate at a time.</span>"""
# handle encoding chars
s2 = s.replace('All rights reserved.', 'All rights reserved.')
s = s.replace(old, new) if old in s else s
# fallback
if 'Privacy' not in s and 'footer-bottom' in s:
    s = s.replace('Made with care, one plate at a time.</span>', 'Made with care, one plate at a time.</span>')
with open(path,'w',encoding='utf-8') as f:
    f.write(s)
print('check')
