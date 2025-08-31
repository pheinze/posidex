from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navigate to the page.
            page.goto("http://localhost:4173/")

            # Give the page a moment to load
            page.wait_for_selector('button#save-preset-btn')

            # 2. Fill in some data
            page.fill('input[placeholder="Account Size"]', "10000")
            page.fill('input[placeholder="Risk per Trade (%)"]', "1")
            page.fill('input[placeholder="Entry Price"]', "100")
            page.fill('input[placeholder="Manual Stop Loss"]', "90")

            # 3. Click the save preset button.
            page.click('button#save-preset-btn')

            # 4. The modal should appear. Fill in the preset name.
            modal_input_selector = 'input[placeholder="Input..."]'
            page.wait_for_selector(modal_input_selector)
            page.fill(modal_input_selector, "Test Preset")

            # 5. Click the "OK" button in the modal.
            page.click('div.modal-content button:has-text("OK")')

            # 6. Verify the preset appears in the dropdown immediately.
            preset_option_selector = 'select#preset-loader option:has-text("Test Preset")'
            expect(page.locator(preset_option_selector)).to_have_count(1)

            # 7. Reload the page.
            page.reload()
            page.wait_for_selector('button#save-preset-btn')

            # 8. Verify the preset is still in the dropdown.
            expect(page.locator(preset_option_selector)).to_have_count(1)

            # 9. Take a screenshot.
            page.screenshot(path="jules-scratch/verification/verification.png")

            print("Verification successful!")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
