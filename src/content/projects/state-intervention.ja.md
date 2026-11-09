---
title: 報酬ではなく世界を変えて教える
excerpt: >-
  指示を伝えることのできないエージェントを、人はどのように教えるのでしょうか。本研究では、環境を並べ替えて学習者が適切な行動を自ら発見できるようにする、物理的な状態介入による教示を研究しています。
date: 2026-04-01T00:00:00.000Z
locale: ja
translationKey: state-intervention
translated: auto
tags:
  - pedagogy
  - reinforcement learning
  - social learning
status: active
weight: 20
sourceHash: da3227ba0bd8742a1ac7de7aa7f3b42535895309fc4b8cd9c4b89ff9f964262a
---

機械教示（machine teaching）に関する多くの研究は、教師が学習者の報酬を形作れること、あるいは課題を直接実演できることを前提としています。しかし、日常の教示の多くは異なる方法で行われます。学習者自身の探索が有益な結果につながるように、**世界を変える**のです。ロボット掃除機の進路から障害物をどかしたり、面白い本を山の一番上に置いたりするのがその例です。

このプロジェクトでは、人がこうした物理的な状態介入を通じてどのように教えるのか、そして、自分の周りの世界が怪しいほど都合よく変化し続けるとき、モデルフリー強化学習の学習者は何を推論すべきかを問います。

## 研究の現状

Zhuolun Zhong（ジョン ジュオルン）が主導した3件の論文が CogSci 2026 で発表されました。

- [How the Teaching Style and Interpretation Type of State Interventions Shape
  Multi-Agent Coordination](/papers/files/Zhongetal2026CogScia.pdf) — 計算論的な側面から、教師の教示スタイルと学習者の解釈がどのように相互作用して協調を生み出す（あるいは損なう）かを扱います。
- [Individual Differences in Human Teaching of Reinforcement Learning
  Agents](/papers/files/Zhongetal2026CogScib.pdf) — 人の教え方は一様ではなく、ベイズ的仮説検定によってその違いを説明できます。
- [Interpretational alignment: How agents learn from physical guidance depends
  on how they interpret it](/papers/files/Zhongetal2026CogScic.pdf) — Stanford、Princeton、ENS の共同研究者とともに行った、簡略化したグリッドワールドの設計です。

COSMOS サマースクールで学生とともに開発した、課題の「最小パラダイム」版により、オンライン実験でも扱いやすい設計になりました。コードは [cosmos-state-interventions](https://github.com/benpry/cosmos-state-interventions) で公開しています。

## 背景

この一連の研究は、教示とは計算論的に何であるかをめぐる [Mark Ho](http://www.markkho.com/)（マーク・ホー）との長年の共同研究から発展したものです。

- [Teaching with rewards and punishments: Reinforcement or communication?](/en/publications/#ho15)
  （CogSci 2015）とその学術誌版である
  [People Teach with Rewards and Punishments as Communication, not
  Reinforcement](/en/publications/#hoetal2019jep)（JEP: General, 2019） — 人が与える報酬は強化信号ではなくメッセージである、という知見です。
- [Showing versus doing: Teaching by demonstration](/en/publications/#ho16nips)
  （NIPS 2016）および [Effectively Learning from Pedagogical
  Demonstrations](/en/publications/#hoetal2018)（CogSci 2018） — *情報量が多くなる*ように選ばれた実演は、*最適*になるように選ばれた実演とは系統的に異なります。
- [Teaching by intervention: Working backwards, undoing mistakes, or correcting
  mistakes?](/en/publications/#ho17)（CogSci 2017） — 世界そのものに働きかけて教えるという、現在の研究の最も直接的な先駆けです。
- [Communication in action: Planning and interpreting communicative
  demonstrations](/en/publications/#ho2021)（JEP: General, 2021）

この研究の背後にある確率論の仕組みに興味がありますか。[確率の物語的入門](/en/projects/probability-tutorial/)では、ゼロから順を追って解説しています。
