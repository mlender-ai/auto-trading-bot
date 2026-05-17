/**
 * Prisma Seed — 타로 카드 22장 초기 데이터
 * 실행: npx tsx prisma/tarot-seed.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CARDS = [
  { id: "the-fool",           name: "The Fool",           nameKo: "바보",        number: 0,  meaningUpright: "새로운 시작, 무한한 가능성, 리스크 감수",           meaningReversed: "무모함, 준비 부족, 경솔한 결정",              keywords: ["new beginning","spontaneity","risk","potential"],              keywordsKo: ["새로운 시작","즉흥성","리스크","가능성"],       imageUrl: "/cards/the-fool.png",           toneGuide: "가볍고 호기심 넘치는 에너지. 미지의 여정을 시작하는 느낌." },
  { id: "the-magician",       name: "The Magician",       nameKo: "마법사",      number: 1,  meaningUpright: "의지력과 기술로 목표를 현실로 만드는 힘",              meaningReversed: "재능 낭비, 조종, 부실한 계획",               keywords: ["willpower","skill","manifestation","resourcefulness"],          keywordsKo: ["의지력","기술","현실화","자원 활용"],           imageUrl: "/cards/the-magician.png",       toneGuide: "집중되고 능동적인 에너지. 모든 도구를 갖추고 행동하는 느낌." },
  { id: "the-high-priestess", name: "The High Priestess", nameKo: "여교황",      number: 2,  meaningUpright: "직관을 신뢰하라. 드러나지 않은 정보가 있다.",           meaningReversed: "정보 은폐, 판단 흐림, 표면만 보는 실수",       keywords: ["intuition","mystery","patience","hidden knowledge"],            keywordsKo: ["직관","신비","인내","숨겨진 정보"],             imageUrl: "/cards/the-high-priestess.png", toneGuide: "차분하고 신비로운 에너지. 관망과 직관의 시간." },
  { id: "the-empress",        name: "The Empress",        nameKo: "여황제",      number: 3,  meaningUpright: "풍요로운 성장, 생산성 증가, 번영의 시기",              meaningReversed: "성장 정체, 과잉, 의존성",                     keywords: ["abundance","growth","fertility","nurturing"],                   keywordsKo: ["풍요","성장","생산성","육성"],                  imageUrl: "/cards/the-empress.png",        toneGuide: "따뜻하고 풍요로운 에너지. 성장과 번영의 계절." },
  { id: "the-emperor",        name: "The Emperor",        nameKo: "황제",        number: 4,  meaningUpright: "강한 기반, 안정적 구조, 권위 있는 세력의 영향",         meaningReversed: "경직성, 과도한 통제, 권력 남용",               keywords: ["authority","structure","stability","control"],                  keywordsKo: ["권위","구조","안정성","통제"],                  imageUrl: "/cards/the-emperor.png",        toneGuide: "강하고 안정적인 에너지. 확고한 구조와 질서." },
  { id: "the-hierophant",     name: "The Hierophant",     nameKo: "교황",        number: 5,  meaningUpright: "전통, 관습, 기관의 지원, 검증된 방법론",               meaningReversed: "반항, 혁신, 제도의 실패",                     keywords: ["tradition","convention","institution","guidance"],              keywordsKo: ["전통","관습","기관","인도"],                    imageUrl: "/cards/the-hierophant.png",     toneGuide: "안정적이고 신뢰할 수 있는 에너지." },
  { id: "the-lovers",         name: "The Lovers",         nameKo: "연인",        number: 6,  meaningUpright: "중요한 선택, 파트너십, 가치 정렬",                    meaningReversed: "불균형, 잘못된 선택, 갈등",                   keywords: ["choice","partnership","alignment","values"],                    keywordsKo: ["선택","파트너십","정렬","가치"],                imageUrl: "/cards/the-lovers.png",         toneGuide: "조화롭고 균형 잡힌 에너지." },
  { id: "the-chariot",        name: "The Chariot",        nameKo: "전차",        number: 7,  meaningUpright: "강한 의지, 승리, 통제된 전진",                        meaningReversed: "방향 상실, 과도한 통제욕, 좌절",               keywords: ["victory","willpower","control","determination"],                keywordsKo: ["승리","의지력","통제","결단"],                  imageUrl: "/cards/the-chariot.png",        toneGuide: "강하고 결단력 있는 에너지." },
  { id: "strength",           name: "Strength",           nameKo: "힘",          number: 8,  meaningUpright: "내면의 힘, 인내, 부드러운 통제",                      meaningReversed: "자기 의심, 약점 노출, 통제력 상실",            keywords: ["courage","patience","influence","compassion"],                  keywordsKo: ["용기","인내","영향력","자비"],                  imageUrl: "/cards/strength.png",           toneGuide: "조용하고 강인한 에너지." },
  { id: "the-hermit",         name: "The Hermit",         nameKo: "은둔자",      number: 9,  meaningUpright: "내면 탐구, 고독, 전략적 후퇴",                        meaningReversed: "고립, 정보 차단, 외로움",                      keywords: ["introspection","solitude","guidance","withdrawal"],             keywordsKo: ["성찰","고독","안내","후퇴"],                    imageUrl: "/cards/the-hermit.png",         toneGuide: "조용하고 내향적인 에너지." },
  { id: "wheel-of-fortune",   name: "Wheel of Fortune",   nameKo: "운명의 바퀴", number: 10, meaningUpright: "운명의 전환, 기회, 사이클",                           meaningReversed: "불운, 저항, 사이클 끊김",                      keywords: ["luck","fate","cycles","turning point"],                         keywordsKo: ["행운","운명","사이클","전환점"],                imageUrl: "/cards/wheel-of-fortune.png",   toneGuide: "역동적이고 변화무쌍한 에너지." },
  { id: "justice",            name: "Justice",            nameKo: "정의",        number: 11, meaningUpright: "공정한 결과, 균형, 책임",                             meaningReversed: "불공정, 불균형, 결과 회피",                    keywords: ["fairness","truth","cause-effect","law"],                        keywordsKo: ["공정","진실","인과","법칙"],                    imageUrl: "/cards/justice.png",            toneGuide: "균형 잡힌 공정한 에너지." },
  { id: "the-hanged-man",     name: "The Hanged Man",     nameKo: "매달린 사람", number: 12, meaningUpright: "관점 전환, 일시 정지, 희생",                          meaningReversed: "지연, 저항, 희생 거부",                        keywords: ["pause","surrender","new perspective","sacrifice"],              keywordsKo: ["일시정지","내려놓기","새 시각","희생"],         imageUrl: "/cards/the-hanged-man.png",     toneGuide: "차분하고 성찰적인 에너지." },
  { id: "death",              name: "Death",              nameKo: "죽음",        number: 13, meaningUpright: "변화와 변환, 한 사이클의 종료, 새 시작",              meaningReversed: "변화 저항, 정체, 낡은 패턴 집착",              keywords: ["transformation","endings","transition","change"],               keywordsKo: ["변환","종료","전환","변화"],                    imageUrl: "/cards/death.png",              toneGuide: "깊고 변혁적인 에너지." },
  { id: "temperance",         name: "Temperance",         nameKo: "절제",        number: 14, meaningUpright: "균형, 절제, 인내, 조화",                              meaningReversed: "불균형, 과잉, 극단성",                         keywords: ["balance","patience","moderation","purpose"],                    keywordsKo: ["균형","인내","절제","목적"],                    imageUrl: "/cards/temperance.png",         toneGuide: "안정되고 조화로운 에너지." },
  { id: "the-devil",          name: "The Devil",          nameKo: "악마",        number: 15, meaningUpright: "집착, 물질주의, 제약 인식",                           meaningReversed: "해방, 집착 끊기, 자유",                        keywords: ["bondage","materialism","addiction","shadow"],                   keywordsKo: ["집착","물질주의","중독","그림자"],              imageUrl: "/cards/the-devil.png",          toneGuide: "무거운 경고의 에너지." },
  { id: "the-tower",          name: "The Tower",          nameKo: "탑",          number: 16, meaningUpright: "갑작스러운 변화, 혼돈, 붕괴, 계시",                  meaningReversed: "붕괴 회피, 재앙 지연, 두려움",                 keywords: ["upheaval","chaos","revelation","sudden change"],                keywordsKo: ["격변","혼돈","계시","갑작스러운 변화"],         imageUrl: "/cards/the-tower.png",          toneGuide: "강렬하고 충격적인 에너지." },
  { id: "the-star",           name: "The Star",           nameKo: "별",          number: 17, meaningUpright: "희망, 회복, 영감, 평온",                              meaningReversed: "절망, 연결 단절, 비현실적 기대",               keywords: ["hope","faith","renewal","serenity"],                            keywordsKo: ["희망","믿음","재생","평온"],                    imageUrl: "/cards/the-star.png",           toneGuide: "밝고 희망적인 에너지." },
  { id: "the-moon",           name: "The Moon",           nameKo: "달",          number: 18, meaningUpright: "환상, 불확실성, 혼란, 숨겨진 것",                    meaningReversed: "혼란 해소, 진실 드러남, 두려움 극복",          keywords: ["illusion","fear","subconscious","confusion"],                   keywordsKo: ["환상","두려움","잠재의식","혼란"],              imageUrl: "/cards/the-moon.png",           toneGuide: "신비롭고 불분명한 에너지." },
  { id: "the-sun",            name: "The Sun",            nameKo: "태양",        number: 19, meaningUpright: "성공, 활력, 낙관, 명확함",                            meaningReversed: "일시적 우울, 과도한 낙관, 에너지 고갈",        keywords: ["success","vitality","optimism","clarity"],                      keywordsKo: ["성공","활력","낙관","명확함"],                  imageUrl: "/cards/the-sun.png",            toneGuide: "밝고 활기찬 에너지." },
  { id: "judgement",          name: "Judgement",          nameKo: "심판",        number: 20, meaningUpright: "재탄생, 자아 평가, 중요한 결정",                     meaningReversed: "자기 의심, 내면의 비판, 회피",                 keywords: ["rebirth","inner calling","absolution","reflection"],             keywordsKo: ["재탄생","내면의 부름","사면","성찰"],           imageUrl: "/cards/judgement.png",          toneGuide: "강렬하고 계시적인 에너지." },
  { id: "the-world",          name: "The World",          nameKo: "세계",        number: 21, meaningUpright: "완성, 성취, 통합, 승리",                              meaningReversed: "미완성, 지연, 단기적 사고",                    keywords: ["completion","achievement","wholeness","fulfillment"],            keywordsKo: ["완성","성취","완전성","성취감"],                imageUrl: "/cards/the-world.png",          toneGuide: "풍요롭고 완성된 에너지." },
];

async function main() {
  console.log("🃏 타로 카드 22장 Seed 시작...\n");

  for (const card of CARDS) {
    await prisma.tarotCard.upsert({
      where: { id: card.id },
      update: {
        name: card.name,
        nameKo: card.nameKo,
        number: card.number,
        keywords: card.keywords,
        keywordsKo: card.keywordsKo,
        meaningUpright: card.meaningUpright,
        meaningReversed: card.meaningReversed,
        imageUrl: card.imageUrl,
        toneGuide: card.toneGuide,
        status: "ACTIVE",
      },
      create: {
        id: card.id,
        name: card.name,
        nameKo: card.nameKo,
        arcana: "major",
        number: card.number,
        keywords: card.keywords,
        keywordsKo: card.keywordsKo,
        meaningUpright: card.meaningUpright,
        meaningReversed: card.meaningReversed,
        imageUrl: card.imageUrl,
        toneGuide: card.toneGuide,
        status: "ACTIVE",
      },
    });
    console.log(`  ✓ ${String(card.number).padStart(2, "0")} ${card.nameKo} (${card.name})`);
  }

  console.log(`\n✅ 완료 — ${CARDS.length}장 upsert`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
