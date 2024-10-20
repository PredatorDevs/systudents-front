import React, { useEffect, useState, useRef } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Col,
  DatePicker,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  Modal,
  Space,
  Tag,
  Result,
  Radio,
  Alert,
  Drawer
} from 'antd';
import { customNot } from '../../utils/Notifications';

import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import { filter, find, forEach, isEmpty } from 'lodash';
import { columnActionsDef, columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import { DeleteOutlined, DollarCircleOutlined, InfoCircleTwoTone, SaveOutlined } from '@ant-design/icons';
import customersServices from '../../services/CustomersServices';
import CustomerForm from '../../components/forms/CustomerForm';
import { getUserLocation, getUserMyCashier } from '../../utils/LocalData';
import SaleTicket from '../../components/tickets/SaleTicket';
import ReactToPrint from 'react-to-print';
import ConsumidorFinal from '../../components/invoices/ConsumidorFinal';
import generalsServices from '../../services/GeneralsServices';
import CFFInvoice from '../../components/invoices/CFFInvoice';
import { numberToLetters } from '../../utils/NumberToLetters';
import { printerServices } from '../../services/PrintersServices';
import {
  GAddFileIcon,
  GAddUserIcon,
  GCardMethodIcon,
  GCashMethodIcon,
  GCashPaymentIcon,
  GClearIcon,
  GCreditNoteIcon,
  GCreditPaymentIcon,
  GDebitNoteIcon,
  GDispatchIcon,
  GEditUserIcon,
  GInvoice2Icon,
  GInvoiceTax2Icon,
  GPaymentCheckMethodIcon,
  GRefreshIcon,
  GSearchForIcon,
  GTicketIcon,
  GTransferMethodIcon
} from '../../utils/IconImageProvider';
import { filterData } from '../../utils/Filters';
import ProductSearchForSale from '../../components/ProductSearchForSale';
import cashiersServices from '../../services/CashiersServices';
import LocationStockCheckPreview from '../../components/previews/LocationStockCheckPreview';
import AuthorizeUserPINCode from '../../components/confirmations/AuthorizeUserPINCode';
import NewSaleCashExchange from '../../components/confirmations/NewSaleCashExchange';
import { RequiredQuestionMark } from '../../components/RequiredQuestionMark';
import { validateSelectedData, validateStringData } from '../../utils/ValidateData';
import AuthorizeAction from '../../components/confirmations/AuthorizeAction';
import orderSalesServices from '../../services/OrderSalesServices';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const styleSheet = {
  tableFooter: {
    footerCotainer: {
      backgroundColor: '#d9d9d9',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      padding: 5,
      width: '100%',
      height: '100%'
    },
    detailContainer: {
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderRadius: '5px',
      marginBottom: '5px',
      padding: 5,
      width: '100%'
    },
    detailLabels: {
      normal: {
        margin: 0,
        fontSize: 12,
        color: '#434343'
      },
      emphatized: {
        margin: 0,
        fontSize: 12,
        color: '#434343',
        fontWeight: 600
      }
    }
  }
};

function NewOrderSale() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const ticketComponentRef = useRef();
  const cfComponentRef = useRef();
  const ccfComponentRef = useRef();

  const [fetching, setFetching] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openStockPreview, setOpenStockPreview] = useState(false);
  const [openAuthUserPINCode, setOpenAuthUserPINCode] = useState(false);
  const [openAuthCreditLimitReached, setOpenAuthCreditLimitReached] = useState(false);
  const [openCashExchangeForm, setOpenCashExchangeForm] = useState(false);
  const [openPaymentAdditionalInfoDrawer, setOpenPaymentAdditionalInfoDrawer] = useState(false);
  const [cashAmountToExchange, setCashAmountToExchange] = useState(null);

  const [ableToProcess, setIsAbleToProcess] = useState(false);

  const [docSerie, setDocSerie] = useState(null);

  const [customerSearchFilter, setCustomerSearchFilter] = useState('');
  const [productSearchFilter, setProductSearchFilter] = useState('');

  const [openCusomterSelector, setOpenCusomterSelector] = useState(false);
  const [openProductSearchForSale, setOpenProductSearchForSale] = useState(false);
  
  const [printData, setPrintData] = useState([]);
  const [printDataDetails, setPrintDataDetails] = useState([]);

  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [paymentTypesData, setPaymentTypesData] = useState([]);
  const [taxesData, setTaxesData] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [banksData, setBanksData] = useState([]);

  const [customersData, setCustomersData] = useState([]);

  const [customerSelected, setCustomerSelected] = useState(0);
  const [customerUpdateMode, setCustomerUpdateMode] = useState(false);
  const [customerToUpdate, setCustomerToUpdate] = useState({});
  const [customerCreditLimit, setCustomerCreditLimit] = useState(null);
  const [customerPendingToPay, setCustomerPendingToPay] = useState(null);
  const [validDocNumberAndSerie, setValidDocNumberAndSerie] = useState(true);
  
  const [documentTypeSelected, setDocumentTypeSelected] = useState(2);
  const [paymentTypeSelected, setPaymentTypeSelected] = useState(0);

  const [paymentMethodSelected, setPaymentMethodSelected] = useState(0);
  
  const [docDatetime, setDocDatetime] = useState(defaultDate());
  const [docNumber, setDocNumber] = useState('');
  const [docType, setDocType] = useState(1);
  const [docDetails, setDocDetails] = useState([]);
  
  const [docIVAretention, setDocIVAretention] = useState(null);
  const [docIVAperception, setDocIVAperception] = useState(null);
  
  const [docExpirationDays, setDocExpirationDays] = useState(8);

  // PAYMENT METHOD EXTRA INFO STATES
  const [bankSelected, setBankSelected] = useState(0);
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');

  function restoreState() {
    setFetching(false);
    setOpenForm(false);
    setOpenStockPreview(false);
    setCustomerSearchFilter('');
    setProductSearchFilter('');
    setOpenCusomterSelector(false);
    setOpenProductSearchForSale(false);
    setPrintData([]);
    setPrintDataDetails([]);
    setCustomerSelected(0);
    setCustomerUpdateMode(false);
    setCustomerToUpdate({});
    setValidDocNumberAndSerie(false);
    setDocumentTypeSelected(2);
    setPaymentTypeSelected(0);
    setPaymentMethodSelected(0);
    setDocDatetime(defaultDate());
    setDocNumber('');
    setDocType(1);
    setDocDetails([]);
    setDocIVAperception(null);
    setDocIVAretention(null);
    setDocExpirationDays(8);

    setBankSelected(0);
    setPaymentReferenceNumber('');
    setPaymentAccountNumber('');

    setOpenAuthCreditLimitReached(false);
    setCustomerCreditLimit(null);
    setCustomerPendingToPay(null);
  }

  async function checkIfAbleToProcess() {
    setFetching(true);

    const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());

    const { isOpen, currentShiftcutId } = response.data[0];

    if (isOpen === 1 && currentShiftcutId !== null) {
      setIsAbleToProcess(true);
    }

    setFetching(false);
  }

  async function loadDocumentInformation(docTypeId) {
    try {
      setFetching(true);

      const response = await cashiersServices.getDocumentInformation(getUserMyCashier(), docTypeId);
      const { documentCorrelative, documentSerie } = response.data[0];

      setDocNumber(String(documentCorrelative));
      setDocSerie(documentSerie);

      const valRes = await orderSalesServices.validateDocNumber(
        docTypeId,
        documentCorrelative || '',
        getUserMyCashier()
      );

      const { validated } = valRes.data[0];
      
      setValidDocNumberAndSerie(validated === 0 ? false : true);

      if (validated === 0)
        customNot('warning', 'Correlativo ya registrado', 'El correlativo especificado ya pertenece a un documento');
      else
        customNot('success', 'Correlativo disponible', '');
      setFetching(false);
    } catch(error) {
      console.log(error);
      setFetching(false);
    }
  }

  async function loadData() {
    setFetching(true);

    const documentTypesResponse = await generalsServices.findDocumentTypes();
    const paymentTypesResponse = await generalsServices.findPaymentTypes();
    const taxesResponse = await generalsServices.findTaxes();
    const customersResponse = await customersServices.findByLocation(getUserLocation());
    const payMetRes = await generalsServices.findPaymentMethods();
    const banksRes = await generalsServices.findBanks();
    
    setDocumentTypesData(documentTypesResponse.data);
    setPaymentTypesData(paymentTypesResponse.data);
    setTaxesData(taxesResponse.data);
    setCustomersData(customersResponse.data);
    setPaymentMethodsData(payMetRes.data);
    setBanksData(banksRes.data);

    setFetching(false);
  }

  function getQuantitySumProductDetail(productId) {
    let sum = 0;
    forEach(docDetails, (x, index) => {
      sum += x.detailId === productId ? x.detailQuantity : 0;
    });
    return sum;
  }

  useEffect(() => {
    checkIfAbleToProcess();
    loadData();
  }, []);

  function defaultDate() {
    return moment();
  };

  function isValidDetail(element) {
    return (element.detailQuantity > 0) && (element.detailUnitPrice >= 0);
  }

  function validateData() {
    const validDocDatetime = docDatetime !== null && docDatetime.isValid();
    // const validDocNumber = !isEmpty(docNumber);
    const validCustomerSelected = customerSelected !== 0 && customerSelected !== null;
    const validDocumentType = documentTypeSelected !== 0 && !!documentTypeSelected;

    const validDetailQuantityLimit = (docDetails.length <= 18);

    if (!validDetailQuantityLimit) {
      customNot('warning', 'Limite de detalles de venta alcanzado', 'Actualmente el sistema solo permite dieciocho o menos detalles por venta');
      return;
    }

    // if (documentTypeSelected === 3 && getDetailTotal() < 5) {
    //   customNot('warning', 'Créditos Fiscales deben ser facturados con más de $5.00', 'Debe añadir más venta');
    //   return;
    // }

    // if (paymentTypeSelected === 2 && (docExpirationDays <= 0 || docExpirationDays === null)) {
    //   customNot('warning', 'Sus ventas al crédito deben tener definidos los días de vencimiento', 'Coloque un valor a días de vencimiento');
    //   return;
    // }

    // if (paymentTypeSelected === 3 && (docExpirationDays <= 0 || docExpirationDays === null)) {
    //   customNot('warning', 'Sus ventas en ruta deben tener definidos los días de vencimiento', 'Coloque un valor a días de vencimiento');
    //   return;
    // }

    // if (paymentTypeSelected === 1 && (paymentMethodSelected === 0 || paymentMethodSelected === null)) {
    //   customNot('warning', 'Sus ventas de contado deben tener definido un método de pago', 'Seleccione un método de pago');
    //   return;
    // }
    
    const validPaymentType = paymentTypeSelected !== 0 && !!paymentTypeSelected;
    const validDocDetails = !isEmpty(docDetails);
    const validDocDetailsIntegrity = docDetails.every(isValidDetail);
    if (!validDocDatetime) customNot('warning', 'Debe seleccionar una fecha válida', 'Dato no válido');
    // if (!validDocNumber) customNot('warning', 'Debe colocar un número de documento', 'Dato no válido');
    if (!validCustomerSelected) customNot('warning', 'Debe seleccionar un cliente', 'Dato no válido');
    if (!validDocumentType) customNot('warning', 'Seleccione un tipo de documento', 'Dato no válido');
    if (!validPaymentType) customNot('warning', 'Seleccione un tipo de pago', 'Dato no válido');
    if (!validDocDetails) customNot('warning', 'Debe añadir por lo menos un detalle a la compra', 'Dato no válido');
    // if (!validDocNumberAndSerie) customNot('warning', 'Correlativo ya registrado', 'El correlativo especificado ya pertenece a un documento de la serie actual');
    if (!validDocDetailsIntegrity) customNot('warning', 'Los datos en el detalle no son admitidos', 'Dato no válido');
    return (
      // validDocNumber
      // && validDocDatetime
      validCustomerSelected 
      && validDocumentType
      && validPaymentType 
      && validDocDetails
      && validDocDetailsIntegrity 
      // && validDocNumberAndSerie
    );
  }

  async function createNewOrderSale(userPINCode) {
    setFetching(true);
    try {
      // START THE PROCESS OF SAVE THE SALE
      const orderSaleResponse = await orderSalesServices.add(
        getUserLocation() || 1,
        customerSelected,
        docDatetime.format('YYYY-MM-DD HH:mm:ss'),
        documentTypeSelected,
        paymentTypeSelected,
        Number(getDetailTotal().toFixed(2)) || 0.00, // TOTAL
        userPINCode
      );
      
      const { insertId } = orderSaleResponse.data[0];
    
      const bulkData = docDetails.map((element) => ([ insertId, element.detailId, element.detailUnitPrice, element.detailQuantity ]));

      const saleDetailResponse = await orderSalesServices.details.add(bulkData);
      // const saleResultResponse = await orderSalesServices.findById(insertId);
      // const saleDetailResultResponse = await orderSalesServices.details.findBySaleId(insertId);

      // setPrintData(saleResultResponse.data);
      // setPrintDataDetails(saleDetailResultResponse.data);

      // if (paymentTypeSelected === 1) {
      //   setCashAmountToExchange(Number(getDetailTotal().toFixed(2)) || 0.00);
      //   setOpenCashExchangeForm(true);
      // }

      // if (paymentTypeSelected === 3) {
      //   confirm({
      //     centered: true,
      //     title: 'Recuerde hacer el cobro de $2.50',
      //     icon: <InfoCircleTwoTone />,
      //     content: 'Esta venta fue marcada como En Ruta',
      //     okType: 'danger',
      //     okText: 'Entendido',
      //     onOk() {}
      //   });
      // }
      
      // let printingResponse;

      // if (documentTypeSelected === 2) {
      //   customNot('info', '', 'Imprimiendo Factura');
      //   printingResponse = await printerServices.printCF(
      //     {
      //       customerFullname: `${saleResultResponse.data[0].customerFullname || '-'}`,
      //       documentDatetime: `${moment(isEmpty(saleResultResponse.data[0]) ? '1999-01-01' : saleResultResponse.data[0].docDatetime).format('L') || '-'}`,
      //       customerAddress: `${saleResultResponse.data[0].customerAddress || '-'}`,
      //       customerDui: `${saleResultResponse.data[0].customerDui || null}`,
      //       customerNit: `${saleResultResponse.data[0].customerNit || null}`,
      //       customerPhone: `${saleResultResponse.data[0].customerPhone || null}`,
      //       paymentTypeName: `${saleResultResponse.data[0].paymentTypeName || '-'}`,
      //       totalSale: saleResultResponse.data[0].total || 0,
      //       totalToLetters: `${numberToLetters(saleResultResponse.data[0].total)}`
      //     },
      //     saleDetailResultResponse.data
      //   );
      // }

      // if (documentTypeSelected === 3) {
      //   customNot('info', '', 'Imprimiendo Comprobante de Crédito Fiscal');
      //   printingResponse = await printerServices.printCCF(
      //     {
      //       customerFullname: `${saleResultResponse.data[0].customerFullname || '-'}`,
      //       documentDatetime: `${moment(isEmpty(saleResultResponse.data[0]) ? '1999-01-01' : saleResultResponse.data[0].docDatetime).format('L') || '-'}`,
      //       customerAddress: `${saleResultResponse.data[0].customerAddress || '-'}`,
      //       customerState: `${'' || '-'}`,
      //       customerNit: `${saleResultResponse.data[0].customerNit || null}`,
      //       customerNrc: `${saleResultResponse.data[0].customerNrc || null}`,
      //       customerBusinessType: `${saleResultResponse.data[0].customerBusinessLine || '-'}`,
      //       customerDepartmentName: `${saleResultResponse.data[0].customerDepartmentName || '-'}`,
      //       paymentTypeName: `${saleResultResponse.data[0].paymentTypeName || '-'}`,
      //       taxableSale: saleResultResponse.data[0].totalTaxable || 0,
      //       taxableSaleWithoutTaxes: saleResultResponse.data[0].taxableSubTotalWithoutTaxes || 0,
      //       noTaxableSale: saleResultResponse.data[0].totalNoTaxable || 0,
      //       totalTaxes: saleResultResponse.data[0].totalTaxes || 0,
      //       totalSale: saleResultResponse.data[0].total || 0,
      //       totalToLetters: `${numberToLetters(saleResultResponse.data[0].total)}`
      //     },
      //     saleDetailResultResponse.data
      //   );
      // }

      restoreState();

      loadData();

      window.scrollTo(0, 0);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function formAction() {
    // Si todos los datos de venta están correctos pasa a lo siguiente
    if (validateData()) {
      // Si el monto total de la venta mas lo adeudado por el cliente excede el limite otorgado pide autorizacion
      // if (customerReachCreditLimit()) {
        // setOpenAuthCreditLimitReached(true);
      // } else {
        setOpenAuthUserPINCode(true);
      // }
    }
  }

  async function validateDocNumber() {
    setFetching(true);
    if (isEmpty(docNumber)) {
      setFetching(false);
    } else {
      const response = await orderSalesServices.validateDocNumber(
        documentTypeSelected,
        docNumber || '',
        getUserMyCashier()
      );

      const { validated } = response.data[0];
      
      setValidDocNumberAndSerie(validated === 0 ? false : true);

      if (validated === 0)
        customNot('warning', 'Correlativo ya registrado', 'El correlativo especificado ya pertenece a un documento');
      else
        customNot('success', 'Correlativo disponible', '');
      setFetching(false);
    }
  }

  function pushDetail(data) {
    const newDetails = [ ...docDetails, data ];

    setDocDetails(newDetails);
  }

  function getDetailTaxableTotal() {
    let total = 0;
    forEach(docDetails, (value) => {
      if (value.detailIsTaxable === 1)
        total += (value.detailQuantity * value.detailUnitPrice);
    });
    return total || 0;
  }

  function getDetailNoTaxableTotal() {
    let total = 0;
    forEach(docDetails, (value) => {
      if (value.detailIsTaxable === 0)
        total += (value.detailQuantity * value.detailUnitPrice);
    });
    return total || 0;
  }

  function getDetailTotalTaxes() {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(docDetails, (docdetail) => {
      // EVALUA SI EL DETALLE APLICA A IMPUESTOS
      if (docdetail.detailIsTaxable === 1) {
        // UN FOREACH PARA RECORRER LOS TAXES CONFIGURADOS EN ESE DETALLE
        forEach(docdetail.detailTaxesData, (detailtax) => {
          // BUSCA EL TAX ENTRE LA INFORMACIÓN DE LOS TAXES
          const targetTax = find(taxesData, (x) => x.id === detailtax.taxId);
          
          if (targetTax.isPercentage === 1) {
            totalTaxes += (((docdetail.detailQuantity * docdetail.detailUnitPrice) / (1 + +targetTax.taxRate)) * +targetTax.taxRate);
          } else {
            totalTaxes += (docdetail.detailQuantity * ++targetTax.taxRate);
          }
        })
        
      }
    });
    return totalTaxes || 0;
  }

  function getDetailTotalTaxesById(targetTaxId) {
    let totalTaxes = 0;

    forEach(docDetails, (docdetail) => {
      if (docdetail.detailIsTaxable === 1) {
        forEach(docdetail.detailTaxesData, (detailtax) => {
          if (targetTaxId === detailtax.taxId) {
            const targetTax = find(taxesData, (x) => x.id === targetTaxId);
            if (targetTax.isPercentage === 1) {
              // console.log("SUB TOTAL", (docdetail.detailQuantity * docdetail.detailUnitPrice));
              // console.log("TAX RATE", ((1 + +targetTax.taxRate)));
              // console.log("WITHOUT TAX", ((docdetail.detailQuantity * docdetail.detailUnitPrice) / (1 + +targetTax.taxRate)));
              // console.log("TAX", (((docdetail.detailQuantity * docdetail.detailUnitPrice) / (1 + +targetTax.taxRate)) * +targetTax.taxRate));
              totalTaxes += (((docdetail.detailQuantity * docdetail.detailUnitPrice) / (1 + +targetTax.taxRate)) * +targetTax.taxRate);
            } else {
              totalTaxes += (docdetail.detailQuantity * ++targetTax.taxRate);
            }
          }
        })
      }
    });

    return totalTaxes || 0;
  }

  function getDetailTotal() {
    let total = 0;
    forEach(docDetails, (value) => {
      total += (value.detailQuantity * value.detailUnitPrice)
    });

    total = total + docIVAperception;
    total = total - docIVAretention;
    
    return total || 0;
  }

  const columns = [
    columnDef({title: 'Cantidad', dataKey: 'detailQuantity'}),
    columnDef({title: 'Detalle', dataKey: 'detailName'}),
    columnMoneyDef({title: 'Precio Unitario', dataKey: (documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailUnitPrice' : 'detailUnitPriceWithoutTax'}),
    columnMoneyDef({title: 'Exento', dataKey: 'detailNoTaxableTotal', showDefaultString: true}),
    columnMoneyDef({title: 'Gravado', dataKey: (documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailTaxableTotal' : 'detailTaxableWithoutTaxesTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'GravadoNoTaxes', dataKey: 'detailTaxableWithoutTaxesTotal', showDefaultString: true}),
    // columnMoneyDef({title: 'Taxes', dataKey: 'detailTotalTaxes', showDefaultString: true}),
    columnActionsDef(
      {
        title: 'Acciones',
        dataKey: 'uuid',
        detail: false,
        edit: false,
        del: true,
        delAction: (value) => {
          confirm({
            centered: true,
            title: '¿Desea eliminar este detalle?',
            icon: <DeleteOutlined />,
            content: 'Acción irreversible',
            okType: 'danger',
            onOk() { setDocDetails(docDetails.filter((x) => x.uuid !== value)); },
            onCancel() { },
          });
        },
      }
    ),
  ];

  function getDocumentTypeIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GTicketIcon width={size} />;
      case 2: return <GInvoice2Icon width={size} />;
      case 3: return <GInvoiceTax2Icon width={size} />;
      case 4: return <GCreditNoteIcon width={size} />;
      case 5: return <GDebitNoteIcon width={size} />;
      default: return <GAddFileIcon width={size} />;
    }
  }

  function getPaymentTypeIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GCashPaymentIcon width={size} />;
      case 2: return <GCreditPaymentIcon width={size} />;
      case 3: return <GDispatchIcon width={size} />;
      default: return <GAddFileIcon width={size} />;
    }
  }

  // function getPaymentMethodIcon(type, size = '36px') {
  //   switch(type) {
  //     case 1: return <GCashMethodIcon width={size} />;
  //     case 2: return <GTransferMethodIcon width={size} />;
  //     case 3: return <GPaymentCheckMethodIcon width={size} />;
  //     case 4: return <GCardMethodIcon width={size} />;
  //     default: return <GAddFileIcon width={size} />;
  //   }
  // }

  function getCustomerByFilters() {
    if (
      (documentTypeSelected !== 0 && documentTypeSelected !== 1 && documentTypeSelected !== null)
      && (paymentTypeSelected !== 0 && paymentTypeSelected !== null)
    )
      return customersData.filter((x) => (
        // Si tipo doc Factura y tipo pago Contado traer Clientes = todos
        (documentTypeSelected === 2 && paymentTypeSelected === 1)
        ||
        // Si tipo doc CCF y tipo pago Contado traer Clientes != Consumidor Final
        ((documentTypeSelected === 3 && x.customerTypeId !== 1) && paymentTypeSelected === 1)
        ||
        // Si tipo doc Factura y tipo pago Credito traer Clientes = todos mientras Apliquen credito
        (documentTypeSelected === 2 && paymentTypeSelected === 2 && x.applyForCredit === 1)
        ||
        // Si tipo doc CCF y tipo pago Credito traer Clientes != Consumidor final mientras Apliquen credito
        ((documentTypeSelected === 3 && x.customerTypeId !== 1) && paymentTypeSelected === 2 && x.applyForCredit === 1)
        ||
        // Si tipo doc Factura y tipo pago En Ruta traer Clientes = todos
        (documentTypeSelected === 2 && paymentTypeSelected === 3)
        ||
        // Si tipo doc CCF y tipo pago En Ruta traer Clientes != Consumidor Final
        ((documentTypeSelected === 3 && x.customerTypeId !== 1) && paymentTypeSelected === 3)
      ));
    return [];
  }

  // function customerReachCreditLimit() {
  //   console.log(customerCreditLimit);
  //   console.log((+customerPendingToPay + +getDetailTotal()));
  //   console.log((+customerPendingToPay + +getDetailTotal()) >= +customerCreditLimit);
  //   return paymentTypeSelected === 2 && (
  //     (customerSelected !== 0 || customerSelected !== null)
  //     && (+customerPendingToPay !== null && +customerCreditLimit !== null)
  //     && ((+customerPendingToPay + +getDetailTotal()) >= +customerCreditLimit)
  //   );
  // }

  return (
    // !ableToProcess ? <>
    //   <Result
    //     status="info"
    //     title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Caja cerrada, operaciones de venta limitadas"}`}</p>}
    //     subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere..." : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
    //   />
    // </> : 
    <Wrapper>
      <div style={{ display: 'none' }}>
        <ReactToPrint
          trigger={() => <button id="print-newsale-button">Print</button>}
          content={() => ticketComponentRef.current}
        />
        <SaleTicket 
          ref={ticketComponentRef} 
          ticketData={printData[0] || {}}
          ticketDetail={printDataDetails || []}
        />
      </div>
      <div style={{ display: 'none' }}>
        <ReactToPrint
          trigger={() => <button id="print-newsale-cf-button">Print</button>}
          content={() => cfComponentRef.current}
        />
        <ConsumidorFinal
          ref={cfComponentRef} 
          ticketData={printData[0] || {}}
          ticketDetail={printDataDetails || []}
        />
      </div>
      <div style={{ display: 'none' }}>
        <ReactToPrint
          trigger={() => <button id="print-newsale-ccf-button">Print</button>}
          content={() => ccfComponentRef.current}
        />
        <CFFInvoice 
          ref={ccfComponentRef} 
          ticketData={printData[0] || {}}
          ticketDetail={printDataDetails || []}
        />
      </div>
      <Row gutter={[8, 4]} style={{ width: '100%' }}>
        <Col
          span={24}
          style={{
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundColor: '#e6f4ff',
            borderRadius: '5px'
          }}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Opciones:'}</p>
          <Space wrap>
            <Button
              // type='primary'
              disabled
              onClick={() => restoreState()}
            >
              <Space>
                <GClearIcon width={'16px'} />
                {'Limpiar todo'}
              </Space>
            </Button>
            <Button
              // type='primary'
              onClick={() => loadData()}
            >
              <Space>
                <GRefreshIcon width={'16px'} />
                {'Refrescar'}
              </Space>
            </Button>
            <Button
              // type='primary'
              onClick={() => setOpenForm(true)}
            >
              <Space>
                <GAddUserIcon width={'16px'} />
                {'Añadir cliente'}
              </Space>
            </Button>
            <Button
              // type='primary'
              onClick={async () => {
                const response = await customersServices.findById(customerSelected);
                setCustomerToUpdate(response.data);
                setCustomerUpdateMode(true);
                setOpenForm(true);
              }}
              disabled={customerSelected === 0 || customerSelected === null}
            >
              <Space>
                <GEditUserIcon width={'16px'} />
                {'Editar cliente seleccionado'}
              </Space>
            </Button>
            {/* <Button
              // type='primary'
              onClick={() => setOpenForm(true)}
            >
              <Space>
                <GAdd1Icon width={'16px'} />
                {'Añadir producto'}
              </Space>
            </Button> */}
            <Button
              // type='primary'
              onClick={() => setOpenStockPreview(true)}
            >
              <Space>
                <GSearchForIcon width={'16px'} />
                {'Ver existencias'}
              </Space>
            </Button>
          </Space>
        </Col>
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }} xl={{ span: 12 }} xxl={{ span: 12 }}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Documento:'}</p>
          <Space wrap>
            <Radio.Group
              buttonStyle="solid"
              value={documentTypeSelected}
              onChange={(e) => {
                setDocumentTypeSelected(e.target.value);
                setCustomerSelected(0);
                setCustomerCreditLimit(null);
                setCustomerPendingToPay(null);
                // loadDocumentInformation(e.target.value);
              }}
            >
              {
                (filter(documentTypesData, ['enableForSales', 1]) || []).map((element) => {
                  return (
                    <Radio.Button key={element.id} value={element.id}>
                      <Space>
                      {getDocumentTypeIcon(element.id, '16px')}
                      {element.name}
                      </Space>
                    </Radio.Button>
                  )
                })
              }
              
            </Radio.Group>
            {/* <Button
              icon={<GRefreshIcon width={'16px'} />}
              onClick={(e) => {
                loadDocumentInformation(documentTypeSelected);
              }}
            /> */}
          </Space>
          <p style={{ margin: '0px', fontSize: 9, color: 'gray' }}>{`Serie: ${docSerie || ''}`}</p>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          // style={{ display: (documentTypeSelected !== 0 && documentTypeSelected !== 1 && documentTypeSelected !== null) ? 'inline' : 'none'}}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Pago:'}</p>
          <Space wrap>
            <Radio.Group
              buttonStyle="solid"
              value={paymentTypeSelected}
              onChange={(e) => {
                setPaymentTypeSelected(e.target.value);
                setCustomerSelected(0);
                setCustomerCreditLimit(null);
                setCustomerPendingToPay(null);
              }}
            >
            {
              (paymentTypesData || []).map((element) => {
                return (
                  <Radio.Button key={element.id} value={element.id}>
                    <Space>
                      {getPaymentTypeIcon(element.id, '16px')}
                      {element.name}
                    </Space>
                  </Radio.Button>
                )
              })
            }
            </Radio.Group>
          </Space>
        </Col>
        {/* <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{ display: (paymentTypeSelected === 1) ? 'inline' : 'none'}}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Metodo de pago:'}</p>
          <Radio.Group
            buttonStyle="solid"
            value={paymentMethodSelected}
            onChange={(e) => {
              setPaymentMethodSelected(e.target.value);
              setBankSelected(0);
              setPaymentReferenceNumber('');
              setPaymentAccountNumber('');
              if (e.target.value !== 1)
                setOpenPaymentAdditionalInfoDrawer(true);
              // setCustomerSelected(0);              
              // setCustomerCreditLimit(null);
              // setCustomerPendingToPay(null);
              // loadDocumentInformation(e.target.value);
            }}
          >
            {
              (paymentMethodsData || []).map((element) => {
                return (
                  <Radio.Button key={element.id} value={element.id}>
                    <Space>
                    {getPaymentMethodIcon(element.id, '16px')}
                    {element.name}
                    </Space>
                  </Radio.Button>
                )
              })
            }
          </Radio.Group>
          {
            (paymentMethodSelected !== null && (paymentMethodSelected !== 0 && paymentMethodSelected !== 1)) ? <>
              <p style={{ margin: '0px', fontSize: 12 }}>{`No Referencia: ${paymentReferenceNumber}`}</p>
              <p style={{ margin: '0px', fontSize: 12 }}>{`No Cuenta: ${paymentAccountNumber}`}</p>
              <p style={{ margin: '0px', fontSize: 12 }}>{`Banco: ${banksData.find((x) => x.id === bankSelected)?.name}`}</p>
            </>
            : <></>
          }
        </Col> */}
        {/* <Col span={24} /> */}
        {/* <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 6 }}
          xxl={{ span: 6 }}
          style={{ display: (documentTypeSelected !== 0 && documentTypeSelected !== 1 && documentTypeSelected !== null) ? 'inline' : 'none'}}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'N° Documento:'}</p>
          <Input 
            id='g-new-sale-doc-number-input'
            style={{ width: '100%' }} 
            placeholder={'0001'}
            min={0}
            disabled
            value={docNumber} 
            type={'number'} 
            onChange={(e) => setDocNumber(e.target.value)}
            onBlur={(e) => { validateDocNumber(); }}
            onKeyDown={
              (e) => {
                if (e.key === 'Enter')
                  document.getElementById('g-new-sale-datepicker').focus();
              }
            }
          />
        </Col> */}
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12  }}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Fecha:'}</p>
          <DatePicker 
            id={'g-new-sale-datepicker'}
            locale={locale} 
            format="DD-MM-YYYY" 
            value={docDatetime} 
            disabled
            style={{ width: '100%' }}
            onFocus={() => {
              document.getElementById('g-new-sale-datepicker').select();
            }}
            onChange={(datetimeMoment, datetimeString) => {
              setDocDatetime(datetimeMoment);
              document.getElementById('g-customer-new-sale-selector').focus();
            }}
          />
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          // style={{ display: (documentTypeSelected !== 0 && documentTypeSelected !== 1 && documentTypeSelected !== null) ? 'inline' : 'none'}}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Cliente:'}</p>
          <Select 
            id={'g-customer-new-sale-selector'}
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={customerSelected} 
            onChange={(value) => {
              setCustomerSelected(value);
              setCustomerCreditLimit(customersData.find((x) => x.id === value)?.creditLimit || null);
              setCustomerPendingToPay(customersData.find((x) => x.id === value)?.pendingToPay || null);
              setCustomerSearchFilter('');
              setTimeout(() => {
                document.getElementById('newsale-product-search-input').focus();
              }, 500);
            }}
            // onFocus={() => setOpenCusomterSelector(true)}
            // onBlur={() => setOpenCusomterSelector(false)}
            // open={openCusomterSelector}
            optionFilterProp='children'
            showSearch
            filterOption={false}
            onSearch={(value) => {
              setCustomerSearchFilter(value);
            }}
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (filterData(getCustomerByFilters(), customerSearchFilter, ['id', 'fullName', 'phone', 'address', 'businessName']) || []).map(
                (element, index) => (
                  <Option
                    key={element.id}
                    value={element.id}
                    style={{ borderBottom: '1px solid #E5E5E5', backgroundColor: index % 2 === 0 ? '#f0f5ff' : '#ffffff' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: 0, fontSize: 12 }}>{element.fullName}</p>
                      <p style={{ margin: 0, fontSize: 10, fontStyle: 'italic' }}>{element.businessName}</p>
                      <p style={{ margin: 0, fontSize: 10 }}>{element.address}</p>
                      <p style={{ margin: 0, fontSize: 10 }}>{element.phone}</p>
                    </div>
                    {/* <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: '3px' }}>
                      <Tag icon={<HomeOutlined />}>{`${element.address || '-'}`}</Tag>
                      <Tag icon={<PhoneOutlined />}>{`${element.phone || '-'}`}</Tag>
                    </div> */}
                    {/* {
                      paymentTypeSelected === 2 && element.applyForCredit === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: '3px' }}>
                          <p style={{ margin: 0, marginRight: 5 }}>{'Limite de crédito: '}</p>
                          
                          <Tag icon={<DollarCircleOutlined />} color={'red'}>{`${element.creditLimit || '-'}`}</Tag>
                          <p style={{ margin: 0, marginRight: 5 }}>{'Deuda actual: '}</p>
                          
                          <Tag icon={<DollarCircleOutlined />} color={'volcano'}>{`${element.pendingToPay || '-'}`}</Tag>
                        </div>
                      ) : <></>
                    } */}
                  </Option>
                )
              )
            }
          </Select>
          {/* {
            paymentTypeSelected === 2 ? (
              <Space wrap style={{ marginTop: '5px' }}>
                <p style={{ margin: 0, marginRight: 5 }}>{'Limite de crédito: '}</p>
                <Tag icon={<DollarCircleOutlined />} color={'red'}>{`${customerCreditLimit || ''}`}</Tag>
                <p style={{ margin: 0, marginRight: 5 }}>{'Deuda actual: '}</p>
                <Tag icon={<DollarCircleOutlined />} color={'volcano'}>{`${customerPendingToPay || ''}`}</Tag>
              </Space>
            ) : <></>
          } */}
        </Col>
        {/* <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 6 }}
          xxl={{ span: 6 }}
          style={{ display: (paymentTypeSelected === 2) ? 'inline' : 'none'}}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Plazo vencimiento (dias):'}</p>
          <InputNumber 
            id='g-new-sale-expiration-days-input'
            style={{ width: '100%' }} 
            min={0}
            value={docExpirationDays} 
            type={'number'} 
            onChange={(val) => setDocExpirationDays(val)}
            onKeyDown={
              (e) => {
                if (e.key === 'Enter')
                  document.getElementById('g-new-sale-datepicker').focus();
              }
            }
          />
        </Col> */}
        <Col span={24} />
        <Col span={24} style={{ display: customerSelected !== 0 && customerSelected !== null ? 'inline' : 'none' }}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Buscar producto:'}</p>
          {
            (docDetails.length <= 18) ? <Search
              id={'newsale-product-search-input'}
              name={'filter'}
              value={productSearchFilter} 
              placeholder="Código, Nombre, Cód. Barra"
              allowClear
              disabled={!(docDetails.length < 18)}
              style={{ width: 300, marginBottom: 5 }}
              onChange={(e) => setProductSearchFilter(e.target.value)}
              onSearch={() => setOpenProductSearchForSale(true)}
              onKeyDown={
                (e) => {
                  if (e.key === 'Enter')
                    setOpenProductSearchForSale(true);
                }
              }
            /> : <Alert message="Ha llegado al máximo de detalles que puede facturar por cada venta" type="warning" />
          }
        </Col>
        <Col span={24} />
        <Col span={24}>
          <Table 
            bordered
            loading={fetching}
            columns={columns}
            rowKey={'uuid'}
            size={'small'}
            dataSource={[
              ...docDetails
            ] || []}
            pagination={false}
            footer={() => {
              return(
                <Row gutter={[8, 4]}>
                  <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 16 }} lg={{ span: 18 }} xl={{ span: 18 }} xxl={{ span: 18 }}>
                    <div style={styleSheet.tableFooter.footerCotainer}>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`SON:`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`${numberToLetters(getDetailTotal())}`}</p>
                      </div>
                      {/* {
                        customerReachCreditLimit() ? (
                          <Alert
                            message="Requiere autorizacion superior cerrar esta venta"
                            description="La venta actual excede el limite de crédito disponible para este cliente"
                            type="warning"
                            showIcon
                          />
                        ) : <></>
                      } */}
                    </div>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 8 }} lg={{ span: 6 }} xl={{ span: 6 }} xxl={{ span: 6 }}>
                    <div style={styleSheet.tableFooter.footerCotainer}>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`GRAVADO`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>
                          {`$${((documentTypeSelected === 1 || documentTypeSelected === 2) ? getDetailTaxableTotal() : (getDetailTaxableTotal() - getDetailTotalTaxes())).toFixed(2)}`}
                        </p>
                      </div>
                      {
                        (documentTypeSelected === 1 || documentTypeSelected === 2) || isEmpty(taxesData) ? <></> : (
                          taxesData.map((element, index) => {
                            let dataValue = getDetailTotalTaxesById(element.id).toFixed(2);
                            return (
                              <div key={index} style={styleSheet.tableFooter.detailContainer}>
                                <p style={styleSheet.tableFooter.detailLabels.normal}>{`${element.name}`}</p>
                                <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${dataValue}`}</p>
                              </div>
                            );
                          })
                        )
                      }
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`SUBTOTAL`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${getDetailTaxableTotal().toFixed(2)}`}</p>
                      </div>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`EXENTO`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${getDetailNoTaxableTotal().toFixed(2)}`}</p>
                      </div>
                      {/* <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`IVA PERCIBIDO (+)`}</p>
                        <InputNumber
                          prefix={'$'}
                          size='small'
                          id='g-new-sale-iva-perception'
                          style={{ width: '50%' }} 
                          placeholder={''}
                          disabled={docIVAretention !== null || docIVAretention > 0}
                          min={0}
                          value={docIVAperception} 
                          type={'docIVAperception'} 
                          onChange={(value) => setDocIVAperception(value)}
                          onKeyDown={
                            (e) => {
                              if (e.key === 'Enter')
                                document.getElementById('g-new-sale-iva-retention').focus();
                            }
                          }
                        />
                      </div>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`IVA RETENIDO (-)`}</p>
                        <InputNumber 
                          prefix={'$'}
                          size='small'
                          id='g-new-sale-iva-retention'
                          style={{ width: '50%' }}
                          placeholder={''}
                          min={0}
                          value={docIVAretention}
                          disabled={docIVAperception !== null || docIVAperception > 0}
                          type={'docIVAretention'} 
                          onChange={(value) => setDocIVAretention(value)}
                        />
                      </div> */}
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`VENTA TOTAL`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`$${getDetailTotal().toFixed(2)}`}</p>
                      </div>
                      <Button
                        type={'primary'}
                        icon={<SaveOutlined />}
                        style={{ margin: 5 }}
                        onClick={() => formAction()}
                        disabled={fetching}
                      >
                        CONFIRMAR
                      </Button>
                    </div>
                  </Col>
                </Row>
              )
            }}
          />
        </Col>
      </Row>
      <ProductSearchForSale
        open={openProductSearchForSale} 
        priceScale={customersData.filter(x => x.id === customerSelected)[0]?.defPriceIndex || 1}
        productFilterSearch={productSearchFilter}
        allowOutOfStock={true}
        onClose={(saleDetailToPush, executePush, currentStock) => { 
          setOpenProductSearchForSale(false);
          // const { detailId, detailName, detailQuantity, detailIsService } = saleDetailToPush;
          // const currentDetailQuantity = getQuantitySumProductDetail(detailId);
          if (executePush) {
            pushDetail(saleDetailToPush);
            // if (!(currentStock < (currentDetailQuantity + detailQuantity)) || detailIsService) {
            //   pushDetail(saleDetailToPush);
            // } else {
            //   customNot(
            //     'error',
            //     `No puede añadir más ${detailName}`,
            //     `Solo hay ${currentStock} y ya ha añadido ${currentDetailQuantity} por lo que no se pueden añadir ${detailQuantity} más`
            //   );
            // }
          }
          document.getElementById('newsale-product-search-input').focus();
          document.getElementById('newsale-product-search-input').select();
        }}
      />
      <CustomerForm
        open={openForm} 
        updateMode={customerUpdateMode}
        dataToUpdate={customerToUpdate}
        showDeleteButton={false}
        onClose={(refresh) => { 
          setOpenForm(false);
          setCustomerUpdateMode(false);
          setCustomerToUpdate({});
          if (refresh) { 
            document.getElementById('g-customer-new-sale-selector').focus();
            loadData();
          }
        }}
      />
      <LocationStockCheckPreview
        open={openStockPreview}
        onClose={(refresh) => {
          setOpenStockPreview(false);
        }}
      />
      <AuthorizeUserPINCode
        open={openAuthUserPINCode}
        title={`PIN Vendedor requerido`}
        confirmButtonText={'Confirmar'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId, userPINCode } = userAuthorizer;
            createNewOrderSale(userPINCode);
          }
          setOpenAuthUserPINCode(false);
        }}
      />
      <AuthorizeAction
        open={openAuthCreditLimitReached}
        allowedRoles={[1, 2]}
        title={`Autorizar crédito`}
        confirmButtonText={'Confirmar'}
        actionType={`Autorizar credito con limite excedido para nueva Orden de Venta`}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId, roleId } = userAuthorizer;
            setOpenAuthUserPINCode(true);
          }
          setOpenAuthCreditLimitReached(false);
        }}
      />
      <NewSaleCashExchange
        open={openCashExchangeForm}
        amountToExchange={cashAmountToExchange}
        onClose={() => {
          setOpenCashExchangeForm(false);
        }}
      />
      {/* <Drawer
        title={
          paymentMethodSelected === 2 ? 'Informacion de transferencia' :
            paymentMethodSelected === 3 ? 'Informacion de cheque' : ''
        }
        placement="right"
        onClose={() => {
          setOpenPaymentAdditionalInfoDrawer(false);
          setPaymentMethodSelected(0);
        }}
        maskClosable={false}
        open={openPaymentAdditionalInfoDrawer}
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <p style={{ margin: 0, fontSize: 11 }}>{<RequiredQuestionMark />} No Referencia:</p>  
            <Input
              onChange={(e) => setPaymentReferenceNumber(e.target.value)}
              name={'paymentReferenceNumber'}
              value={paymentReferenceNumber}
            />
          </Col>
          <Col span={24}>
            <p style={{ margin: 0, fontSize: 11 }}>No Cuenta:</p>  
            <Input
              onChange={(e) => setPaymentAccountNumber(e.target.value)}
              name={'paymentAccountNumber'}
              value={paymentAccountNumber}
            />
          </Col>
          <Col span={24}>
            <p style={{ margin: 0, fontSize: 11 }}>{<RequiredQuestionMark />} Banco:</p>  
            <Select
              dropdownStyle={{ width: '100%' }} 
              style={{ width: '100%' }} 
              value={bankSelected} 
              onChange={(value) => setBankSelected(value)}
              optionFilterProp='children'
              showSearch
              filterOption={(input, option) =>
                (option.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
              {
                (banksData || []).map(
                  (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                )
              }
            </Select>
          </Col>
          <Col span={24}>
            <Button
              type={'primary'}
              icon={<SaveOutlined />}
              style={{ margin: 5, width: '100%' }}
              onClick={() => {
                if (
                  validateStringData(paymentReferenceNumber, 'Debe proporcionar un numero de referencia de la transaccion')
                  && validateSelectedData(bankSelected, 'Seleccione un banco')
                ) {
                  setOpenPaymentAdditionalInfoDrawer(false);
                }
              }}
              disabled={fetching}
            >
              GUARDAR
            </Button>
          </Col>
        </Row>
      </Drawer> */}
    </Wrapper>
  );
}

export default NewOrderSale;
