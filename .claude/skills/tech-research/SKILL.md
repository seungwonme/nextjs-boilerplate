---
name: tech-research
description: 기술 리서치 및 의사결정 통합 스킬. 커뮤니티 의견 스캔, 구현 전 리서치, 기술 의사결정을 모드별로 제공. "개발자 반응", "커뮤니티 의견", "리서치해줘", "모범 사례", "A vs B", "비교 분석", "뭐 쓸지", "기술 의사결정" 요청에 사용. 3가지 모드 — scan (커뮤니티 의견만), research (구현 전 리서치), decision (기술 의사결정 분석).
version: 1.0.0
---

# Tech Research - 기술 리서치 & 의사결정

기술 리서치부터 의사결정까지 3가지 모드로 운영. 모든 리서치는 **SubAgent로 실행**하여 메인 컨텍스트를 깔끔하게 유지.

## 핵심 원칙

1. **SubAgent 패턴**: 모든 리서치는 Task tool로 SubAgent에 위임. 메인 컨텍스트에서 직접 WebSearch/Tavily 호출 금지.
2. **정제된 결과만**: Agent가 반환한 요약만 메인 컨텍스트에 남기고, 원본 검색 결과는 SubAgent 컨텍스트에서 소멸.
3. **모드에 맞는 agent만 실행**: scan 모드에서 전체 파이프라인 실행하지 말 것.

## 모드 선택

| 모드         | 트리거                                                | 실행 Agent                          | 용도                 |
| ------------ | ----------------------------------------------------- | ----------------------------------- | -------------------- |
| **scan**     | "커뮤니티 의견", "개발자 반응", "반응 어때"           | community-scanner                   | 커뮤니티 의견 수집   |
| **research** | "~ 구현할 건데 리서치", "모범 사례", "best practices" | docs-researcher + community-scanner | 구현 전 리서치       |
| **decision** | "A vs B", "뭐 쓸지", "기술 의사결정", "비교 분석"     | 전체 agent 파이프라인               | 기술 비교 & 의사결정 |

### 분기 로직

1. **커뮤니티 의견만 필요** → `scan` 모드
2. **구현 전 모범 사례/패턴 조사** → `research` 모드
3. **기술 비교/선택이 필요** → `decision` 모드

판단이 어려우면 AskUserQuestion:

```
questions:
  - question: "어떤 리서치가 필요한가요?"
    header: "모드"
    options:
      - label: "커뮤니티 스캔"
        description: "Reddit, HN 등에서 개발자 의견 수집"
      - label: "구현 전 리서치"
        description: "모범 사례, 패턴, 공식 문서 조사 후 구현"
      - label: "기술 의사결정"
        description: "A vs B 비교 분석, 트레이드오프 평가, 최종 보고서"
    multiSelect: false
```

---

## Scan 모드

커뮤니티 의견만 빠르게 수집.

### 실행

```
Task community-scanner (agents/community-scanner.md 읽고 프롬프트로 사용)
  - subagent_type: "general-purpose"
  - 주제: [사용자 요청에서 추출한 토픽]
```

### 결과

community-scanner agent가 반환한 Consensus / Controversy / Notable Perspective를 그대로 사용자에게 전달.

---

## Research 모드

구현 전 모범 사례와 패턴을 조사. **핵심: SubAgent가 리서치하고, 정제된 결과만 메인 컨텍스트에 반환.**

### 실행

```
┌──────────────────────────────────────────────────┐
│  병렬 실행 (Task tool)                             │
├──────────────────────────────────────────────────┤
│  1. docs-researcher agent                         │
│     → 공식 문서, best practices, 코드 예시 수집     │
│     → research 모드 출력 형식 사용                  │
│                                                    │
│  2. community-scanner agent                        │
│     → 실무자 경험담, 주의사항, 안티패턴 수집         │
└──────────────────────────────────────────────────┘
```

### 결과 종합

두 agent의 결과를 합쳐서 사용자에게 전달 후 구현 진행.

---

## Decision 모드

기술 비교/의사결정을 위한 체계적 분석. 두괄식 보고서로 결론 도출.

### Phase 1: 문제 정의

1. **주제 파악**: 무엇을 결정해야 하는가?
2. **옵션 식별**: 비교할 선택지들
3. **평가 기준 수립**: `references/evaluation-criteria.md` 참조

### Phase 2: 병렬 정보 수집

```
┌──────────────────────────────────────────────────────┐
│  동시 실행 (Task tool로 병렬)                           │
├──────────────────────────────────────────────────────┤
│  1. codebase-explorer agent                           │
│     → 기존 코드베이스 분석, 패턴/제약사항 파악           │
│                                                        │
│  2. docs-researcher agent                              │
│     → 공식 문서, 가이드, best practices 리서치           │
│                                                        │
│  3. community-scanner agent                            │
│     → Reddit, HN, Dev.to, Lobsters 의견 수집            │
│                                                        │
│  4. [선택] Skill: agent-council                        │
│     → 다양한 AI 전문가 관점 수집                         │
└──────────────────────────────────────────────────────┘
```

### Phase 3: 종합 분석

tradeoff-analyzer agent 실행:
- 각 옵션별 pros/cons 정리
- 평가 기준별 점수화
- 충돌하는 의견 정리

### Phase 4: 최종 보고서

decision-synthesizer agent로 두괄식 보고서 작성 (`references/report-template.md` 참조).

---

## Agent 목록

각 에이전트의 상세 프롬프트는 `agents/` 디렉토리에 위치. Task tool로 실행 시 해당 파일을 읽고 프롬프트로 활용.

| Agent                  | 파일                             | 역할                               | 사용 모드                |
| ---------------------- | -------------------------------- | ---------------------------------- | ------------------------ |
| `community-scanner`    | `agents/community-scanner.md`    | 커뮤니티 의견 수집                 | scan, research, decision |
| `docs-researcher`      | `agents/docs-researcher.md`      | 공식 문서, Tavily, Context7 리서치 | research, decision       |
| `codebase-explorer`    | `agents/codebase-explorer.md`    | 기존 코드베이스 분석               | decision                 |
| `tradeoff-analyzer`    | `agents/tradeoff-analyzer.md`    | 트레이드오프 비교 분석             | decision                 |
| `decision-synthesizer` | `agents/decision-synthesizer.md` | 두괄식 최종 보고서                 | decision                 |

## 외부 스킬

| Skill           | 용도                | 사용 모드       |
| --------------- | ------------------- | --------------- |
| `agent-council` | AI 전문가 관점 수집 | decision (선택) |

## 참조 파일

- **`references/evaluation-criteria.md`** - 평가 기준 가이드
- **`references/report-template.md`** - 상세 보고서 템플릿

## 빠른 실행 가이드

### Scan: 커뮤니티 의견 수집

```
사용자: "Tailwind v4 개발자들 반응 어때?"
→ Task community-scanner: "Tailwind v4"
→ 결과 전달
```

### Research: 구현 전 리서치

```
사용자: "Server Actions 사용해서 폼 구현할 건데, 모범 사례 찾아줘"
→ Task docs-researcher + Task community-scanner (병렬)
→ 정제된 패턴/주의사항 전달 후 구현 진행
```

### Decision: 기술 의사결정

```
사용자: "Redux vs Zustand vs Jotai 뭐가 나을까?"
→ Phase 1: 문제 정의
→ Phase 2: 4개 agent 병렬 수집
→ Phase 3: tradeoff-analyzer
→ Phase 4: decision-synthesizer
→ 두괄식 최종 보고서
```

## 주의사항

1. **컨텍스트 제공**: 프로젝트 특성, 팀 규모, 기존 기술 스택 등 맥락 정보가 많을수록 정확한 분석 가능
2. **평가 기준 확인**: decision 모드에서는 사용자에게 중요한 기준이 무엇인지 먼저 확인
3. **출처 필수**: 모든 주장에 출처 URL 포함
4. **두괄식**: decision 모드 보고서는 결론부터
