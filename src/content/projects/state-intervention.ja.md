---
title: 報酬ではなく世界を変えることによる教示
excerpt: >-
  何をすべきか指示できないエージェントを、人はどう教えるのでしょうか。私たちは、物理的な状態介入による教示——学習者が正しい行動を自ら発見できるように環境を並べ替えること——について研究しています。
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
sourceHash: 2db7bb0c031d493b4731e2c33f4a043e357812967e71a48cbeb349b802817424
---

機械教示（machine teaching）に関する研究の多くは、教師が学習者の報酬を形作れる、あるいは課題を直接実演できることを前提としています。しかし、日常の教示の多くはそれとは異なる仕組みで機能します——私たちは**世界を変える**ことで、学習者自身の探索が有益な場所へとたどり着くようにするのです。ロボット掃除機の進路から障害物をどける、本の山の一番上に面白い本を置く、といった具合です。

本プロジェクトでは、人がこうした物理的な状態介入（physical state intervention）を通じてどのように教えるのかを問うとともに、身の回りの世界が不自然なほど都合よく変化し続けるとき、モデルフリー強化学習（model-free reinforcement learning）エージェントは何を推論すべきかを検討します。

## 研究の現状

CogSci 2026では、ジュオルン・ジョン（Zhuolun Zhong）を筆頭著者とする3本の論文が発表されました。

- [How the Teaching Style and Interpretation Type of State Interventions Shape Multi-Agent Coordination](/papers/files/Zhongetal2026CogScia.pdf) — 計算論的な側面を扱った論文で、教師のスタイルと学習者の解釈がどのように相互作用し、協調を生み出す（あるいは損なう）かを検討しています。
- [Individual Differences in Human Teaching of Reinforcement Learning Agents](/papers/files/Zhongetal2026CogScib.pdf) — 人による教え方は一様ではなく、ベイズ的仮説検定（Bayesian hypothesis testing）を用いることで、その違いを明らかにできることを示しています。
- [Interpretational alignment: How agents learn from physical guidance depends on how they interpret it](/papers/files/Zhongetal2026CogScic.pdf) — 簡略化されたグリッドワールド（grid-world）設計を用いており、スタンフォード大学、プリンストン大学、ENS（エコール・ノルマル・シュペリウール）の共同研究者との共同研究です。

COSMOSサマースクールの学生たちと開発した課題の「最小パラダイム（minimal paradigm）」版により、オンライン実験にも適した扱いやすい設計が可能になりました。コードは[cosmos-state-interventions](https://github.com/benpry/cosmos-state-interventions)で公開されています。

## 背景

この一連の研究は、教示とは計算論的に何であるかについて、[Mark Ho（マーク・ホー）](http://www.markkho.com/)との長年の共同研究から生まれたものです。

- [Teaching with rewards and punishments: Reinforcement or communication?](/en/publications/#ho15)（CogSci 2015）と、その後継となるジャーナル論文 [People Teach with Rewards and Punishments as Communication, not Reinforcement](/en/publications/#hoetal2019jep)（JEP: General, 2019）——人が与える報酬はメッセージであって強化信号ではない、という知見です。
- [Showing versus doing: Teaching by demonstration](/en/publications/#ho16nips)（NIPS 2016）および[Effectively Learning from Pedagogical Demonstrations](/en/publications/#hoetal2018)（CogSci 2018）——*情報を伝えること*を目的に選ばれた実演は、*最適な行動を示すこと*を目的に選ばれた実演と体系的に異なる、という知見です。
- [Teaching by intervention: Working backwards, undoing mistakes, or correcting mistakes?](/en/publications/#ho17)（CogSci 2017）——本プロジェクトに最も直接つながる先行研究で、世界そのものに働きかけることによる教示を扱っています。
- [Communication in Action: Belief-directed Planning and Pragmatic Action Interpretation](/en/publications/#ho2021)（JEP: General, 2021）。

この研究を支える確率論的な仕組みに興味がある方は、[確率の物語による入門](/en/projects/probability-tutorial/)から順を追って解説していますので、ぜひご覧ください。
