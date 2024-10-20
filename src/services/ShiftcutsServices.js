import { genRequest } from "./Requests";

const shiftcutsService = {};

shiftcutsService.find = () => genRequest(`get`, `/shiftcuts`, {});
shiftcutsService.findById = (shiftcutId) => genRequest(`get`, `/shiftcuts/${shiftcutId}`, {});
shiftcutsService.settlements = () => genRequest(`get`, `/shiftcuts/settlements`, {});
shiftcutsService.settlementsById = (shiftcutId) => genRequest(`get`, `/shiftcuts/settlements/${shiftcutId}`, {});
shiftcutsService.settlementsByLocation = (locationId) => genRequest(`get`, `/shiftcuts/settlements/by-location/${locationId}`, {});
shiftcutsService.settlementsByLocationCashierDate = (locationId, cashierId, dateFilter) =>
  genRequest(`get`, `/shiftcuts/settlements/by-location-cashier-date/${locationId}/${cashierId}/${dateFilter}`, {});

shiftcutsService.settlementsByLocationCashierMonthDate = (locationId, cashierId, monthDateFilter) =>
  genRequest(`get`, `/shiftcuts/settlements/by-location-cashier-monthdate/${locationId}/${cashierId}/${monthDateFilter}`, {});

shiftcutsService.settlementsOrderSaleById = (shiftcutId) => genRequest(`get`, `/shiftcuts/settlements/order-sales/${shiftcutId}`, {});

export default shiftcutsService;
