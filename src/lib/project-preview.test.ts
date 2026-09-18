import {
  countJobs,
  countWord,
  describeAnchorJob,
  describeAudience,
  describeCompetition,
  describeExistingSolutions,
  describeJobs,
  describeMarket,
  describeMethod,
  describeProgress,
  describeSegmentSize,
  describeSolutionScores,
  describeSolutions,
  formatList,
  formatPreviewDate,
  hasJobs,
  jobIntensityPhrase,
  levelWord,
  metricText,
  pluralise,
  solutionScoreWord,
} from "./project-preview"
import type { Solution } from "@/types/solution"
import type { JobsToBeDone, ValidationAssessment } from "@/types/validation"
import { DEFAULT_JOBS_TO_BE_DONE, DEFAULT_VALIDATION_ASSESSMENT } from "@/types/validation"
import { DEFAULT_SOLUTION_FIELDS } from "@/types/solution"

const solution = (patch: Partial<Solution> = {}): Solution => ({
  ...DEFAULT_SOLUTION_FIELDS,
  id: 1,
  problemId: 1,
  workspaceId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  editedAt: "2026-01-01T00:00:00.000Z",
  ...patch,
})

const jobs = (patch: Partial<JobsToBeDone> = {}): JobsToBeDone => ({
  ...DEFAULT_JOBS_TO_BE_DONE,
  ...patch,
})

const assessment = (patch: Partial<ValidationAssessment> = {}): ValidationAssessment => ({
  ...DEFAULT_VALIDATION_ASSESSMENT,
  ...patch,
})

describe("language helpers", () => {
  it("words small counts and leaves large ones as figures", () => {
    expect(countWord(0)).toBe("no")
    expect(countWord(1)).toBe("one")
    expect(countWord(10)).toBe("ten")
    expect(countWord(11)).toBe("11")
    expect(countWord(-3)).toBe("no")
  })

  it("pluralises on the count", () => {
    expect(pluralise(1, "group")).toBe("group")
    expect(pluralise(2, "group")).toBe("groups")
    expect(pluralise(2, "person", "people")).toBe("people")
  })

  it("joins lists without a serial comma", () => {
    expect(formatList([])).toBe("")
    expect(formatList(["a"])).toBe("a")
    expect(formatList(["a", "b"])).toBe("a and b")
    expect(formatList(["a", "b", "c"])).toBe("a, b and c")
    expect(formatList(["a", "b"], "or")).toBe("a or b")
  })

  it("drops blanks when joining", () => {
    expect(formatList(["a", "  ", "c"])).toBe("a and c")
  })

  it("reads a level only when one is set", () => {
    expect(levelWord("medium")).toBe("medium")
    expect(levelWord("")).toBeNull()
    expect(levelWord(undefined)).toBeNull()
  })

  it("renders a metric as value and unit", () => {
    expect(metricText({ value: 12, unit: "per week", level: "" })).toBe("12 per week")
    expect(metricText({ value: null, unit: "per week", level: "" })).toBe("per week")
    expect(metricText({ value: 3, unit: "", level: "" })).toBe("3")
    expect(metricText({ value: null, unit: "", level: "" })).toBeNull()
    expect(metricText(undefined)).toBeNull()
  })

  it("formats a date as a long UK date and rejects rubbish", () => {
    expect(formatPreviewDate("2026-03-09T10:00:00.000Z")).toBe("9 March 2026")
    expect(formatPreviewDate("not a date")).toBeNull()
    expect(formatPreviewDate(null)).toBeNull()
  })
})

describe("describeProgress", () => {
  it("says nothing has started when no milestone is reached", () => {
    expect(describeProgress([])).toContain("not started")
  })

  it("lists the milestones reached", () => {
    const text = describeProgress(["identify-problems", "explore-problems", "validate-problems"])
    expect(text).toBe(
      "So far this team has identified a problem, explored it in depth and reached a verdict on whether it is worth solving.",
    )
  })
})

describe("describeAudience", () => {
  it("admits when nobody has been pinned down", () => {
    expect(describeAudience(0, 0)).toContain("not yet pinned down")
  })

  it("counts groups and situations together", () => {
    expect(describeAudience(1, 2)).toBe(
      "The team has this problem down to one group of people, feeling it in two situations.",
    )
  })

  it("handles customers with no context", () => {
    expect(describeAudience(2, 0)).toBe("The team has this problem down to two groups of people.")
  })

  it("handles contexts with no customers", () => {
    expect(describeAudience(0, 1)).toContain("one situation")
  })

  it("only describes a segment size when there is a real one", () => {
    expect(describeSegmentSize(40000)).toBe("The team puts that at roughly 40,000 people.")
    expect(describeSegmentSize(1)).toBe("The team puts that at roughly 1 person.")
    expect(describeSegmentSize(0)).toBeNull()
    expect(describeSegmentSize(null)).toBeNull()
  })
})

describe("jobs", () => {
  it("ignores blank jobs when counting", () => {
    const counted = countJobs(
      jobs({
        functional: [{ id: 1, text: "Get to work dry", intensity: "" }, { id: 2, text: "   ", intensity: "" }],
        emotional: [{ id: 1, text: "Stop dreading the commute", intensity: "strong" }],
      }),
    )
    expect(counted).toEqual({ functional: 1, emotional: 1, social: 0 })
  })

  it("breaks the total down by kind", () => {
    const text = describeJobs(
      jobs({
        functional: [{ id: 1, text: "Get to work dry", intensity: "" }],
        emotional: [{ id: 1, text: "Stop dreading it", intensity: "strong" }],
      }),
    )
    expect(text).toBe("People in this situation are trying to get two things done: one functional and one emotional.")
  })

  it("admits when no job has been recorded", () => {
    expect(describeJobs(jobs())).toContain("not yet recorded")
    expect(hasJobs(jobs())).toBe(false)
  })

  it("phrases intensity only when set", () => {
    expect(jobIntensityPhrase("mild")).toBe("felt mildly")
    expect(jobIntensityPhrase("unbearable")).toBe("unbearable")
    expect(jobIntensityPhrase("")).toBeNull()
  })

  it("names the anchor job the price rests on", () => {
    const text = describeAnchorJob({
      jobsToBeDone: jobs({
        functional: [{ id: 1, text: "Get to work dry", intensity: "mild" }],
        emotional: [{ id: 1, text: "Stop dreading the commute", intensity: "unbearable" }],
      }),
      validationAssessment: assessment(),
    })
    // With no explicit pick, the strongest job anchors the price.
    expect(text).toBe("The money below rests on one job in particular: Stop dreading the commute.")
  })

  it("has no anchor to name when there are no jobs", () => {
    expect(describeAnchorJob({ jobsToBeDone: jobs(), validationAssessment: assessment() })).toBeNull()
  })
})

describe("describeExistingSolutions", () => {
  it("admits when nothing was recorded", () => {
    expect(describeExistingSolutions(0, 0)).toContain("not recorded")
  })

  it("counts the shortcomings as the opening for something better", () => {
    expect(describeExistingSolutions(2, 3)).toBe(
      "People already have two ways of coping with this. Between them the team found three shortcomings, which is where a better answer would have to start.",
    )
  })

  it("says when the gaps are missing", () => {
    expect(describeExistingSolutions(1, 0)).toContain("None of the gaps in them have been written down yet.")
  })
})

describe("describeMarket", () => {
  it("says so when the numbers are missing", () => {
    const story = describeMarket(assessment())
    expect(story.ready).toBe(false)
    expect(story.figures).toHaveLength(0)
    expect(story.paragraphs[0]).toContain("not yet put numbers")
  })

  it("tells the sizing story and returns the three figures", () => {
    const story = describeMarket(
      assessment({
        howManyPeople: { value: 1000, unit: "people", level: "" },
        howOften: { value: 12, unit: "per year", level: "" },
        worthToThem: { value: 5, unit: "GBP", level: "" },
        reachableShare: 30,
        obtainableShare: 10,
      }),
    )
    expect(story.ready).toBe(true)
    expect(story.currency).toBe("GBP")
    expect(story.paragraphs[0]).toContain("1,000 people")
    expect(story.paragraphs[0]).toContain("12 per year")
    expect(story.figures.map((f) => f.label)).toEqual([
      "The total market",
      "The reachable market",
      "A realistic share",
    ])
    // 1000 x 12 x 5 = 60,000, then 30% and 10% of that.
    expect(story.figures[0].value).toContain("60,000")
    expect(story.figures[1].value).toContain("18,000")
    expect(story.figures[2].value).toContain("1,800")
  })

  it("never names TAM, SAM or SOM, which the reader has not met", () => {
    const story = describeMarket(
      assessment({
        howManyPeople: { value: 10, unit: "", level: "" },
        howOften: { value: 1, unit: "", level: "" },
        worthToThem: { value: 2, unit: "GBP", level: "" },
      }),
    )
    const words = [...story.paragraphs, ...story.figures.map((f) => `${f.label} ${f.blurb}`)].join(" ")
    expect(words).not.toMatch(/\bTAM\b|\bSAM\b|\bSOM\b/)
  })
})

describe("describeCompetition", () => {
  it("returns the three signals, unset ones as null", () => {
    const signals = describeCompetition(assessment({ competitorSize: { value: null, unit: "", level: "" } }))
    expect(signals).toHaveLength(3)
    expect(signals[0].value).toBe("medium")
    expect(signals[2].value).toBeNull()
  })
})

describe("solutions", () => {
  it("says when there are none", () => {
    expect(describeSolutions([])).toContain("No solutions have been captured")
  })

  it("counts the candidates and their outcomes", () => {
    const text = describeSolutions([
      solution({ id: 1, validationStatus: "valid" }),
      solution({ id: 2, validationStatus: "invalid" }),
      solution({ id: 3, validationStatus: "unvalidated" }),
    ])
    expect(text).toBe("The team came up with three candidates. Of those, one judged worth pursuing and one ruled out.")
  })

  it("says when nothing has been scored", () => {
    expect(describeSolutions([solution({ validationStatus: "unvalidated" })])).toContain("None of them have been scored yet.")
    expect(describeSolutions([solution({ validationStatus: "in_progress" })])).toContain("None of them have been scored yet.")
  })

  it("counts a candidate left open as scored, not as unscored", () => {
    const text = describeSolutions([
      solution({ id: 1, validationStatus: "unsure" }),
      solution({ id: 2, validationStatus: "unsure" }),
    ])
    expect(text).toBe("The team came up with two candidates. Of those, two left open pending more evidence.")
  })

  it("reads the three outcomes in order", () => {
    const text = describeSolutions([
      solution({ id: 1, validationStatus: "valid" }),
      solution({ id: 2, validationStatus: "unsure" }),
      solution({ id: 3, validationStatus: "invalid" }),
    ])
    expect(text).toBe(
      "The team came up with three candidates. Of those, one judged worth pursuing, one left open pending more evidence and one ruled out.",
    )
  })

  it("prefers the team's own note over the stock description of a method", () => {
    expect(describeMethod({ inspirationSource: "analogy", inspirationDetail: "Borrowed from how airlines board" }))
      .toBe("Borrowed from how airlines board")
    expect(describeMethod({ inspirationSource: "analogy", inspirationDetail: "" })).toContain("another field")
    expect(describeMethod({ inspirationSource: "", inspirationDetail: "" })).toBeNull()
  })

  it("turns a 1-5 score into the word the validation flow uses", () => {
    expect(solutionScoreWord("feasibility", 5)).toBe("Very achievable")
    expect(solutionScoreWord("cost", 1)).toBe("Negligible")
    expect(solutionScoreWord("timeToImplement", 3)).toBe("One quarter")
    expect(solutionScoreWord("impact", null)).toBeNull()
  })

  it("writes out only the scores a candidate actually has", () => {
    const scores = describeSolutionScores(
      solution({ feasibility: 4, impact: 2, cost: null, timeToImplement: null }),
    )
    expect(scores.map((s) => s.key)).toEqual(["feasibility", "impact"])
    expect(scores[0].word).toBe("Achievable")
    expect(scores[0].description.length).toBeGreaterThan(0)
  })
})
