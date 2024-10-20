import { genRequest } from "./Requests";

const expensesServices = {};

expensesServices.find = () => 
  genRequest(
    `get`,
    `/expenses`,
    {},
    '',
    '',
    '',
    ''
  );

expensesServices.findTypes = () => genRequest(`get`, `/expenses/types`, {});
expensesServices.findById = (expenseId) => genRequest(`get`, `/expenses/${expenseId}`, {});
expensesServices.getAttachmentsById = (expenseId) => genRequest(`get`, `/expenses/get-attachments/${expenseId}`, {});

expensesServices.add = async (
  locationId,
  documentTypeId,
  expenseTypeId,
  paymentMethodId,
  documentNumber,
  documentDatetime,
  accountCode,
  concept,
  description,
  amount,
  taxedAmount,
  noTaxedAmount,
  discounts,
  bonus,
  iva,
  fovial,
  cotrans,
  ivaRetention,
  ivaPerception,
  createdBy,
  accountingAccountId,
  fileAttachment
) => {
  const formData = new FormData();
    
  formData.append('locationId', locationId);
  formData.append('documentTypeId', documentTypeId);
  formData.append('expenseTypeId', expenseTypeId);
  formData.append('paymentMethodId', paymentMethodId);
  formData.append('documentNumber', documentNumber);
  formData.append('documentDatetime', documentDatetime);
  formData.append('accountCode', accountCode);
  formData.append('concept', concept);
  formData.append('description', description);
  formData.append('amount', amount);
  formData.append('taxedAmount', taxedAmount);
  formData.append('noTaxedAmount', noTaxedAmount);
  formData.append('discounts', discounts);
  formData.append('bonus', bonus);
  formData.append('iva', iva);
  formData.append('fovial', fovial);
  formData.append('cotrans', cotrans);
  formData.append('ivaRetention', ivaRetention);
  formData.append('ivaPerception', ivaPerception);
  formData.append('createdBy', createdBy);
  formData.append('accountingAccountId', accountingAccountId);

  formData.append('fileAttachment', fileAttachment);

  await genRequest(`post-multipart`, `/expenses`, formData);
}

expensesServices.update = (locationId, shiftcutId, expenseTypeId, paymentMethodId, docNumber, docDatetime, accountCode, concept, description, amount, createdBy, expenseId) => 
  genRequest(`put`, `/expenses`, { locationId, shiftcutId, expenseTypeId, paymentMethodId, docNumber, docDatetime, accountCode, concept, description, amount, createdBy, expenseId });

expensesServices.voidById = (userId, expenseId) => 
  genRequest(`put`, `/expenses/void`, { voidedBy: userId, expenseId });

expensesServices.remove = (expenseId) => 
  genRequest(`delete`, `/expenses/${expenseId}`);

export default expensesServices;
