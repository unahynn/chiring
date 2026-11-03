# 치링 (chiring)

친구들과 행운(기운)을 주고받는 앱의 모바일 웹 프로토타입이에요. React + Vite로 만들었어요.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 터미널에 나오는 주소(보통 http://localhost:5173)를 열면 돼요.

**폰으로 보기:** https://unahynn.github.io/chiring/ (main에 올라갈 때마다 자동 배포)
PC에서는 폰 크기 프레임으로 보이고, 휴대폰에서는 화면에 꽉 차게 보여요.

## 화면 진행 상황

- [x] 친구방 (행운방 · Lucky Talk 캐러셀 · Lucky Moments) + 하단 탭바 — 피그마 node 1870:10692
- [x] 스토리 보기 / 기운 스티커 붙이기 (Lucky Moments 카드 → 스토리)
- [ ] 채팅방
- [x] 주파수: 누구에게(Me/Friend) → 친구 선택 → 내용 입력 전
- [ ] 주파수 선택 (Lucky signal)

## 폴더 구조

```
src/
  components/   여러 화면에서 같이 쓰는 부분 (상태바, 하단 탭바)
  screens/      화면 단위 (FriendsRoom = 친구방)
  assets/       피그마에서 가져온 이미지
```
