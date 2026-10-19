path = "src/storefront/components/StorefrontLayout.jsx"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
# replace with simpler regex-based approach
s = s.replace("{HAS_FACEBOOK", "<!-- fb removed")
s = s.replace("{HAS_X", "<!-- x removed")
s = s.replace("{HAS_TIKTOK", "<!-- tiktok removed")
with open(path, 'w', encoding='utf-8') as f:
    f.write(s)
print('ok')
