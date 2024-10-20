import { genRequest } from "./Requests";

const contractsServices = {};

contractsServices.find = () =>
  genRequest(
    `get`,
    `/contracts`,
    {},
    '',
    '',
    'La información de los contratos no pudo ser obtenida',
    'Error desconocido'
  );

contractsServices.findById = (contractId) =>
  genRequest(
    `get`,
    `/contracts/${contractId}`,
    {},
    '',
    '',
    'La información de los contratos no pudo ser obtenida',
    'Error desconocido'
  );

contractsServices.changeStatus = (contractId, newStatus) =>
  genRequest(
    `post`,
    `/contracts/change-status/${contractId}/${newStatus}`,
    {},
    '',
    '',
    'No se pudo actualizar el estado del contrato',
    'Error desconocido'
  );

contractsServices.add = (
  locationId,
  customerId,
  status,
  contractDatetime,
  total,
  downPayment,
  numberOfPayments,
  comments
) => 
  genRequest(
    `post`,
    `/contracts`,
    {
      locationId,
      customerId,
      status,
      contractDatetime,
      total,
      downPayment,
      numberOfPayments,
      comments
    },
    'El contrato fue creado exitosamente',
    'Operación terminada',
    'La información de los contratos no pudo ser obtenida',
    'Error desconocido'
  );

contractsServices.details = {};

// EXPECTED req.body => details = [[ contractId, productId, unitPrice, unitCost, isActive, isVoided, createdBy, updatedBy ], [...]]
contractsServices.details.add = (bulkData) => 
  genRequest(
    `post`,
    `/contracts/details/add-many`,
    { bulkData },
    'Detalle de contrato guardados',
    '',
    'El detalle de contrato no fue añadido', 'Error desconocido'
  );

contractsServices.beneficiaries = {};

// EXPECTED req.body => details = [[ contractId, relationshipId, fullname, age, gender, address, createdBy, updatedBy ], [...]]
contractsServices.beneficiaries.add = (bulkData) => 
  genRequest(
    `post`,
    `/contracts/beneficiaries/add-many`,
    { bulkData },
    'Detalle de beneficiarios de contrato guardados',
    '',
    'El detalle de beneficiarios de contrato no fue añadido', 'Error desconocido'
  );


export default contractsServices;
