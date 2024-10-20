import { genRequest } from "./Requests";

const authenticateUser = (username, password) => 
  genRequest(`post`, `/auth`, { username, password });

const authMH = () => 
  genRequest(`post`, `/auth/authmh`, {});

const authUserPassword = (password, actionType) => 
  genRequest(`post`, `/auth/authpassword`, { password, actionType }, '', '', 'No se pudo autenticar su clave', 'Por favor intente más tarde');

const authUserPINCode = (PINCode) => 
  genRequest(`post`, `/auth/authuserpincode`, { PINCode }, '', '', 'No se pudo autenticar su PIN', 'Por favor intente más tarde');

const checkToken = () => 
  genRequest(`post`, `/auth/checktoken`, {});

export {
  authMH,
  authenticateUser,
  authUserPINCode,
  authUserPassword,
  checkToken
}