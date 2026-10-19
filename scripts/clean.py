path = "src/storefront/components/StorefrontLayout.jsx"
with open(path,'r',encoding='utf-8',errors='ignore') as f:
    s = f.read()
s = s.replace("X (Twitter)", "X")
with open(path,'w',encoding='utf-8',errors='ignore') as f:
    f.write(s)
print('ok')
