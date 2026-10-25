---
title: "Streaming voice agents, turn-taking and recovery"
description: "Connect speech recognition, model/tool work and audio playback while preserving interruption, cancellation and action identity."
chapter: production
order: 10
sequence: 410
level: Core
keywords: [voice agent, ASR, speech recognition, text to speech, TTS, VAD, endpointing, barge in, streaming, first audio latency, turn taking]
interview_queries: [how do you deploy a voice agent, what metrics matter for voice agents, how does barge in work, how do you prevent duplicate voice agent actions]
last_verified: "2026-10-25"
references:
  - title: Google Live API capabilities and interruptions
    url: https://ai.google.dev/gemini-api/docs/live-api/capabilities
  - title: Google Live API session management
    url: https://ai.google.dev/gemini-api/docs/live-api/session-management
---

A voice agent has to decide when the user has finished speaking, act on a sufficiently stable request, and stop obsolete playback when the user interrupts. Fast token generation solves only part of that path.

## Cascaded and native audio designs

A cascaded design connects automatic speech recognition (ASR), a large language model (LLM) with tools, and text-to-speech (TTS). Each stage can be inspected and replaced, but transcription errors and stage delays propagate downstream. A native audio model can process and produce audio within one model interface, potentially preserving vocal cues; tool execution, session control and observable business outcomes still belong to the application.

| Stage | State to retain | Failure that affects the conversation |
|---|---|---|
| Capture and voice activity detection (VAD) | Session, audio sequence and speech boundaries | Noise treated as speech or a quiet user cut off |
| Recognition and endpointing | Partial/final transcript and turn ID | Acting on an interim transcript that later changes |
| Model and tool work | Turn version, task state, tool operation ID | Slow dependencies or a duplicate action after retry |
| Synthesis and playback | Output chunks and generation/turn identity | Old audio continues after the user changes the request |

VAD detects speech activity. Endpointing decides that the turn is complete, often using silence and additional signals. Aggressive endpointing reduces waiting but interrupts hesitations; conservative endpointing adds delay. An interim transcript can change “fifteen” to “fifty,” so consequential actions need a stable interpretation and any required confirmation.

## Measure from end of speech to useful audio

For a cascaded system, the critical path can include endpoint detection, transcript finalization, retrieval/tools, model startup-to-first-output, synthesis and network/playback buffering. Streaming overlaps some stages, so adding their full completion times overstates user-visible delay.

**Illustrative sequential first-audio budget:** endpointing 300 ms, transcript finalization 100 ms, model first usable text 350 ms, synthesis 180 ms and transport/playback buffer 70 ms produce 1,000 ms from end of speech to first audio. A blocking 800 ms tool call increases that path to 1,800 ms unless useful and permitted work overlaps. These are example measurements, not a service guarantee.

Track end-of-speech to first audio, interruption-to-silence, turn completion, audio underruns, transcript corrections, task success, tool failures and cost per successful conversation. LLM time to first token (TTFT) can be healthy while TTS buffering makes the conversation feel slow. Word error rate helps diagnose transcription but does not establish whether a number, name or negation critical to the task was understood.

## Barge-in cancels obsolete work

When a new speech turn interrupts playback, advance the turn/generation identity, stop or flush old audio, and cancel obsolete generation and read-only work where supported. Discard late chunks carrying the previous generation ID. Network delivery can race with cancellation, so a server-side cancel alone may leave buffered client audio playing.

Maintain the distinction between generated text and what the user actually heard. Conversation state that assumes an unplayed instruction was delivered can make the next turn incoherent. Provider interruption signals can help coordinate playback; the client still needs to update its buffers and application state.

Cancellation does not undo an external side effect. If a booking request already committed, reconcile its operation ID and explain the actual result rather than issuing a second booking after the user restarts the turn. [Typed tool execution]({{ '/ai-engineering/agents/typed-tools-execution-state/' | relative_url }}) owns this recovery behavior.

## Recover sessions without replaying actions

A reconnect needs bounded buffering, audio sequence handling, durable task state and supported session-resumption behavior. Resuming a model connection does not prove that every prior tool action is safe to repeat. Persist confirmed effects separately from transient audio/model state.

Keep per-stage deadlines. A failed recognizer can ask for repetition; an uncertain amount can request confirmation; a failed dependency can give a bounded status response or hand off. A fallback model/provider may have different voice, tool and interruption behavior, so validate the full fallback path.

Trace a conversation through session, turn, generation and tool-operation IDs. Retain appropriately protected evidence under the system's privacy and retention policy. Use the shared [observability, explainability, traceability and auditability reference]({{ '/infrastructure/observability/observability-explainability-traceability-auditability/' | relative_url }}) for the evidence design and [release evaluation]({{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}) for task-level gates.
