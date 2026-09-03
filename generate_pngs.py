import os
import zlib
import struct

def make_valid_png(width, height, color_rgb=(16, 185, 129)):
    # PNG Signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk: width, height, bit_depth=8, color_type=2 (RGB), compression=0, filter=0, interlace=0
    ihdr_body = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_body) & 0xffffffff
    png.extend(struct.pack('>I', len(ihdr_body)))
    png.extend(b'IHDR')
    png.extend(ihdr_body)
    png.extend(struct.pack('>I', ihdr_crc))
    
    # Raw pixel data with filter byte 0 at start of each scanline
    r, g, b = color_rgb
    scanline = bytes([0]) + bytes([r, g, b]) * width
    raw_pixels = scanline * height
    
    # IDAT chunk
    compressed = zlib.compress(raw_pixels)
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    return bytes(png)

assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
os.makedirs(assets_dir, exist_ok=True)

emerald_png = make_valid_png(512, 512, (16, 185, 129))

files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png']
for f_name in files:
    file_path = os.path.join(assets_dir, f_name)
    with open(file_path, 'wb') as f:
        f.write(emerald_png)
    print(f"Generated valid PNG: {file_path}")
