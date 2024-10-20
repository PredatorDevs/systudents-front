import { isEmpty, isNumber, isString } from "lodash";
import { customNot } from "./Notifications";

// let emailRegex = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;
// let emailRegex = /^[\w%]+(\.[\w%]+)*@[\w%]+(\.[\w%]+)+$/;
let emailRegex = /^[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?$/;
let phoneRegex = /^\d{8}$|\d{4}-\d{4}$|\d{4} \d{4}$/;
let nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
let nitMHRegex = /^([0-9]{14}|[0-9]{9})$/;
let nrcMHRegex = /^[0-9]{1,8}$/;
let duiRegex = /^\d{8}-\d{1}|[0-9]{9}$/;
let duiMHRegex = /^\d{9}$/;

export const validateBooleanExpression = (expression, messageIfFalse) => {
  if (!(expression))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return expression;
}

export const validateStringData = (value, messageIfFalse) => {
  if (!(isString(value) && !isEmpty(value)))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return isString(value) && !isEmpty(value);
}

export const validateNumberData = (value, messageIfFalse, allowZero = true) => {
  if (!(isNumber(value) && isFinite(value) && (allowZero ? value >= 0 : value > 0)))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return isNumber(value) && isFinite(value) && (allowZero ? value >= 0 : value > 0);
}

export const validateSelectedData = (value, messageIfFalse) => {
  if (!(value !== 0 && value !== null))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return (value !== 0 && value !== null);
}

export const validateArrayData = (value, minLength, messageIfFalse) => {
  if (!(!isEmpty(value) && value.length >= minLength))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return !isEmpty(value) && value.length >= minLength;
}

export const validatePhoneNumber = (value, messageIfFalse) => {
  if (!(phoneRegex.test(value)))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return phoneRegex.test(value);
}

export const validateEmail = (value, messageIfFalse) => {
  if (!(emailRegex.test(value) || value === ''))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return emailRegex.test(value) || value === '';
}

export const validateDui = (value, messageIfFalse) => {
  if (!(duiRegex.test(value)))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return duiRegex.test(value);
}

export const validateNit = (value, messageIfFalse, captionIfFalse) => {
  if (!(nitMHRegex.test(value)) && !duiMHRegex.test(value))
    customNot('warning', messageIfFalse || 'Dato no válido', captionIfFalse || '');

  // if (!duiRegex.test(value)) 
  //   customNot('warning', messageIfFalse || 'Dato no válido', captionIfFalse || '');

  return nitMHRegex.test(value) || duiRegex.test(value);
}

export const validateNrc = (value, messageIfFalse) => {
  if (!(nrcMHRegex.test(value)))
    customNot('warning', messageIfFalse || 'Dato no válido', '');
  return nrcMHRegex.test(value);
}
