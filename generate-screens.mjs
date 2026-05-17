import { stitch } from "@google/stitch-sdk";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(process.cwd(), "stitch-screens");
await mkdir(outDir, { recursive: true });

const project = await stitch.createProject("ACH Finance UI System");
console.log("projectId:", project.id);

const BASE =
  "Desktop High-Fidelity. Modern fintech SaaS UI similar to Stripe or Mercury. " +
  "Clean minimal enterprise design. Inter font. " +
  "Color palette: primary indigo #6366f1, background white #ffffff, " +
  "surface #f8fafc, border #e2e8f0, text #0f172a, muted #64748b, " +
  "success green #22c55e, danger red #ef4444, warning amber #f59e0b. " +
  "Rounded corners 10px. Generous whitespace. Accessible. " +
  "Sidebar navigation on left 240px wide with logo and nav items. " +
  "Top header 64px with breadcrumb, search and user avatar. ";

const screens = [
  {
    key: "login",
    deviceType: "DESKTOP",
    prompt:
      "Desktop High-Fidelity login page for ACH Finance fintech app. " +
      "Stripe/Mercury style. Split layout: left panel 50% dark navy #0f172a with fintech brand " +
      "illustration (abstract flowing lines in indigo/violet, key metrics floating cards), " +
      "right panel 50% white with centered login form. " +
      "Right panel: ACH Finance logo top, 'Welcome back' heading, subtitle, " +
      "email input with icon, password input with show/hide toggle, " +
      "'Remember me' checkbox, primary indigo 'Sign In' button full width, " +
      "divider, 'Create account' link. Clean, no clutter. Enterprise feel.",
  },
  {
    key: "register",
    deviceType: "DESKTOP",
    prompt:
      "Desktop High-Fidelity registration page for ACH Finance fintech app. " +
      "Stripe/Mercury style. Split layout: left panel dark navy with fintech branding and feature highlights " +
      "(bullet points: 'Real-time balance tracking', 'Smart budgets', 'Analytics'), " +
      "right panel white centered form. " +
      "Form: Full name, Email, Password (with strength meter bar), Confirm password, " +
      "Terms checkbox, primary indigo 'Create Account' button full-width, " +
      "'Already have account? Sign in' link. Password strength indicator bar in green/amber/red.",
  },
  {
    key: "dashboard",
    deviceType: "DESKTOP",
    prompt:
      BASE +
      "Main dashboard overview page. " +
      "Sidebar nav: Dashboard (active, indigo highlight), Transactions, Categories, Budgets, Analytics, Settings. " +
      "Header: 'Good morning, Juan' greeting, date, notification bell with badge. " +
      "Body content: " +
      "Row 1 — 4 KPI cards with icon, label, value, trend badge: " +
      "Total Balance $124,592 (+2.4%), Monthly Income $8,450 (+1.2% green), " +
      "Monthly Expenses $3,120 (-0.8% red), Savings Rate 63.1% (+4% green). " +
      "Row 2 — Large area chart card 'Portfolio Performance' 8 months data with indigo gradient fill, " +
      "and donut chart card 'Spending by Category' with legend. " +
      "Row 3 — Recent transactions table 5 rows: date, description, category pill, amount colored +/-, status badge. " +
      "Row 4 — Budget progress bars 3 cards: Housing 78% amber, Food 42% green, Transport 95% red. " +
      "White cards, subtle shadow, 10px radius.",
  },
  {
    key: "transactions",
    deviceType: "DESKTOP",
    prompt:
      BASE +
      "Transactions management page. " +
      "Page title 'Transactions' with subtitle '247 transactions', " +
      "right side: '+ Add Transaction' button indigo. " +
      "Filter bar: search input with magnifier icon, Type dropdown (All/Income/Expense), " +
      "Category dropdown, Date range picker, Sort dropdown. " +
      "Summary row: 3 stat pills — Total Income $28,450 green, Total Expenses $12,340 red, Net Balance $16,110 indigo. " +
      "Table: columns Date, Description, Category (colored pill), Amount (+/- colored), Status (badge), Actions (edit/delete icons). " +
      "10 rows of realistic fintech transaction data. " +
      "Row hover state subtle. Pagination at bottom: prev/next arrows, page numbers. " +
      "Empty state illustration if no results.",
  },
  {
    key: "transaction-modal",
    deviceType: "DESKTOP",
    prompt:
      BASE +
      "Add/Edit Transaction modal dialog. " +
      "Dimmed background overlay. Centered modal 520px wide, white, 16px radius, shadow-xl. " +
      "Header: 'New Transaction' title, X close button. " +
      "Form body: " +
      "Type toggle — two pill buttons 'Income' green / 'Expense' red, selected state filled. " +
      "Amount input large 36px text with $ prefix, prominent. " +
      "Description text input. Category select dropdown with color dot. " +
      "Date picker input. Notes textarea 3 rows optional. " +
      "Footer: Cancel button outline, Save Transaction button indigo. " +
      "Clean, focused, no distractions.",
  },
  {
    key: "categories",
    deviceType: "DESKTOP",
    prompt:
      BASE +
      "Categories management page. " +
      "Header: 'Categories' title, subtitle 'Organize your income and expenses', " +
      "'+ New Category' button. " +
      "Two-column grid: left 'Income Categories' card, right 'Expense Categories' card. " +
      "Each card has header with count badge. " +
      "Category rows: colored circle icon with letter, name, 'Default' badge for system categories, " +
      "transaction count '12 transactions', edit and delete icon buttons. " +
      "6 income categories + 9 expense categories with realistic names and distinct colors. " +
      "Hover states. Add category form inline at bottom of each section.",
  },
  {
    key: "budgets",
    deviceType: "DESKTOP",
    prompt:
      BASE +
      "Budgets management page. " +
      "Header: 'Budgets', month/year selector pills (May 2026 selected), '+ New Budget' button. " +
      "Alert banner at top: orange warning 'Housing budget at 78% — $3,900 of $5,000 used'. " +
      "Red exceeded banner: 'Transport budget exceeded — 105% used'. " +
      "Budget cards grid 3 columns: " +
      "Each card: category colored header stripe, category icon+name, month label, " +
      "large progress bar (green/amber/red based on %), spent/limit amounts, " +
      "percentage text, edit/delete buttons. " +
      "Cards for: Housing 78% amber, Food 42% green, Transport 105% red exceeded, " +
      "Entertainment 25% green, Health 60% green, Education 10% green.",
  },
  {
    key: "analytics",
    deviceType: "DESKTOP",
    prompt:
      BASE +
      "Analytics and reports page. " +
      "Header: 'Analytics', time range selector buttons (1M 3M 6M 1Y), Export button. " +
      "Row 1 — 4 mini KPI cards: Avg Monthly Income, Avg Monthly Expense, Best Savings Month, Total Saved. " +
      "Row 2 left — Large bar chart 'Monthly Cash Flow' 12 months, grouped bars income (indigo) vs expense (coral red), x-axis months. " +
      "Row 2 right — Donut chart 'Expense Breakdown by Category' with percentage labels and legend. " +
      "Row 3 left — Line chart 'Net Worth Over Time' smooth curve indigo with shaded area. " +
      "Row 3 right — Horizontal bar chart 'Top Spending Categories' ranked list. " +
      "All charts in white cards with subtle shadows. Chart tooltips visible.",
  },
];

async function generate(s) {
  console.log(`Generating: ${s.key}...`);
  const screen = await project.generate(s.prompt, s.deviceType ?? "DESKTOP");
  const [imgUrl, htmlUrl] = await Promise.all([screen.getImage(), screen.getHtml()]);

  const imgRes = await fetch(imgUrl);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(join(outDir, `${s.key}.png`), imgBuf);

  if (htmlUrl) {
    const htmlRes = await fetch(htmlUrl);
    if (htmlRes.ok) await writeFile(join(outDir, `${s.key}.html`), await htmlRes.text());
  }

  console.log(`${s.key} — screenId: ${screen.id}`);
  return { key: s.key, screenId: screen.id, imgUrl, htmlUrl };
}

// Generate in batches of 2 to avoid rate limits
const results = [];
for (let i = 0; i < screens.length; i += 2) {
  const batch = screens.slice(i, i + 2);
  const batchResults = await Promise.all(batch.map(generate));
  results.push(...batchResults);
  if (i + 2 < screens.length) {
    console.log("Waiting 3s before next batch...");
    await new Promise((r) => setTimeout(r, 3000));
  }
}

await writeFile(
  join(outDir, "manifest.json"),
  JSON.stringify({ projectId: project.id, screens: results }, null, 2),
);

console.log(`\nAll screens generated! Project ID: ${project.id}`);
console.log(`Saved to: ${outDir}`);

await stitch.close();
