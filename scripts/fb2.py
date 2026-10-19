path = "src/storefront/components/StorefrontLayout.jsx"
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    s = f.read()
old = '<div className="footer-bottom">'
new = '<div className="footer-bottom" style={{flexDirection:"column", alignItems:"center", textAlign:"center", gap:"8px"}}>'
s = s.replace(old, new)
with open(path, 'w', encoding='utf-8', errors='ignore') as f:
    f.write(s)
print('ok')
