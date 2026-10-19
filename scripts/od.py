path = "src/admin/pages/OrderDetail.jsx"
with open(path,'r',encoding='utf-8',errors='ignore') as f:
    s = f.read()
old = "  const waLink = `https://wa.me/${toWhatsAppNumber(order.phone)}?text=${encodeURIComponent(waText)}`;"
new = """  const waNum = toWhatsAppNumber(order.phone);
  const isRealWa = waNum && waNum !== '233000000000' && /[1-9]/.test(waNum);
  const waLink = isRealWa ? `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}` : null;"""
if old in s:
    s = s.replace(old, new)
with open(path,'w',encoding='utf-8',errors='ignore') as f:
    f.write(s)
print('ok')
