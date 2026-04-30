### API

##### api.fetchAllData

```json
{
  "s": [{
      "i": id, "c": crowd, "l": stock
    }],
  "n": [{
      "i": id, "t": "Title", "c": "Content", "a": Created_at, "r": "rewrite reason"
    }],
  "l": [{
      "i": id, "n": "Lost title", "p": "Lost place", "a": Created_at, "r": "rewrite reason"
    }],
  "q": [{
    "i": id, "t": "Question", "w": "Answer", "a": Created_at, "r": "rewrite reason"
  }],
  "config": {
    "fetch_interval_ms": pooling time [ms],
    "full_refresh_freq": api.fetchAllData frequency [step],
    "maintenance_mode": In maintenance mode [0 || 1],
    "voting_enabled": Can vote [0 || 1],
    "vote_start_at": Vote start time [UNIX second],
    "vote_end_at": Vote end time [UNIX second]
  }
}
```

##### api.voting.getResults

```json
[
  {
    "c": "category (s: stall, e: exhibition, o: other)",
    "i": "target_id (2-digit string)",
    "v": vote_count (number)
  }
]
```

##### api.fetchStallsOnly

```json
{
  "s": [
    { "i": id, "c": crowd_level, "l": stock_level }
  ]
}
```

#### Other Methods

- **auth**
  - `loginAsAdmin(password)`: Login as global admin.
  - `loginAsStallAdmin(password?)`: Login as booth admin.
  - `fetchSession()`: Get current Supabase session.
- **stalls**
  - `update(stallName, { crowdLevel?, stockLevel? })`: Update booth status.
- **lostAndFound**
  - `post({ name, place })`: Register new lost item.
  - `update(id, { name, place, reason })`: Edit lost item with reason.
  - `delete(id)`: Remove lost item.
- **qa**
  - `ask(text)`: Post a new question.
  - `reply(id, answer, reason?)`: Answer or edit a question.
  - `delete(id)`: Remove a question.
- **news**
  - `post(title, content)`: Post new announcement.
  - `update(id, { title, content, reason })`: Edit announcement.
  - `delete(id)`: Remove announcement.
- **voting**
  - `submitVote(targetId, category)`: Submit a vote (includes IP-based and rate-limit checks).
  - `getVoterId()`: (Async) Get or generate a persistent identifier (IP + LocalID).

