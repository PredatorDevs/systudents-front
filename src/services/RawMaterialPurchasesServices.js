import { genRequest } from "./Requests";

const rawMaterialPurchasesServices = {};

rawMaterialPurchasesServices.details = {};
rawMaterialPurchasesServices.payments = {};

rawMaterialPurchasesServices.find = () => genRequest(`get`, `/rawmaterialspurchases`, {});

rawMaterialPurchasesServices.findById = (rawMaterialPurchaseId) => 
  genRequest(
    `get`,
    `/rawmaterialspurchases/byId/${rawMaterialPurchaseId || 0}`,
    {},
    '',
    '',
    'No se han podido obtener la información de esta compra',
    'Error desconocido'
  );

rawMaterialPurchasesServices.findByLocationCurrentActiveShiftcut = (locationId) => 
  genRequest(
    `get`,
    `/rawmaterialspurchases/active-shiftcut/location/${locationId || 0}`,
    {},
    '',
    '',
    'No se han podido obtener las compras',
    'Error desconocido'
  );
 
rawMaterialPurchasesServices.findPendings = () => genRequest(`get`, `/rawmaterialspurchases/pendings`, {});

rawMaterialPurchasesServices.findPendingsByLocation = (locationId) => 
  genRequest(`get`, `/rawmaterialspurchases/pendings/by-location/${locationId}`, {});

rawMaterialPurchasesServices.findPendingAmountToPay = (saleId) =>
  genRequest(`get`, `/rawmaterialspurchases/pending-amount-to-pay/${saleId || 0}`, {}, '', '', 'No se pudo obtener el mongo a pagar', 'Error desconocido');

rawMaterialPurchasesServices.add = (
  locationId,
  supplierId,
  documentTypeId,
  paymentTypeId,
  paymentMethodId,
  docDatetime,
  docNumber,
  docOrderPurchaseNumber,
  total,
  IVAretention,
  IVAperception,
  expirationDays,
  userPINCode,
  rawMaterialDistributionId,
  notes
) => 
  genRequest(
    `post`,
    `/rawmaterialspurchases`,
    {
      locationId,
      supplierId,
      documentTypeId,
      paymentTypeId,
      paymentMethodId,
      docDatetime,
      docNumber,
      docOrderPurchaseNumber,
      total,
      IVAretention,
      IVAperception,
      expirationDays,
      userPINCode,
      rawMaterialDistributionId,
      notes
    },
    'Se han registrado los datos generales de la compra',
    'Acción exitosa',
    'No se han podido registrar los datos generales de la compra',
    'Error desconocido'
  );
 
rawMaterialPurchasesServices.voidRawMaterialPurchase = (userId, rawMaterialPurchaseId) => 
  genRequest(`post`, `/rawmaterialspurchases/void`, { userId, rawMaterialPurchaseId });

rawMaterialPurchasesServices.findByLocationMonth = (locationId, dateToSearch) =>
  genRequest(`get`, `/rawmaterialspurchases/by-month/${locationId}/${dateToSearch}`, {}, '', '', 'No se pudo obtener información de la búsqueda', 'Error desconocido');

rawMaterialPurchasesServices.details.findByRawMaterialPurchaseId = (rawMaterialPurchaseId) => 
  genRequest(`get`, `/rawmaterialspurchases/details/${rawMaterialPurchaseId}`, {});

// EXPECTED req.body => details = [[rawMaterialPurchaseId, rawMaterialId, unitCost, quantity], [...]]
rawMaterialPurchasesServices.details.add = (bulkData) => 
  genRequest(
    `post`,
    `/rawmaterialspurchases/details`,
    { bulkData },
    'Se han registrado los detalles de la compra',
    'Acción exitosa',
    'No se han podido registrar los detalles de la compra',
    'Error desconocido'
  );

rawMaterialPurchasesServices.payments.add = (locationId, cashierId, rawMaterialPurchaseId, paymentAmount) => 
  genRequest(`post`, `/rawmaterialspurchases/payments/new-single-payment`, { locationId, cashierId, rawMaterialPurchaseId, paymentAmount });
  
export default rawMaterialPurchasesServices;
