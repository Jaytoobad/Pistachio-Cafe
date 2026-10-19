path = "src/storefront/pages/policy/DeliveryInfo.jsx"
with open(path,'r',encoding='utf-8',errors='ignore') as f:
    s = f.read()
if "getContact" not in s:
    s = s.replace("import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP, DELIVERY_ZONES, DEFAULT_DELIVERY_ZONE } from '../../config';",
                  "import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP, DELIVERY_ZONES, DEFAULT_DELIVERY_ZONE, getContact } from '../../config';")
with open(path,'w',encoding='utf-8',errors='ignore') as f:
    f.write(s)
print('ok')
