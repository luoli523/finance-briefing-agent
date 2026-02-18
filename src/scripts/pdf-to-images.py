#!/usr/bin/env python3
"""
PDF 转图片工具

将 PDF 文件按页切分为 PNG 图片，输出到与 PDF 同名的目录中

用法:
    python src/scripts/pdf-to-images.py <pdf_path> [--dpi 150]

依赖:
    bash install.sh (自动安装到 .venv)
    macOS: brew install poppler
    Ubuntu: apt-get install poppler-utils
"""

import sys
import argparse
from pathlib import Path

try:
    from pdf2image import convert_from_path
except ImportError:
    print("❌ pdf2image 未安装，请运行: bash install.sh")
    print("   macOS 还需要: brew install poppler")
    sys.exit(1)


def convert_pdf(pdf_path, dpi=150):
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        print(f"❌ PDF 文件不存在: {pdf_path}")
        return None

    output_dir = pdf_path.parent / pdf_path.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    file_size_mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"📄 PDF: {pdf_path.name} ({file_size_mb:.1f} MB)")
    print(f"📁 输出目录: {output_dir}")
    print(f"🔍 DPI: {dpi}")
    print(f"⏳ 正在转换...")

    try:
        images = convert_from_path(str(pdf_path), dpi=dpi)
    except Exception as e:
        print(f"❌ PDF 转换失败: {e}")
        if "poppler" in str(e).lower() or "pdftoppm" in str(e).lower():
            print("   请安装 poppler:")
            print("   macOS:  brew install poppler")
            print("   Ubuntu: apt-get install poppler-utils")
        return None

    output_files = []
    for i, image in enumerate(images):
        filename = f"slide-{i + 1:03d}.png"
        filepath = output_dir / filename
        image.save(str(filepath), "PNG")
        output_files.append(str(filepath))
        print(f"   ✅ {filename} ({image.width}x{image.height})")

    print(f"\n📊 共转换 {len(output_files)} 页")
    return output_files


def main():
    parser = argparse.ArgumentParser(description="Convert PDF to images")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--dpi", type=int, default=150, help="DPI for conversion (default: 150)")
    args = parser.parse_args()

    result = convert_pdf(args.pdf_path, args.dpi)
    if result is None:
        sys.exit(1)

    for f in result:
        print(f)


if __name__ == "__main__":
    main()
