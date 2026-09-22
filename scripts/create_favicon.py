from PIL import Image, ImageDraw

def create_favicons():
    # Load original logo
    im = Image.open('public/logo.png').convert('RGBA')
    
    # The circle containing the Parliament dome in the "O" of GOV:
    # Let's find the circle center precisely.
    # From earlier crop: x is around 1030 to 2030 (width ~ 1000), y is around 190 to 1190 (height ~ 1000)
    cx, cy, r = 1530, 690, 500
    
    # Crop square around the dome emblem
    size = int(r * 2)
    crop_box = (cx - r, cy - r, cx + r, cy + r)
    cropped = im.crop(crop_box)
    
    # Create circular mask with antialiasing
    mask = Image.new('L', (size * 2, size * 2), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size * 2, size * 2), fill=255)
    mask = mask.resize((size, size), Image.Resampling.LANCZOS)
    
    # Output circle with transparency
    output_circle = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output_circle.paste(cropped, (0, 0), mask=mask)
    
    # Save standard favicon sizes
    output_circle.save('public/favicon-test.png')
    
    # Create multi-size favicon.ico (16, 32, 48, 64, 128, 256)
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icons = [output_circle.resize(s, Image.Resampling.LANCZOS) for s in sizes]
    
    # Save to app/favicon.ico and public/favicon.ico
    icons[0].save(
        'app/favicon.ico',
        format='ICO',
        sizes=sizes,
        append_images=icons[1:]
    )
    icons[0].save(
        'public/favicon.ico',
        format='ICO',
        sizes=sizes,
        append_images=icons[1:]
    )
    
    # Also save standard web icons
    output_circle.resize((32, 32), Image.Resampling.LANCZOS).save('public/favicon-32x32.png')
    output_circle.resize((16, 16), Image.Resampling.LANCZOS).save('public/favicon-16x16.png')
    output_circle.resize((180, 180), Image.Resampling.LANCZOS).save('public/apple-touch-icon.png')
    output_circle.resize((192, 192), Image.Resampling.LANCZOS).save('public/icon-192.png')
    output_circle.resize((512, 512), Image.Resampling.LANCZOS).save('public/icon-512.png')
    
    print("Favicons successfully generated!")

if __name__ == '__main__':
    create_favicons()
