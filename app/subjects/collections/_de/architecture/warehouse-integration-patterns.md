---
title: "Kimball, Inmon, Data Vault and hybrid warehouse design"
description: "Choose integration and presentation patterns from shared definitions, source volatility, audit history and delivery cost."
chapter: "architecture"
order: 1
sequence: 176
level: "Core"
mermaid: true
keywords: ["Kimball","Inmon","Data Vault","3NF warehouse","bus matrix","conformed dimensions","data lake","lakehouse","data mesh","hybrid architecture"]
interview_queries: ["Kimball vs Inmon vs Data Vault","when to combine warehouse modelling approaches"]
last_verified: "2026-10-25"
references: [{"title":"Kimball enterprise warehouse bus architecture","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-architecture/"},{"title":"Bill Inmon on the Corporate Information Factory","url":"https://www.ewsolutions.com/evolution-corporate-information-factory/"},{"title":"Data Vault Alliance introduction","url":"https://datavaultalliance.com/engineering/data-vault-2-0-an-introduction/"},{"title":"Data Mesh principles by Zhamak Dehghani","url":"https://martinfowler.com/articles/data-mesh-principles.html"}]
---

A retailer wants sales, returns and support metrics across several acquired businesses. Customer identifiers disagree, source systems change independently, and finance needs reproducible historical totals. The design must decide where identities are reconciled and how consumers receive stable definitions.

## Compare integration and presentation responsibilities

| Approach | Integration emphasis | Consumer representation | Main operating cost |
|---|---|---|---|
| Kimball bus architecture | Conformed dimensions and facts across business processes | Dimensional marts with shared definitions | Coordinating grain and dimensions as new processes arrive |
| Inmon-style enterprise warehouse | Integrated, normalized enterprise history | Downstream dimensional or other marts | Building the common integration model and delivering its consumers |
| Data Vault | Business keys, relationships and descriptive history with provenance | Business rules and presentation marts downstream | Many tables, temporal joins and automation/metadata discipline |
| Direct wide marts | Repeated queries over a defined business output | Denormalized reporting tables | Duplicated transformations and cross-mart definition drift |

A Kimball approach can deliver one business process at a time while planning shared dimensions through a bus matrix. It requires enterprise coordination; isolated departmental stars with incompatible customer definitions lose that integration.

An Inmon-style integration store can preserve a common enterprise representation before presentation models are built. That common layer adds work, so prioritize its contracts and consumer delivery together. A normalized integration model and dimensional reporting marts can coexist.

## Data Vault structures

A hub captures a business-key identity. A link captures a relationship between identities. A satellite holds descriptive context and its history/provenance. Operational implementations need explicit record grain, load timestamps and source identity. In the simplified schema below, the suffixes BK and HK mean business key and hash key.


{% capture diagram_1 %}
erDiagram
HUB_CUSTOMER ||--o{ LINK_CUSTOMER_ORDER : participates
HUB_ORDER ||--o{ LINK_CUSTOMER_ORDER : participates
HUB_CUSTOMER ||--o{ SAT_CUSTOMER : describes
HUB_ORDER ||--o{ SAT_ORDER : describes
HUB_CUSTOMER {
  string customer_hk PK
  string customer_bk
  timestamp loaded_at
}
HUB_ORDER {
  string order_hk PK
  string order_bk
}
LINK_CUSTOMER_ORDER {
  string link_hk PK
  string customer_hk FK
  string order_hk FK
}
SAT_CUSTOMER {
  string customer_hk FK
  timestamp loaded_at
  string region
  string record_source
}
SAT_ORDER {
  string order_hk FK
  timestamp loaded_at
  string status
}
{% endcapture %}
{% capture fallback_1 %}
Customer and order hubs retain identities, the link captures their association, and satellites retain descriptive versions. Keys and timestamps shown are simplified; the full uniqueness rules depend on satellite grain.
{% endcapture %}
{% include diagram.html title="Customer-order integration using hubs, a link and satellites" code=diagram_1 fallback=fallback_1 caption=true %}


Consumers can receive a star built from this integration model. Hash keys need canonical input and collision handling; identity matching still decides whether different source identifiers name the same customer.

A load timestamp answers when the platform recorded a change. Historical business interpretation may need separate effective times and rules.

## Storage and organizational patterns are separate choices

A **data warehouse** provides governed analytical storage and execution. A **data lake** retains diverse source and derived objects. A **lakehouse** adds table-management and analytical capabilities over lake storage. A star schema can live in a warehouse or lakehouse.

**Data mesh** assigns domain ownership and treats datasets as products supported by shared platform and governance capabilities. Domain-owned datasets still need product contracts, discoverability and cross-domain identity. A centralized team can use the same table formats and dimensional methods.

A practical hybrid can retain source objects, integrate customer/order history, then publish conformed facts to a warehouse and keyed operational projections to an application store. Each copy needs an owner, freshness promise and correction path.


{% capture diagram_2 %}
flowchart TD
S["Source applications"] --> R["Replayable raw records"]
R --> I["Identity and historical integration"]
I --> F["Conformed facts and dimensions"]
I --> O["Operational read projection"]
F --> B["Business reports"]
F --> M["Training datasets"]
I -. "Versioned rules and lineage" .-> G["Governance and reconciliation"]
G -. "Checks before publication" .-> F
{% endcapture %}
{% capture fallback_2 %}
Raw records support replay; an integration representation resolves identity and history; downstream facts support reporting and training, while an operational projection serves application lookups. Governance tracks contracts and releases.
{% endcapture %}
{% include diagram.html title="A hybrid assigns one responsibility to each representation" code=diagram_2 fallback=fallback_2 caption=true %}


## Choosing an integration model

A small team with one stable source may do well with raw retention plus tested dimensional marts. Many changing sources and audit demands may justify a more explicit integration store. Repeated definition conflicts across marts call for conformed entities and metric ownership before another processing framework.

Measure onboarding time, reconciliation effort, change propagation, query latency, freshness and maintenance cost. Schema style alone supplies no storage or throughput limit. [Capacity estimates]({{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}) turn those requirements into a workload, while [Lambda, Kappa and medallion]({{ '/data-engineering/architecture/lambda-kappa-medallion/' | relative_url }}) describe independent processing and quality choices.
