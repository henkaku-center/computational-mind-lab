---
title: 疾患進行のモデル化
excerpt: >-
  慢性疾患が脳と行動を変化させていく順序を、単一時点で収集されたデータから復元する確率モデルおよびTransformerベースのモデル。Hongtao
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
sourceHash: f3aee2205002957dab4693cc6c9fd133e2f7f252547a8335fd4273c04b44c05c
---

アルツハイマー病のような慢性疾患は数十年かけて進行しますが、収集できるデータは通常**横断的（cross-sectional）**です。つまり、患者一人につき得られるのは、たまたまその時点にあった病期での測定値1つだけです。イベントベースモデル（event-based models）は、この制約を推論の問題へと転換します——各患者が、共通の根底にある軌跡（trajectory）上のある一時点のスナップショットであるならば、そのスナップショット群から軌跡を再構成できるはずです。

この研究の流れを主導しているのは**[Hongtao Hao（ホンタオ・ハオ）](https://hongtaoh.com/)**で、博士課程を通じてこの研究を築き上げ、現在も継続しています。以下のモデルはいずれもインストール可能なパッケージとして提供されています。誰も実行できない手法は、手法とは言えないからです。

私たちの知る限り、これらのモデルは**イベントベース疾患進行モデリングにおける最先端（state of the art）**です。9,000件の合成データセットと実際のADNIデータを用いた評価において、私たちのステージ考慮型モデル（stage-aware model）は、Gaussian mixture EBM、kernel density EBM、discriminative EBMを含む既存のイベントベース手法を、疾患イベントの順序の復元と患者の病期割り当ての両方において有意に上回りました。直感に反するため、あえて明記しておく価値のある知見があります。それは、より単純なGaussianベースのモデルが、より複雑なKDEベースのモデルを一貫して上回るという点です。

## モデル一覧

**ステージ考慮型モデリング(SA-EBM)。** 標準的なイベントベースモデルは、各バイオマーカーを「影響を受けている」か「影響を受けていない」かの二値で扱います。私たちは、疾患が進行するにつれてより多くの認知的・生物学的要因に影響を及ぼしていくという直感を定式化し、ステージを直接モデル化することで進行順序の復元精度が向上することを示しました。
[論文](/papers/files/Haoetal2025SAEBM.pdf) ·
[GitHub](https://github.com/jpcca/pysaebm) ·
[`pip install pysaebm`](https://pypi.org/project/pysaebm/)

**サブタイプ(Bayesian EBM)。** 疾患はすべての患者で同じように進行するわけではありませんが、かといって無秩序にばらつくわけでもありません——通常、いくつかの繰り返し現れるサブタイプが存在します。私たちはサブタイプと病期を同時に推定します。
[論文](/papers/files/HaoAusterweil2025BEBMS.pdf) ·
[GitHub](https://github.com/jpcca/bebms_pkg) ·
[`pip install bebms`](https://pypi.org/project/bebms/)

**混合病理(JPM)。** ほとんどのイベントベースモデルは、一人につき一つの疾患を仮定します。しかし実際には、複数の病理が同時に進行することが多いため、私たちは単一の説明を無理に当てはめるのではなく、それらを同時にモデル化します。
[論文](/papers/files/Hao2025JPM.pdf) ·
[GitHub](https://github.com/jpcca/pyjpm) ·
[`pip install pyjpm`](https://pypi.org/project/pyjpm/)

**学習ベース推論(TEMPO)。** 確率モデルからシミュレートされたデータで学習したTransformerは、元の手法よりも高速かつ高精度に推論を行います——ただし、確率モデルは、学習データの供給源としても、結果を解釈可能にするものとしても、依然として不可欠です。
[論文(CHIL 2026)](/papers/files/HaoetalCHIL2026TEMPO.pdf) ·
[GitHub](https://github.com/jpcca/tempo)

## 共同研究

この研究は神経学および神経画像分野の共同研究者と共に行われており、オープンな形で開発されています——コードとデータは[JPCCA GitHub組織](https://github.com/jpcca)で公開されています。最近の成果は[ML4HおよびNeurIPS Time Series for Healthワークショップ](/en/news/2025-12-05-ml4h-neurips/)で発表され、TEMPOは[CHIL 2026](/en/news/2026-06-25-chil-tempo/)で発表されました。

Hongtao Hao（ホンタオ・ハオ）やGrisha Szep（グリシャ・シェプ）など一部同じ共同研究者と、JPCCAの支援によって進められている、より緩やかに関連した研究の流れでは、異なる枠組みで隣接する問いを扱っています。スナップショットから軌跡を再構成する代わりに、診断の過程でシステムが次に何を尋ねるべきかをどう決定するか、という問いです。詳細は[Adaptive Bayesian Active Querying with LLMs for Efficient Information Gathering](/en/news/2026-08-30-eig-daih-colm/)を参照してください。これはCOLM 2026のDAIHワークショップで発表されました。
