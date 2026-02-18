#!/usr/bin/env python3
"""
Instagram 发布脚本

使用 instagrapi 库发布图片或相册到 Instagram
支持 session 持久化以减少登录频率

用法:
    # 发布单张图片
    python src/scripts/post-instagram.py photo <image_path> <caption>
    # 发布相册（多张图片轮播）
    python src/scripts/post-instagram.py album <image_dir> <caption>

环境变量:
    IG_USERNAME      - Instagram 用户名
    IG_PASSWORD      - Instagram 密码
    IG_SESSION_PATH  - Session 文件路径 (可选, 默认 ~/.instagram/session.json)
"""

import sys
import os
import json
import time
import argparse
from pathlib import Path

try:
    from instagrapi import Client
    from instagrapi.exceptions import (
        LoginRequired,
        ChallengeRequired,
        TwoFactorRequired,
    )
except ImportError:
    print("❌ instagrapi 未安装，请运行: bash install.sh")
    sys.exit(1)


def get_session_path(custom_path=None):
    if custom_path:
        return Path(custom_path)
    env_path = os.environ.get("IG_SESSION_PATH")
    if env_path:
        return Path(env_path)
    return Path.home() / ".instagram" / "session.json"


def login(cl, username, password, session_path):
    """尝试用 session 登录，失败则用密码登录"""
    session_path = Path(session_path)

    if session_path.exists():
        try:
            cl.load_settings(session_path)
            cl.login(username, password)
            cl.get_timeline_feed()
            print(f"✅ 使用已保存的 session 登录成功")
            return True
        except (LoginRequired, ChallengeRequired, Exception) as e:
            print(f"⚠️  Session 过期，重新登录... ({e})")
            cl = Client()

    try:
        cl.login(username, password)
        session_path.parent.mkdir(parents=True, exist_ok=True)
        cl.dump_settings(session_path)
        print(f"✅ 密码登录成功，session 已保存到 {session_path}")
        return True
    except TwoFactorRequired:
        print("❌ 需要两步验证 (2FA)，请在 IG_2FA_CODE 环境变量中提供验证码")
        code = os.environ.get("IG_2FA_CODE")
        if code:
            cl.login(username, password, verification_code=code)
            session_path.parent.mkdir(parents=True, exist_ok=True)
            cl.dump_settings(session_path)
            print("✅ 2FA 登录成功")
            return True
        return False
    except ChallengeRequired:
        print("❌ Instagram 需要验证（Challenge Required）")
        print("   建议：先在手机上登录 Instagram 完成验证，然后重试")
        return False
    except Exception as e:
        print(f"❌ 登录失败: {e}")
        return False


def post_photo(cl, image_path, caption):
    """发布单张图片到 Instagram feed"""
    image_path = Path(image_path)

    if not image_path.exists():
        print(f"❌ 图片文件不存在: {image_path}")
        return None

    file_size_mb = image_path.stat().st_size / (1024 * 1024)
    print(f"📸 上传图片: {image_path.name} ({file_size_mb:.1f} MB)")
    print(f"📝 Caption 长度: {len(caption)} 字符")

    try:
        media = cl.photo_upload(str(image_path), caption)
        print(f"✅ 发布成功!")
        print(f"   Media ID: {media.pk}")
        print(f"   URL: https://www.instagram.com/p/{media.code}/")
        return media
    except Exception as e:
        print(f"❌ 发布失败: {e}")
        return None


def resize_for_instagram(image_files, max_width=1440):
    """缩放图片到 Instagram 兼容尺寸，返回处理后的路径列表"""
    from PIL import Image

    resized = []
    for f in image_files:
        img = Image.open(f)
        if img.width > max_width:
            ratio = max_width / img.width
            new_size = (max_width, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)

        # 转为 JPEG（Instagram 更友好）
        jpeg_path = f.with_suffix(".jpg")
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(str(jpeg_path), "JPEG", quality=92)
        resized.append(jpeg_path)
        size_mb = jpeg_path.stat().st_size / (1024 * 1024)
        print(f"   ✅ {jpeg_path.name} ({img.width}x{img.height}, {size_mb:.1f} MB)")

    return resized


def post_album(cl, image_dir, caption):
    """发布相册（多张图片轮播）到 Instagram feed"""
    image_dir = Path(image_dir)

    if not image_dir.exists() or not image_dir.is_dir():
        print(f"❌ 图片目录不存在: {image_dir}")
        return None

    image_files = sorted(
        [f for f in image_dir.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg")],
        key=lambda f: f.name,
    )

    if not image_files:
        print(f"❌ 目录中没有图片文件: {image_dir}")
        return None

    # 去掉最后一张（通常是结束页/致辞页）
    if len(image_files) > 1:
        print(f"   跳过最后一页: {image_files[-1].name}")
        image_files = image_files[:-1]

    # Instagram 相册最多 10 张
    if len(image_files) > 10:
        print(f"⚠️  Instagram 相册最多 10 张，截取前 10 张（共 {len(image_files)} 张）")
        image_files = image_files[:10]

    print(f"📑 相册模式: {len(image_files)} 张图片")
    print(f"   缩放并转换为 JPEG...")
    resized_files = resize_for_instagram(image_files)

    print(f"📝 Caption 长度: {len(caption)} 字符")

    try:
        paths = [str(f) for f in resized_files]
        media = cl.album_upload(paths, caption)
        print(f"✅ 相册发布成功!")
        print(f"   Media ID: {media.pk}")
        print(f"   URL: https://www.instagram.com/p/{media.code}/")
        return media
    except Exception as e:
        print(f"❌ 相册发布失败: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Post to Instagram")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    photo_parser = subparsers.add_parser("photo", help="Post a single photo")
    photo_parser.add_argument("image_path", help="Path to the image file")
    photo_parser.add_argument("caption", help="Post caption text")
    photo_parser.add_argument("--session", help="Custom session file path", default=None)

    album_parser = subparsers.add_parser("album", help="Post an album (carousel)")
    album_parser.add_argument("image_dir", help="Directory containing images")
    album_parser.add_argument("caption", help="Post caption text")
    album_parser.add_argument("--session", help="Custom session file path", default=None)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    username = os.environ.get("IG_USERNAME")
    password = os.environ.get("IG_PASSWORD")

    if not username or not password:
        print("❌ 请设置环境变量 IG_USERNAME 和 IG_PASSWORD")
        sys.exit(1)

    session_path = get_session_path(getattr(args, "session", None))

    cl = Client()
    cl.delay_range = [1, 3]

    if not login(cl, username, password, session_path):
        sys.exit(1)

    if args.command == "photo":
        media = post_photo(cl, args.image_path, args.caption)
    elif args.command == "album":
        media = post_album(cl, args.image_dir, args.caption)
    else:
        parser.print_help()
        sys.exit(1)

    if media is None:
        sys.exit(1)

    result = {"success": True, "media_id": str(media.pk), "code": media.code}
    print(f"\n📋 Result: {json.dumps(result)}")


if __name__ == "__main__":
    main()
