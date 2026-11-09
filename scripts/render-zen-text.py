"""ZEN SERIF 글자 이미지 만들기

ZEN SERIF 라이선스에 '폰트 파일 수정·재배포 금지'가 있어서, 폰트 파일은 저장소에 넣지 않고
피그마처럼 글자를 이미지(3배 크기 PNG)로 뽑아서 써요.
글자를 바꾸거나 새로 추가하려면 아래 ITEMS를 고치고, 폰트가 설치된 컴퓨터에서 실행하세요.

    pip install playwright && playwright install chromium
    python scripts/render-zen-text.py ~/Library/Fonts/ZEN-SERIF-Regular.otf

결과: src/assets/frequency/v2/<이름>.png
"""

import base64
import pathlib
import sys

from playwright.sync_api import sync_playwright

TITLE = 'display:inline-block;height:48px;font-size:40px;line-height:1.2;color:#000'
VIBE = 'width:129px;height:29px;font-size:26px;letter-spacing:-0.52px;color:#000;text-align:center'

# (파일 이름, 글자, 스타일) — 크기는 피그마 글자 상자 그대로예요
ITEMS = [
    ('text-me', 'Me', 'width:61px;height:42px;font-size:32px;color:#000'),
    ('text-friend', 'Friend', 'width:131px;height:42px;font-size:32px;color:#000'),
    ('vibe-fire', 'Fire Vibe', VIBE),
    ('vibe-water', 'Water Vibe', VIBE),
    ('vibe-wood', 'Wood Vibe', VIBE),
    ('vibe-earth', 'Earth Vibe', VIBE),
    ('vibe-metal', 'Metal Vibe', VIBE),
    ('lucky-signal', 'Lucky signal', 'width:280px;height:47px;font-size:36px;letter-spacing:-0.72px;color:#fff;text-align:center'),
    # 필요한 기운 확인 화면 제목 (src/data/energy.ts 의 key / title 과 맞춰요)
    ('need-title-water-contact', '물부처의 기운', TITLE),
    ('need-title-water', '물의 기운', TITLE),
    ('need-title-fire', '불의 기운', TITLE),
    ('need-title-wood', '나무의 기운', TITLE),
    ('need-title-metal', '금의 기운', TITLE),
    ('need-title-earth', '흙의 기운', TITLE),
]


def main() -> None:
    font_path = pathlib.Path(sys.argv[1]).expanduser()
    out = pathlib.Path(__file__).resolve().parent.parent / 'src/assets/frequency/v2'
    font = 'data:font/otf;base64,' + base64.b64encode(font_path.read_bytes()).decode()
    html = (
        f"<style>@font-face{{font-family:Z;src:url('{font}')}}"
        'body{margin:0;background:transparent} div{font-family:Z;line-height:normal;white-space:nowrap;margin:20px}</style>'
        + ''.join(f'<div id="{name}" style="{style}">{text}</div>' for name, text, style in ITEMS)
    )
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=3)
        page.set_content(html)
        page.evaluate('document.fonts.load("32px Z", "Me물")')
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(300)
        if not page.evaluate("document.fonts.check('32px Z')"):
            sys.exit('폰트를 읽지 못했어요. 경로를 확인해 주세요.')
        for name, _, _ in ITEMS:
            page.locator('#' + name).screenshot(path=str(out / f'{name}.png'), omit_background=True)
            print('저장:', name)
        browser.close()


if __name__ == '__main__':
    main()
