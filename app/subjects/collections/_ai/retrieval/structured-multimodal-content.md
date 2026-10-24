---
title: "Retrieving tables, images, code and structured evidence"
description: "Preserve relationships across document layouts instead of reducing every source to arbitrary text chunks."
chapter: retrieval
order: 7
sequence: 607
level: Intermediate
mermaid: true
keywords: [multimodal RAG, tables, PDF parser, OCR, code AST, layout aware chunking, parent child retrieval]
aliases: [chunk tables images, document parsing quality]
interview_queries: [how do you chunk PDF tables, how to search code with RAG, how to index images]
---
Text splitting works when documents are mostly narrative prose. It fails when meaning depends on relationships encoded in layout, tables, images or code structure. A value such as *14.6* means little without its column heading, currency, period and entity. A code fragment may refer to a symbol defined in another file.

## Preserve document layout before embedding

Document ingestion first identifies source type and its internal structure. Optical character recognition (OCR) converts pixels to text, while layout extraction identifies headings, tables, captions, lists and reading order. The parser should preserve source-page and bounding-region references so a retrieval hit can be traced back to the evidence a reviewer sees.

For a table, capture the table title, headers, row identity, units and dates. When a long table must split, repeat headers and stable identifiers in every fragment. If a question requires exact sums, ranges or joins across thousands of table rows, place the structured records in SQL and let retrieval locate the table definition or relevant identifiers.

For images, store captions, surrounding text and image references. Multimodal encoders can represent image content for retrieval, but require their own modality-aligned training and evaluation. OCR alone can miss a chart's trends, legend or visual relationships.

## Use syntax-aware units for code

An abstract syntax tree (AST) identifies functions, classes and declarations. Index a method together with its signature, file path, language, imports and surrounding documentation. Stable symbols support links to callers and tests. A function-only snippet may answer “where is this implemented?” while a parent file excerpt answers “what state does it rely on?”

{% capture diagram_code %}
flowchart TD
S["Source files"] --> T{"Type"}
T -->|Prose| P["Sections / paragraphs"]
T -->|Table| U["Headers + typed rows / SQL records"]
T -->|Code| C["AST symbol + signatures"]
T -->|Image| I["Caption + image reference / multimodal encoder"]
P --> X["Source-aware retrieval units"]
U --> X
C --> X
I --> X
X --> Y["Lexical + modality-compatible vector indexes"]
Y --> Z["Evidence assembly with provenance"]
{% endcapture %}
{% capture diagram_fallback %}
Source type determines extraction: prose becomes sections; tables keep headings and typed rows; code becomes AST-aware symbols; images keep captions or aligned multimodal embeddings. All indexed units preserve source references.
{% endcapture %}
{% include diagram.html title="Extract evidence according to its source structure" code=diagram_code fallback=diagram_fallback caption=true %}

## Parent-child and multi-vector retrieval

A short child chunk can be an excellent search key while omitting the parent section needed for an accurate answer. Store links from child chunks to larger parents. Retrieve children for precision, then fetch selected parents for complete context; account for the extra tokens.

For tables, it can be useful to index both the table summary and row-level representations. For code, index names, docstrings and behavior descriptions alongside symbols. This improves recall but creates multiple entries per source object, so deduplication and version tracking become essential.

## Failure-specific tests

Build evaluation questions that require reading a table across a page break, recognizing units, resolving a variable defined in a different module, interpreting a figure or citing an exact line. Validate the parser and extraction output separately from retrieval; an encoder cannot retrieve a cell lost during extraction.

Record document and section revisions with source-span provenance, then check that updates to a table or function invalidate the matching chunks and answers. The [incremental indexing guide]({{ '/ai-engineering/retrieval/document-chunks-incremental-updates/' | relative_url }}) owns that update process.
