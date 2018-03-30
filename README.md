# myTimeOfflineDemoApp

This application uses ngStorage to show data without going to web services each time , so that it can work in offline
-----
supports Offline Mode by putting data tolocalStorage for the 1st time when application is loaded and serves from localStorage until the companyID changed or localStorage is deleted by clearing cache.

Use a web server to run app and to start the application

To start go to route - #/company?companyID=40426   (Example: http://server-name/#/company?companyID=40426)

Loads all the data needed by the views when you load the app first time.

when companyID changed it clears the localStorage data and writes the new data of the company in the localStorage.

note: clear localStorage or change companyID to load the new data from web service has its served from localStorage if there is an existing version in it.


(since its a small project and because of time contraint this was developed with less files and did not use npm or john papa conventions but does the work).

Hope you enjoy the app!!

some screen shots are attached below.
<br>
<image height="700" src="https://github.com/manish3344/myTimeDemo/blob/master/assets/home_screen_capture.PNG" />
<br>
When clicked on each employee services button it shows up a doalog with list of services. variations with price
<br>
<image height="700" src="https://github.com/manish3344/myTimeDemo/blob/master/assets/ServicesModalCapture.PNG" />


