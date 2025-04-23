/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Anish Ananda Sagri
 * @description Suitelet for collecting customer feedback and displaying feedback summary.
 */

define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/log'], (ui, search, record, log) => {

  const onRequest = (context) => {
    if (context.request.method === 'GET') {
      const form = ui.createForm({ title: 'Customer Feedback Form' });

      // Add form fields
      form.addField({
        id: 'custpage_customer',
        type: ui.FieldType.SELECT,
        label: 'Select Customer',
        source: 'customer',
      });

      form.addField({
        id: 'custpage_feedback',
        type: ui.FieldType.TEXTAREA,
        label: 'Feedback',
      });

      const ratingField = form.addField({
        id: 'custpage_rating',
        type: ui.FieldType.SELECT,
        label: 'Satisfaction Rating',
      });

      ratingField.addSelectOption({ value: '', text: '--Select--' });
      for (let i = 1; i <= 5; i++) {
        ratingField.addSelectOption({ value: i.toString(), text: `${i} Star${i > 1 ? 's' : ''}` });
      }

      form.addSubmitButton({ label: 'Submit Feedback' });

      // Add Feedback Summary Sublist
      const feedbackList = form.addSublist({
        id: 'custpage_feedback_list',
        type: ui.SublistType.LIST,
        label: 'Submitted Feedback',
      });

      feedbackList.addField({ id: 'custpage_customer_list', type: ui.FieldType.TEXT, label: 'Customer' });
      feedbackList.addField({ id: 'custpage_feedback_text', type: ui.FieldType.TEXT, label: 'Feedback' });
      feedbackList.addField({ id: 'custpage_rating_list', type: ui.FieldType.TEXT, label: 'Rating' });

      // Fetch records using a search
      const feedbackSearch = search.create({
        type: 'customrecord_customer_feedback',
        columns: ['custrecord_feedback_customer', 'custrecord_feedback_text', 'custrecord_feedback_rating']
      });

      const results = feedbackSearch.run().getRange({ start: 0, end: 20 });

      let line = 0;
      results.forEach(result => {
        feedbackList.setSublistValue({
          id: 'custpage_customer_list',
          line: line,
          value: result.getText('custrecord_feedback_customer') || '-'
        });
        feedbackList.setSublistValue({
          id: 'custpage_feedback_text',
          line: line,
          value: result.getValue('custrecord_feedback_text') || '-'
        });
        feedbackList.setSublistValue({
          id: 'custpage_rating_list',
          line: line,
          value: result.getValue('custrecord_feedback_rating') || '-'
        });
        line++;
      });

      context.response.writePage(form);
    } 
    else {
      const request = context.request;
      const customerId = request.parameters.custpage_customer;
      const feedback = request.parameters.custpage_feedback;
      const rating = request.parameters.custpage_rating;

      const feedbackRecord = record.create({ type: 'customrecord_customer_feedback' });

      feedbackRecord.setValue({ fieldId: 'custrecord_feedback_customer', value: customerId });
      feedbackRecord.setValue({ fieldId: 'custrecord_feedback_text', value: feedback });
      feedbackRecord.setValue({ fieldId: 'custrecord_feedback_rating', value: rating });
      feedbackRecord.setValue({ fieldId: 'name', value: 'Feedback by ' + customerId });

      feedbackRecord.save();

      const form = ui.createForm({ title: 'Thank You!' });
      form.addField({
        id: 'custpage_message',
        type: ui.FieldType.INLINEHTML,
        label: 'Message',
      }).defaultValue = `<div style="color: green; font-size: 16px;">Thanks for your feedback!</div>`;

      context.response.writePage(form);
    }
  };

  return { onRequest };
});
