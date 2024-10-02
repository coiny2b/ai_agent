import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# Set up Selenium options
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Set up the Chrome driver
service = Service("/usr/bin/chromedriver")
driver = webdriver.Chrome(service=service, options=chrome_options)

# Open the URL
url = "https://opensea.io/collection/puuvillasociety?search[stringTraits][0][name]=Rarity&search[stringTraits][0][values][0]=Legendary"
driver.get(url)
time.sleep(5)  # Let the page load completely

# Scrape the data
items = []
prices = []
best_offers = []
last_sales = []
owners = []
time_listed = []

for row in driver.find_elements(By.CSS_SELECTOR, ".AssetSearchList--asset"):
    try:
        item = row.find_element(By.CSS_SELECTOR, ".AssetCell--name").text
    except:
        item = ""
    try:
        price = row.find_element(By.CSS_SELECTOR, ".Price--amount").text
    except:
        price = ""
    try:
        best_offer = row.find_element(By.CSS_SELECTOR, ".Price--unit").text
    except:
        best_offer = ""
    try:
        last_sale = row.find_element(By.CSS_SELECTOR,
                                     ".PriceHistory--price").text
    except:
        last_sale = ""
    try:
        owner = row.find_element(By.CSS_SELECTOR, ".AccountLink--name").text
    except:
        owner = ""
    try:
        time = row.find_element(By.CSS_SELECTOR, ".AssetCell--listed").text
    except:
        time = ""

    items.append(item)
    prices.append(price)
    best_offers.append(best_offer)
    last_sales.append(last_sale)
    owners.append(owner)
    time_listed.append(time)

# Close the driver
driver.quit()

# Create DataFrame
df_full = pd.DataFrame({
    "Item": items,
    "Current Price": prices,
    "Best Offer": best_offers,
    "Last Sale": last_sales,
    "Owner": owners,
    "Time Listed": time_listed
})

# Save DataFrame to CSV
csv_file_path_full = "puuvillasociety_full_data.csv"
df_full.to_csv(csv_file_path_full, index=False)
