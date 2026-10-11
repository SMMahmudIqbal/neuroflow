"""
Sample Visual Dataset Generator
Generates curated mathematical/geometric pattern images for demonstration
Developed by S. M. Mahmud Iqbal
"""

from typing import List
from PIL import Image, ImageDraw
import io
import base64
from vision_engine import ImageItem, VisionLatentEngine

def generate_sample_images(engine: VisionLatentEngine) -> List[ImageItem]:
    categories = [
        ("Cosmic Nebula", [(15, 23, 42), (99, 102, 241), (192, 132, 252)], 4),
        ("Cyberpunk Neon", [(5, 10, 20), (6, 182, 212), (244, 63, 94)], 4),
        ("Emerald Biosphere", [(6, 40, 25), (16, 185, 129), (52, 211, 153)], 4),
        ("Solar Flare", [(40, 10, 5), (249, 115, 22), (234, 179, 8)], 4),
    ]

    items: List[ImageItem] = []

    for cat_name, palette, count in categories:
        for idx in range(count):
            img = Image.new("RGB", (128, 128), color=palette[0])
            draw = ImageDraw.Draw(img)

            # Draw procedural artistic shapes
            if "Cosmic" in cat_name:
                draw.ellipse([20 + idx*5, 20, 100 - idx*5, 100], fill=palette[1], outline=palette[2])
                draw.ellipse([45, 45, 85, 85], fill=palette[2])
            elif "Cyberpunk" in cat_name:
                draw.rectangle([15, 15 + idx*10, 110, 60 + idx*10], fill=palette[1], outline=palette[2])
                draw.line([0, 0, 128, 128], fill=palette[2], width=3)
            elif "Emerald" in cat_name:
                draw.polygon([(64, 15), (115, 105), (15, 105)], fill=palette[1], outline=palette[2])
                draw.ellipse([50, 50, 78, 78], fill=palette[2])
            else:
                draw.pieslice([10, 10, 118, 118], start=30*idx, end=180 + 30*idx, fill=palette[1], outline=palette[2])

            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            img_bytes = buf.getvalue()
            b64_str = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode('utf-8')

            features, dominant_hex, brightness = engine.extract_visual_features(img_bytes)

            items.append(
                ImageItem(
                    id=f"vis-{cat_name.lower().replace(' ', '-')}-{idx+1}",
                    title=f"{cat_name} #{idx+1}",
                    category=cat_name,
                    imageUrl=b64_str,
                    features=features
                )
            )

    return items
