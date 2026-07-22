---
title: 疾患進行のモデル化
excerpt: >-
  慢性疾患が脳と行動をどのような順序で変化させるかを再構築する、確率モデルおよびTransformerベースのモデルで、単一時点で収集されたデータから学習する。Hongtao
  Hao（ホンタオ・ハオ）が主導。
date: 2026-04-01T00:00:00.000Z
locale: ja
translationKey: disease-progression
translated: auto
tags:
  - disease progression
  - bayesian modeling
  - computational psychiatry
status: active
repo: 'https://github.com/jpcca'
weight: 30
sourceHash: c0d527b40675c25b3704fc32f4d82c10c68bcfe5b580c7a4373ad65cdfd1bd23
---

アルツハイマー病のような慢性疾患は数十年かけて進行するが、実際に収集できるデータは通常**横断的（cross-sectional）**なものにとどまる——つまり、各患者について、その時点でのステージにおける一回の測定にすぎない。イベントベースモデル（event-based model）は、この制約を推論の問題へと転換する——各患者を、共通の進行過程における一つのスナップショットと捉えれば、複数のスナップショットからその進行過程全体を再構築できる。

この一連の研究は**[Hongtao Hao](https://hongtaoh.com/)**（ホンタオ・ハオ）が主導し、博士課程を通じて築き上げ、現在も続けている。誰も実行できない手法は手法とは言えないという考えから、以下のモデルはすべてインストール可能なパッケージとして公開する。

私たちの知る限り、これらのモデルは**イベントベースの疾患進行モデリングにおける最先端（state of the art）**に位置する。9,000件の合成データセットと実際のADNIデータを用いた評価において、私たちのステージ考慮型モデル（stage-aware model）は、Gaussian mixture EBM、kernel density EBM、discriminative EBMを含む既存のイベントベース手法を、疾患イベントの順序の復元と患者のステージ判定の両方において大きく上回る。特筆すべき知見が一つある。直感に反する結果だが、よりシンプルなGaussianベースのモデルは、より複雑なKDEベースのモデルよりも一貫して優れている。

## モデル一覧

**ステージ考慮型モデリング（SA-EBM）。** 標準的なイベントベースモデルは、すべてのバイオマーカーを「影響あり」か「影響なし」かのいずれかとして扱う。私たちは、疾患が進行するにつれてより多くの認知的・生物学的要因に影響を及ぼしていくという直観を定式化し、ステージを直接モデル化することで進行順序の復元精度が向上することを示した。
[論文](/papers/files/Haoetal2025SAEBM.pdf) ·
[GitHub](https://github.com/jpcca/pysaebm) ·
[`pip install pysaebm`](https://pypi.org/project/pysaebm/)

**サブタイプ（Bayesian EBM）。** 疾患はすべての患者で同じように進行するわけではないが、かといって無秩序にばらつくわけでもなく、通常はいくつかの典型的なサブタイプが存在する。私たちは、サブタイプとステージを同時に推定する。
[論文](/papers/files/HaoAusterweil2025BEBMS.pdf) ·
[GitHub](https://github.com/jpcca/bebms_pkg) ·
[`pip install bebms`](https://pypi.org/project/bebms/)

**混合病理（JPM）。** 多くのイベントベースモデルは、一人につき一つの疾患のみを想定している。しかし実際には、複数の病理が同時に進行することが多いため、単一の説明を無理に当てはめるのではなく、それらを同時にモデル化する。
[論文](/papers/files/Hao2025JPM.pdf) ·
[GitHub](https://github.com/jpcca/pyjpm) ·
[`pip install pyjpm`](https://pypi.org/project/pyjpm/)

**学習による推論（TEMPO）。** 確率モデルからシミュレートされたデータで学習させたTransformerは、私たちの元の手法よりも高速かつ高精度に推論を行う。ただし確率モデルは、学習データの供給源としても、結果の解釈可能性を担保するものとしても、引き続き欠かせない。
[論文（CHIL 2026）](/papers/files/HaoetalCHIL2026TEMPO.pdf) ·
[GitHub](https://github.com/jpcca/tempo)

## 共同研究

本研究は神経学および神経画像研究の共同研究者との共同作業であり、コードとデータは[JPCCAのGitHub組織](https://github.com/jpcca)で公開の形で開発されている。直近の成果は[ML4H and the NeurIPS Time Series for Health workshop](/en/news/2025-12-05-ml4h-neurips/)で発表され、TEMPOは[CHIL 2026](/en/news/2026-06-25-chil-tempo/)で発表された。
