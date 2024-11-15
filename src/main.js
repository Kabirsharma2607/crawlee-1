import { PlaywrightCrawler } from "crawlee";
import { mkdirSync } from "fs";
import { join } from "path";

const loginUrl = "https://kabir.joslery.com/login";
const username = "kabir.console@gmail.com";
const password = "Admin@12345";

const skipKeywords = [
  "Log out",
  "Log Out",
  "log out",
  "Sign out",
  "sign out",
  "Sign up",
];

const sanitizeFilename = (url) => {
  return url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
};

const screenshotsDir = "./screenshots";
mkdirSync(screenshotsDir, { recursive: true });

const visitedUrls = new Set();

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    const { loadedUrl } = request;

    if (
      !loadedUrl.includes("kabir.joslery.com") ||
      visitedUrls.has(loadedUrl)
    ) {
      log.info(`Skipping URL: ${loadedUrl}`);
      return;
    }

    visitedUrls.add(loadedUrl);

    const title = await page.title();
    log.info(`Title of ${loadedUrl} is '${title}'`);

    await pushData({ title, url: loadedUrl });

    const sanitizedUrl = sanitizeFilename(loadedUrl);
    const screenshotPath = join(screenshotsDir, `${sanitizedUrl}.png`);

    await page.screenshot({ path: screenshotPath });
    log.info(`Screenshot saved for ${loadedUrl} at ${screenshotPath}`);

    await page.waitForTimeout(2000);

    // Find all elements with onClick handlers
    const clickableElements = await page.evaluate(() => {
      return [...document.querySelectorAll("*")]
        .filter((el) => el.onclick)
        .map((el) => ({
          tagName: el.tagName,
          textContent: el.textContent.trim(),
          outerHTML: el.outerHTML,
        }));
    });

    log.info(
      `Found ${clickableElements.length} elements with onClick handlers`
    );

    for (const element of clickableElements) {
      if (
        skipKeywords.some((keyword) => element.textContent.includes(keyword))
      ) {
        log.info(`Skipping button: ${element.textContent}`);
        continue;
      }
      log.info(
        `Clicking element: ${element.tagName} with text: ${element.textContent}`
      );

      await page.evaluate((outerHTML) => {
        const element = [...document.querySelectorAll("*")].find(
          (el) => el.outerHTML === outerHTML
        );
        if (element) element.click();
      }, element.outerHTML);

      await page.waitForTimeout(5000);

      const clickedScreenshotPath = join(
        screenshotsDir,
        `${sanitizeFilename(request.loadedUrl)}_${
          element.textContent
        }_clicked.png`
      );
      await page.screenshot({ path: clickedScreenshotPath });
      log.info(`Screenshot saved after clicking at ${clickedScreenshotPath}`);
    }

    await enqueueLinks({
      regexps: [/https:\/\/kabir\.joslery\.com\/.*/],
      pseudoUrls: ["https://kabir.joslery.com/[.*]"],
    });
  },
  navigationTimeoutSecs: 120000,
  requestHandlerTimeoutSecs: 120000,
  maxRequestsPerCrawl: 50, // Increased to explore more pages
  //headless: false,
  preNavigationHooks: [
    async ({ page, log }) => {
      log.info("Logging in...");

      await page.goto(loginUrl);

      await page.fill('input[id="username"]', username);
      await page.fill('input[id="userpassword"]', password);

      await page.click('button[type="button"]');

      await page.waitForNavigation();
      //await page.waitForSelector('a[href="/dashboard"]'); // Wait until dashboard link appears

      log.info("Login successful!");
    },
  ],
});

await crawler.run(["https://kabir.joslery.com/login"]);
