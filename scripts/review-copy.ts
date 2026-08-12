import { generateReviewCopy } from "./lib/review";

const { approved, total } = generateReviewCopy();
console.log(`REVIEW-COPY.md written (${approved}/${total} approved) → out/review/ + docs/reports/`);
