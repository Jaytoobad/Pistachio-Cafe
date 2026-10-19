path = "src/storefront/components/StorefrontLayout.jsx"
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    s = f.read()
s = s.replace('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">')
with open(path, 'w', encoding='utf-8', errors='ignore') as f:
    f.write(s)
print('ok')
