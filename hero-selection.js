'use strict';
// Personal prologues extend the current two-keeper story; they do not change combat balance.
window.DREAM_HERO_PROFILES = Object.freeze({
    ari: {
        name: '아리', title: '작은 용기를 모으는 관찰자', keyword: '조용한 용기',
        quote: '작은 빛이라도, 내가 기억해 줄게.',
        traits: '차분함 · 세심함 · 다정함', weapon: '첫 별빛 지팡이',
        action: '별빛을 휘둘러 걱정을 정화해요.',
        heading: '아무도 듣지 못한 작은 소원',
        story: [
            '첫잠 해변에서 아리는 꺼져 가는 꿈빛 하나를 발견했어요. 그 안에는 “한 번만 더 해 보고 싶어”라는 작은 소원이 남아 있었죠. 모두 지나쳤지만, 아리는 그 빛 곁에 앉아 끝까지 귀를 기울였어요.',
            '작은 빛도 돌아갈 곳이 필요하다는 걸 알게 된 아리는 꿈빛 원정대에 들어왔어요. 오늘은 첫 순찰. 어둑이 속에 묻힌 기억을 찾아, 희미해진 포근등대까지 이어 보려 해요.'
        ],
        goal: '사라지기 전의 작은 기억을 찾아 등대의 빛을 되살리기',
        secret: '출발 전에는 가방의 별 장식을 꼭 한 번 만져요. 무섭지 않아서가 아니라, 무서워도 한 걸음 나아가려고요.'
    },
    popo: {
        name: '포포', title: '호기심으로 길을 여는 탐험가', keyword: '반짝이는 호기심',
        quote: '길을 잃어도 괜찮아. 빛을 찾으면 되니까!',
        traits: '쾌활함 · 호기심 · 엉뚱함', weapon: '별나무 꿈망치',
        action: '꿈망치로 힘차게 걱정을 정화해요.',
        heading: '길 잃은 꿈에게 보내는 인사',
        story: [
            '반짝이는 것을 따라가다 길을 잃은 포포. 낯선 부두에서 집으로 돌아가게 해 준 건 멀리 깜빡이던 포근등대였어요. 그런데 어느 날, 늘 반겨 주던 그 빛이 점점 희미해지기 시작했죠.',
            '“이번엔 내가 돌아갈 길을 찾아 줄 차례야!” 포포는 꿈망치를 챙겨 원정대의 문을 두드렸어요. 오늘의 첫 순찰에서는 길을 잃은 기억을 모아, 잠의 항구에 다시 환한 인사를 건넬 거예요.'
        ],
        goal: '길 잃은 기억이 돌아갈 수 있도록 항구와 등대에 빛 켜기',
        secret: '아직도 지도를 거꾸로 들 때가 있어요. 대신 처음 만난 길에서도 재미있는 것을 잘 찾아내죠. 순찰이 끝나면 외쳐요. “순찰 완료—!”'
    }
});
window.renderDreamHeroProfile = function (id) {
    const p = DREAM_HERO_PROFILES[id] || DREAM_HERO_PROFILES.ari;
    return `<article class="keeper-dossier" data-profile="${id}" aria-labelledby="keeperProfileName">
        <header><span class="keeper-file-label">꿈빛 원정대 · 신입 지킴이</span><h3 id="keeperProfileName">${p.name}<small>${p.title}</small></h3></header>
        <blockquote>“${p.quote}”</blockquote>
        <dl class="keeper-facts"><div><dt>성격</dt><dd>${p.traits}</dd></div><div><dt>처음 드는 무기</dt><dd>${p.weapon}<small>${p.action}</small></dd></div></dl>
        <section class="keeper-origin" aria-labelledby="keeperOriginTitle"><span class="keeper-file-label">원정대에 들어온 이유</span><h4 id="keeperOriginTitle">${p.heading}</h4>${p.story.map(t=>`<p>${t}</p>`).join('')}</section>
        <p class="keeper-goal"><span>첫 순찰의 약속</span>${p.goal}</p>
        <details class="keeper-secret"><summary>${p.name}의 작은 비밀</summary><p>${p.secret}</p></details>
    </article>`;
};
