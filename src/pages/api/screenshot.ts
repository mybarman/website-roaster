import { NextApiRequest, NextApiResponse } from "next";
import { Browser, Page } from "playwright";
import playwright from "playwright-aws-lambda";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let browser: Browser | null = null;

  try {
    // Launch the browser
    browser = await playwright.launchChromium();
    const page: Page = await browser.newPage();

    // Navigate to the requested URL
    const { url } = req.query;
    if (typeof url !== "string") {
      res.status(400).send("Invalid URL");
      return;
    }
    await page.setViewportSize({ width: 1320, height: 800 });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    await page.focus("body"); // Replace 'selector' with your actual selector
    let scrollArea = 0;
    for (let i = 0; i < 10; i++) {
      const deltaScroll = Math.random() * 100;
      scrollArea += deltaScroll;
      await page.mouse.wheel(0, deltaScroll);
    }
    await page.mouse.wheel(0, -scrollArea);

    // Take a screenshot
    const screenshot = await page.screenshot({ fullPage: true });

    // Send the screenshot as a response
    res.setHeader("Content-Type", "image/png");
    res.send(screenshot);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to take screenshot" });
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}
