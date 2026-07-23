public with sharing class GuestReviewProcessor {

    @InvocableMethod(label='Process Guest Reviews' description='Processes guest reviews and inserts them into the Guest_Review__c object.')
    public static List<GuestReviewResponse> processReviews(List<GuestReviewRequest> requests) {

        GuestReviewResponse response = new GuestReviewResponse();

        try {
            Guest_Review__c guestReview = new Guest_Review__c();
            guestReview.Contact__c    = requests.get(0).contact.Id;
            guestReview.Experience__c = requests.get(0).experience.Id;
            guestReview.Rating__c     = requests.get(0).rating;
            guestReview.Comments__c   = requests.get(0).review;
            insert guestReview;
            response.message = 'Guest review processed successfully.';
        } catch (Exception e) {
            response.message = 'Error processing guest review: ' + e.getMessage();
        }

        return new List<GuestReviewResponse> { response };
    }

    public class GuestReviewRequest {
        @InvocableVariable(label='Contact' description='The contact associated with the guest review.' required=true)
        public Contact contact;

        @InvocableVariable(label='Experience' description='The experience associated with the guest review.' required=true)
        public Experience__c experience;

        @InvocableVariable(label='Review' description='The review provided by the guest.' required=true)
        public String review;

        @InvocableVariable(label='Rating' description='The rating provided by the guest.' required=true)
        public String rating;
    }

    public class GuestReviewResponse {
        @InvocableVariable(label='Message' description='The response message after processing the guest review.' required=true)
        public String message;
    }
}
