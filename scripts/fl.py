path = "src/styles/storefront.css"
with open(path,'r',encoding='utf-8') as f:
    s = f.read()
css = '''\n.footer-links { list-style: none; padding: 0; margin: 0; }\n.footer-links li { margin-bottom: 10px; }\n.footer-links li:last-child { margin-bottom: 0; }\n'''
if '.footer-links {' in s:
    # replace existing definition if it's simple
    pass
s2 = s
if '.footer-links' not in s2:
    s2 += css
else:
    # ensure list-style reset is there; old-static has it but we imported old-static - maybe add explicit
    if 'list-style: none' not in s2.split('.footer-links')[0][-200:] if '.footer-links' in s2 else False:  # rough
        pass
    # easier: just add our rules
    s2 += css
with open(path,'w',encoding='utf-8') as f:
    f.write(s2)
print('ok')
