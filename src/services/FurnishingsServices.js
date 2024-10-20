import { genRequest } from "./Requests";

const furnishingsServices = {};

furnishingsServices.stocks = {};

furnishingsServices.find = () => genRequest(`get`, `/furnishings`, {});
furnishingsServices.findByLocationStockData = (locationId) => genRequest(`get`, `/furnishings/by-location-stock-data/${locationId}`, {});

furnishingsServices.findCurrentStock = () => genRequest(`get`, `/furnishings/current-stock`, {});

furnishingsServices.add = (name, cost) => 
  genRequest(`post`, `/furnishings`, { name, cost });

furnishingsServices.update = (name, cost, furnishingId) => 
  genRequest(`put`, `/furnishings`, { name, cost, furnishingId });

furnishingsServices.remove = (furnishingId) => 
  genRequest(`delete`, `/furnishings/${furnishingId}`);

// PRODUCT LOCATION STOCKS

furnishingsServices.stocks.findByFurnishingId = (furnishingId) => 
  genRequest(`get`, `/furnishings/stocks/${furnishingId}`, {});

furnishingsServices.stocks.updateById = (initialStock, stock, furnishingstockId) => 
  genRequest(`put`, `/furnishings/stocks`, { initialStock, stock, furnishingstockId });

  
export default furnishingsServices;
