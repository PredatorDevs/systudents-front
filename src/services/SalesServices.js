import { genRequest } from "./Requests";

const salesServices = {};

salesServices.details = {};
salesServices.payments = {};
salesServices.pdfDocs = {};
salesServices.excelDocs = {};

salesServices.find = () => genRequest(`get`, `/sales`, {});

salesServices.findById = (saleId) => genRequest(`get`, `/sales/byId/${saleId || 0}`, {}, '', '', 'No se pudo obtener información general de la orden', 'Error desconocido');

salesServices.findByDocNumber = (docNumber, documentTypeId) =>
  genRequest(`get`, `/sales/byDocNumber/${String(docNumber).replace('/', '%2F')}/${documentTypeId || 0}`, {}, '', '', 'No se pudo obtener información de la búsqueda', 'Error desconocido');

salesServices.pdfDocs.findByDocNumber = (docNumber, documentTypeId) =>
  genRequest(
    `get`,
    `/sales/pdf-docs/byDocNumber/${String(docNumber).replace('/', '%2F')}/${documentTypeId || 0}`,
    {},
    '',
    '',
    'No se pudo obtener información de la búsqueda',
    'Error desconocido',
    'application/json',
    'blob'
  );

salesServices.excelDocs.findByDocNumber = (docNumber, documentTypeId) =>
  genRequest(
    `get`,
    `/sales/excel-docs/byDocNumber/${String(docNumber).replace('/', '%2F')}/${documentTypeId || 0}`,
    {},
    '',
    '',
    'No se pudo obtener información de la búsqueda',
    'Error desconocido',
    'application/json',
    'blob'
  );

salesServices.findByCustomerIdentifier = (customerIdentifier, startDate, endDate) =>
  genRequest(`get`, `/sales/by-customer/${String(customerIdentifier).replace('/', '%2F')}/${startDate}/${endDate}`, {}, '', '', 'No se pudo obtener información de la búsqueda', 'Error desconocido');


salesServices.findByCashierDate = (cashierId, dateToSearch) =>
  genRequest(`get`, `/sales/by-cashier-date/${cashierId}/${dateToSearch}`, {}, '', '', 'No se pudo obtener información de la búsqueda', 'Error desconocido');

salesServices.pdfDocs.findByCustomerIdentifier = (customerIdentifier, startDate, endDate) =>
  genRequest(
    `get`,
    `/sales/pdf-docs/by-customer/${String(customerIdentifier).replace('/', '%2F')}/${startDate}/${endDate}`,
    {},
    '',
    '',
    'No se pudo obtener información de la búsqueda',
    'Error desconocido',
    'application/json',
    'blob'
  );

salesServices.excelDocs.findByCustomerIdentifier = (customerIdentifier, startDate, endDate) =>
  genRequest(
    `get`,
    `/sales/excel-docs/by-customer/${String(customerIdentifier).replace('/', '%2F')}/${startDate}/${endDate}`,
    {},
    '',
    '',
    'No se pudo obtener información de la búsqueda',
    'Error desconocido',
    'application/json',
    'blob'
  );

salesServices.findByProductIdentifier = (productIdentifier) =>
  genRequest(`get`, `/sales/by-product/${String(productIdentifier).replace('/', '%2F')}`, {}, '', '', 'No se pudo obtener información de la búsqueda', 'Error desconocido');

salesServices.pdfDocs.findByProductIdentifier = (productIdentifier) =>
  genRequest(
    `get`,
    `/sales/pdf-docs/by-product/${String(productIdentifier).replace('/', '%2F')}`,
    {},
    '',
    '',
    'No se pudo obtener información de la búsqueda',
    'Error desconocido',
    'application/json',
    'blob'
  );

salesServices.excelDocs.findByProductIdentifier = (productIdentifier) =>
  genRequest(
    `get`,
    `/sales/excel-docs/by-product/${String(productIdentifier).replace('/', '%2F')}`,
    {},
    '',
    '',
    'No se pudo obtener información de la búsqueda',
    'Error desconocido',
    'application/json',
    'blob'
  );

salesServices.findByLocationCurrentActiveShiftcut = (locationId) => genRequest(`get`, `/sales/active-shiftcut/location/${locationId || 0}`, {});

salesServices.findByMyCashier = (cashierId) => 
  genRequest(
    `get`,
    `/sales/my-cashier/${cashierId || 0}`,
    {},
    '',
    '',
    'No se pudo obtener la información de las órdenes de su caja',
    'Error desconocido'
  );

salesServices.findPendings = () => genRequest(`get`, `/sales/pendings`, {});

salesServices.findPendingsByLocation = (locationId) => 
  genRequest(
    `get`,
    `/sales/pendings/by-location/${locationId}`,
    {},
    ``,
    ``,
    `No se pudieron obtener las cuentas pendientes`,
    `Error desconocido`
  );

salesServices.findPendingAmountToPay = (saleId) => 
  genRequest(
    `get`,
    `/sales/pending-amount-to-pay/${saleId || 0}`,
    {},
    '',
    '',
    'No se pudo obtener la información para efectuar el cobro',
    'Error desconocido'
  );

salesServices.add = (
  locationId,
  customerId,
  documentTypeId,
  paymentTypeId,
  paymentMethodId,
  docType,
  docDatetime,
  docNumber,
  total,
  cashierId,
  IVAretention,
  IVAperception,
  expirationDays,
  bankId,
  referenceNumber,
  accountNumber,
  userPINCode,
  totalInLetters,
  isNoTaxableOperation,
  salesNotes,
  customerComplementaryName
) => 
  genRequest(
    `post`,
    `/sales`,
    {
      locationId,
      customerId,
      documentTypeId,
      paymentTypeId,
      paymentMethodId,
      docType,
      docDatetime,
      docNumber,
      total,
      cashierId,
      IVAretention,
      IVAperception,
      expirationDays,
      bankId,
      referenceNumber,
      accountNumber,
      userPINCode,
      totalInLetters,
      isNoTaxableOperation,
      salesNotes: salesNotes || null,
      customerComplementaryName: customerComplementaryName || null
    },
    'Datos generales guardados',
    '',
    'La información general de la venta no se pudo guardar',
    'Error desconocido'
  );
  
salesServices.validateDocNumber = (documentType, docNumber, cashierId) => 
  genRequest(
    `post`,
    `/sales/validate`,
    { documentType, docNumber, cashierId },
    '',
    '',
    'No se pudo validar el número de documento para esta caja',
    'Error desconocido'
  );

salesServices.voidSale = (userId, saleId) => 
  genRequest(`post`, `/sales/void`, { userId, saleId });

salesServices.update = (locationId, customerId, docType, docDatetime, docNumber, total, saleId) => 
  genRequest(`put`, `/sales`, { locationId, customerId, docType, docDatetime, docNumber, total, saleId });

salesServices.remove = (saleId) => 
  genRequest(`delete`, `/sales/${saleId}`);

// PRODUCTION DETAILS

salesServices.details.findBySaleId = (saleId) => 
  genRequest(`get`, `/sales/details/${saleId}`, {}, '', '', 'No se pudo obtener información del detalle de ventas', 'Error desconocido');

// EXPECTED req.body => details = [[saleId, productId, unitPrice, quantity], [...]]
salesServices.details.add = (bulkData) => 
  genRequest(`post`, `/sales/details`, { bulkData }, 'Detalle de venta guardados', '', 'El detalle de la venta no fue añadido', 'Error desconocido');

salesServices.details.update = ( saleId, productId, unitPrice, quantity, saleDetailId ) => 
  genRequest(`put`, `/sales/details`, {  saleId, productId, unitPrice, quantity, saleDetailId });

salesServices.details.remove = (saleDetailId) => 
  genRequest(`delete`, `/sales/details/${saleDetailId}`);

salesServices.payments.add = (
  locationId,
  cashierId,
  saleId,
  paymentAmount,
  paymentMethodId,
  bankId,
  referenceNumber,
  accountNumber
) => 
  genRequest(
    `post`,
    `/sales/payments/new-single-payment`,
    {
      locationId,
      cashierId,
      saleId,
      paymentAmount,
      paymentMethodId,
      bankId,
      referenceNumber,
      accountNumber
    }
  );

salesServices.payments.addGeneral = (
  customerId,
  paymentAmount,
  locationId,
  cashierId,
  paymentMethodId,
  bankId,
  referenceNumber,
  accountNumber
) => 
  genRequest(
    `post`,
    `/sales/payments/new-general-payment`,
    {
      customerId,
      paymentAmount,
      locationId,
      cashierId,
      paymentMethodId,
      bankId,
      referenceNumber,
      accountNumber
    }
  );
  
export default salesServices;
