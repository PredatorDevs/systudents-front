import { genRequest } from "./Requests";

const generalsServices = {};

generalsServices.findBanks = () => genRequest(`get`, `/generals/banks`, {}, '', '', 'La informacion de bancos no ha sido obtenida', 'Error desconocido');
generalsServices.findProductDistributions = () => genRequest(`get`, `/generals/product-dist`, {}, '', '', 'La informacion de bancos no ha sido obtenida', 'Error desconocido');
generalsServices.findRawMaterialDistributions = () => genRequest(`get`, `/generals/rawmat-dist`, {}, '', '', 'La informacion de bancos no ha sido obtenida', 'Error desconocido');
generalsServices.findDocumentTypes = () => genRequest(`get`, `/generals/document-types`, {}, '', '', 'Los tipos de documentos no se han obtenido', 'Error desconocido');
generalsServices.findPaymentTypes = () => genRequest(`get`, `/generals/payment-types`, {}, '', '', 'Los tipos de pago no se han obtenido', 'Error desconocido');
generalsServices.findPaymentMethods = () => genRequest(`get`, `/generals/payment-methods`, {}, '', '', 'Los métodos de pago no se han obtenido', 'Error desconocido');
generalsServices.findAccountingAccounts = () => genRequest(`get`, `/generals/acc-accounts`, {}, '', '', 'Las cuentas contables no han podido obtenerse', 'Error desconocido');
generalsServices.findDepartments = () => genRequest(`get`, `/generals/departments`, {}, '', '', 'Los departamentos no se han obtenido', 'Error desconocido');
generalsServices.findCities = () => genRequest(`get`, `/generals/cities`, {}, '', '', 'Las ciudades no se han obtenido', 'Error desconocido');
generalsServices.findTaxes = () => genRequest(`get`, `/generals/taxes`, {}, '', '', 'Los impuestos no se han obtenido', 'Error desconocido');
generalsServices.findPackageTypes = () => genRequest(`get`, `/generals/package-types`, {}, '', '', 'Los tipos de paquetes no se han obtenido', 'Error desconocido');
generalsServices.findRelationships = () => genRequest(`get`, `/generals/relationships`, {}, '', '', 'Los parentescos no se han obtenido', 'Error desconocido');
generalsServices.findProductTypes = () => genRequest(`get`, `/generals/product-types`, {}, '', '', 'Los tipos de productos no se han obtenido', 'Error desconocido');
generalsServices.findRawMaterialTypes = () => genRequest(`get`, `/generals/rawmat-types`, {}, '', '', 'Los tipos de productos no se han obtenido', 'Error desconocido');
generalsServices.findEconomicActivities = () => genRequest(`get`, `/generals/economic-activities`, {}, '', '', 'Las actividades economicas no se han obtenido', 'Error desconocido');
generalsServices.checkUniquenessValue = (table, field, value, updatingId = null) => 
  genRequest(`get`, `/generals/check-uniqueness?table=${table}&field=${field}&value=${String(value).replace('/', '%2F')}&updatingId=${updatingId}`, {}, '', '', 'No se ha realizado la comprobacion', 'Accion terminada');

generalsServices.validatePolicyDocNumber = (docNumber) => genRequest(`post`, `/generals/policy/validate-docnumber`, { docNumber }, '', '', 'No se ha podido verificar el número de póliza', 'Error desconocido')

export default generalsServices;
