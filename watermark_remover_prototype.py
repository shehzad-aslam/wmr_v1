#!/usr/bin/env python3
"""
watermark_remover_prototype.py

Educational prototype...
"""
import argparse
import cv2
import numpy as np
from PIL import Image
import os

try:
    from diffusers import StableDiffusionInpaintPipeline
    import torch
    HAS_SD = True
except Exception:
    HAS_SD = False

def detect_watermark_mask(img_bgr, verbose=False):
    h, w = img_bgr.shape[:2]
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                               cv2.THRESH_BINARY_INV, 21, 10)
    median = np.median(img_bgr.reshape(-1,3), axis=0)
    dist = np.linalg.norm(img_bgr.astype(float) - median[None,None,:], axis=2)
    _, color_mask = cv2.threshold((dist / dist.max() * 255).astype(np.uint8), 120, 255, cv2.THRESH_BINARY)
    combined = cv2.bitwise_or(th, color_mask)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7,7))
    cleaned = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=2)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(cleaned)
    for c in contours:
        area = cv2.contourArea(c)
        if area > (w*h)*0.0005:
            cv2.drawContours(mask, [c], -1, 255, -1)
    if verbose:
        print(f"Detected {len(contours)} contours, mask sum={mask.sum()}")
    return mask

def inpaint_opencv(img_bgr, mask):
    inpainted = cv2.inpaint(img_bgr, (mask>0).astype('uint8'), 3, cv2.INPAINT_TELEA)
    return inpainted

def inpaint_stable_diffusion(img_pil, mask_pil, device='cpu'):
    if not HAS_SD:
        raise RuntimeError("Diffusers or torch not available. Install diffusers, torch, etc.")
    model_id = "runwayml/stable-diffusion-inpainting"
    pipe = StableDiffusionInpaintPipeline.from_pretrained(model_id, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
    if torch.cuda.is_available():
        pipe = pipe.to('cuda')
    else:
        pipe = pipe.to(device)
    prompt = ""
    result = pipe(prompt=prompt, image=img_pil, mask_image=mask_pil, guidance_scale=7.5, num_inference_steps=30)
    out = result.images[0]
    return out

def save_mask(mask, path):
    cv2.imwrite(path, mask)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--mask-out', required=False)
    parser.add_argument('--use-sd', action='store_true')
    parser.add_argument('--verbose', action='store_true')
    args = parser.parse_args()
    img_bgr = cv2.imread(args.input)
    if img_bgr is None:
        raise SystemExit('Could not read input image')
    mask = detect_watermark_mask(img_bgr, verbose=args.verbose)
    if args.mask_out:
        save_mask(mask, args.mask_out)
        if args.verbose:
            print(f"Saved mask to {args.mask_out}. You can refine the mask manually and re-run with --mask-out as input.")
    if args.use_sd:
        if not HAS_SD:
            raise SystemExit('Stable Diffusion not available in environment. Install diffusers and torch.')
        img_pil = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
        mask_pil = Image.fromarray(mask).convert('L')
        out_pil = inpaint_stable_diffusion(img_pil, mask_pil)
        out_pil.save(args.output)
        print(f"Saved SD inpainted result to {args.output}")
    else:
        out_bgr = inpaint_opencv(img_bgr, mask)
        cv2.imwrite(args.output, out_bgr)
        print(f"Saved OpenCV inpainted result to {args.output}")

if __name__ == '__main__':
    main()
