// const axios = require("axios");
// const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// async function getLinks(url) {
//   try {
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
//     const links = [];

//     $("a").each((i, element) => {
//       const link = $(element).attr("href");
//       if (link) {
//         links.push(link);
//       }
//     });

//     let filteredLinks = links.filter(
//       (link) => link[0] === "/" || link.includes("myntra.com")
//     );
//     console.log("Crawled links:", links, "FIltered", filteredLinks);
//     return filteredLinks;
//   } catch (error) {
//     console.error("Could not fetch ${url}: ${error.message}");
//   }
// }

// async function takeScreenshot(url, page) {
//   page.setViewport({ width: 1920, height: 1080 });
//   try {
//     await page.goto(url, { waitUntil: "networkidle2" });
//     const screenshotPath = `screenshots/${url
//       .replace(/https?:\/\//, "")
//       .replace(/\//g, "_")}.png`;
//     await page.screenshot({ path: screenshotPath, fullPage: true });
//     console.log(`Screenshot saved: ${screenshotPath}`);
//   } catch (error) {
//     console.error(`Failed to take screenshot of ${url}: ${error.message}`);
//   }
// }

// async function crawlWebsite(startUrl) {
//   const visited = new Set();
//   const links = await getLinks(startUrl);

//   // Ensure the screenshots directory exists
//   const screenshotsDir = path.join(__dirname, "screenshots");
//   if (!fs.existsSync(screenshotsDir)) {
//     fs.mkdirSync(screenshotsDir);
//   }

//   // Start Puppeteer browser
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   for (const link of links) {
//     // Resolve relative URLs
//     const absoluteLink = new URL(link, startUrl).href;

//     if (!visited.has(absoluteLink)) {
//       visited.add(absoluteLink);
//       await takeScreenshot(absoluteLink, page);
//     }
//   }

//   await browser.close();
// }

// const websiteUrl = "https://www.myntra.com"; // Replace with the desired URL
// crawlWebsite(websiteUrl);

// !!WORKING

// const { PlaywrightCrawler } = require("crawlee");
// const { mkdirSync } = require("fs");
// const { join } = require("path");

// // const loginUrl = "https://paytm-basic-frontend-seven.vercel.app/signin";
// // const username = "temp2@gmail.com";
// // const password = "123456";

// const loginUrl = "https://sanskruty.com/my-account/";
// const username = "kabiragnihotri@gmail.com";
// const password = "Admin@12345";

// const skipKeywords = [
//   "Log out",
//   "Log Out",
//   "log out",
//   "Sign out",
//   "sign out",
//   "Sign up",
// ];

// // Function to sanitize the URL to a valid filename
// const sanitizeFilename = (url) => {
//   return url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
// };

// // Create a directory to store screenshots if it doesn't exist
// const screenshotsDir = "./screenshots";
// mkdirSync(screenshotsDir, { recursive: true });

// // Set to track visited URLs
// const visitedUrls = new Set();

// // Flag to track if the user is logged in
// let isLoggedIn = false;

// // const crawler = new PlaywrightCrawler({
// //   async requestHandler({ request, page, enqueueLinks, log, pushData }) {
// //     const { loadedUrl } = request;

// //     // Check if the URL contains "paytm" and is not already visited
// //     if (!loadedUrl.includes("paytm") || visitedUrls.has(loadedUrl)) {
// //       log.info(`Skipping URL: ${loadedUrl}`);
// //       return;
// //     }

// //     // Add the current URL to the visited set
// //     visitedUrls.add(loadedUrl);

// //     // Log the page title
// //     const title = await page.title();
// //     log.info(`Title of ${loadedUrl} is '${title}'`);

// //     // Save results as JSON to ./storage/datasets/default
// //     await pushData({ title, url: loadedUrl });

// //     // Sanitize the URL and create a screenshot file name
// //     const sanitizedUrl = sanitizeFilename(loadedUrl);
// //     const screenshotPath = join(screenshotsDir, `${sanitizedUrl}.png`);

// //     // Take a screenshot of the page and save it
// //     await page.screenshot({ path: screenshotPath });
// //     log.info(`Screenshot saved for ${loadedUrl} at ${screenshotPath}`);

// //     // Ensure the page has fully loaded (React may load content dynamically)
// //     await page.waitForTimeout(2000);

// //     // Find all button elements
// //     const clickableElements = await page.evaluate(() => {
// //       return [...document.querySelectorAll("button")].map((el) => ({
// //         tagName: el.tagName,
// //         textContent: el.textContent.trim(),
// //         href: el.href, // Note: `href` may be undefined for buttons
// //         outerHTML: el.outerHTML,
// //       }));
// //     });

// //     log.info(`Found ${clickableElements.length} clickable buttons`);

// //     // Click each button element and capture screenshots
// //     for (const element of clickableElements) {
// //       if (
// //         skipKeywords.some((keyword) => element.textContent.includes(keyword))
// //       ) {
// //         log.info(`Skipping button: ${element.textContent}`);
// //         continue; // Skip clicking this button
// //       }

// //       log.info(
// //         `Opening button: ${element.tagName} with text: ${element.textContent}`
// //       );

// //       try {
// //         // Click the button
// //         await page.click(`button:has-text("${element.textContent}")`);

// //         // Wait for navigation after clicking the button
// //         //await page.waitForNavigation({ waitUntil: "networkidle" });
// //         await new Promise((resolve) => setTimeout(resolve, 3000));

// //         // Take a screenshot of the new page
// //         const clickedScreenshotPath = join(
// //           screenshotsDir,
// //           `${sanitizeFilename(loadedUrl)}_clicked.png`
// //         );
// //         await page.screenshot({ path: clickedScreenshotPath });
// //         log.info(
// //           `Screenshot saved for button click at ${clickedScreenshotPath}`
// //         );
// //       } catch (error) {
// //         log.error(
// //           `Failed to open button ${element.textContent}: ${error.message}`
// //         );
// //       }
// //     }

// //     // Extract links from the current page
// //     await enqueueLinks();
// //   },
// //   maxRequestsPerCrawl: 50, // Increased to explore more pages
// //   headless: false,
// //   preNavigationHooks: [
// //     async ({ page, log }) => {
// //       if (!isLoggedIn) {
// //         log.info("Logging in...");

// //         // Go to the login page
// //         await page.goto(loginUrl);

// //         // Fill in the credentials
// //         await page.fill(
// //           'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email"], input[type="text"]',
// //           username
// //         );

// //         await page.fill(
// //           'input[type="password"], input[name*="password"], input[id*="password"], input[placeholder*="password"]',
// //           password
// //         );

// //         // Click the login button
// //         await page.click(
// //           'button[type="submit"], button[name*="sign in"], button[id*="login"], button[type="button"]'
// //         );
// //         await new Promise((resolve) => setTimeout(resolve, 3000));

// //         // Wait for navigation after login
// //         //await page.waitForNavigation();

// //         // Verify login success by checking the current URL or specific elements
// //         const currentUrl = page.url();
// //         if (currentUrl !== loginUrl) {
// //           // Set the flag to true after successful login
// //           isLoggedIn = true;
// //           log.info("Login successful!");
// //         } else {
// //           log.warn("Login failed, still on the login page.");
// //         }
// //       }
// //     },
// //   ],
// // });

// // // Start the crawl
// // crawler.run(["https://paytm-basic-frontend-seven.vercel.app/dashboard"]);

// const { PlaywrightCrawler } = require("crawlee");
// const { mkdirSync } = require("fs");
// const { join } = require("path");

// // const loginUrl = "https://paytm-basic-frontend-seven.vercel.app/signin";
// // const username = "temp2@gmail.com";
// // const password = "123456";

// const skipKeywords = [
//   "Log out",
//   "Log Out",
//   "log out",
//   "Sign out",
//   "sign out",
//   "Sign up",
//   "Close",
// ];

// // Function to sanitize the URL to a valid filename
// const sanitizeFilename = (url) => {
//   return url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
// };

// // Create a directory to store screenshots if it doesn't exist
// const screenshotsDir = "./screenshots";
// mkdirSync(screenshotsDir, { recursive: true });

// // Set to track visited URLs
// const visitedUrls = new Set();

// // Flag to track if the user is logged in
// let isLoggedIn = false;

// const loginUrl = "https://sanskruty.com/my-account/";
// const username = "kabiragnihotri@gmail.com";
// const password = "Admin@12345";

// const crawler = new PlaywrightCrawler({
//   async requestHandler({ request, page, enqueueLinks, log, pushData }) {
//     const { loadedUrl } = request;

//     // Check if the URL contains "paytm" and is not already visited
//     if (!loadedUrl.includes("sans") || visitedUrls.has(loadedUrl)) {
//       log.info(`Skipping URL: ${loadedUrl}`);
//       return;
//     }

//     // Add the current URL to the visited set
//     visitedUrls.add(loadedUrl);

//     // Log the page title
//     const title = await page.title();
//     log.info(`Title of ${loadedUrl} is '${title}'`);

//     // Save results as JSON to ./storage/datasets/default
//     await pushData({ title, url: loadedUrl });

//     // Sanitize the URL and create a screenshot file name
//     const sanitizedUrl = sanitizeFilename(loadedUrl);
//     const screenshotPath = join(screenshotsDir, `${sanitizedUrl}.png`);

//     // Take a screenshot of the page and save it
//     await page.screenshot({ path: screenshotPath });
//     log.info(`Screenshot saved for ${loadedUrl} at ${screenshotPath}`);

//     // Ensure the page has fully loaded (React may load content dynamically)
//     await page.waitForTimeout(2000);

//     // Find all button elements
//     const clickableElements = await page.evaluate(() => {
//       return [...document.querySelectorAll("button")].map((el) => ({
//         tagName: el.tagName,
//         textContent: el.textContent.trim(),
//         href: el.href, // Note: `href` may be undefined for buttons
//         outerHTML: el.outerHTML,
//       }));
//     });

//     log.info(`Found ${clickableElements.length} clickable buttons`);

//     // Click each button element and capture screenshots
//     for (const element of clickableElements) {
//       if (
//         skipKeywords.some((keyword) => element.textContent.includes(keyword))
//       ) {
//         log.info(`Skipping button: ${element.textContent}`);
//         continue; // Skip clicking this button
//       }

//       log.info(
//         `Opening button: ${element.tagName} with text: ${element.textContent}`
//       );

//       try {
//         // Click the button
//         await page.click(`button:has-text("${element.textContent}")`);

//         // Wait for navigation after clicking the button
//         //await page.waitForNavigation({ waitUntil: "networkidle" });
//         await new Promise((resolve) => setTimeout(resolve, 3000));

//         // Take a screenshot of the new page
//         const clickedScreenshotPath = join(
//           screenshotsDir,
//           `${sanitizeFilename(loadedUrl)}_clicked.png`
//         );
//         await page.screenshot({ path: clickedScreenshotPath });
//         log.info(
//           `Screenshot saved for button click at ${clickedScreenshotPath}`
//         );
//       } catch (error) {
//         log.error(
//           `Failed to open button ${element.textContent}: ${error.message}`
//         );
//       }
//     }

//     // Extract links from the current page
//     await enqueueLinks();
//   },
//   maxRequestsPerCrawl: 2, // Increased to explore more pages
//   headless: false,
//   preNavigationHooks: [
//     async ({ page, log }) => {
//       if (!isLoggedIn) {
//         log.info("Logging in...");

//         // Go to the login page
//         await page.goto(loginUrl);

//         // Fill in the credentials
//         await page.fill(
//           'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email"], input[type="text"]',
//           username
//         );

//         await page.fill(
//           'input[type="password"], input[name*="password"], input[id*="password"], input[placeholder*="password"]',
//           password
//         );

//         // Click the login button
//         await page.click(
//           'button[type="submit"], button[name*="sign in"], button[id*="login"], button[type="button"]'
//         );
//         await new Promise((resolve) => setTimeout(resolve, 3000));

//         // Wait for navigation after login
//         //await page.waitForNavigation();
//         isLoggedIn = true;
//         // Verify login success by checking the current URL or specific elements
//         // const currentUrl = page.url();
//         // if (currentUrl !== loginUrl) {
//         //   // Set the flag to true after successful login

//         //   log.info("Login successful!");
//         // } else {
//         //   log.warn("Login failed, still on the login page.");
//         // }
//       }
//     },
//   ],
// });

// // Start the crawl
// crawler.run(["https://sanskruty.com"]);

const { PlaywrightCrawler } = require("crawlee");
const { mkdirSync } = require("fs");
const { join } = require("path");

const skipKeywords = [
  "Log out",
  "Log Out",
  "log out",
  "Sign out",
  "sign out",
  "Sign up",
  "Close",
];

// Function to sanitize the URL to a valid filename
const sanitizeFilename = (url) => {
  return url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
};

// Create a directory to store screenshots if it doesn't exist
const screenshotsDir = "./screenshots";
mkdirSync(screenshotsDir, { recursive: true });

// Set to track visited URLs
const visitedUrls = new Set();

// Flag to track if the user is logged in
let isLoggedIn = false;
let screenshotCount = 0; // Counter for screenshots

const loginUrl = "https://sanskruty.com/my-account/";
const username = "kabiragnihotri@gmail.com";
const password = "Admin@12345";

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    const { loadedUrl } = request;

    // Check if the URL contains "sans" and is not already visited
    if (!loadedUrl.includes("sans") || visitedUrls.has(loadedUrl)) {
      log.info(`Skipping URL: ${loadedUrl}`);
      return;
    }

    // Add the current URL to the visited set
    visitedUrls.add(loadedUrl);

    // Log the page title
    const title = await page.title();
    log.info(`Title of ${loadedUrl} is '${title}'`);

    // Save results as JSON to ./storage/datasets/default
    await pushData({ title, url: loadedUrl });

    // Sanitize the URL and create a screenshot file name
    const sanitizedUrl = sanitizeFilename(loadedUrl);
    const screenshotPath = join(screenshotsDir, `${sanitizedUrl}.png`);

    // Take a screenshot of the page and save it
    await page.screenshot({ path: screenshotPath });
    log.info(`Screenshot saved for ${loadedUrl} at ${screenshotPath}`);

    // Increment the screenshot counter
    screenshotCount++;
    if (screenshotCount >= 5) {
      log.info("Screenshot limit reached. Stopping the crawler.");
      await crawler.autostop(); // Stop the crawler if 5 screenshots are taken
      return; // Exit the request handler
    }

    // Ensure the page has fully loaded (React may load content dynamically)
    await page.waitForTimeout(2000);

    // Find all button elements
    const clickableElements = await page.evaluate(() => {
      return [...document.querySelectorAll("button")].map((el) => ({
        tagName: el.tagName,
        textContent: el.textContent.trim(),
        href: el.href, // Note: `href` may be undefined for buttons
        outerHTML: el.outerHTML,
      }));
    });

    log.info(`Found ${clickableElements.length} clickable buttons`);

    // Click each button element and capture screenshots
    for (const element of clickableElements) {
      if (
        skipKeywords.some((keyword) => element.textContent.includes(keyword))
      ) {
        log.info(`Skipping button: ${element.textContent}`);
        continue; // Skip clicking this button
      }

      log.info(
        `Opening button: ${element.tagName} with text: ${element.textContent}`
      );

      try {
        // Click the button
        await page.click(`button:has-text("${element.textContent}")`);

        // Wait for navigation after clicking the button
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Take a screenshot of the new page
        const clickedScreenshotPath = join(
          screenshotsDir,
          `${sanitizeFilename(loadedUrl)}_clicked.png`
        );
        await page.screenshot({ path: clickedScreenshotPath });
        log.info(
          `Screenshot saved for button click at ${clickedScreenshotPath}`
        );

        // Increment the screenshot counter
        screenshotCount++;
        if (screenshotCount >= 5) {
          log.info(
            "Screenshot limit reached after button click. Stopping the crawler."
          );
          await crawler.autostop(); // Stop the crawler if 5 screenshots are taken
          return; // Exit the request handler
        }
      } catch (error) {
        log.error(
          `Failed to open button ${element.textContent}: ${error.message}`
        );
      }
    }

    // Extract links from the current page
    await enqueueLinks();
  },
  maxRequestsPerCrawl: 2, // Increased to explore more pages
  headless: false,
  preNavigationHooks: [
    async ({ page, log }) => {
      if (!isLoggedIn) {
        log.info("Logging in...");

        // Go to the login page
        await page.goto(loginUrl);

        // Fill in the credentials
        await page.fill(
          'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email"], input[type="text"]',
          username
        );

        await page.fill(
          'input[type="password"], input[name*="password"], input[id*="password"], input[placeholder*="password"]',
          password
        );

        // Click the login button
        await page.click(
          'button[type="submit"], button[name*="sign in"], button[id*="login"], button[type="button"]'
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Set login flag
        isLoggedIn = true;
      }
    },
  ],
});

// Start the crawl
crawler.run(["https://sanskruty.com"]);
