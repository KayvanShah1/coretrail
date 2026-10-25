---
title: "Interview patterns"
nav_title: "Overview"
description: "Recognize recurring problems and choose a reliable approach."
keywords:
  - deduplication
  - gaps and islands
  - funnels
  - retention
aliases:
  - SQL interview patterns
chapter: "patterns"
order: 0
sequence: 700
level: "Chapter overview"
mermaid: true
math: true
---

## Recognize a problem, then compose a solution

Interview questions often combine a few operations across different grains. The wording map suggests a starting point; the worked lessons show why the stages are needed and where a plausible shortcut breaks.


## Technique map

Use this when the problem sounds familiar but the SQL shape does not come back immediately. Start from the problem shape, then open the page that owns the detailed explanation.

### Pick the right row

| Problem shape | Technique | Building blocks | Detailed page |
|---|---|---|---|
| latest / earliest row per entity | Latest-per-group | `ROW_NUMBER` → filter `rn = 1` | [Duplicates & latest records]({{ '/sql/patterns/deduplication/' | relative_url }}) |
| exactly top N rows per group | Top-N per group | `ROW_NUMBER` + outer filter | [Ranking]({{ '/sql/windows/ranking/' | relative_url }}) |
| top N distinct values / levels | Tie-preserving ranking | `DENSE_RANK` + outer filter | [Ranking]({{ '/sql/windows/ranking/' | relative_url }}) |
| previous / next observed value | Neighbor comparison | `LAG` / `LEAD` | [LAG & LEAD]({{ '/sql/windows/lag-lead/' | relative_url }}) |

### Sequences & events

| Problem shape | Technique | Building blocks | Detailed page |
|---|---|---|---|
| consecutive dates / streaks | Gaps & Islands | deduplicate → `ROW_NUMBER` → stable island key | [Gaps & Islands]({{ '/sql/patterns/gaps-islands/' | relative_url }}) |
| new session after inactivity | Sessionization | `LAG` → boundary flag → cumulative `SUM` | [Sessions & state changes]({{ '/sql/patterns/sessions/' | relative_url }}) |
| runs of the same state | State-change islands | `LAG` → changed flag → cumulative `SUM` | [Sessions & state changes]({{ '/sql/patterns/sessions/' | relative_url }}) |
| view → cart → purchase | Ordered funnel | stage timestamps / ordered existence checks | [Ordered funnels]({{ '/sql/patterns/funnels/' | relative_url }}) |
| first event followed by a later event | First → later | first-event CTE → later join / `EXISTS` | [Ordered funnels]({{ '/sql/patterns/funnels/' | relative_url }}) |

### Time & periods

| Problem shape | Technique | Building blocks | Detailed page |
|---|---|---|---|
| month-over-month / year-over-year change | Period comparison | aggregate to period → `LAG` | [Period changes]({{ '/sql/patterns/period-changes/' | relative_url }}) |
| missing dates must appear | Calendar spine | generate dates → aggregate facts → `LEFT JOIN` | [Retention & missing dates]({{ '/sql/patterns/retention-calendar/' | relative_url }}) |
| running / cumulative metric | Running window | aggregate if needed → `SUM OVER` + frame | [Running calculations]({{ '/sql/windows/running-calculations/' | relative_url }}) |
| last N observations / days | Moving window | `ROWS` or time-aware `RANGE` | [Window frames]({{ '/sql/windows/frames/' | relative_url }}) |

### Existence & sets

| Problem shape | Technique | Building blocks | Detailed page |
|---|---|---|---|
| at least one related row | Semi-join | correlated `EXISTS` | [EXISTS, IN, ANY & ALL]({{ '/sql/subqueries/exists-in-all/' | relative_url }}) |
| no related row | Anti-join | `NOT EXISTS` | [EXISTS, IN, ANY & ALL]({{ '/sql/subqueries/exists-in-all/' | relative_url }}) |
| every required item | Relational division | double `NOT EXISTS` or constrained `HAVING COUNT(DISTINCT ...)` | [Set operations & all-item matches]({{ '/sql/joins/set-operations/' | relative_url }}) |
| every entity × category/date pair | Expected combinations | `CROSS JOIN` → `LEFT JOIN` | [Joins & row multiplication]({{ '/sql/joins/join-types/' | relative_url }}) |

### Metrics & comparisons

| Problem shape | Technique | Building blocks | Detailed page |
|---|---|---|---|
| categories become columns | Conditional pivot | `SUM(CASE ...)` / conditional aggregates | [Conditional aggregation & pivots]({{ '/sql/patterns/pivoting/' | relative_url }}) |
| percentage / conversion rate | Population-first rate | align numerator + denominator grain | [Rates & populations]({{ '/sql/patterns/rates-and-populations/' | relative_url }}) |
| combine group rates | Weighted average | sum weighted numerators / denominators | [Rates & populations]({{ '/sql/patterns/rates-and-populations/' | relative_url }}) |
| median / p95 / threshold | Ordered-set percentile | `PERCENTILE_CONT / DISC ... WITHIN GROUP` | [Percentiles & thresholds]({{ '/sql/aggregation/percentiles/' | relative_url }}) |
| quartiles / deciles | Equal-row buckets | `NTILE(n) OVER (...)` | [Window distributions]({{ '/sql/windows/distribution/' | relative_url }}) |
| overlapping bookings / ranges | Interval overlap | self join + overlap condition | [Interval overlaps]({{ '/sql/patterns/interval-overlaps/' | relative_url }}) |

## High-value composition patterns

### Aggregate → window

Use whenever a comparison should happen **after** reducing data to the reporting grain.

{% capture diagram_code %}
flowchart LR
accTitle: Aggregate before applying a window
A["Raw rows"] --> B["GROUP BY period or entity"] --> C["Window over aggregated rows"]
click B href "{{ '/sql/aggregation/aggregate-functions/' | relative_url }}" "Open GROUP BY period or entity" _self
click C href "{{ '/sql/windows/introduction/' | relative_url }}" "Open Window over aggregated rows" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Raw rows
2. [GROUP BY period or entity]({{ '/sql/aggregation/aggregate-functions/' | relative_url }})
3. [Window over aggregated rows]({{ '/sql/windows/introduction/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Aggregate before applying a window" code=diagram_code fallback=diagram_fallback %}

Examples: MoM revenue, rank stores by total visits, percentage of total, cumulative monthly sales.

### LAG → arithmetic

For current value {% include math.html tex="x_t" %} and previous value {% include math.html tex="x_{t-1}" %}:

{% include math.html tex="\text{absolute change}=x_t-x_{t-1}" block=true %}

{% include math.html tex="\text{change (\%)}=100\times\frac{x_t-x_{t-1}}{x_{t-1}}" block=true %}

Percentage change is undefined when the previous value is zero. Protect that denominator in SQL with `NULLIF`.

### LAG → flag → cumulative SUM

{% capture diagram_code %}
flowchart LR
accTitle: Turn events into sessions or runs
A["Ordered events"] --> B["LAG: previous event or state"] --> C["CASE: mark each boundary"] --> D["Cumulative SUM of boundaries"] --> E["Session, island, or run ID"]
click B href "{{ '/sql/windows/lag-lead/' | relative_url }}" "Open LAG: previous event or state" _self
click D href "{{ '/sql/windows/running-calculations/' | relative_url }}" "Open Cumulative SUM of boundaries" _self
click E href "{{ '/sql/patterns/sessions/' | relative_url }}" "Open Session, island, or run ID" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Ordered events
2. [LAG: previous event or state]({{ '/sql/windows/lag-lead/' | relative_url }})
3. CASE: mark each boundary
4. [Cumulative SUM of boundaries]({{ '/sql/windows/running-calculations/' | relative_url }})
5. [Session, island, or run ID]({{ '/sql/patterns/sessions/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Turn events into sessions or runs" code=diagram_code fallback=diagram_fallback %}

Use for sessions, state changes, event runs, and many gaps-and-islands problems.

### ROW_NUMBER → filter

{% capture diagram_code %}
flowchart LR
accTitle: Choose one row per business key
A["Partition by business key"] --> B["Order by preferred survivor"] --> C["Assign ROW_NUMBER"] --> D["Keep rn = 1"]
click C href "{{ '/sql/windows/ranking/' | relative_url }}" "Open Assign ROW_NUMBER" _self
click D href "{{ '/sql/patterns/deduplication/' | relative_url }}" "Open Keep rn = 1" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Partition by business key
2. Order by preferred survivor
3. [Assign ROW_NUMBER]({{ '/sql/windows/ranking/' | relative_url }})
4. [Keep rn = 1]({{ '/sql/patterns/deduplication/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Choose one row per business key" code=diagram_code fallback=diagram_fallback %}

Use for latest records and deterministic deduplication.

### Calendar → LEFT JOIN

{% capture diagram_code %}
flowchart LR
accTitle: Make missing dates explicit
A["Generate expected dates"] --> B["Aggregate observed data"] --> C["LEFT JOIN on the date"] --> D["Fill zero only when appropriate"]
click C href "{{ '/sql/joins/join-types/' | relative_url }}" "Open LEFT JOIN on the date" _self
click D href "{{ '/sql/patterns/retention-calendar/' | relative_url }}" "Open Fill zero only when appropriate" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Generate expected dates
2. Aggregate observed data
3. [LEFT JOIN on the date]({{ '/sql/joins/join-types/' | relative_url }})
4. [Fill zero only when appropriate]({{ '/sql/patterns/retention-calendar/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Make missing dates explicit" code=diagram_code fallback=diagram_fallback %}

Needed when “no row” must appear explicitly as a date with zero activity.

### CROSS JOIN → LEFT JOIN

{% capture diagram_code %}
flowchart LR
accTitle: Build the expected combinations
A["Expected entities"] --> B["CROSS JOIN expected categories or dates"] --> C["LEFT JOIN observations"]
click B href "{{ '/sql/joins/join-types/' | relative_url }}" "Open CROSS JOIN expected categories or dates" _self
click C href "{{ '/sql/patterns/retention-calendar/' | relative_url }}" "Open LEFT JOIN observations" _self
{% endcapture %}
{% capture diagram_fallback %}
1. Expected entities
2. [CROSS JOIN expected categories or dates]({{ '/sql/joins/join-types/' | relative_url }})
3. [LEFT JOIN observations]({{ '/sql/patterns/retention-calendar/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Build the expected combinations" code=diagram_code fallback=diagram_fallback %}

Use for students × subjects, stores × days, customers × months.

### First event → later event

{% capture diagram_code %}
flowchart LR
accTitle: Find events after the first occurrence
A["MIN(event_time) per entity"] --> B["Establish first-event attributes"] --> C["Find events after first_time"]
click C href "{{ '/sql/patterns/funnels/' | relative_url }}" "Open Find events after first_time" _self
{% endcapture %}
{% capture diagram_fallback %}
1. MIN(event_time) per entity
2. Establish first-event attributes
3. [Find events after first_time]({{ '/sql/patterns/funnels/' | relative_url }})
{% endcapture %}
{% include diagram.html title="Find events after the first occurrence" code=diagram_code fallback=diagram_fallback %}

Useful for first purchase, repeat purchase, activation, campaign follow-up, and retention questions.

## Percentile decision map

| Question | Use |
|---|---|
| “What is the p95 threshold?” | `PERCENTILE_CONT(0.95) WITHIN GROUP` |
| “Give an actual observed value at the percentile” | `PERCENTILE_DISC` |
| “Where does each row rank from 0–1?” | `PERCENT_RANK()` |
| “What fraction is at or below this row?” | `CUME_DIST()` |
| “Split rows into 10 groups” | `NTILE(10)` |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/patterns/deduplication/' | relative_url }}">Duplicates & latest records</a><span>Find repeated business keys and choose one version deterministically.</span></li>
<li><a href="{{ '/sql/patterns/gaps-islands/' | relative_url }}">Gaps & Islands: consecutive days & streaks</a><span>Group runs using deduplicated dates and row numbers.</span></li>
<li><a href="{{ '/sql/patterns/sessions/' | relative_url }}">Sessions & changes in state</a><span>Turn boundary flags into groups with a cumulative sum.</span></li>
<li><a href="{{ '/sql/patterns/retention-calendar/' | relative_url }}">Retention & missing dates</a><span>Define observation windows and construct complete calendars.</span></li>
<li><a href="{{ '/sql/patterns/pivoting/' | relative_url }}">Conditional aggregation & pivots</a><span>Turn category values into columns without losing the intended grain.</span></li>
<li><a href="{{ '/sql/patterns/interval-overlaps/' | relative_url }}">Interval overlaps</a><span>Detect overlapping ranges while avoiding self-pairs and mirrored duplicates.</span></li>
<li><a href="{{ '/sql/patterns/funnels/' | relative_url }}">Ordered funnels</a><span>Require the right sequence of events instead of merely counting users with each event.</span></li>
<li><a href="{{ '/sql/patterns/period-changes/' | relative_url }}">Period changes and missing months</a><span>Aggregate to calendar grain before LAG, and make missing periods explicit.</span></li>
<li><a href="{{ '/sql/patterns/rates-and-populations/' | relative_url }}">Rates, populations, and weighted averages</a><span>Define numerator and denominator at the same grain before dividing.</span></li>
</ul>

## Practice without the label

Hide the technique column and read only the problem shape. Sketch the transformation sequence you would use, then open the linked lesson and compare where your approach differs.
