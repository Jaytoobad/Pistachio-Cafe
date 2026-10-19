path = "src/storefront/components/StorefrontLayout.jsx"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

# Replace imports to include getContact, and update contact handling
# Add getContact to imports from config
s2 = s.replace("import { BRAND, HOURS, CONTACT, IMAGES, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL, HAS_FACEBOOK, HAS_X, HAS_TIKTOK } from '../config';",
               "import { BRAND, HOURS, CONTACT, IMAGES, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL, HAS_FACEBOOK, HAS_X, HAS_TIKTOK, getContact } from '../config';")
if s2 != s:
    s = s2
else:
    # try to add getContact
    if 'getContact' not in s:
        s = s.replace("HAS_TIKTOK } from '../config';", "HAS_TIKTOK, getContact } from '../config';")

with open(path, 'w', encoding='utf-8') as f:
    f.write(s)
print('ok')
