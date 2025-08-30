from playwright.sync_api import sync_playwright, expect
import time

def run(p):
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        print("Navigating to http://localhost:5173...")
        page.goto("http://localhost:5173")

        print("Waiting for .calculator-wrapper to be visible...")
        expect(page.locator(".calculator-wrapper")).to_be_visible(timeout=15000)
        print("Calculator wrapper visible.")

        # Adding a hard wait as a last resort for debugging
        print("Waiting for 5 seconds...")
        time.sleep(5)
        print("Waited 5 seconds.")

        # Fill in some data
        print("Filling account size...")
        page.locator('input#account-size').fill("10000")
        print("Filling risk percentage...")
        page.locator('input#risk-percentage').fill("1")
        print("Filling entry price...")
        page.locator('input#entry-price').fill("100")
        print("Filling stop loss...")
        page.locator('input#stop-loss-price').fill("99")
        print("Inputs filled.")

        time.sleep(1)

        # --- Save the first preset ---
        print("Saving first preset...")
        page.once("dialog", lambda dialog: dialog.accept("Test Preset 1"))
        page.locator('button#save-preset-btn').click()
        print("First preset saved.")

        expect(page.locator('select#preset-loader')).to_have_value("Test Preset 1", timeout=5000)
        print("First preset found in dropdown.")
        page.screenshot(path="jules-scratch/verification/01_one_preset.png")

        # --- Save the second preset ---
        print("Saving second preset...")
        page.locator('input#account-size').fill("20000")
        time.sleep(1)

        page.once("dialog", lambda dialog: dialog.accept("Test Preset 2"))
        page.locator('button#save-preset-btn').click()
        print("Second preset saved.")

        expect(page.locator('select#preset-loader')).to_have_value("Test Preset 2", timeout=5000)
        print("Second preset selected in dropdown.")

        expect(page.locator('select#preset-loader')).to_contain_text("Test Preset 1")
        expect(page.locator('select#preset-loader')).to_contain_text("Test Preset 2")
        print("Both presets found in dropdown.")

        page.screenshot(path="jules-scratch/verification/02_two_presets.png")
        print("Final screenshot taken.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as p:
    run(p)
