import { genRequest } from "./Requests";

const dteServices = {};

dteServices.check = (saleId) => 
  genRequest(`get`, `/dte/check/${saleId}`, {}, '', '', '', '');

dteServices.signCF = (saleId) => 
  genRequest(`get`, `/dte/sign/cf/${saleId}`, {}, 'DTE Transmitio Exitosamente', 'Acción terminada', 'DTE no ha sido transmitido', '-');

dteServices.signCCF = (saleId) => 
  genRequest(`get`, `/dte/sign/ccf/${saleId}`, {}, 'DTE Transmitio Exitosamente', 'Acción terminada', 'DTE no ha sido transmitido', '-');

dteServices.voidCF = (saleId, authBy) => 
  genRequest(`delete`, `/dte/void/cf/${saleId}/${authBy}`, {}, 'DTE Invalidado Exitosamente', 'Acción terminada', 'DTE no ha sido invalidado completamente', '-');

dteServices.voidCCF = (saleId, authBy) => 
  genRequest(`delete`, `/dte/void/ccf/${saleId}/${authBy}`, {}, 'DTE Invalidado Exitosamente', 'Acción terminada', 'DTE no ha sido invalidado completamente', '-');

dteServices.getCFPDF = (saleId) => 
  genRequest(`get`, `/dte/pdf/cf/download/${saleId}`, {}, '', '', 'No se ha podido descargar PDF de este DTE', 'Error desconocido', 'application/pdf', 'blob');

dteServices.getCCFPDF = (saleId) => 
  genRequest(`get`, `/dte/pdf/ccf/download/${saleId}`, {}, '', '', 'No se ha podido descargar PDF de este DTE', 'Error desconocido', 'application/pdf', 'blob');

dteServices.sendEmailCF = (saleId) => 
  genRequest(`get`, `/dte/sendmail/cf/${saleId}`, {}, 'DTE enviado al email registrado del cliente', '', 'No se ha podido enviar el email con el DTE', 'Error desconocido', 'application/json');

dteServices.sendEmailCCF = (saleId) => 
  genRequest(`get`, `/dte/sendmail/ccf/${saleId}`, {}, 'DTE enviado al email registrado del cliente', '', 'No se ha podido enviar el email con el DTE', 'Error desconocido', 'application/json');

export default dteServices;
