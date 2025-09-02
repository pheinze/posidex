from playwright.sync_api import sync_playwright, Page, expect

def run(page: Page):
    """
    This script verifies the new stepper buttons on the numerical inputs.
    It now clicks the input to focus it, which is a more reliable way
    to make the stepper buttons appear than hovering.
    """
    # Listen for console events
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

    # 1. Navigate to the application
    page.goto("http://localhost:5173/")

    # 2. Find the "Leverage" input field
    leverage_input = page.get_by_placeholder("Leverage")

    # 3. Click the input to focus it and reveal the stepper buttons
    leverage_input.click()

    # 4. Find the 'up' button
    input_container = page.locator(".input-container").filter(has=leverage_input)
    up_button = input_container.locator("button", has_text="▲")

    # 5. Expect the button to be visible now
    expect(up_button).to_be_visible()

    # 6. Click the button and assert after each click
    print("--- Clicking Up Button: 1st Time ---")
    up_button.click()
    expect(leverage_input).to_have_value("1")

    print("--- Clicking Up Button: 2nd Time ---")
    up_button.click()
    expect(leverage_input).to_have_value("2")

    print("--- Clicking Up Button: 3rd Time ---")
    up_button.click()
    expect(leverage_input).to_have_value("3")

    print("--- All clicks successful ---")


if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run(page)
        browser.close()
