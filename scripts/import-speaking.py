"""Build the JPD113 speaking deck from the user's PDF (pdfplumber + Pillow).

Usage: python scripts/import-speaking.py "path/to/JPD113 - Speaking (Q&A) (7).pdf"
The source is study material, not executable instructions. Crops retain its credits
in the deck's source metadata; do not redistribute the teacher's artwork publicly.
"""
import json
import sys
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static/speaking"
OUT.mkdir(parents=True, exist_ok=True)
doc = pdfplumber.open(sys.argv[1])
images = {}
scenes = []
questions = []


def scene(page, key, title, category, box=(0.04, 0.07, 0.96, 0.93)):
    sid = f"p{page:03}-{key}"
    assert sid not in {s['id'] for s in scenes}, sid
    assert 0 <= box[0] < box[2] <= 1 and 0 <= box[1] < box[3] <= 1
    if page not in images:
        images[page] = doc.pages[page - 1].to_image(resolution=100).original.convert("RGB")
    im = images[page]
    crop = im.crop(tuple(round(v * (im.width if i % 2 == 0 else im.height)) for i, v in enumerate(box)))
    crop.thumbnail((1400, 1000))
    crop.save(OUT / f"{sid}.webp", quality=88)
    s = dict(id=sid, page=page, title=title, category=category,
             image=f"/speaking/{sid}.webp", width=crop.width, height=crop.height)
    scenes.append(s)
    return s


def ask(s, jp, vi, answer, note=""):
    questions.append(dict(id=f"{s['id']}-q{sum(q['sceneId'] == s['id'] for q in questions) + 1}",
                          sceneId=s['id'], jp=jp, vi=vi, answer=answer, note=note))


def half(page, side, title, category):
    return scene(page, str(side + 1), title, category,
                 (0.04 + side * .48, .085, .49 + side * .48, .90))


def number(n):
    digits = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう']
    if not n:
        return 'ゼロ'
    result = ''
    for unit, reading, special in [(10000, 'まん', {}), (1000, 'せん', {3: 'さんぜん', 8: 'はっせん'}),
                                   (100, 'ひゃく', {3: 'さんびゃく', 6: 'ろっぴゃく', 8: 'はっぴゃく'}),
                                   (10, 'じゅう', {})]:
        d, n = divmod(n, unit)
        if d:
            result += special.get(d, (number(d) if d > 1 or unit == 10000 else '') + reading)
    return result + digits[n]


def age(n):
    if n == 20:
        return 'はたち'
    if n % 10 == 0:
        return number(n)[:-3] + 'じゅっさい'
    return number(n - n % 10) + {1: 'いっさい', 8: 'はっさい', 0: 'さい'}.get(n % 10, number(n % 10) + 'さい')


def date(month, day):
    months = {4: 'しがつ', 7: 'しちがつ', 9: 'くがつ'}
    days = {1: 'ついたち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか',
            7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか',
            20: 'はつか', 24: 'にじゅうよっか'}
    return months.get(month, number(month) + 'がつ') + ' ' + days.get(day, number(day) + 'にち')


def clock(h, m=0, period=''):
    hr = {0: 'じゅうにじ', 4: 'よじ', 7: 'しちじ', 9: 'くじ'}.get(h, number(h) + 'じ')
    minutes = {0: '', 10: 'じゅっぷん', 15: 'じゅうごふん', 20: 'にじゅっぷん',
               30: 'はん', 45: 'よんじゅうごふん', 50: 'ごじゅっぷん'}
    return period + hr + minutes[m]


floors = {1: 'いっかい', 2: 'にかい', 3: 'さんがい', 4: 'よんかい', 5: 'ごかい',
          6: 'ろっかい', 7: 'ななかい', 8: 'はっかい', 9: 'きゅうかい', 10: 'じゅっかい', -1: 'ちかいっかい'}
counts = {1: 'ひとつ', 2: 'ふたつ', 3: 'みっつ', 4: 'よっつ', 5: 'いつつ', 6: 'むっつ',
          7: 'ななつ', 8: 'やっつ', 9: 'ここのつ', 10: 'とお'}

# Pages 11–15: use the visible names, not the overlapping PDF text layer.
people = [
    (11, 'オリビア', 'ロシア', 22, 'ふくしまだいがくの がくせい', 'がくせい'),
    (11, 'エリザベス', 'ちゅうごく', 20, 'にほんごがっこうの がくせい', 'がくせい'),
    (12, 'マイケル', 'オーストラリア', 31, 'えいごの きょうし', 'きょうし'),
    (12, 'カルロス', 'ブラジル', 38, 'さくらこうこうの きょうし', 'きょうし'),
    (13, 'ジュリア', 'かんこく', 29, 'ひゃくえんショップの てんいん', 'てんいん'),
    (13, 'ナタリア', 'タイ', 35, 'スーパーの てんいん', 'てんいん'),
    (14, 'フェリシア', 'フランス', 21, 'メイジだいがくの がくせい', 'がくせい'),
    (14, 'クリスティナ', 'ドイツ', 30, 'ふじみこうこうの がくせい', 'がくせい'),
    (15, 'サントス', 'アメリカ', 28, 'フジミこうこうの きょうし', 'きょうし'),
    (15, 'フジハラ', 'にほん', 58, 'にほんごがっこうの きょうし', 'きょうし')]
for i, (p, name, country, years, job, role) in enumerate(people):
    s = half(p, i % 2, name, 'intro')
    ask(s, 'このひとの おなまえは なんですか。', 'Người này tên là gì?', name + 'さんです。')
    ask(s, f'{name}さんの おくには どちらですか。', 'Người này đến từ nước nào?', country + 'です。')
    ask(s, f'{name}さんは どこの くにの ひとですか。', 'Người này là người nước nào?', country + 'じんです。')
    ask(s, f'{name}さんは なんさいですか。', 'Người này bao nhiêu tuổi?', age(years) + 'です。')
    ask(s, f'{name}さんの おしごとは なんですか。', 'Người này làm nghề gì?', job + 'です。')
    ask(s, f'{name}さんは {role}ですか。', 'Xác nhận nghề nghiệp.', 'はい、' + role + 'です。')
    ask(s, f'{name}さんは ベトナムじんですか。', 'Người này có phải người Việt Nam không?', 'いいえ、' + country + 'じんです。')
    if role != 'きょうし' or name != 'マイケル':
        ask(s, f'{name}さんは どこの {role}ですか。', 'Học/làm việc ở đâu?', job + 'です。')
    ask(s, f'{name}さんは {age(years + 1)}ですか。', 'Xác nhận tuổi (câu phủ định).', 'いいえ、' + age(years) + 'です。')

hobbies = [
    (19, 'チルポン', 4, 17, ['りょこう', 'えいが']), (19, 'アベール', 7, 7, ['サッカー', 'すいえい']),
    (20, 'アンジェラ', 9, 4, ['りょうり', 'どくしょ']), (20, 'ベッキー', 8, 20, ['おんがく', 'すいえい']),
    (21, 'オリヴィア', 4, 15, ['すいえい', 'おんがく']), (21, 'ルシアナ', 1, 3, ['りょうり', 'どくしょ']),
    (22, 'ジュリアン', 7, 24, ['すいえい', 'えいが']), (22, 'レオナルド', 5, 8, ['サッカー', 'りょこう']),
    (23, 'ロサリンド', 12, 2, ['テニス', 'りょうり']), (23, 'アナスタシア', 9, 10, ['おんがく', 'どくしょ'])]
for i, (p, name, m, d, hs) in enumerate(hobbies):
    s = half(p, i % 2, name, 'dates')
    ask(s, f'{name}さんの たんじょうびは いつですか。', 'Sinh nhật khi nào?', date(m, d) + 'です。')
    ask(s, f'{name}さんの たんじょうびは なんがつなんにちですか。', 'Sinh nhật ngày mấy tháng mấy?', date(m, d) + 'です。')
    ask(s, f'{name}さんの たんじょうびは {date(m, d)}ですか。', 'Xác nhận ngày sinh nhật.', 'はい、そうです。')
    ask(s, f'{name}さんの たんじょうびは {date(m, d+1)}ですか。', 'Xác nhận ngày sinh nhật (phủ định).', 'いいえ、' + date(m, d) + 'です。')
    ask(s, f'{name}さんの しゅみは なんですか。', 'Sở thích là gì?', 'と '.join(hs) + 'です。', 'Nối hai danh từ bằng と.')
    ask(s, f'{name}さんの しゅみは {hs[0]}ですか。', 'Xác nhận sở thích.', 'はい、そうです。')
    ask(s, f'{name}さんの しゅみは にほんごのべんきょうですか。', 'Xác nhận sở thích (phủ định).', 'いいえ、' + 'と '.join(hs) + 'です。')

for p, events in [(24, [('まつり', 7, 10), ('パーティー', 11, 20), ('はなび', 4, 5), ('ピクニック', 3, 3)]),
                  (25, [('おはなみ', 4, 10), ('おべんとう', 8, 6), ('バーベキュー', 7, 5)])]:
    for i, (event, m, d) in enumerate(events):
        n = len(events)
        s = scene(p, str(i), event, 'dates', (.025 + i * .95/n, .26, .025 + (i+1)*.95/n, .85))
        for word in ['いつ', 'なんがつなんにち']:
            ask(s, f'{event}は {word}ですか。', 'Sự kiện vào ngày nào?', date(m, d) + 'です。')
s = scene(26, 'calendar', 'Lịch sự kiện', 'dates', (.085, .29, .915, .78))
for event, m, d in [('おはなみ', 4, 10), ('テスト', 6, 25), ('まつり', 8, 4), ('りゅうがくせいパーティー', 9, 2), ('バスりょこう', 10, 14)]:
    ask(s, f'{event}は いつですか。', 'Đọc ngày sự kiện trên lịch.', date(m, d) + 'です。')
ask(s, 'ホームステイは いつから いつまでですか。', 'Homestay từ ngày nào đến ngày nào?', date(12, 20) + 'から ' + date(12, 24) + 'までです。')
week = ['げつようび', 'かようび', 'すいようび', 'もくようび', 'きんようび', 'どようび', 'にちようび']
for p, m, first in [(27, 7, 8), (28, 4, 1), (29, 9, 14)]:
    s = scene(p, 'week', f'Lịch tháng {m}', 'dates', (.09, .11, .91, .64))
    for i, day in enumerate(week):
        ask(s, f'{date(m, first+i)}は なんようびですか。', 'Ngày này là thứ mấy? (Theo lịch trong ảnh.)', day + 'です。')
        ask(s, f'{day}は なんがつなんにちですか。', 'Thứ này là ngày mấy tháng mấy? (Theo ảnh.)', date(m, first+i) + 'です。')

buildings = [
    (33, [('レストラン', 5), ('サカイでんき', 4), ('ひゃくえんショップ', 3), ('くつうりば', 2), ('ふくうりば', 2), ('ほんうりば', 2), ('きっさてん', 1), ('ケーキうりば', 1), ('エーティーエム', 1), ('スーパー', -1)]),
    (34, [('レストラン', 6), ('シーディーうりば', 5), ('ほんうりば', 5), ('きっさてん', 5), ('サカイでんき', 4), ('ひゃくえんショップ', 3), ('きっさてん', 3), ('くつうりば', 2), ('ふくうりば', 2), ('はなうりば', 1), ('バー', 1), ('ケーキうりば', 1)]),
    (35, [('きっさてん', 5), ('ひゃくえんショップ', 4), ('ほんや', 3), ('さくらレストラン', 2), ('みどりゆうびんきょく', 1), ('ふじみぎんこう', -1)]),
    (36, [('エービーイーかいしゃ', 5), ('にほんごがっこう', 4), ('はなびょういん', 3), ('きつえんじょ', 2), ('ひまわりとしょかん', 1), ('スーパー', -1)])]
for p, locations in buildings:
    s = scene(p, 'building', 'Sơ đồ tầng', 'floors', (.21, .04, .88, .95) if p in [33, 34] else (.20, .09, .79, .90))
    for place in dict.fromkeys(x[0] for x in locations):
        fs = [floor for name, floor in locations if name == place]
        answer = 'と '.join(floors[f] for f in fs) + 'です。'
        ask(s, f'{place}は なんかいですか。', 'Địa điểm này ở tầng mấy?', answer)
        ask(s, f'{place}は {floors[fs[0]]}ですか。', 'Xác nhận tầng.', 'はい、' + answer)
    toilets = {33: [1, 3, 5], 34: [2, 4, 6]}.get(p)
    if toilets:
        ask(s, 'トイレは なんかいですか。', 'Nhà vệ sinh ở những tầng nào?', 'と '.join(floors[f] for f in toilets) + 'です。')

# Page 38: isolate each object so 「これ」 has an unambiguous referent.
objects = [
    ('とけい', (.06,.34,.18,.53)), ('でんしじしょ', (.22,.34,.34,.53)), ('くつ', (.37,.34,.50,.53)),
    ('カメラ', (.53,.34,.63,.53)), ('スマートフォン', (.66,.34,.77,.53)), ('パソコン', (.78,.34,.91,.53)),
    ('シャツ', (.12,.54,.25,.73)), ('ズボン', (.30,.54,.39,.73)), ('かばん', (.44,.54,.55,.73)),
    ('さいふ', (.63,.54,.73,.73)), ('ティーバッグ', (.75,.54,.83,.73)), ('ペン', (.86,.54,.94,.73)),
    ('とんかつ', (.06,.76,.19,.94)), ('ハンバーグ', (.21,.76,.35,.94)), ('カレー', (.37,.76,.49,.94)),
    ('あぶら', (.535,.73,.595,.94)), ('ワイン', (.64,.73,.72,.94)), ('にほんごのほん', (.75,.73,.825,.94)),
    ('えいごのほん', (.87,.73,.96,.94))]
for i, (obj, box) in enumerate(objects):
    s = scene(38, f'object-{i}', f'Đồ vật {i+1}', 'objects', box)
    ask(s, 'これは にほんごで なんですか。', 'Vật này tiếng Nhật là gì?', obj + 'です。')

for p, orders in [(40, [('ケーキを みっつと みずを ふたつ ください。', (.05,.33,.49,.88)),
                       ('おちゃを よっつと カレーを ひとつ ください。', (.50,.33,.94,.88))]),
                   (41, [('コーヒーを いつつと ジュースを ふたつ ください。', (.05,.33,.49,.88)),
                         ('ビールを みっつと とんかつを ふたつ ください。', (.50,.33,.94,.88))])]:
    for i, (answer, box) in enumerate(orders):
        s = scene(p, str(i), f'Gọi món {i+1}', 'ordering', box)
        ask(s, 'ごちゅうもんを どうぞ。', 'Hãy gọi đủ món và số lượng trong ảnh.', answer, 'Mẫu: Nを số lượng と Nを số lượng ください。')

# (page, item, price, currency, country, brand/restaurant, owner, ingredient, quantity, floor)
products = [
 (45,'とけい',560000,'ドン','ちゅうごく','ローレックス','アインせんせい','',0,0),
 (45,'でんしじしょ',43000,'えん','にほん','カシオ','アドリアンさん','',0,0),
 (46,'くつ',350000,'ドン','ベトナム','アディダス','ナムさん','',0,0),
 (46,'スマートフォン',180000,'えん','アメリカ','アップル','ナタリアさん','',0,0),
 (47,'パソコン',113000,'えん','インド','レノボ','アンジェラさん','',0,0),
 (47,'カメラ',258000,'えん','かんこく','ニーコン','スコットさん','',0,0),
 (48,'ハンバーグ',1670,'えん','','ロッテリア','','ぎゅうにくと やさい',3,3),
 (48,'ケーキ',310,'えん','かんこく','サントリー','','いちご',1,0),
 (49,'パイ',1650,'えん','','マイソン','','りんご',2,0),
 (49,'ジュース',370,'えん','ブラジル','キリン','','りんご',5,0),
 (50,'どんぶり',1350,'えん','','','','とりにくと やさい',4,0),
 (50,'スープ',840,'えん','','','','やさい',2,0),
 (51,'とんかつ',3300,'えん','','ハッピー','','ぶたにく',3,6),
 (51,'ビール',820,'えん','ドイツ','タイガー','','',4,0),
 (52,'さかなりょうり',2350,'えん','','ニコニコ','','さかなと やさい',2,8),
 (52,'ワイン',23600,'えん','フランス','タボルド','','',1,0),
 (53,'ほん',228000,'ドン','','','ナタリアさん','えいご',2,0),
 (53,'ほん',196000,'ドン','','','イサベラさん','にほんご',3,0),
 (54,'シャツ',120,'ドル','タイ','ナイキ','サントスさん','',6,10),
 (54,'ズボン',4650,'ドル','ロシア','リーバイ','マイクさん','',7,0),
 (55,'ペン',528000,'ドン','オーストラリア','パイロット','ベッキーさん','',9,-1),
 (55,'おちゃ',18500,'ドン','ちゅうごく','デリー','ベンジャミンさん','',8,0),
 (56,'さいふ',3280000,'ドン','イタリア','ポールスミス','ナタリアさん','',3,5),
 (56,'かばん',6200000,'ドン','アメリカ','モンブラン','イサベラさん','',1,0),
 (57,'あぶら',228000,'ドン','インド','シンプリー','ナタリアさん','',8,5),
 (57,'トイレットペーパー',98600,'ドン','ちゅうごく','アンアン','イサベラさん','',10,0)]
for i, (p, item, price, currency, country, brand, owner, ingredient, qty, floor) in enumerate(products):
    s = half(p, i % 2, f'Đồ vật / món ăn {i+1}', 'shopping')
    money = number(price) + currency
    ask(s, 'これは なんですか。', 'Đây là gì?', item + 'です。')
    ask(s, f'この{item}は いくらですか。', 'Giá bao nhiêu?', money + 'です。', f'Giá ghi trên đề: {price:,} {currency}. Không tự nhân số lượng với giá vì đề không ghi giá đơn vị.')
    ask(s, f'この{item}は {money}ですか。', 'Xác nhận giá.', 'はい、そうです。')
    if country:
        ask(s, f'これは どこの {item}ですか。', 'Sản xuất ở nước nào?', country + 'の ' + item + 'です。', 'どこの có thể hỏi nước sản xuất hoặc hãng; ở câu này luyện nước sản xuất.')
        ask(s, f'これは にほんの {item}ですか。', 'Có phải hàng Nhật không?', ('はい、そうです。' if country == 'にほん' else 'いいえ、' + country + 'の ' + item + 'です。'))
    if brand:
        ask(s, f'この{item}の ブランドは なんですか。' if not floor or owner else f'これは どこの {item}ですか。', 'Hãng / nhà hàng nào?', brand + 'の ' + item + 'です。', 'Giữ cách viết tên hãng theo slide gốc.')
    if owner:
        ask(s, f'これは だれの {item}ですか。', 'Đồ của ai?', owner + 'の ' + item + 'です。')
    if ingredient:
        ask(s, f'これは なんの {item}ですか。', 'Loại gì / làm từ gì?', ingredient + 'の ' + item + 'です。')
    if qty:
        ask(s, 'いくつ ありますか。', 'Có bao nhiêu? Dùng cách đếm つ.', counts[qty] + ' あります。')
        ask(s, 'ごちゅうもんを どうぞ。', 'Gọi món / yêu cầu số lượng trong ảnh.', item + 'を ' + counts[qty] + ' ください。')
    if floor:
        ask(s, f'{brand if not owner else item + 'うりば'}は なんかいですか。', 'Cửa hàng / quầy ở tầng mấy?', floors[floor] + 'です。')

def hours(s, place, start, end, closed, dayrange=None, note=''):
    if start:
        a, b = start, end
        ask(s, f'{place}は なんじから なんじまでですか。', 'Mở cửa từ mấy giờ đến mấy giờ?', a + 'から ' + b + 'までです。', note)
        ask(s, f'{place}は {a}から {b}までですか。', 'Xác nhận giờ mở và đóng cửa.', 'はい、そうです。', note)
    if dayrange:
        ask(s, f'{place}は なんようびから なんようびまでですか。', 'Mở cửa từ thứ mấy đến thứ mấy?', dayrange + 'です。')
    ask(s, f'{place}の やすみは いつですか。', 'Ngày / buổi nghỉ khi nào?', closed + 'です。')
    ask(s, f'{place}の やすみのひは なんようびですか。', 'Nghỉ thứ mấy?', closed + 'です。')

places = [
 (63,'こうえん',(6,0),(7,0),'どようびと にちようび',None),
 (63,'たいいくかん',(5,30),(9,30),'もくようび',None),
 (64,'ケーキや',None,None,'げつようびと かようび','すいようびから にちようびまで'),
 (64,'ほんや',None,None,'にちようびの ごぜん','げつようびから どようびまで'),
 (65,'くつや',(8,10),(9,50),'きんようびと どようび',None),
 (65,'びょういん',(7,15),(5,0),'もくようび',None),
 (66,'ゆうびんきょく',(8,45),(7,0),'すいようびの ごご',None),
 (66,'スーパー',(9,20),(4,0),'どようびと にちようび',None),
 (67,'としょかん',(7,0),(4,0),'げつようびと すいようび',None),
 (67,'きっさてん',(9,45),(8,0),'かようびの ごご',None),
 (68,'レストラン',(9,30),(7,30),'きんようび',None),
 (68,'かいしゃ',(6,45),(4,30),'どようびの ごごと にちようび',None),
 (69,'ひゃくえんショップ',(10,30),(9,20),'かようびの ごぜん',None),
 (69,'メイジだいがく',(7,10),(5,30),'かようびと もくようび',None)]
for i, (p, place, start, end, closed, days) in enumerate(places):
    s = half(p, i % 2, place, 'hours')
    note = 'Slide ghi giờ mở 6:45–4:30 không có AM/PM; đáp án mẫu hiểu là sáng đến chiều.' if p == 68 and i % 2 else ''
    hours(s, place, clock(*start, 'ごぜん') if start else None, clock(*end, 'ごご') if end else None, closed, days, note)
for p, key, place, start, end, closed, box in [
 (70,'restaurant','ひまわりレストラン',(12,0,''),(10,0,'ごご'),'もくようび',(.105,.14,.47,.53)),
 (70,'hospital','さくらびょういん',(9,30,'ごぜん'),(3,0,'ごご'),'すいようび',(.52,.14,.87,.53)),
 (70,'post','みどりゆうびんきょく',(9,0,'ごぜん'),(5,0,'ごご'),'どようびと にちようび',(.30,.54,.67,.94)),
 (71,'library','さくらとしょかん',(9,0,'ごぜん'),(7,0,'ごご'),'げつようび',(.17,.15,.49,.85)),
 (71,'hospital','さくらびょういん',(9,30,'ごぜん'),(3,0,'ごご'),'すいようび',(.49,.15,.80,.85)),
 (72,'gym','わかばたいいくかん',(8,30,'ごぜん'),(9,0,'ごご'),'もくようび',(.15,.12,.50,.91)),
 (72,'post','みどりゆうびんきょく',(9,0,'ごぜん'),(5,0,'ごご'),'どようびと にちようび',(.50,.12,.87,.91))]:
    s = scene(p, key, place, 'hours', box)
    hours(s, place, clock(*start), clock(*end), closed,
          note='Ảnh không ghi AM/PM; đáp án mẫu dùng giờ hoạt động ban ngày.' if p in [71,72] and key != 'gym' else '')

for i, (name, start, end) in enumerate([
 ('はるやすみ',(1,3),(1,20)), ('なつやすみ',(5,11),(8,14)),
 ('ふゆやすみ',(10,29),(12,10)), ('ホームステイ',(9,9),(9,17))]):
    x, y = i % 2, i // 2
    s = scene(73, str(i), name, 'hours', (.05+x*.48,.215+y*.325,.47+x*.48,.495+y*.325))
    ask(s, f'{name}は いつから いつまでですか。', 'Kỳ nghỉ / homestay từ ngày nào đến ngày nào?', date(*start) + 'から ' + date(*end) + 'までです。')

actions = [
 (78,'チン','まつりへ いきます。'),(78,'マイク','パーティーを します。'),(78,'にしかわ','はなびを みます。'),(78,'かりな','ピクニックを します。'),
 (79,'エレナ','おはなみを します。'),(79,'マルコ','おべんとうを たべます。'),(79,'ケンタ','バーベキューを します。'),
 (80,'マリア','ケーキを たべます。'),(80,'ダニエル','ジュースを のみます。'),(80,'ナタリア','まつりへ いきます。'),
 (81,'スコット','スキーを します。'),(81,'ジェイミ','ごはんを たべます。'),(81,'ハナコ','はなびを みます。'),
 (82,'カルロス','べんきょうします。'),(82,'チン','しんぶんを よみます。'),(82,'アドリアン','おんがくを ききます。'),
 (83,'ジョン','べんきょうします。'),(83,'シュミット','カレーを たべます。'),(83,'サントス','テレビを みます。')]
for p in range(78,84):
    group = [a for a in actions if a[0] == p]
    for i, (_, name, answer) in enumerate(group):
        n = len(group)
        box = (.04+i*.245,.26,.25+i*.245,.86) if p == 78 else (.035+i*.93/n,.19,.035+(i+1)*.93/n,.86)
        s = scene(p, str(i), name, 'actions', box)
        ask(s, f'{name}さんは なにを しますか。', 'Người này làm gì?', answer)
        ask(s, f'{name}さんは べんきょうしますか。', 'Người này có học không?', 'はい、べんきょうします。' if answer == 'べんきょうします。' else 'いいえ、' + answer)

destinations = [
 (84,'カタリナ','ほっかいどう','スキーを します。'),(84,'カルロス','あおもり','おはなみを します。'),
 (85,'ハナコ','はかた','まつりへ いきます。'),(85,'ハヤオ','こうえん','バーベキューを します。'),
 (86,'エンマ','きっさてん','コーヒーを のみます。'),(86,'エレナ','スーパー','かいものを します。'),
 (87,'ジョン','としょかん','ほんを よみます。'),(87,'ジュン','うち','べんきょうします。'),
 (88,'ミサキ','うち','おんがくを ききます。'),(88,'ミゲル','うち','シーディーを ききます。')]
for i, (p, name, place, action) in enumerate(destinations):
    top = i % 2 == 0
    s = scene(p, str(i % 2), name, 'destinations', (.13,.16 if top else .54,.90,.50 if top else .90))
    home = place == 'うち'
    ask(s, f'{name}さんは どこへ いきますか。', 'Người này đi đâu?', 'どこへも いきません。うちで ' + action if home else place + 'へ いきます。', 'Dấu X: không đi đâu; dùng どこへも いきません。' if home else '')
    ask(s, f'{name}さんは {place}で なにを しますか。', 'Làm gì tại địa điểm đó?', place + 'で ' + action)
    ask(s, f'{name}さんは なにを しますか。', 'Nêu hoạt động theo tranh.', action)

activity_places = [
 (90,'Tổng hợp địa điểm','きっさてん','コーヒーを のみます。',(.115,.31,.44,.835)),
 (91,'Quán cà phê','きっさてん','コーヒーを のみます。',(.06,.18,.30,.56)),
 (91,'Tiệm bánh','ケーキや','ケーキを かいます。',(.37,.18,.57,.56)),
 (91,'Nhà hàng','レストラン','ごはんを たべます。',(.66,.18,.90,.56)),
 (92,'Tiệm giày','くつや','くつを かいます。',(.025,.23,.22,.55)),
 (92,'Cửa hàng 100 yên','ひゃくえんショップ','かいものを します。',(.25,.23,.425,.55)),
 (92,'Nhà sách','ほんや','ほんを かいます。',(.45,.23,.62,.55)),
 (92,'Siêu thị','スーパー','かいものを します。',(.67,.23,.98,.55)),
 (92,'Trung tâm mua sắm','ショッピングモール','かいものを します。',(.025,.57,.29,.93)),
 (92,'Cửa hàng tiện lợi','コンビニ','アルバイトを します。',(.33,.56,.53,.93)),
 (93,'Công viên','こうえん','サッカーを します。',(.06,.21,.355,.51)),
 (93,'Công viên','こうえん','スポーツを します。',(.37,.21,.58,.62)),
 (93,'Nhà thể chất','たいいくかん','スポーツを します。',(.06,.55,.35,.94)),
 (93,'Trường học','がっこう','べんきょうします。',(.38,.65,.63,.91)),
 (94,'Bệnh viện','びょういん','はたらきます。',(.06,.24,.265,.51)),
 (94,'Thư viện','としょかん','ほんを よみます。',(.275,.25,.49,.51)),
 (94,'Bưu điện','ゆうびんきょく','はたらきます。',(.07,.57,.265,.91)),
 (94,'Công ty','かいしゃ','はたらきます。',(.32,.57,.47,.89)),
 (95,'Nhà sách','ほんや','ほんを かいます。',(.12,.20,.31,.53)),
 (95,'Thư viện','としょかん','ほんを よみます。',(.08,.56,.35,.91)),
 (96,'Thư viện','としょかん','べんきょうします。',(.09,.24,.34,.54)),
 (96,'Đại học','だいがく','べんきょうします。',(.07,.55,.40,.92))]
for i, (p, title, place, action, box) in enumerate(activity_places):
    s = scene(p, f'place-{i}', title, 'places', box)
    ask(s, f'{place}で なにを しますか。', 'Bạn làm gì ở địa điểm này?', place + 'で ' + action, 'Đáp án mẫu; có thể nói hoạt động hợp lý khác. Trợ từ で chỉ nơi diễn ra hành động.')

times = [
 (99,'ケンタ','まいにち','かいしゃへ いきます。','いきます',(7,30),None),
 (99,'アンナ','まいあさ','がっこうへ いきます。','いきます',(8,0),None),
 (100,'カルロス','まいあさ','おきます。','おきます',(6,0),None),
 (100,'スコット','まいばん','ねます。','ねます',(11,30),None),
 (101,'ワン','','おきます。','おきます',(8,0),None),
 (101,'イサベラ','','あさごはんを たべます。','たべます',(8,30),None),
 (101,'ベッキー','','がっこうへ いきます。','いきます',(9,0),None),
 (102,'パク','まいにち','べんきょうします。','べんきょうします',(7,0),(9,0)),
 (102,'ダニエル','まいにち','はたらきます。','はたらきます',(8,0),(5,0)),
 (103,'マリヤム','','テレビを みます。','みます',(7,0),(9,0)),
 (103,'キム','','えいがを みます。','みます',(10,0),(11,0))]
for p in range(99,104):
    group = [t for t in times if t[0] == p]
    for i, (_, name, freq, action, verb, start, end) in enumerate(group):
        n = len(group)
        s = scene(p, str(i), name, 'time-actions', (.055+i*.90/n,.17,.055+(i+1)*.90/n,.88))
        if end:
            ask(s, f'{name}さんは {freq} なんじから なんじまで {verb}か。', 'Làm từ mấy giờ đến mấy giờ?', clock(*start) + 'から ' + clock(*end) + 'まで ' + action, 'Theo giờ ghi trên ảnh; đề không luôn chỉ rõ sáng/chiều.')
        else:
            ask(s, f'{name}さんは {freq} なんじに {verb}か。', 'Thực hiện hành động lúc mấy giờ?', clock(*start) + 'に ' + action)
        ask(s, f'{name}さんは なにを しますか。', 'Người này làm gì?', action)

# Personal answers: examples only, never treat a user's own facts as wrong.
personal = dict(id='personal', page=105, title='Trả lời về bản thân', category='personal', image='', width=0, height=0)
scenes.append(personal)
for q, vi, a in [
 ('おなまえは なんですか。','Bạn tên gì?','わたしは フイです。'),
 ('おくには どちらですか。','Bạn đến từ đâu?','ベトナムです。'),
 ('なんさいですか。','Bạn bao nhiêu tuổi?','はたちです。'),
 ('たんじょうびは いつですか。','Sinh nhật bạn khi nào?','しがつ とおかです。'),
 ('しゅみは なんですか。','Sở thích của bạn?','おんがくです。'),
 ('やすみのひ、なにを しますか。','Ngày nghỉ bạn làm gì?','うちで えいがを みます。'),
 ('としょかんで なにを しますか。','Bạn làm gì ở thư viện?','ほんを よみます。'),
 ('やすみのひ、なんじに たべますか。','Ngày nghỉ bạn ăn lúc mấy giờ?','しちじに あさごはんを たべます。'),
 ('まいあさ、パンを たべますか。','Mỗi sáng bạn có ăn bánh mì không?','はい、たべます。'),
 ('やすみのひ、どこへ いきますか。','Ngày nghỉ bạn đi đâu?','こうえんへ いきます。'),
 ('いま、なんじなんぷんですか。','Bây giờ là mấy giờ mấy phút?','しちじ はんです。'),
 ('まいあさ、なんじに おきますか。','Mỗi sáng mấy giờ bạn dậy?','ろくじに おきます。'),
 ('まいばん、なんじに ねますか。','Mỗi tối mấy giờ bạn ngủ?','じゅういちじに ねます。'),
 ('なんじから なんじまで べんきょうしますか。','Bạn học từ mấy giờ đến mấy giờ?','しちじから くじまで べんきょうします。')]:
    ask(personal, q, vi, a, 'Chỉ là ví dụ. Thay bằng thông tin thật của bạn; câu hỏi giờ hiện tại phải trả lời theo đồng hồ lúc luyện.')

assert number(3280000) == 'さんびゃくにじゅうはちまん'
assert number(6200000) == 'ろっぴゃくにじゅうまん'
assert age(20) == 'はたち' and age(31) == 'さんじゅういっさい'
assert age(30) == 'さんじゅっさい'
assert date(7,24) == 'しちがつ にじゅうよっか'
assert len({q['id'] for q in questions}) == len(questions)
assert all(any(q['sceneId'] == s['id'] for q in questions) for s in scenes)
assert {s['page'] for s in scenes} >= set([*range(11,16),*range(19,30),33,34,35,36,38,40,41,*range(45,58),*range(63,74),*range(78,89),*range(90,97),*range(99,104),105])
data = dict(source='JPD113 - Speaking (Q&A) (7).pdf · AnhNH88', scenes=scenes, questions=questions)
(ROOT / 'src/lib/speaking/deck.json').parent.mkdir(parents=True, exist_ok=True)
(ROOT / 'src/lib/speaking/deck.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(scenes)} scenes, {len(questions)} questions, {len(images)} source pages')
