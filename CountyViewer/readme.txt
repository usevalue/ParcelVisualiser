HOW TO
- If you've made it this far, you've unzipped the file.  Open index.html in any browser.  Consider exploring the interface before reading the feature descriptions below, as a way of testing how intuitive it is (or isn't).

FEATURES
- The left edge of the screen offers various controls, broken into two main categories: display options and filtering options.  To operate the controls, adjust the various settings and click the "update map" button at the bottom.
- There are two display options.  Checking and unchecking the highlights will give bold outlines to selected features.  The drop-down menu offers several different colour schemes.  The default is a semi-transparent overlay to ease reading of the base map.  The others offer visual representations of continuous variables (distance, assessed value).
- Filters allow you to exclude parcels from display.  The first set of filters, for vacancy and ownership, allow you to specify if results must or must not be displayed.  Clicking "filter by price range" opens a list of bands of total property value.  The three double sliders allow one to specify minimum and maximum distances from various terrain features.
- Below the update button is a count of how many features are being displayed out of total features in the dataset, as determined by filter settings.

ABOUT
- Information about data sources available here:
https://docs.google.com/spreadsheets/d/1cEWEQUClcTVNaKQUTkYxPCnMqFq-HvTb-AEOaiO2lok/edit?usp=sharing
- This is a beta version of the mapping tool.  What that means is that most of the main features are working, but tweaks and additions should be expected.  This has not been rigourously tested across browsers other than Firefox.  Please send feedback or bug reports to James Pollard at jamespol@buffalo.edu with "BNLRT" somewhere in the subject line.  For bug reports, please describe the steps to reproduce the bug, as well as the browser you are using to view the page.
- This application is built using the Leaflet and JQuery Javascript libraries.  Leaflet handles the maps; JQuery handles the double sliders.

KNOWN ISSUES
- Refreshing the page will reset most parts of the program's internal state, but will not necessarily reset interface options.  In particular, you will need to re-select your colour scheme, even if it already appears to be selected, after a page refresh.
- The colour key for park distance does not yet include bright green, which is used to indicate parks themselves.  This is in addition to the bright green outlines displayed if you select greenspace highlighting.