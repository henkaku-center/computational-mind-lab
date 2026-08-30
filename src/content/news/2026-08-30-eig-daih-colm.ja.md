---
title: DAIH（COLM 2026）にコスト考慮型LLM診断に関する新論文が採択
excerpt: >-
  Gaudiy Inc.との共同研究による、コスト考慮型の逐次診断のための、LLMとベイズ推論を組み合わせたハイブリッドフレームワークが、COLM
  2026のDeploying AI in Healthcareワークショップに採択されました。
date: 2026-08-30T00:00:00.000Z
locale: ja
translationKey: 2026-08-30-eig-daih-colm
translated: auto
tags:
  - publications
  - natural language processing
  - bayesian modeling
  - conferences
sourceHash: 77a464b905403aae6571a4af9d75c82abb4a25aae590ce13bf838842cf28d2c3
---

[Adaptive Bayesian Active Querying with LLMs for Efficient Information
Gathering](/papers/files/MalkocetalDAIH2026EIG.pdf)が、[Conference on Language Modeling (COLM) 2026](https://colmweb.org/)のワークショップである
[DAIH: Deploying AI in Healthcare](https://daih2026.github.io/)に採択されました。

この論文は、私たちの[疾患進行モデリングの研究](/en/projects/disease-progression/)と隣接する問いを扱っています。
事後的にバイオマーカーの軌跡を再構成するのではなく、システムは次に*何を*尋ねるべきかを
どのように決定すればよいのでしょうか。LLMはもっともらしい診断質問を生成し、各回答の起こりやすさを
推測することはできますが、自身では較正された信念を追跡できません。私たちはLLMと
ベイズ的意思決定層を組み合わせ、各候補質問（または費用のかかる検査）を単位コストあたりの
期待情報利得によってスコアリングします。これにより、費用のかかる検査を指示する前に、安価な
症状に関する質問で仮説空間を絞り込むことができます。実際の救急外来の症例では、
このシステムは最良の非適応的ベースラインと比較して31%低いコストで86.6%の診断精度を
達成しました。

このプロジェクトは、[Gaudiy Inc.](https://gaudiy.com/en/)のOgnjen Malkoc
（オグニェン・マルコッチ、愛称「Ogi」）氏とShubham Saha（シュバム・サハ）氏が主導し、[JPCCA](https://jpcca.org/)
および[千葉工業大学](https://chibatech.jp/english/)のMizuki Oka（ミズキ・オカ）氏、
ウィスコンシン大学マディソン校の[Hongtao
Hao](https://hongtaoh.com/)（ホンタオ・ハオ）氏、[Grisha
Szep](https://gszep.com/)（グリシャ・シェプ）氏、そして本研究室のJoseph Austerweil
（ジョセフ・オースターワイル）が加わりました。本研究についても、疾患進行モデリングと
同様に[JPCCA](https://jpcca.org/)にご支援いただいたことに感謝申し上げます。

[コードとデータはGitHubで公開されています](https://github.com/gaudiy/rnd_bayesian_eig_colm)。
