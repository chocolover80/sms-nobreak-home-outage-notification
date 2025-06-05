# sms-nobreak-home-outage-notification
This application aims to collect the status' flags of my personal SMS UPS I store in my home. It'll track (via node.js webscrapping with puppeteer) the current status of each of the flags (which are shown in a dedicated IP in my network), save it to a JSON Log file, and then send an email if there's any outages.
