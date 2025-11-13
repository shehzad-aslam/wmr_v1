from flask import Flask, request, send_file
import io
from PIL import Image
import cv2
import numpy as np
from watermark_remover_prototype import detect_watermark_mask, inpaint_opencv

app = Flask(__name__)

@app.route('/detect-mask', methods=['POST'])
def detect_mask():
    f = request.files.get('image')
    if not f:
        return 'no image', 400
    img = Image.open(f.stream).convert('RGB')
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    mask = detect_watermark_mask(img_cv)
    _, buffer = cv2.imencode('.png', mask)
    return send_file(io.BytesIO(buffer.tobytes()), mimetype='image/png')

@app.route('/inpaint', methods=['POST'])
def inpaint():
    f = request.files.get('image')
    m = request.files.get('mask')
    if not f:
        return 'no image', 400
    img = Image.open(f.stream).convert('RGB')
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    if m:
        mask_img = Image.open(m.stream).convert('L')
        mask_cv = np.array(mask_img)
    else:
        mask_cv = detect_watermark_mask(img_cv)
    out = inpaint_opencv(img_cv, mask_cv)
    _, buffer = cv2.imencode('.png', out)
    return send_file(io.BytesIO(buffer.tobytes()), mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
