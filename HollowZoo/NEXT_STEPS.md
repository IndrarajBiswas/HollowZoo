## Hollow Zoo · Next Steps

A quick backlog of improvements that would take the MVP to the next tier. Each item is intentionally scoped so it can be tackled iteratively.

1. **Persistent Progression**  
   - Store unlocked levels, battle history, and best times in `localStorage` (and optionally the backend) so progress survives browser refreshes.  
   - Surface a “continue campaign” CTA on the menu when a previous run exists.

2. **Prompt Templates & Sharing**  
   - Provide curated prompt presets (“Defensive turtle”, “Aggro finisher”) plus the ability to copy/paste links that auto-fill the Mission Briefing text.  
   - Track win rates per prompt to help players iterate faster.

3. **Biome Hazards & Power-Ups**  
   - Add light platforming hazards unique to each biome (quicksand ticks, poison clouds).  
   - Spawn temporary pickups (shield, energy surge) that the AI can reason about in its prompt.

4. **Replay & Telemetry Panel**  
   - Log every action + reasoning line into a collapsible timeline for debugging prompts.  
   - Allow exporting logs as JSON for community sharing or post-mortems.

5. **Coaching UX Enhancements**  
   - Inline prompt suggestions based on previous defeats (“You lost 80% HP to jump attacks – mention dodging”).  
   - Voice-to-text briefing support using the browser SpeechRecognition API.

6. **Backend Hardening**  
   - Add pytest smoke tests covering `/api/decide` and `/api/reflect`.  
   - Implement rate limiting / API key validation when Gemini mode is enabled.

7. **Art & Audio Polish**  
   - Replace placeholder animal sprites with a cohesive sprite atlas and add impact particles.  
   - Layer in adaptive music that intensifies near sudden-death mode.

If you start on any of these, note it in `PROGRESS.md` so others can coordinate. Contributions are always welcome!
