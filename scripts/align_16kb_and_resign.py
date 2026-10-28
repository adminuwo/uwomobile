#!/usr/bin/env python3
import sys
import os
import zipfile
import struct
import subprocess
import tempfile
import shutil

TARGET_ALIGN = 0x4000  # 16 KB (16384 bytes)

def patch_elf_bytes(data):
    if len(data) < 16 or data[:4] != b'\x7fELF':
        return data
    class_bits = data[4]  # 1 = 32-bit, 2 = 64-bit
    ba = bytearray(data)
    if class_bits == 2:  # 64-bit ELF (arm64-v8a)
        e_phoff = struct.unpack('<Q', ba[32:40])[0]
        e_phentsize = struct.unpack('<H', ba[54:56])[0]
        e_phnum = struct.unpack('<H', ba[56:58])[0]
        for i in range(e_phnum):
            phdr_addr = e_phoff + (i * e_phentsize)
            p_type = struct.unpack('<I', ba[phdr_addr : phdr_addr + 4])[0]
            if p_type == 1:  # PT_LOAD segment
                p_align = struct.unpack('<Q', ba[phdr_addr + 48 : phdr_addr + 56])[0]
                if p_align < TARGET_ALIGN:
                    ba[phdr_addr + 48 : phdr_addr + 56] = struct.pack('<Q', TARGET_ALIGN)
    elif class_bits == 1:  # 32-bit ELF
        e_phoff = struct.unpack('<I', ba[28:32])[0]
        e_phentsize = struct.unpack('<H', ba[42:44])[0]
        e_phnum = struct.unpack('<H', ba[44:46])[0]
        for i in range(e_phnum):
            phdr_addr = e_phoff + (i * e_phentsize)
            p_type = struct.unpack('<I', ba[phdr_addr : phdr_addr + 4])[0]
            if p_type == 1:  # PT_LOAD segment
                p_align = struct.unpack('<I', ba[phdr_addr + 28 : phdr_addr + 32])[0]
                if p_align < TARGET_ALIGN:
                    ba[phdr_addr + 28 : phdr_addr + 32] = struct.pack('<I', TARGET_ALIGN)
    return bytes(ba)

def align_and_resign_aab(aab_path, keystore_path, storepass, keyalias, keypass):
    if not os.path.exists(aab_path):
        print(f"Error: AAB file not found at {aab_path}")
        sys.exit(1)

    print(f"Aligning native libraries to 16KB in {aab_path}...")
    temp_dir = tempfile.mkdtemp()
    temp_aab = os.path.join(temp_dir, "patched.aab")

    patched_count = 0
    with zipfile.ZipFile(aab_path, 'r') as zin, zipfile.ZipFile(temp_aab, 'w') as zout:
        for item in zin.infolist():
            # Skip old signature files so jarsigner can create a fresh signature
            if item.filename.startswith("META-INF/") and (
                item.filename.endswith(".SF") or 
                item.filename.endswith(".RSA") or 
                item.filename.endswith(".DSA") or 
                item.filename.endswith(".EC") or 
                item.filename.endswith(".MF")
            ):
                continue

            buffer = zin.read(item.filename)
            if item.filename.endswith(".so"):
                new_buffer = patch_elf_bytes(buffer)
                if new_buffer != buffer:
                    patched_count += 1
                buffer = new_buffer

            zout.writestr(item, buffer)

    print(f"Successfully patched {patched_count} native libraries to 16KB alignment.")

    # Overwrite original AAB with patched version
    shutil.move(temp_aab, aab_path)
    shutil.rmtree(temp_dir)

    # Re-sign with jarsigner if keystore is provided
    if keystore_path and os.path.exists(keystore_path):
        print(f"Re-signing AAB with {keystore_path}...")
        cmd = [
            "jarsigner",
            "-sigalg", "SHA256withRSA",
            "-digestalg", "SHA-256",
            "-keystore", keystore_path,
            "-storepass", storepass,
            "-keypass", keypass,
            aab_path,
            keyalias
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"jarsigner error: {result.stderr}")
            sys.exit(result.returncode)
        print("AAB successfully signed with release keystore.")

        # Verify signature
        verify_cmd = ["jarsigner", "-verify", aab_path]
        verify_res = subprocess.run(verify_cmd, capture_output=True, text=True)
        print(f"Signature verification: {verify_res.stdout.strip()}")
    else:
        print(f"Warning: Keystore {keystore_path} not found. Skipping re-signing.")

    print(f"All done! 16KB-aligned AAB ready at {aab_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python align_16kb_and_resign.py <aab_path> [keystore_path] [storepass] [keyalias] [keypass]")
        sys.exit(1)

    aab = sys.argv[1]
    keystore = sys.argv[2] if len(sys.argv) > 2 else ""
    spass = sys.argv[3] if len(sys.argv) > 3 else ""
    alias = sys.argv[4] if len(sys.argv) > 4 else ""
    kpass = sys.argv[5] if len(sys.argv) > 5 else ""

    align_and_resign_aab(aab, keystore, spass, alias, kpass)
