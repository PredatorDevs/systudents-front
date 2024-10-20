import { genRequest } from "./Requests";

const orderSalesServices = {};

orderSalesServices.details = {};

orderSalesServices.find = () => genRequest(`get`, `/ordersales`, {});
orderSalesServices.findById = (orderSaleId) => genRequest(`get`, `/ordersales/byId/${orderSaleId || 0}`, {});

orderSalesServices.add = (
  locationId,
  customerId,
  documentDatetime,
  documentType,
  paymentType,
  total,
  userPINCode
) => 
  genRequest(
    `post`,
    `/ordersales`,
    {
      locationId,
      customerId,
      documentDatetime,
      documentType,
      paymentType,
      total,
      userPINCode
    },
    'Datos generales guardados',
    '',
    'La información general de la orden venta no se pudo guardar',
    'Error desconocido'
  );

orderSalesServices.update = (
  locationId,
  customerId,
  docDatetime,
  documentType,
  paymentType,
  status,
  total,
  userPINCode,
  orderSaleId
) => 
  genRequest(
    `put`,
    `/ordersales`,
    {
      locationId,
      customerId,
      docDatetime,
      documentType,
      paymentType,
      status,
      total,
      userPINCode,
      orderSaleId
    }
  );

orderSalesServices.changeStatus = (newStatus, orderSaleId) => 
  genRequest(`put`, `/ordersales/change-status`, { newStatus, orderSaleId });

orderSalesServices.consolidate = (saleId, orderSaleId) => 
  genRequest(`put`, `/ordersales/consolidate`, { saleId, orderSaleId }, 'Orden de venta consolidada', '', 'No se pudo consolidar la Orden de venta', '');
 
orderSalesServices.remove = (orderSaleId) =>
  genRequest(`delete`, `/ordersales/${orderSaleId}`);

// PRODUCTION DETAILS

orderSalesServices.details.findByOrderSaleId = (orderSaleId) => 
  genRequest(`get`, `/ordersales/details/${orderSaleId}`, {});

// EXPECTED req.body => details = [[orderSaleId, productId, unitPrice, quantity], [...]]
orderSalesServices.details.add = (bulkData) => 
  genRequest(`post`, `/ordersales/details`, { bulkData }, 'Detalle de orden de venta guardados', '', 'El detalle de la orden de venta no fue añadido', 'Error desconocido');

orderSalesServices.details.update = (orderSaleId, productId, unitPrice, quantity, orderSaleDetailId) => 
  genRequest(`put`, `/ordersales/details`, { orderSaleId, productId, unitPrice, quantity, orderSaleDetailId });

orderSalesServices.details.remove = (orderSaleDetailId) => 
  genRequest(`delete`, `/ordersales/details/${orderSaleDetailId}`);
  
export default orderSalesServices;
