import { genRequest } from "./Requests";

const reportsServices = {};

reportsServices.excel = {};

reportsServices.kardexByProduct = (locationId, productId, startDate, endDate) => 
  genRequest(`get`, `/reports/kardex/by-product/${locationId}/${productId}/${startDate}/${endDate}`, {});

reportsServices.getLocationProductsByCategory = (locationId) => 
  genRequest(`get`, `/reports/get-product-by-cat/${locationId}`, {}, '', '', '', '', 'application/pdf', 'blob');

reportsServices.getLocationProductsByBrand = (locationId) => 
genRequest(`get`, `/reports/get-product-by-brand/${locationId}`, {}, '', '', '', '', 'application/pdf', 'blob');

reportsServices.getProfitReportByLocationDateRange = (locationId, startDate, endDate) => 
  genRequest(`get`, `/reports/profit-report/${locationId}/${startDate}/${endDate}`, {}, '', '', '', '');

reportsServices.shiftcutSettlement = (shiftcutId) => 
  genRequest(
    `get`,
    `/reports/shiftcut-settlement/${shiftcutId}`,
    {},
    '',
    '',
    '',
    '',
    'application/pdf',
    'blob'
  );

reportsServices.shiftcutXSettlement = (shiftcutId) => 
  genRequest(
    `get`,
    `/reports/shiftcut-settlement-x/${shiftcutId}`,
    {},
    '',
    '',
    '',
    '',
    'application/pdf',
    'blob'
  );

reportsServices.shiftcutZSettlement = (shiftcutDay, initShiftcutId, finalShiftcutId) => 
  genRequest(
    `get`,
    `/reports/shiftcut-settlement-z/${shiftcutDay}/${initShiftcutId}/${finalShiftcutId}`,
    {},
    '',
    '',
    '',
    '',
    'application/pdf',
    'blob'
  );

reportsServices.getMainDashboardData = (startDate, endDate) => 
  genRequest(`get`, `/reports/main-dashboard/${startDate}/${endDate}`, {});

reportsServices.getLocationProductsByFilteredData = (filteredData) => 
  genRequest(`post`, `/reports/get-product-by-filtered-data`, { productsData: filteredData }, '', '', '', '', 'application/json', 'blob');

reportsServices.getCashierLocationSalesByMonth = (locationId, cashierId, documentTypeId, month) => 
  genRequest(`get`, `/reports/cashier-location-sales-by-month/${locationId}/${cashierId}/${documentTypeId}/${month}`, {});

reportsServices.getMonthlyFinalConsumerSaleBook = (locationId, month) => 
  genRequest(`get`, `/reports/location-final-consumer-sale-book/${locationId}/${month}`, {});

reportsServices.getDteMonthlyFinalConsumerSaleBook = (locationId, month) => 
  genRequest(`get`, `/reports/location-dte-final-consumer-sale-book/${locationId}/${month}`, {});

reportsServices.getMonthlyTaxPayerSaleBook = (locationId, month) => 
  genRequest(`get`, `/reports/location-tax-payer-sale-book/${locationId}/${month}`, {});

reportsServices.getDteMonthlyTaxPayerSaleBook = (locationId, month) => 
  genRequest(`get`, `/reports/location-dte-tax-payer-sale-book/${locationId}/${month}`, {});

reportsServices.getMonthlyPurchasesBook = (locationId, month) => 
  genRequest(`get`, `/reports/location-purchase-book/${locationId}/${month}`, {});

reportsServices.getMonthlyFinalConsumerSaleBookPDF = (locationId, month) => 
  genRequest(`get`, `/reports/location-final-consumer-sale-book-pdf/${locationId}/${month}`, {}, '', '', 'No se pudo descargar el Libro de Ventas', 'Error desconocido', 'application/json', 'blob');

reportsServices.getMonthlyTaxPayerSaleBookPDF = (locationId, month) => 
  genRequest(`get`, `/reports/location-tax-payer-sale-book-pdf/${locationId}/${month}`, {}, '', '', 'No se pudo descargar el Libro de Ventas', 'Error desconocido', 'application/json', 'blob');

reportsServices.getMonthlyPurchaseBookPDF = (locationId, month) => 
  genRequest(`get`, `/reports/location-purchase-book-pdf/${locationId}/${month}`, {}, '', '', 'No se pudo descargar el Libro de Compras', 'Error desconocido', 'application/json', 'blob');

reportsServices.getTransferSheet = (transferId) => 
  genRequest(`get`, `/reports/transfer-sheet/${transferId}`, {}, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido', 'application/json', 'blob');

reportsServices.getLowStockByLocation = (locationId) => 
  genRequest(`get`, `/reports/low-stock-report/${locationId}`, {}, '', '', 'No se ha podido descargar el reporte de existencias bajas', 'Error desconocido', 'application/json', 'blob');

reportsServices.getGeneralInventory = () => 
  genRequest(`get`, `/reports/general-inventory`, {}, '', '', 'No se ha podido descargar el reporte de existencias', 'Error desconocido', 'application/pdf', 'blob');

reportsServices.getGeneralInventoryStock = () => 
  genRequest(`get`, `/reports/general-inventory-stock`, {}, '', '', 'No se ha podido descargar el reporte de existencias', 'Error desconocido', 'application/pdf', 'blob');

reportsServices.calculatedKardexByProduct = (locationId, productId, startDate, endDate) => 
  genRequest(`get`, `/reports/kardex-calculated/by-product/${locationId}/${productId}/${startDate}/${endDate}`, {});

reportsServices.excel.getLowStockByLocation = (locationId) => 
  genRequest(`get`, `/reports/excel/low-stock-report/${locationId}`, {}, '', '', 'No se ha podido descargar el reporte de existencias bajas', 'Error desconocido', 'application/vnd.ms-excel', 'blob');

reportsServices.excel.getProfitReportByLocationDateRange = (locationId, startDate, endDate) => 
  genRequest(`get`, `/reports/excel/profit-report/${locationId}/${startDate}/${endDate}`, {}, '', '', 'No se ha podido descargar el reporte de utilidades', 'Error desconocido', 'application/vnd.ms-excel', 'blob');

reportsServices.excel.getPendingSales = () => 
  genRequest(`get`, `/reports/excel/pending-sales`, {}, '', '', 'No se ha podido descargar el reporte de saldos pendientes', 'Error desconocido', 'application/vnd.ms-excel', 'blob');

reportsServices.excel.getPendingProductPurchases = () => 
  genRequest(`get`, `/reports/excel/pending-productpurchases`, {}, '', '', 'No se ha podido descargar el reporte de saldos pendientes', 'Error desconocido', 'application/vnd.ms-excel', 'blob');

export default reportsServices;
