## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Mon Sep 23 2024 07:19:57 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>@sap/generator-fiori-freestyle|
|**App Generator Version**<br>1.15.0|
|**Generation Platform**<br>SAP Business Application Studio|
|**Template Used**<br>simple|
|**Service Type**<br>SAP System (ABAP On Premise)|
|**Service URL**<br>http://sapbtp.com:8023/sap/opu/odata/sap/ZVBAP_SRV|
|**Module Name**<br>salesproject|
|**Application Title**<br>sales project|
|**Namespace**<br>|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.114.0|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

## salesproject

An SAP Fiori application.

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  In order to launch the generated app, simply run the following from the generated app root folder:

```
    npm start
```

- It is also possible to run the application using mock data that reflects the OData Service URL supplied during application generation.  In order to run the application with Mock Data, run the following from the generated app root folder:

```
    npm run start-mock
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)


##### Description:
Aim: To create a Fiori Application to Update reference ID based on customer number.

Tales used :- VBAK, 12mi, ZRAR_REFRENCE, T001.

Process:
AT FRONT_END:
 1. Create a login page.
 2. After logic we have the Home page and the left menu.
 3. I have created an option to switch the page to RAR Reference Update in the left menu.
 4. ![image](https://github.com/user-attachments/assets/2d91e04b-105d-4e34-9ce9-c2b8a2092e40)
 5. That RAR Reference Update page has filter bars to filter that smart table which fetches data from the VBAK Table.
 6. Based on search criteria, such as customer number, company code, and company organization,
 7. After getting data to the table, the user can select a multi-select option to select items from the table.
 8. On my screen I have used two buttons 1. add to list 2. review
 9. After selecting items from the table, when the user clicks on the add to the list button, all selected fields are stored in a list.
 10. after that when the user clicks on the review button it will navigate the user to the next screen which contains a list of items that are selected by the user.
 11. in that screen we have a table with respective fields and a field with new reference and old reference.
 12. On that 2nd screen we have two buttons 1. Update 2. Add more items.
 13. When that user wants to add some more items from 1st screen when the user presses on the button add more items.
 14. after pressing again it navigates to page 1 or screen 1. If the user selects a new item which does add already on to list it will added to the list or else it to throw an error to the user.
 15. once all done.  when the user clicks on the update that filed old reference has to be updated with a new reference.

AT BACKEND:-
1. In BackEnd I have created a gateway service. To do crud operations.
2. By implementing methods like getentity, create, and update methods in the gateway.
3. And the goal is to push the changes from front end to back end.



