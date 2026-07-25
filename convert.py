import base64
import os

pdf_path = r"C:\Users\HP\.gemini\antigravity\scratch\magazine-website\Magazine\2,Grp1_Hindi_SSbA_24pages_1+5Copies-compressed.pdf"
js_path = r"C:\Users\HP\.gemini\antigravity\scratch\magazine-website\Magazine\pdfData.js"

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} does not exist!")
    exit(1)

print("Reading PDF...")
with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

print("Encoding to base64...")
base64_str = base64.b64encode(pdf_bytes).decode("utf-8")

print(f"Writing to {js_path}...")
with open(js_path, "w", encoding="utf-8") as f:
    f.write(f'window.magazinePdfData = "{base64_str}";')

print("Success!")
