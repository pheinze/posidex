from playwright.sync_api import sync_playwright, expect

def run(p):
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        print("Navigating to http://localhost:5173...")
        page.goto("http://localhost:5173", timeout=60000)

        print("Waiting for .calculator-wrapper to be visible...")
        expect(page.locator(".calculator-wrapper")).to_be_visible(timeout=30000)

        print("Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/load_test.png")
        print("Screenshot saved to jules-scratch/verification/load_test.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/load_error.png")
    finally:
        browser.close()

with sync_playwright() as p:
    run(p)
