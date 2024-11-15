const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Updated getXPath function with null checks
function getXPath(element) {}

// Function to extract key elements on the page
async function extractKeyElements(page) {
  return await page.evaluate(() => {
    const getXPath = (element) => {
      if (!element || !element.parentNode) {
        return ""; // If element or its parent doesn't exist, return an empty string
      }

      if (element.id) return `//*[@id="${element.id}"]`; // XPath based on element's ID
      if (element === document.body) return "/html/body"; // Base case for body
      const ix =
        Array.from(element.parentNode.childNodes)
          .filter(
            (node) => node.nodeType === 1 && node.nodeName === element.nodeName
          )
          .indexOf(element) + 1;
      return `${getXPath(
        element.parentNode
      )}/${element.nodeName.toLowerCase()}[${ix}]`;
    };

    const elementsData = {};

    // Select only the important elements: input, button, a, p, and div
    const selector = "input, button, a, p, div";
    document.querySelectorAll(selector).forEach((element) => {
      const tagName = element.tagName.toLowerCase();

      // Group elements by their tag name in the result object
      if (!elementsData[tagName]) {
        elementsData[tagName] = [];
      }

      elementsData[tagName].push({
        text: element.innerText || element.textContent || null,
        id: element.id || null,
        classList: Array.from(element.classList) || null,
        xpath: getXPath(element), // Get XPath for the element
      });
    });

    return elementsData;
  });
}

// Function to take a screenshot, extract key elements, and save them in a folder for each page
async function takeScreenshot(url, page) {
  page.setViewport({ width: 1920, height: 1080 });
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract only key elements on the page
    const elementsData = await extractKeyElements(page);

    // Create folder name based on URL path
    const urlPath = new URL(url).pathname.replace(/\//g, "_") || "home";
    const folderPath = path.join(__dirname, "screenshots", urlPath);

    // Create folder for storing screenshots and JSON if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Save screenshot
    const screenshotPath = path.join(folderPath, `${urlPath}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Save elements data to a JSON file for the page
    const jsonFilePath = path.join(folderPath, `${urlPath}.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(elementsData, null, 2));

    console.log(`Screenshot saved: ${screenshotPath}`);
    console.log(`Data saved to ${jsonFilePath}`);
  } catch (error) {
    console.error(`Failed to take screenshot of ${url}: ${error.message}`);
  }
}

// Function to crawl the website and take screenshots
async function crawlWebsite(startUrl) {
  const visited = new Set();
  const links = await getLinks(startUrl);

  // Ensure the screenshots directory exists
  const screenshotsDir = path.join(__dirname, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Start Puppeteer browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const link of links) {
    // Resolve relative URLs
    const absoluteLink = new URL(link, startUrl).href;

    if (!visited.has(absoluteLink)) {
      visited.add(absoluteLink);
      await takeScreenshot(absoluteLink, page);
    }
  }

  await browser.close();
}

// Function to fetch links from a webpage
async function getLinks(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const links = [];

    // Collect all anchor links
    $("a").each((i, element) => {
      const link = $(element).attr("href");
      if (link) {
        links.push(link);
      }
    });

    // Filter links that are relative or belong to the same domain
    let filteredLinks = links.filter(
      (link) => link[0] === "/" || link.includes("figma.com")
    );
    console.log("Crawled links:", links, "Filtered", filteredLinks);
    return filteredLinks;
  } catch (error) {
    console.error(`Could not fetch ${url}: ${error.message}`);
    return [];
  }
}

// Start the crawl
const websiteUrl = "https://figma.com";
crawlWebsite(websiteUrl);

// const axios = require("axios");
// const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// // Function to extract XPath of an element
// function getXPath(element) {
//   if (!element || !element.parentNode) {
//     return ""; // If element or its parent doesn't exist, return an empty string
//   }

//   if (element.id) return `//*[@id="${element.id}"]`; // XPath based on element's ID
//   if (element === document.body) return "/html/body"; // Base case for body
//   const ix =
//     Array.from(element.parentNode.childNodes)
//       .filter(
//         (node) => node.nodeType === 1 && node.nodeName === element.nodeName
//       )
//       .indexOf(element) + 1;
//   return `${getXPath(
//     element.parentNode
//   )}/${element.nodeName.toLowerCase()}[${ix}]`;
// }

// // Function to extract key elements on the page
// async function extractKeyElements(page) {
//   return await page.evaluate(() => {
//     const elementsData = {};
//     const selector = "input, button, a, p, div";
//     document.querySelectorAll(selector).forEach((element) => {
//       const tagName = element.tagName.toLowerCase();
//       if (!elementsData[tagName]) {
//         elementsData[tagName] = [];
//       }
//       elementsData[tagName].push({
//         text: element.innerText || element.textContent || null,
//         id: element.id || null,
//         classList: Array.from(element.classList) || null,
//         xpath: getXPath(element),
//       });
//     });
//     return elementsData;
//   });
// }

// // Function to sign in
// async function signIn(page, email, password) {
//   await page.evaluate(
//     (email, password) => {
//       console.log("Signing in...");
//       const emailInput = document.querySelector(
//         'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email"], input[type="text"]'
//       );
//       const passwordInput = document.querySelector(
//         'input[type="password"], input[name*="password"], input[id*="password"], input[placeholder*="password"]'
//       );
//       const signInButton = document.querySelector(
//         'button[type="submit"], button[name*="sign in"], button[id*="login"], button[type="button"]'
//       );

//       if (emailInput) emailInput.value = email;
//       if (passwordInput) passwordInput.value = password;

//       if (signInButton) signInButton.click();
//     },
//     email,
//     password
//   );
//   console.log("Signed in");
//   await page.waitForNavigation({ waitUntil: "networkidle2" });
//   await new Promise((resolve) => setTimeout(resolve, 3000));

//   return page.url(); // Capture the new URL after login
// }

// // Function to take a screenshot, extract key elements, and save them in a folder for each page
// async function takeScreenshot(url, page) {
//   page.setViewport({ width: 1920, height: 1080 });
//   try {
//     await page.goto(url, { waitUntil: "networkidle2" });

//     const elementsData = await extractKeyElements(page);

//     const urlPath = new URL(url).pathname.replace(/\//g, "_") || "home";
//     const folderPath = path.join(__dirname, "screenshots", urlPath);

//     if (!fs.existsSync(folderPath)) {
//       fs.mkdirSync(folderPath, { recursive: true });
//     }

//     const screenshotPath = path.join(folderPath, `${urlPath}.png`);
//     await page.screenshot({ path: screenshotPath, fullPage: true });

//     const jsonFilePath = path.join(folderPath, `${urlPath}.json`);
//     fs.writeFileSync(jsonFilePath, JSON.stringify(elementsData, null, 2));

//     console.log(`Screenshot saved: ${screenshotPath}`);
//     console.log(`Data saved to ${jsonFilePath}`);
//   } catch (error) {
//     console.error(`Failed to take screenshot of ${url}: ${error.message}`);
//   }
// }

// // Function to scroll the page
// async function scrollPage(page) {
//   const bodyHandle = await page.$("body");
//   const { height } = await bodyHandle.boundingBox();
//   await page.evaluate(async (height) => {
//     for (let i = 0; i < height; i += 100) {
//       window.scrollTo(0, i);
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
//   }, height);
//   await bodyHandle.dispose();
// }

// // Function to crawl the website and take screenshots
// async function crawlWebsite(startUrl, email, password) {
//   const visited = new Set();
//   const screenshotsDir = path.join(__dirname, "screenshots");

//   if (!fs.existsSync(screenshotsDir)) {
//     fs.mkdirSync(screenshotsDir);
//   }

//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto(startUrl, { waitUntil: "networkidle2" });
//   // Sign in before crawling
//   const newUrl = await signIn(page, email, password);
//   console.log("Signed in and redirected to:", newUrl);

//   // Fetch links from the new URL
//   const links = await getLinks(newUrl); // Use the new URL here
//   console.log("Crawled links:", links); // Log crawled links

//   for (const link of links) {
//     const absoluteLink = new URL(link, newUrl).href; // Use newUrl for building absolute link

//     if (!visited.has(absoluteLink)) {
//       visited.add(absoluteLink);
//       await takeScreenshot(absoluteLink, page);
//       await scrollPage(page); // Scroll after taking screenshot
//     }
//   }

//   await browser.close();
// }

// // Function to fetch links from a webpage
// async function getLinks(url) {
//   try {
//     console.log("IN GET links");
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
//     console.log($, response);
//     const links = [];
//     $("[onclick]").each((i, element) => {
//       const onclickValue = $(element).attr("onclick");
//       // Push the onclick value to the links array
//       if (onclickValue) {
//         links.push(onclickValue);
//       }
//     });
//     let filteredLinks = links.filter((link) => link[0] === "/");
//     console.log("Crawled links:", links, "Filtered", filteredLinks);
//     return filteredLinks;
//   } catch (error) {
//     console.error(`Could not fetch ${url}: ${error.message}`);
//     return [];
//   }
// }

// // Start the crawl
// const websiteUrl = "https://paytm-basic-frontend-seven.vercel.app/signin";
// const userEmail = "temp2@gmail.com"; // Replace with your email
// const userPassword = "123456"; // Replace with your password
// crawlWebsite(websiteUrl, userEmail, userPassword);
