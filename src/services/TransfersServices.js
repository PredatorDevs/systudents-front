import { genRequest } from "./Requests";

const transfersServices = {};

transfersServices.getRejecteds = () =>
  genRequest(
    `get`,
    `/transfers/rejecteds`,
    {},
    '',
    '',
    'No se pudo obtener la información detallada de los detalles de traslados rechazados',
    'Error desconocido'
  );

transfersServices.add = (originLocationId, destinationLocationid, sentBy, sentAt, status, userPINCode) => 
  genRequest(`post`, `/transfers`, { originLocationId, destinationLocationid, sentBy, sentAt, status, userPINCode });

transfersServices.addDetails = (bulkData) => 
  genRequest(`post`, `/transfers/details`, { bulkData });

transfersServices.incomingTransfers = (destinationLocationId) => 
  genRequest(
    `get`,
    `/transfers/incoming/${destinationLocationId}`,
    {},
    '',
    '',
    'No se pudieron obtener los traslados entrantes de esta sucursal',
    'Error desconocido'
  );

transfersServices.incomingTransfersBySentAtRange = (destinationLocationId, initialDate, finalDate) => 
  genRequest(
    `get`,
    `/transfers/incoming/sent-at/${destinationLocationId}/${initialDate}/${finalDate}`,
    {},
    '',
    '',
    'No se pueden obtener los resultados de esta búsqueda de traslados entrantes por fecha de envio',
    'Error desconocido'
  );

transfersServices.incomingTransfersByReceivedAtRange = (destinationLocationId, initialDate, finalDate) => 
  genRequest(
    `get`,
    `/transfers/incoming/received-at/${destinationLocationId}/${initialDate}/${finalDate}`,
    {},
    '',
    '',
    'No se pueden obtener los resultados de esta búsqueda de traslados entrantes por fecha de recepcion',
    'Error desconocido'
  );

transfersServices.outcomingTransfers = (originLocationId) => 
  genRequest(
    `get`,
    `/transfers/outcoming/${originLocationId}`,
    {},
    '',
    '',
    'No se pudieron obtener los traslados salientes de esta sucursal',
    'Error desconocido'
  );

transfersServices.outcomingTransfersBySentAtRange = (originLocationId, initialDate, finalDate) => 
  genRequest(
    `get`,
    `/transfers/outcoming/sent-at/${originLocationId}/${initialDate}/${finalDate}`,
    {},
    '',
    '',
    'No se pueden obtener los resultados de esta búsqueda de traslados salientes por fecha de envio',
    'Error desconocido'
  );

transfersServices.outcomingTransfersByReceivedAtRange = (originLocationId, initialDate, finalDate) => 
  genRequest(
    `get`,
    `/transfers/outcoming/received-at/${originLocationId}/${initialDate}/${finalDate}`,
    {},
    '',
    '',
    'No se pueden obtener los resultados de esta búsqueda de traslados salientes por fecha de recepcion',
    'Error desconocido'
  );

transfersServices.findById = (transferId) => 
  genRequest(`get`, `/transfers/${transferId}`, {});

transfersServices.confirmTransfer = (transferId) => 
  genRequest(`put`, `/transfers/confirm/${transferId}`, {});

transfersServices.confirmTransferDetail = (transferDetailId, quantityToConfirm) => 
  genRequest(`put`, `/transfers/confirm-detail/${transferDetailId}`, { quantityToConfirm });

transfersServices.rejectTransfer = (transferId) => 
  genRequest(`put`, `/transfers/reject/${transferId}`, {});

transfersServices.rejectTransferDetail = (transferDetailId) => 
  genRequest(`put`, `/transfers/reject-detail/${transferDetailId}`, {});

transfersServices.restoreRejectedDetail = (transferRejectedDetailId) => 
  genRequest(`put`, `/transfers/restore-rejected/${transferRejectedDetailId}`, {});

transfersServices.discardRejectedDetail = (transferRejectedDetailId) => 
  genRequest(`put`, `/transfers/discard-rejected/${transferRejectedDetailId}`, {});

export default transfersServices;
