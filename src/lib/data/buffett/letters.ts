export type Passage = {
  original: string;
  translation: string;
  note?: string;
};

export type Letter = {
  year: number;
  title: string;
  hook: string;
  context: string;
  sourceUrl: string;
  passages: Passage[];
};

export const LETTERS: Letter[] = [
  {
    year: 1986,
    title: "공포와 탐욕의 원전",
    hook: "남들이 탐욕에 빠질 때 우리는 무서워하고, 남들이 무서워할 때만 우리도 탐욕을 부린다.",
    context:
      "버핏 투자 철학을 한 줄로 압축한 그 유명한 문장의 출처. 1986년은 일본 버블이 한창 치솟던 시기였고, 그래서 더 의미심장하다. 22년 뒤 2008년 NYT 기고문 「Buy American. I Am.」에서 버핏은 이 말을 거의 그대로 다시 꺼낸다.",
    sourceUrl: "https://www.berkshirehathaway.com/letters/1986.html",
    passages: [
      {
        original:
          "Our goal is more modest: we simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.",
        translation:
          "우리 목표는 좀 더 소박해. 남들이 탐욕에 빠질 때 우리는 무서워하고, 남들이 무서워할 때만 우리도 탐욕을 부린다 — 그게 다야.",
        note: "버핏 어록 중 가장 자주 인용되는 한 줄. 사이클 역행 매매를 단 한 문장으로 압축한 원전.",
      },
      {
        original:
          "What we do know, however, is that occasional outbreaks of those two super-contagious diseases, fear and greed, will forever occur in the investment community. The timing of these epidemics will be unpredictable. And the market aberrations produced by them will be equally unpredictable, both as to duration and degree. Therefore, we never try to anticipate the arrival or departure of either disease.",
        translation:
          "그래도 확실히 아는 게 하나 있어. 공포와 탐욕이라는 끔찍하게 전염성 강한 두 가지 병은 투자 세계에 영원히 주기적으로 창궐한다는 것. 언제 터질지는 아무도 모르고, 얼마나 오래 갈지, 시장이 얼마나 미쳐 돌아갈지도 마찬가지로 예측 불가능하지. 그래서 우린 이 병이 언제 찾아오고 언제 떠날지 아예 예측하려 들지 않아.",
        note: "주목할 점: 버핏은 '언제 위기가 올지' 예측하려 하지 않는다. 그저 병이 도졌을 때 행동할 뿐.",
      },
      {
        original:
          "We will stick with our 'til-death-do-us-part policy. It's the only one with which Charlie and I are comfortable, it produces decent results, and it lets our managers and those of our investees run their businesses free of distractions.",
        translation:
          "우린 '죽음이 갈라놓을 때까지' 원칙을 고수해. 찰리랑 내가 편하게 느끼는 유일한 방식이고, 결과도 그럭저럭 괜찮고, 무엇보다 우리가 투자한 회사 경영진이 잡음 없이 일에 집중할 수 있거든.",
        note: "결혼식 서약을 그대로 가져와 투자 원칙으로 쓴다. 매수했으면 죽을 때까지 보유한다는 뜻.",
      },
    ],
  },
  {
    year: 1987,
    title: "미스터 마켓 우화",
    hook: "시장 가격이라는 건 조울증을 앓는 동업자가 매일 부르는 가격이라고 생각해라.",
    context:
      "벤 그레이엄이 만든 '미스터 마켓' 우화를 버핏이 자기 언어로 다시 풀어낸 결정판. 가치투자의 헌법 같은 텍스트로, 폭락장에 대한 모든 합리적 사고의 출발점이다. 이걸 진짜로 내면화하면, 폭락은 공포가 아니라 미스터 마켓이 우울증 발작을 일으킨 날이 된다.",
    sourceUrl: "https://www.berkshirehathaway.com/letters/1987.html",
    passages: [
      {
        original:
          "Ben Graham, my friend and teacher, long ago described the mental attitude toward market fluctuations that I believe to be most conducive to investment success. He said that you should imagine market quotations as coming from a remarkably accommodating fellow named Mr. Market who is your partner in a private business. Without fail, Mr. Market appears daily and names a price at which he will either buy your interest or sell you his.",
        translation:
          "내 친구이자 스승인 벤 그레이엄은 오래전에, 시장 변동에 대처하는 가장 이상적인 마음가짐을 이렇게 설명했어. 시장 가격이라는 건 '미스터 마켓'이라는 굉장히 친절한 양반에게서 나온다고 상상해보라는 거야. 너랑 같이 사업을 운영하는 동업자라고 생각해. 이 양반은 매일 빠짐없이 찾아와서 가격 하나를 부른다. 그 가격에 네 지분을 사든가, 자기 지분을 너한테 팔든가 둘 중 하나야.",
      },
      {
        original:
          "Even though the business that the two of you own may have economic characteristics that are stable, Mr. Market's quotations will be anything but. For, sad to say, the poor fellow has incurable emotional problems. At times he feels euphoric and can see only the favorable factors affecting the business. When in that mood, he names a very high buy-sell price because he fears that you will snap up his interest and rob him of imminent gains. At other times he is depressed and can see nothing but trouble ahead for both the business and the world. On these occasions he will name a very low price, since he is terrified that you will unload your interest on him.",
        translation:
          "근데 두 사람이 같이 운영하는 사업 자체는 안정적일지 몰라도, 미스터 마켓이 부르는 가격은 절대 안정적이지 않아. 안타깝게도 이 양반이 치료 불가능한 감정 기복증을 앓고 있거든. 어떤 날은 황홀경에 빠져서 사업의 좋은 면만 보여. 그럴 땐 엄청 높은 가격을 부르지 — 네가 자기 지분을 채갈까 봐, 곧 들어올 대박 수익을 놓칠까 봐 무서워서야. 또 어떤 날은 우울증에 빠져서 사업이고 세상이고 다 망할 것처럼만 보여. 그럴 땐 헐값을 부른다 — 네가 너 지분을 자기한테 떠넘길까 봐 벌벌 떨면서.",
      },
      {
        original:
          "Mr. Market has another endearing characteristic: He doesn't mind being ignored. If his quotation is uninteresting to you today, he will be back with a new one tomorrow. Transactions are strictly at your option. Under these conditions, the more manic-depressive his behavior, the better for you.",
        translation:
          "이 양반에겐 사랑스러운 구석이 또 하나 있어. 무시당해도 신경 안 써. 오늘 부른 가격이 마음에 안 들어도, 내일 새 가격을 들고 또 찾아온다. 거래는 전적으로 네 선택이야. 이런 조건이라면, 이 양반이 더 미친 듯이 조울증을 부릴수록 너한테는 오히려 더 이득이지.",
        note: "핵심: 미스터 마켓의 변동성은 적이 아니라 친구. 더 미칠수록 더 좋다.",
      },
      {
        original:
          "But, like Cinderella at the ball, you must heed one warning or everything will turn into pumpkins and mice: Mr. Market is there to serve you, not to guide you. It is his pocketbook, not his wisdom, that you will find useful. If he shows up some day in a particularly foolish mood, you are free to either ignore him or to take advantage of him, but it will be disastrous if you fall under his influence. Indeed, if you aren't certain that you understand and can value your business far better than Mr. Market, you don't belong in the game. As they say in poker, \"If you've been in the game 30 minutes and you don't know who the patsy is, you're the patsy.\"",
        translation:
          "근데 신데렐라가 무도회에서 그랬듯, 한 가지 경고는 꼭 새겨야 해. 안 그러면 모든 게 호박과 쥐로 변해버려. 미스터 마켓은 너에게 도움을 주려고 있는 거지, 너를 가르치려고 있는 게 아니야. 너에게 쓸모 있는 건 그 사람의 지갑이지, 그 사람의 지혜가 아니라고. 어느 날 이 양반이 유난히 멍청한 기분으로 나타나면, 너는 무시하든 등쳐먹든 자유야. 다만 그 사람의 영향력에 휘둘리면 — 그게 재앙의 시작이야. 솔직히 말해서, 자기 사업의 가치를 미스터 마켓보다 훨씬 잘 평가할 자신이 없다면, 이 게임에 끼어들 자격이 없어. 포커 격언처럼: '게임 시작한 지 30분이 됐는데 누가 호구인지 모르겠다면, 호구는 너야.'",
        note: "이 우화 전체에서 가장 중요한 단락. 시장은 너에게 가격을 제공하는 도구일 뿐, 너에게 가치를 가르치는 스승이 아니다.",
      },
      {
        original:
          "Ben's Mr. Market allegory may seem out-of-date in today's investment world, in which most professionals and academicians talk of efficient markets, dynamic hedging and betas. Their interest in such matters is understandable, since techniques shrouded in mystery clearly have value to the purveyor of investment advice. After all, what witch doctor has ever achieved fame and fortune by simply advising \"Take two aspirins\"?",
        translation:
          "벤의 미스터 마켓 우화가 요즘 투자 세계에선 좀 구닥다리처럼 보일지 몰라. 다들 효율적 시장이니, 동적 헤징이니, 베타니 하면서 떠들어대니까. 뭐, 그 사람들이 그런 데 관심 갖는 건 이해해. 신비로운 기법이라는 건 투자 조언 파는 사람한테는 분명히 값이 나가거든. 무당이 그저 '아스피린 두 알 드세요'라고 처방해서 명성과 부를 얻은 적이 있던가?",
        note: "버핏 특유의 위트. 학자/전문가들이 어려운 용어를 쓰는 이유는 어렵게 들려야 비싸게 팔 수 있기 때문이라는 비꼼.",
      },
      {
        original:
          "In my opinion, investment success will not be produced by arcane formulae, computer programs or signals flashed by the price behavior of stocks and markets. Rather an investor will succeed by coupling good business judgment with an ability to insulate his thoughts and behavior from the super-contagious emotions that swirl about the marketplace.",
        translation:
          "내 생각엔, 투자 성공은 비밀스러운 공식이나 컴퓨터 프로그램, 또는 주가와 시장이 깜빡이는 신호 따위에서 나오지 않아. 좋은 사업 판단력에다, 시장에 휘몰아치는 그 끔찍하게 전염성 강한 감정들로부터 자기 생각과 행동을 차단할 줄 아는 능력 — 이 두 가지가 결합돼야 투자자는 성공해.",
      },
    ],
  },
  {
    year: 1996,
    title: "10년의 게으름",
    hook: "10년 동안 보유할 의향이 없는 주식이라면, 10분이라도 갖고 있을 생각 자체를 하지 마.",
    context:
      "1996년은 닷컴 거품이 본격적으로 시작되기 직전. 버핏은 시장이 들끓을수록 오히려 '게으름'을 강조한다. 워렌 버핏 어록 중 가장 자주 인용되는 '10년 룰'이 여기서 나왔다.",
    sourceUrl: "https://www.berkshirehathaway.com/letters/1996.html",
    passages: [
      {
        original:
          "If you aren't willing to own a stock for ten years, don't even think about owning it for ten minutes.",
        translation:
          "10년 동안 보유할 의향이 없는 주식이라면, 10분이라도 갖고 있을 생각 자체를 하지 마.",
        note: "버핏의 '10년 룰'. 시간 지평을 길게 잡으면 단기 노이즈가 자동으로 사라진다.",
      },
      {
        original:
          "Our portfolio shows little change: We continue to make more money when snoring than when active.",
        translation:
          "우리 포트폴리오는 거의 변하지 않아. 우린 활발하게 거래할 때보다 코를 골며 잘 때 더 많은 돈을 번다.",
        note: "거래 활동 = 수익, 이라는 통념을 비웃는 한 줄. 매매 횟수와 수익은 음의 상관관계.",
      },
      {
        original:
          "Inactivity strikes us as intelligent behavior. Neither we nor most business managers would dream of feverishly trading highly-profitable subsidiaries because a small move in the Federal Reserve's discount rate was predicted or because some Wall Street pundit had reversed his views on the market.",
        translation:
          "아무것도 안 하는 것 — 그게 우리 눈엔 지능적인 행동이야. 우리든 웬만한 경영자든, 잘나가는 자회사를 미친 듯이 사고팔 생각은 꿈에도 안 하잖아 — 연준 할인율이 좀 움직일 거란 예측이 나왔다고, 또는 월가 전문가가 시장 전망을 뒤집었다고 해서 말이야.",
        note: "비상장 사업체였다면 절대 안 팔 텐데, 왜 상장 주식만 그렇게 자주 사고파나? 본질은 같은 사업인데.",
      },
      {
        original: "Selling fine businesses on \"scary\" news is usually a bad decision.",
        translation:
          "'무서운' 뉴스가 떴다고 해서 좋은 사업을 팔아치우는 건 대개 나쁜 결정이야.",
        note: "박종훈 소장의 '물보라'와 같은 개념: 단기 뉴스에 반응하지 마라.",
      },
    ],
  },
  {
    year: 2008,
    title: "공포의 한복판에서",
    hook: "공포가 경기 위축을 부르고, 위축이 다시 더 큰 공포를 부른다. — 그리고 미국의 가장 좋은 날들은 아직 오지 않았다.",
    context:
      "리먼 브라더스 파산 직후, 글로벌 금융위기가 한창인 시점에 작성된 서한. 버핏 본인이 「Buy American. I Am.」 NYT 기고문을 발표한 직후이기도 하다. 당시 시장은 패닉이었고, 버핏은 이 서한에서 그 패닉을 어떻게 봐야 하는지를 정면으로 설명한다.",
    sourceUrl: "https://www.berkshirehathaway.com/letters/2008ltr.pdf",
    passages: [
      {
        original:
          "By the fourth quarter, the credit crisis, coupled with tumbling home and stock prices, had produced a paralyzing fear that engulfed the country. A freefall in business activity ensued, accelerating at a pace that I have never before witnessed. The U.S. – and much of the world – became trapped in a vicious negative-feedback cycle. Fear led to business contraction, and that in turn led to even greater fear.",
        translation:
          "4분기에 들어서면서 신용 위기에 집값과 주가 폭락이 겹치자, 마비될 정도의 공포가 나라 전체를 덮었어. 경기 활동은 자유낙하했고, 그 가속도는 내가 살면서 본 적이 없을 정도였지. 미국과 — 그리고 세계 대부분이 — 악성 부정 피드백 사이클에 갇혔다. 공포가 경기 위축을 부르고, 그 위축이 다시 더 큰 공포를 부른다.",
        note: "위기의 메커니즘을 한 문단으로 정리. 박종훈 소장의 '파멸의 J커브와 공포의 톱니바퀴'와 정확히 같은 구조.",
      },
      {
        original:
          "Amid this bad news, however, never forget that our country has faced far worse travails in the past. In the 20th Century alone, we dealt with two great wars (one of which we initially appeared to be losing); a dozen or so panics and recessions; virulent inflation that led to a 21½% prime rate in 1980; and the Great Depression of the 1930s, when unemployment ranged between 15% and 25% for many years. America has had no shortage of challenges. Without fail, however, we've overcome them.",
        translation:
          "이런 나쁜 뉴스 속에서도 잊지 말아야 할 게 있어. 우리나라는 과거에 훨씬 더 험한 시련을 겪었어. 20세기만 봐도 두 번의 세계대전(그중 한 번은 처음엔 지는 줄 알았지), 열 몇 번의 공황과 불황, 1980년 우대금리 21.5%까지 치솟게 만든 살인적인 인플레이션, 그리고 1930년대 대공황 — 실업률이 15~25%로 수년간 머물렀던 그 시기 — 까지. 미국에 시련이 부족했던 적은 한 번도 없어. 근데 우린 매번 빠짐없이 극복했지.",
      },
      {
        original:
          "Though the path has not been smooth, our economic system has worked extraordinarily well over time. It has unleashed human potential as no other system has, and it will continue to do so. America's best days lie ahead.",
        translation:
          "길이 평탄했던 적은 없지만, 우리 경제 시스템은 시간이 갈수록 놀라울 만큼 잘 작동해왔어. 다른 어떤 시스템도 못 풀어낸 인간의 잠재력을 풀어냈고, 앞으로도 그럴 거야. 미국의 가장 좋은 날들은 아직 오지 않았다.",
        note: '"America\'s best days lie ahead." — 버핏이 위기 때마다 반복하는 핵심 신념. 공포에 정면으로 베팅하는 근거.',
      },
      {
        original:
          "Clinging to cash equivalents or long-term government bonds at present yields is almost certainly a terrible policy if continued for long. Holders of these instruments, of course, have felt increasingly comfortable – in fact, almost smug – in following this policy as financial turmoil has mounted. They regard their judgment confirmed when they hear commentators proclaim \"cash is king,\" even though that wonderful cash is earning close to nothing and will surely find its purchasing power eroded over time.",
        translation:
          "현금성 자산이나 장기 국채를 지금 같은 이자율에 오래 쥐고 있는 건 거의 확실히 끔찍한 전략이야. 물론 이걸 들고 있는 사람들은 금융 혼란이 커질수록 점점 더 편해 — 사실 거의 우쭐해 — 한 기분이 들겠지. 해설가들이 '현금이 왕이다'라고 외치는 걸 들을 때마다 자기 판단이 옳다고 확신하면서. 근데 그 멋진 현금은 거의 한 푼도 못 벌고 있고, 시간이 지나면 구매력은 분명히 깎여 나갈 거야.",
        note: "공포 절정기에 가장 안전해 보이는 자산이 사실은 가장 위험하다. 박종훈 소장의 '돈의 가격' 관점과 직결.",
      },
      {
        original:
          "Approval, though, is not the goal of investing. In fact, approval is often counter-productive because it sedates the brain and makes it less receptive to new facts or a re-examination of conclusions formed earlier. Beware the investment activity that produces applause; the great moves are usually greeted by yawns.",
        translation:
          "근데 투자의 목표는 박수받는 게 아니야. 사실 박수는 오히려 해로워. 뇌를 마취시켜서 새로운 사실을 받아들이거나 이미 내린 결론을 재검토하는 능력을 떨어뜨리거든. 박수를 부르는 투자 행위를 경계해라 — 진짜 위대한 한 수는 보통 하품으로 맞이된다.",
        note: "사이클 역행 매매의 본질. 다수가 좋아하는 결정은 이미 가격에 반영되어 있다.",
      },
    ],
  },
  {
    year: 2009,
    title: "금이 비처럼 쏟아질 때",
    hook: "큰 기회는 자주 오지 않아. 금이 비처럼 쏟아질 때는 골무가 아니라 양동이를 들고 나가라.",
    context:
      "위기 직후 회고 서한. 위기 한복판에 어떻게 행동했는지 — 그리고 그 행동을 가능하게 한 자금 여력은 어디서 왔는지 — 를 솔직하게 정리한다. '여유 자금 확보'라는 박종훈 원칙의 원조.",
    sourceUrl: "https://www.berkshirehathaway.com/letters/2009ltr.pdf",
    passages: [
      {
        original:
          "We will never become dependent on the kindness of strangers. Too-big-to-fail is not a fallback position at Berkshire. Instead, we will always arrange our affairs so that any requirements for cash we may conceivably have will be dwarfed by our own liquidity.",
        translation:
          "우린 절대로 낯선 이의 친절에 기대지 않아. '대마불사'는 버크셔의 비상 대책이 아니야. 그 대신, 우리에게 발생할 수 있는 어떤 현금 수요든 우리 자체 유동성에 비하면 새 발의 피가 되도록 — 항상 그렇게 우리 살림을 짠다.",
        note: "위기 때 살아남으려면 위기 전부터 현금이 있어야 한다. 위기가 와서 현금을 마련하면 늦다.",
      },
      {
        original:
          "When the financial system went into cardiac arrest in September 2008, Berkshire was a supplier of liquidity and capital to the system, not a supplicant. At the very peak of the crisis, we poured $15.5 billion into a business world that could otherwise look only to the federal government for help.",
        translation:
          "2008년 9월 금융 시스템이 심정지에 빠졌을 때, 버크셔는 시스템에 유동성과 자본을 공급하는 쪽이었지, 구걸하는 쪽이 아니었어. 위기가 최고조에 달한 바로 그 순간, 우린 155억 달러를 시장에 쏟아부었지 — 그렇지 않았으면 연방정부 말고는 의지할 데가 없었을 시장에 말이야.",
      },
      {
        original:
          "Big opportunities come infrequently. When it's raining gold, reach for a bucket, not a thimble.",
        translation:
          "큰 기회는 자주 오지 않아. 금이 비처럼 쏟아질 때는 골무가 아니라 양동이를 들고 나가라.",
        note: "버핏 비유 중 가장 강렬한 한 줄. 위기 때 작게 베팅하면 위기를 두 번 다시 못 산다.",
      },
      {
        original:
          "We've put a lot of money to work during the chaos of the last two years. It's been an ideal period for investors: A climate of fear is their best friend. Those who invest only when commentators are upbeat end up paying a heavy price for meaningless reassurance. In the end, what counts in investing is what you pay for a business – through the purchase of a small piece of it in the stock market – and what that business earns in the succeeding decade or two.",
        translation:
          "지난 2년간의 혼돈 속에서 우린 어마어마한 자금을 굴렸어. 투자자에게는 이상적인 시기였지. 공포의 분위기 — 그게 투자자의 가장 친한 친구야. 해설가들이 낙관적일 때만 투자하는 사람들은 의미 없는 위안에 비싼 대가를 치르게 돼. 결국 투자에서 중요한 건 두 가지야. 사업을(주식을 통해 그 일부를 사면서) 얼마에 사느냐, 그리고 그 사업이 앞으로 10~20년 동안 얼마를 버느냐.",
        note: "'A climate of fear is their best friend.' — 공포가 투자자의 친구라는 도치된 진실.",
      },
    ],
  },
  {
    year: 2017,
    title: "키플링의 시간",
    hook: "큰 폭락은 빚의 짐을 지지 않은 사람에게 비상한 기회를 가져다 준다.",
    context:
      "버핏 87세, 머리가 가장 맑던 후기 서한 중 하나. 버크셔 주가가 53년간 겪은 폭락 표를 직접 보여주며 레버리지의 위험을 정면으로 경고한다. 그리고 그 폭락이 빚 없는 자에게는 어떻게 기회가 되는지 — 키플링의 시 「If」를 인용해 마무리한다.",
    sourceUrl: "https://www.berkshirehathaway.com/letters/2017ltr.pdf",
    passages: [
      {
        original:
          "This table offers the strongest argument I can muster against ever using borrowed money to own stocks. There is simply no telling how far stocks can fall in a short period. Even if your borrowings are small and your positions aren't immediately threatened by the plunging market, your mind may well become rattled by scary headlines and breathless commentary. And an unsettled mind will not make good decisions.",
        translation:
          "이 표는 빚을 내서 주식을 사면 안 된다는, 내가 들 수 있는 가장 강력한 논거다. 주가가 단기간에 얼마나 떨어질 수 있는지는 그냥 아무도 몰라. 빚이 적고 폭락하는 시장에서 당장 포지션이 위협받지 않더라도, 무서운 헤드라인과 숨가쁜 해설에 너 마음은 흔들릴 가능성이 크다. 그리고 흔들린 마음은 좋은 결정을 못 내려.",
        note: "버핏이 폭락 표(버크셔 주가도 -59% 폭락한 적 있음)를 직접 보여주며 한 경고. 빚의 진짜 위험은 파산이 아니라 '판단력 마비'다.",
      },
      {
        original:
          "In the next 53 years our shares (and others) will experience declines resembling those in the table. No one can tell you when these will happen. The light can at any time go from green to red without pausing at yellow. When major declines occur, however, they offer extraordinary opportunities to those who are not handicapped by debt.",
        translation:
          "앞으로 53년간 우리 주식도(그리고 다른 주식도) 표에 나온 것 같은 폭락을 겪을 거야. 그게 언제 올지는 아무도 모른다. 신호등은 언제든 노란색 안 거치고 초록에서 빨강으로 바뀔 수 있어. 다만 큰 폭락이 왔을 때 — 그건 빚의 짐을 지지 않은 사람에게는 비상한 기회를 가져다 준다.",
      },
      {
        original:
          "That's the time to heed these lines from Kipling's If: \"If you can keep your head when all about you are losing theirs . . . If you can wait and not be tired by waiting . . . If you can think – and not make thoughts your aim . . . If you can trust yourself when all men doubt you . . . Yours is the Earth and everything that's in it.\"",
        translation:
          "그럴 때 키플링의 시 「If」의 이 구절을 새겨야 해. '주위 사람 모두가 정신을 잃을 때 너 정신을 지킬 수 있다면… 기다리되, 기다림에 지치지 않을 수 있다면… 생각하되, 그 생각을 목적으로 삼지 않을 수 있다면… 모두가 너를 의심할 때 너 자신을 믿을 수 있다면… 이 땅과 그 안의 모든 것이 네 것이리라.'",
        note: "버핏이 폭락장 행동지침을 시 한 편으로 압축한 결정적 순간. '평정심 + 인내 + 자기 신뢰' = 폭락장 생존 키트.",
      },
      {
        original:
          "Though markets are generally rational, they occasionally do crazy things. Seizing the opportunities then offered does not require great intelligence, a degree in economics or a familiarity with Wall Street jargon such as alpha and beta. What investors then need instead is an ability to both disregard mob fears or enthusiasms and to focus on a few simple fundamentals. A willingness to look unimaginative for a sustained period – or even to look foolish – is also essential.",
        translation:
          "시장은 대체로 합리적이지만, 가끔 미친 짓을 해. 그때 찾아오는 기회를 잡는 데 대단한 지능이나 경제학 학위, 알파니 베타니 하는 월가 용어에 익숙할 필요는 없어. 투자자에게 필요한 건 군중의 공포든 열광이든 무시할 수 있는 능력, 그리고 몇 가지 단순한 기본기에 집중할 수 있는 능력 — 이 두 가지야. 그리고 한 가지 더: 오랫동안 상상력 없어 보이는 — 심지어 멍청해 보이는 — 모습으로 비치는 걸 견딜 의지. 이것도 필수야.",
        note: "마지막 문장이 핵심. 사이클 역행 매매를 하면 한동안 '바보'로 보인다. 그걸 견딜 수 있어야 한다.",
      },
    ],
  },
];
