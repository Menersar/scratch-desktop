# Store listing scripts

## Microsoft Store

1. Go to top submission on <https://partner.microsoft.com/en-us/dashboard/products/[PRODUCT-ID]/overview>
2. Press "Export listings" and save as "from-microsoft.csv"
3. Run scratch-l10n `npm run sidekick:pull`
4. Run `node generate-csv.js`
5. Press "Import listings" then select "import-to-microsoft.csv"
