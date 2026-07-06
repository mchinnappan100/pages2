Create an Autolaunched flow
Create an input variable:
API Name: Booking_IDCopy
Description: The ID of the activity booking record that the customer wants to cancel.Copy (We check ALL Descriptions, so make sure you copy them accurately.)
Data Type: Text
Available for input: selected
Available for output: not selected
Create an output variable:
API Name: Error_Message_OutputCopy
Description: The error message to show to the customer when this flow doesn't finish successfully.Copy
Data Type: Text
Available for input: not selected
Available for output: selected
Create an output variable:
API Name: Updated_Booking_RecordCopy
Description: The activity's booking record after it has been canceled. Present this data to the customer when the action is complete.Copy
Data Type: Record
Object: Booking
Available for input: not selected
Available for output: selected
Add an Update Records element:
Label: Cancel Selected BookingCopy
API Name: Cancel_Selected_BookingCopy
Description: Update the booking record so that it's canceled. This sets the field Is Canceled to TRUE.Copy
How to Find Records to Update and Set Their Values: Specify conditions to identify records, and set fields individually
Object: Booking
Set Filter Conditions
Condition Requirements to Update Record: All Conditions Are Met (AND)
Field: Record ID
Operator: Equals
Value: Booking_ID
Set Field Values:
Field: Is Canceled
Value: True
After the Cancel Selected Booking element, add a Get Records element:
Label: Get Updated Booking DetailsCopy
API Name: Get_Updated_Booking_DetailsCopy
Description: Retrieve the details of the activity booking record that was canceled, so they can be presented to the customer.Copy
Object: Booking
In the Filter Records section:
Condition Requirements: All Conditions Are Met (AND)
Field: Record ID
Operator: Equals
Value: Booking_ID
How Many Records to Store: Only the first record
How to Store Record Data: Choose fields and assign variables (advanced)
Where to Store Field Values: Together in a record variable
Record: Updated_Booking_Record
In the Select Booking Fields to Store in Variable section:
Field 1: Experience_Name__c
Field 2: Date__c
Field 3: Start_Time__c
Field 4: Is_Canceled__c
Add a fault path coming from the Cancel Selected Booking element
On the fault path, add an Assignment element:
Label: Set the Error Message OutputCopy
API Name: Set_the_Error_Message_OutputCopy
Description: Gives error message text to the Error_Message_Output variable, to present to the customer if this flow fails.Copy
Variable: Error_Message_Output
Operator: Equals
Value: I'm sorry, I'm having a problem canceling that activity booking. Would you like to speak to our support team?Copy
Add a fault path coming from the Get Updated Booking Details element
Connect the Get Updated Booking Details element’s fault path to the Set the Error Message Output element (Hint: Click the + (Add Element) symbol on the Fault path and select Connect to Element)
Save the flow:
Label: Cancel Contact's BookingCopy
API Name: Cancel_Contact_s_BookingCopy
Description: With the Booking record's ID, update the Booking record that the customer has chosen so that it is canceled.Copy
Activate the flow