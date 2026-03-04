---
name: clarify
description: Clarify ambiguity in user requests, strategies, or approaches. Routes to the appropriate sub-skill. Trigger on "clarify", "명확히", "뭘 원하는 건지", "뭘 놓치고 있지", "blind spots", "관점 전환", "다른 방법 없을까", "/clarify". Sub-skills — vague (requirement clarification, "요구사항 정리", "spec this out"), unknown (strategy blind spots with Known/Unknown quadrants, "4분면 분석", "assumption check", "가정 점검"), metamedium (content vs form reframing, "내용 vs 형식", "diminishing returns", "형식을 바꿔볼까").
---

# Clarify: Ambiguity Resolution Router

Route to the correct sub-skill based on the user's need. All sub-skills share a common principle: **hypothesis-driven questioning via AskUserQuestion** (never open questions in plain text).

## Sub-skill Selection

| Sub-skill      | When                                                              | Read                  |
| -------------- | ----------------------------------------------------------------- | --------------------- |
| **vague**      | Ambiguous requirements need concrete specs                        | `vague/SKILL.md`      |
| **unknown**    | Strategy/plan needs blind spot analysis (Known/Unknown quadrants) | `unknown/SKILL.md`    |
| **metamedium** | Stuck optimizing content, need form-level reframing               | `metamedium/SKILL.md` |

## Decision Logic

1. **Requirements are unclear** → `vague` (turn "add login" into a spec)
2. **Strategy has hidden assumptions** → `unknown` (surface what you don't know you don't know)
3. **Diminishing returns on current approach** → `metamedium` (change the medium, not just the message)

If unclear which sub-skill fits, use AskUserQuestion:

```
questions:
  - question: "어떤 종류의 명확화가 필요한가요?"
    header: "유형"
    options:
      - label: "요구사항 정리"
        description: "모호한 요청을 구체적이고 실행 가능한 스펙으로 변환"
      - label: "블라인드 스팟 분석"
        description: "전략이나 계획에 숨겨진 가정과 미지의 영역을 발견"
      - label: "형식 재정의"
        description: "내용이 아닌 매체/구조 자체를 바꿔서 더 큰 레버리지를 얻을 수 있는지 점검"
    multiSelect: false
```

After selection, read the corresponding sub-skill's SKILL.md and follow its protocol.
