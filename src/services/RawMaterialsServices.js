import { genRequest } from "./Requests";

const rawMaterialsServices = {};

rawMaterialsServices.stocks = {};
rawMaterialsServices.stocks.adjustments = {};

rawMaterialsServices.find = () =>
  genRequest(`get`, `/rawmaterials`, {});

rawMaterialsServices.findDeactivated = () => genRequest(`get`, `/rawmaterials/deactivated`, {});

rawMaterialsServices.findByLocationStockData = (locationId) => 
  genRequest(`get`, `/rawmaterials/by-location-stock-data/${locationId}`, {}, '', '', 'No se pudo obtener la información de los materia primas', 'Error desconocido');

rawMaterialsServices.findTaxesByRawMaterialId = (rawMaterialId) => 
  genRequest(`get`, `/rawmaterials/taxes-data/${rawMaterialId}`, {}, '', '', 'No se pudo obtener la información de los impuestos de este materia prima', 'Error desconocido');

rawMaterialsServices.findByMultipleParams = (locationId, rawMaterialFilterParam, excludeServices = 0, rawMaterialDistributionsId = null) => 
  genRequest(
    `get`,
    `/rawmaterials/by-multiple-params/${locationId}/${String(rawMaterialFilterParam).replace('/', '%2F')}/${excludeServices}/${rawMaterialDistributionsId}`,
    {},
    '',
    '',
    'Se ha producido un error al hacer la búsqueda del materia prima',
    'Error desconocido'
  );

rawMaterialsServices.findLocationStockCheck = (locationId) => 
  genRequest(
    `get`,
    `/rawmaterials/location-stock-check/${locationId}`,
    {},
    '',
    '',
    'Se ha producido un error al hacer la búsqueda de las existencias',
    'Error desconocido'
  );

rawMaterialsServices.checkAvailability = (locationId, rawMaterialId, quantity) =>
  genRequest(`get`, `/rawmaterials/check-availability/${locationId}/${rawMaterialId}/${quantity}`, {}, '', '', '', '');

rawMaterialsServices.add = (
  code,
  name,
  brandId,
  categoryId,
  ubicationId,
  measurementUnitId,
  barcode,
  cost,
  isService,
  isTaxable,
  enabledForProduction,
  packageContent,
  rawMaterialTypeId
) => 
  genRequest(
    `post`,
    `/rawmaterials`,
    {
      code,
      name,
      brandId,
      categoryId,
      ubicationId,
      measurementUnitId,
      barcode,
      cost,
      isService,
      isTaxable,
      enabledForProduction,
      packageContent,
      rawMaterialTypeId
    },
    'Información general del materia prima guardada',
    '',
    'No se pudo añadir la información general del materia prima',
    'Error desconocido'
  );

rawMaterialsServices.update = (
  code,
  name,
  brandId,
  categoryId,
  ubicationId,
  measurementUnitId,
  barcode,
  cost,
  isService,
  isTaxable,
  enabledForProduction,
  packageContent,
  rawMaterialTypeId,
  rawMaterialDistributionsId,
  rawMaterialId
) => 
  genRequest(
    `put`,
    `/rawmaterials`,
    {
      code,
      name,
      brandId,
      categoryId,
      ubicationId,
      measurementUnitId,
      barcode,
      cost,
      isService,
      isTaxable,
      enabledForProduction,
      packageContent,
      rawMaterialTypeId,
      rawMaterialDistributionsId,
      rawMaterialId
    }
  );

rawMaterialsServices.reactivate = (rawMaterialId) => 
  genRequest(`put`, `/rawmaterials/reactivate/${rawMaterialId}`, {}, 'El materia prima fue habilitado con exito', 'Accion terminada', 'El materia prima no pudo ser habilitado', 'Accion terminada');

rawMaterialsServices.remove = (rawMaterialId) => 
  genRequest(`delete`, `/rawmaterials/${rawMaterialId}`, {}, 'El materia prima fue deshabilitado con exito', 'Accion terminada', 'El materia prima no pudo ser deshabilitado', 'Accion terminada');

// PRODUCT LOCATION STOCKS

rawMaterialsServices.stocks.findByRawMaterialId = (rawMaterialId) => 
  genRequest(`get`, `/rawmaterials/stocks/${rawMaterialId}`, {}, '', '', 'Información de existencias de materia prima no obtenida', 'Error desconocido');

rawMaterialsServices.stocks.updateById = (initialStock, stock, minStockAlert, rawMaterialStockId) => 
  genRequest(`put`, `/rawmaterials/stocks`, { initialStock, stock, minStockAlert, rawMaterialStockId });

rawMaterialsServices.stocks.adjustments.find = () => 
  genRequest(`get`, `/rawmaterials/stocks/adjustments`, {}, 'Ajusted de existencias obtenidos', '', 'Información de ajustes de existencias de materia prima no obtenida', 'Error desconocido');

rawMaterialsServices.stocks.adjustments.findById = (rawMaterialStockAdjustmentId) => 
  genRequest(`get`, `/rawmaterials/stocks/adjustments/${rawMaterialStockAdjustmentId}`, {}, '', '', 'Información de existencias de materia prima no obtenida', 'Error desconocido');

rawMaterialsServices.stocks.adjustments.findDetailByAdjustmentId = (rawMaterialStockAdjustmentId) => 
  genRequest(`get`, `/rawmaterials/stocks/adjustments/details/${rawMaterialStockAdjustmentId}`, {}, '', '', 'Información de existencias de materia prima no obtenida', 'Error desconocido');

rawMaterialsServices.stocks.adjustments.add = (comments, authorizedBy) => 
  genRequest(`post`, `/rawmaterials/stocks/adjustments`, { comments, authorizedBy }, 'Ajuste de Inventario creado', 'Datos generales registrados', 'No se ha podido generar el ajuste de inventario', 'Error desconocido');

rawMaterialsServices.stocks.adjustments.addDetails = (bulkData) => 
  genRequest(`post`, `/rawmaterials/stocks/adjustments/details`, { bulkData }, 'Detalles de Ajuste de Inventario creados', 'Las existencias fueron modificadas exitosamente', 'No se ha podido generar el ajuste de inventario', 'Error desconocido');

export default rawMaterialsServices;
