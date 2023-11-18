const fs = require("fs");
const pa11y = require("pa11y");
const puppeteer = require("puppeteer");

let views = [
  {
    label: "Home",
    path: "http://localhost:8000/",
  },
  {
    label: "Admin",
    path: "http://localhost:8000/admin/",
  },
];

const run = async () => {
  const browser = await puppeteer.launch();

  try {
    let issues = [];

    for (const scenario of views) {
      console.log(scenario.label, scenario.path);

      const page = await browser.newPage();

      const fullLabel = scenario.label;

      const pa11yOptions = {
        standard: "WCAG2AA",
        log: {
          debug: console.log,
          error: console.error,
          info: console.log,
        },
        runners: ["axe"],
        actions: [],
        viewport: {
          width: 1024,
          height: 768,
          deviceScaleFactor: 1,
          isMobile: false,
        },
        screenCapture: `${__dirname}/screenshots/${fullLabel}.png`,
        browser,
        page,
      };
      const result = await pa11y(scenario.path, pa11yOptions);

      issues = issues.concat(
        result.issues.map((issue) => {
          return {
            label: fullLabel,
            documentTitle: result.documentTitle,
            pageUrl: result.pageUrl,
            code: issue.code,
            context: issue.context,
            message: issue.message,
            type: issue.type,
            selector: issue.selector,
            runner: issue.runner,
            screenshot: `${fullLabel}.png`,
            lighthouseReport: `${fullLabel}.html`,
          };
        })
      );

      fs.writeFileSync(
        `${__dirname}/pa11y.json`,
        JSON.stringify(issues, null, 2),
        "utf8"
      );
    }
  } catch (error) {
    // Output an error if it occurred
    console.error(error.message);
  }

  browser.close();
};

run();
