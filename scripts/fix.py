path = "src/storefront/components/StorefrontLayout.jsx"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
old = "import '../../styles/storefront.css';"
new = "import '../../styles/storefront.css';\nimport '../../styles/old-static.css';"
if new not in s:
    s = s.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('exists')
