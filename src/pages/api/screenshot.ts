import { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Browser, Page } from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let browser: Browser | null = null;

  try {
    // Launch the browser
    browser = await puppeteer.launch();
    const page: Page = await browser.newPage();

    // Navigate to the requested URL
    const { url } = req.query;
    if (typeof url !== "string") {
      res.status(400).send("Invalid URL");
      return;
    }
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1000));

    await page.focus("body"); // Replace 'selector' with your actual selector
    let scrollArea = 0;
    for (let i = 0; i < 10; i++) {
      const deltaScroll = Math.random() * 100;
      scrollArea += deltaScroll;
      await page.mouse.wheel({ deltaY: deltaScroll });
    }
    page.mouse.wheel({ deltaY: -scrollArea });

    // Take a screenshot
    const screenshot = await page.screenshot({ fullPage: true });

    // Send the screenshot as a response
    res.setHeader("Content-Type", "image/png");
    res.send(screenshot);
  } catch (error) {
    res.status(500).json({ error: "Failed to take screenshot" });
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}
