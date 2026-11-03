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

- [x] 온보딩: 사주 설정(사진·이름·생년월일·태어난 시간·성별) → 나의 캐해 리포트(박스 6개 + 상세 바텀시트, 만세력 보기)

- [x] 친구방 (행운방 · Lucky Talk 캐러셀 · Lucky Moments) + 하단 탭바 — 피그마 node 1870:10692
- [x] 스토리 보기 / 기운 스티커 붙이기 (Lucky Moments 카드 → 스토리)
- [x] 채팅방 → 받은 주파수 카드(앞·뒤) → 주파수 듣기 → 듣기 완료
- [x] 주파수: 누구에게(Me/Friend) → 친구 선택 → 내용 입력 전
- [ ] 주파수 선택 (Lucky signal)

## 온보딩

- 앱을 처음 열면 **사주 설정 → 나의 캐해 리포트** 가 나오고, '치링 시작하기'를 누르면 홈(친구방)으로 가요.
- 입력한 정보는 이 기기(브라우저 localStorage)에 저장돼서, 다음부터는 바로 홈이 보여요.
- 다시 처음부터 보고 싶으면 주소 끝에 `?onboarding` 을 붙이면 돼요. 예: https://unahynn.github.io/chiring/?onboarding
- 사주 계산: 한국 표준시에서 30분을 빼 서울 기준으로 보정하고, 밤 11~12시 출생은 일주를 그날로 보는 야자시 기준이에요.
  음력 → 양력은 한국천문연구원 기준 `korean-lunar-calendar`, 네 기둥은 `lunar-javascript`로 계산해요.
- 리포트 문구는 `src/data/report.ts` 에서 고칠 수 있어요. `**굵게**` 는 진하게, 줄바꿈은 문단으로 보여요.

## 폴더 구조

```
src/
  components/   여러 화면에서 같이 쓰는 부분 (상태바, 하단 탭바)
  screens/      화면 단위 (FriendsRoom = 친구방, SajuSetup = 사주 설정, CharReport = 캐해 리포트)
  data/         saju.ts(오행·간지 표) · sajuCalc.ts(네 기둥 계산) · report.ts(리포트 문구) · profile.ts(내 정보 저장)
  assets/       피그마에서 가져온 이미지
```
