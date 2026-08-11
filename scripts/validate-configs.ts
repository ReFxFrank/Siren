import { validateAll } from "./lib/configs";

/** Stage 1 (§9) as a standalone CLI. Non-zero exit on any error. */
const { errors, warnings } = validateAll();

for (const issue of warnings) {
  console.log(`WARN  ${issue.where}: ${issue.msg}`);
}
for (const issue of errors) {
  console.error(`ERROR ${issue.where}: ${issue.msg}`);
}
console.log(`\nvalidate-configs: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length > 0 ? 1 : 0);
