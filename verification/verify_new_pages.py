from playwright.sync_api import sync_playwright

def verify_new_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the new home page
        try:
            page.goto("http://localhost:3000/new/home")
            page.wait_for_load_state("networkidle")

            # Take a screenshot of the home page
            page.screenshot(path="verification/new_home_page.png")
            print("Home page screenshot taken.")

            # Check if the floating menu button exists
            floating_menu_button = page.locator("button[aria-label='Menu']")
            if floating_menu_button.count() > 0:
                print("Floating menu button found.")
                # Click the menu button to open it
                floating_menu_button.click()
                page.wait_for_timeout(500) # Wait for animation
                page.screenshot(path="verification/new_home_page_menu_open.png")
                print("Home page menu open screenshot taken.")
            else:
                print("Floating menu button NOT found.")

            # Navigate to Queues page
            page.goto("http://localhost:3000/new/queues")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="verification/new_queues_page.png")
            print("Queues page screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_new_pages()
