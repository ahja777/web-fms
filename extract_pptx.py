# -*- coding: utf-8 -*-
from pptx import Presentation
import json
import os

pptx_path = r'C:\Claude_AI\backdata\A0203_G02_보고서설계서(디지털물류네트워크)_Shipping_V1.0.pptx'
output_path = r'C:\Claude_AI\report_design.json'

prs = Presentation(pptx_path)

reports = []
for idx, slide in enumerate(prs.slides, 1):
    slide_texts = []
    for shape in slide.shapes:
        if hasattr(shape, 'text') and shape.text.strip():
            slide_texts.append(shape.text.strip())
    if slide_texts:
        reports.append({'slide': idx, 'texts': slide_texts})

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(reports, f, ensure_ascii=False, indent=2)

print(f'Saved {len(reports)} slides to {output_path}')
