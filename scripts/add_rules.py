path = "src/styles/storefront.css"
with open(path,'r',encoding='utf-8') as f:
    s = f.read()
rules = '''\n/* Global safety rules for storefront */\nsvg { display: inline-block; max-width: 100%; height: auto; }\n.social-row svg, .cart-link svg, .nav-toggle svg, .footer-links svg { width: 20px; height: 20px; flex: none; }\n'''
if 'social-row svg' not in s:
    s += rules
    with open(path,'w',encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('exists')
