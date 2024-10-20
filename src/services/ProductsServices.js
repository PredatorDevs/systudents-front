import { genRequest } from "./Requests";

const productsServices = {};

productsServices.stocks = {};
productsServices.stocks.adjustments = {};

productsServices.prices = {};

productsServices.packageConfigs = {};

productsServices.find = () =>
  genRequest(`get`, `/products`, {});

productsServices.findDeactivated = () => genRequest(`get`, `/products/deactivated`, {});

productsServices.findByLocationStockData = (locationId) => 
  genRequest(`get`, `/products/by-location-stock-data/${locationId}`, {}, '', '', 'No se pudo obtener la información de los productos', 'Error desconocido');

productsServices.findTaxesByProductId = (productId) => 
  genRequest(`get`, `/products/taxes-data/${productId}`, {}, '', '', 'No se pudo obtener la información de los impuestos de este producto', 'Error desconocido');

productsServices.findByMultipleParams = (locationId, productFilterParam, excludeServices = 0, productDistributionsId = null) => 
  genRequest(
    `get`,
    `/products/by-multiple-params/${locationId}/${String(productFilterParam).replace('/', '%2F')}/${excludeServices}/${productDistributionsId}`,
    {},
    '',
    '',
    'Se ha producido un error al hacer la búsqueda del producto',
    'Error desconocido'
  );

productsServices.findLocationStockCheck = (locationId) => 
  genRequest(
    `get`,
    `/products/location-stock-check/${locationId}`,
    {},
    '',
    '',
    'Se ha producido un error al hacer la búsqueda de las existencias',
    'Error desconocido'
  );

productsServices.checkAvailability = (locationId, productId, quantity) =>
  genRequest(`get`, `/products/check-availability/${locationId}/${productId}/${quantity}`, {}, '', '', '', '');

productsServices.add = (
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
  productTypeId
) => 
  genRequest(
    `post`,
    `/products`,
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
      productTypeId
    },
    'Información general del producto guardada',
    '',
    'No se pudo añadir la información general del producto',
    'Error desconocido'
  );

productsServices.update = (
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
  productTypeId,
  productDistributionsId,
  productId
) => 
  genRequest(
    `put`,
    `/products`,
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
      productTypeId,
      productDistributionsId,
      productId
    }
  );

productsServices.reactivate = (productId) => 
  genRequest(`put`, `/products/reactivate/${productId}`, {}, 'El producto fue habilitado con exito', 'Accion terminada', 'El producto no pudo ser habilitado', 'Accion terminada');

productsServices.remove = (productId) => 
  genRequest(`delete`, `/products/${productId}`, {}, 'El producto fue deshabilitado con exito', 'Accion terminada', 'El producto no pudo ser deshabilitado', 'Accion terminada');

// PRODUCT LOCATION STOCKS

productsServices.stocks.findByProductId = (productId) => 
  genRequest(`get`, `/products/stocks/${productId}`, {}, '', '', 'Información de existencias de producto no obtenida', 'Error desconocido');

productsServices.stocks.updateById = (initialStock, stock, minStockAlert, productStockId) => 
  genRequest(`put`, `/products/stocks`, { initialStock, stock, minStockAlert, productStockId });

productsServices.stocks.adjustments.find = () => 
  genRequest(`get`, `/products/stocks/adjustments`, {}, 'Ajusted de existencias obtenidos', '', 'Información de ajustes de existencias de producto no obtenida', 'Error desconocido');

productsServices.stocks.adjustments.findById = (productStockAdjustmentId) => 
  genRequest(`get`, `/products/stocks/adjustments/${productStockAdjustmentId}`, {}, '', '', 'Información de existencias de producto no obtenida', 'Error desconocido');

productsServices.stocks.adjustments.findDetailByAdjustmentId = (productStockAdjustmentId) => 
  genRequest(`get`, `/products/stocks/adjustments/details/${productStockAdjustmentId}`, {}, '', '', 'Información de existencias de producto no obtenida', 'Error desconocido');

productsServices.stocks.adjustments.add = (comments, authorizedBy) => 
  genRequest(`post`, `/products/stocks/adjustments`, { comments, authorizedBy }, 'Ajuste de Inventario creado', 'Datos generales registrados', 'No se ha podido generar el ajuste de inventario', 'Error desconocido');

productsServices.stocks.adjustments.addDetails = (bulkData) => 
  genRequest(`post`, `/products/stocks/adjustments/details`, { bulkData }, 'Detalles de Ajuste de Inventario creados', 'Las existencias fueron modificadas exitosamente', 'No se ha podido generar el ajuste de inventario', 'Error desconocido');

// PRODUCT PRICES

productsServices.prices.findByProductId = (productId) => 
  genRequest(`get`, `/products/prices/${productId}`, {}, '', '', 'Información de precios de producto no obtenida', 'Error desconocido');

// EXPECTED req.body => prices = [[productId, price, profitRate, profitRateFixed, requireAuthToApply], [...]]
productsServices.prices.add = (bulkData) => 
  genRequest(
    `post`,
    `/products/prices`,
    { bulkData },
    'Los precios fueron añadidos con éxito',
    'Acción terminada',
    'Los precios no fueron añadidos',
    'Error desconocido'
  );

productsServices.prices.update = (price, profitRate, profitRateFixed, requireAuthToApply, productPriceId) => 
  genRequest(`put`, `/products/prices`, { price, profitRate, profitRateFixed, requireAuthToApply, productPriceId });

productsServices.prices.remove = (productPriceId) => 
  genRequest(`delete`, `/products/prices/${productPriceId}`);

productsServices.packageConfigs.findByProductId = (productId) => 
  genRequest(`get`, `/products/package-configs/${productId}`, {}, '', '', 'Información de contenidos de producto no obtenida', 'Error desconocido');

productsServices.packageConfigs.add = (packageTypeId, productId, measurementUnitId, quantity) => 
  genRequest(
    `post`,
    `/products/package-configs`,
    {
      packageTypeId,
      productId,
      measurementUnitId,
      quantity
    },
    'La información de contenidos de producto fue añadida',
    'Acción existosa',
    'La información de contenidos de producto no pudo ser añadida',
    'Error desconocido'
  );

productsServices.packageConfigs.remove = (productPackageConfigId) => 
  genRequest(
    `delete`,
    `/products/package-configs/${productPackageConfigId}`,
    {},
    'La información de contenidos de producto fue removida',
    'Acción existosa',
    'La información de contenidos de producto no pudo ser removida',
    'Error desconocido'
  );

export default productsServices;
