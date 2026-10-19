path = "src/storefront/pages/Contact.jsx"
with open(path,'r',encoding='utf-8',errors='ignore') as f:
    s = f.read()
if "getContact" not in s:
    s = s.replace("import { BRAND, HOURS, CONTACT, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL } from '../config';",
                  "import { BRAND, HOURS, CONTACT, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL, getContact } from '../config';")
with open(path,'w',encoding='utf-8',errors='ignore') as f:
    f.write(s)
print('ok')
