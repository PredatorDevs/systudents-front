import React, { useEffect, useState, useRef } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, DatePicker, Divider, Input, InputNumber, Row, Select, Table, Modal, Space, Tag, Result, Radio, Alert, Drawer, Comment, Avatar, Checkbox } from 'antd';
import { customNot } from '../../utils/Notifications';

import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import { filter, find, forEach, includes, isEmpty } from 'lodash';
import { columnActionsDef, columnBoolean, columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import { CloseOutlined, ContactsOutlined, DeleteOutlined, DollarCircleOutlined, EditOutlined, HomeOutlined, InfoCircleTwoTone, InfoOutlined, LikeOutlined, PhoneOutlined, SaveOutlined, UserAddOutlined, WarningOutlined } from '@ant-design/icons';
import customersServices from '../../services/CustomersServices';
import salesServices from '../../services/SalesServices';
import CustomerForm from '../../components/forms/CustomerForm';
import { getUserLocation, getUserLocationSalesSerie, getUserLocationSalesSerieCCF, getUserMyCashier } from '../../utils/LocalData';
import SaleTicket from '../../components/tickets/SaleTicket';
import ReactToPrint from 'react-to-print';
import ConsumidorFinal from '../../components/invoices/ConsumidorFinal';
import generalsServices from '../../services/GeneralsServices';
import CFFInvoice from '../../components/invoices/CFFInvoice';
import { numberToLetters } from '../../utils/NumberToLetters';
import { printerServices } from '../../services/PrintersServices';
import { MainMenuCard } from '../../styled-components/MainMenuCard';
import { GAdd1Icon, GAddFileIcon, GAddUserIcon, GCardMethodIcon, GCashMethodIcon, GCashPaymentIcon, GClearIcon, GCreditNoteIcon, GCreditPaymentIcon, GDebitNoteIcon, GDispatchIcon, GEditUserIcon, GInvoice2Icon, GInvoiceTax2Icon, GPaymentCheckMethodIcon, GRefreshIcon, GSearchForIcon, GTicketIcon, GTransferMethodIcon } from '../../utils/IconImageProvider';
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
import SaleDetailModel from '../../models/SaleDetail';
import productsServices from '../../services/ProductsServices';
import dteServices from '../../services/DteServices';

const { Search, TextArea } = Input;
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

function StoreModule(props) {
  const navigate = useNavigate();
  const { state } = useLocation();

  const ticketComponentRef = useRef();
  const cfComponentRef = useRef();
  const ccfComponentRef = useRef();

  // const [counter, setCounter] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openStockPreview, setOpenStockPreview] = useState(false);
  const [openAuthUserPINCode, setOpenAuthUserPINCode] = useState(false);
  const [openAuthCreditLimitReached, setOpenAuthCreditLimitReached] = useState(false);
  const [openCashExchangeForm, setOpenCashExchangeForm] = useState(false);
  const [openPaymentAdditionalInfoDrawer, setOpenPaymentAdditionalInfoDrawer] = useState(false);
  const [cashAmountToExchange, setCashAmountToExchange] = useState(null);

  const [docSerie, setDocSerie] = useState(null);
  const [docRefOrderSaleId, setDocRefOrderSaleId] = useState(null);

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

  const [customerSelected, setCustomerSelected] = useState(1);
  const [customerComplementaryName, setCustomerComplementaryName] = useState('');
  const [customerUpdateMode, setCustomerUpdateMode] = useState(false);
  const [customerToUpdate, setCustomerToUpdate] = useState({});
  const [customerCreditLimit, setCustomerCreditLimit] = useState(null);
  const [customerPendingToPay, setCustomerPendingToPay] = useState(null);
  const [validDocNumberAndSerie, setValidDocNumberAndSerie] = useState(true);
  
  const [documentTypeSelected, setDocumentTypeSelected] = useState(2);
  const [paymentTypeSelected, setPaymentTypeSelected] = useState(1);

  const [paymentMethodSelected, setPaymentMethodSelected] = useState(1);
  
  const [docDatetime, setDocDatetime] = useState(defaultDate());
  const [docNumber, setDocNumber] = useState('');
  const [docType, setDocType] = useState(1);
  const [docDetails, setDocDetails] = useState([]);
  
  const [docIVAretention, setDocIVAretention] = useState(null);
  const [docIVAperception, setDocIVAperception] = useState(null);
  
  const [docExpirationDays, setDocExpirationDays] = useState(8);

  const [isNoTaxableOperation, setIsNoTaxableOperation] = useState(false);

  // PAYMENT METHOD EXTRA INFO STATES
  const [bankSelected, setBankSelected] = useState(0);
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');

  const [saleNotes, setSaleNotes] = useState('');

  const { cashierInfoContainer, productDistributionType } = props;
  
  function restoreState() {
    setFetching(false);
    setOpenForm(false);
    setOpenStockPreview(false);
    setCustomerSearchFilter('');
    setProductSearchFilter('');
    setOpenCusomterSelector(false);
    setOpenProductSearchForSale(false);
    // setOpenProductGasSearchForSale(false);
    setPrintData([]);
    setPrintDataDetails([]);
    setCustomerSelected(1);
    setCustomerComplementaryName('');
    setCustomerUpdateMode(false);
    setCustomerToUpdate({});
    setValidDocNumberAndSerie(false);
    setDocumentTypeSelected(2);
    setPaymentTypeSelected(1);
    setPaymentMethodSelected(1);
    setDocDatetime(defaultDate());
    setDocNumber('');
    setDocType(1);
    setDocDetails([]);
    setDocIVAperception(null);
    setDocIVAretention(null);
    setDocExpirationDays(8);
    setDocRefOrderSaleId(null);

    setBankSelected(0);
    setPaymentReferenceNumber('');
    setPaymentAccountNumber('');

    setOpenAuthCreditLimitReached(false);
    setCustomerCreditLimit(null);
    setCustomerPendingToPay(null);

    setSaleNotes('');

    // if (openCashExchangeForm === false) {
    //   if (
    //     !!document.getElementById('newsale-product-search-input')
    //   ) {
    //     document.getElementById('newsale-product-search-input').focus();
    //     document.getElementById('newsale-product-search-input').select();
    //   }
    // }
  }

  async function loadDocumentInformation(docTypeId) {
    try {
      setFetching(true);

      const response = await cashiersServices.getDocumentInformation(getUserMyCashier(), docTypeId);
      const { documentCorrelative, documentSerie } = response.data[0];

      setDocNumber(String(documentCorrelative));
      setDocSerie(documentSerie);

      const valRes = await salesServices.validateDocNumber(
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
    try {
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
    } catch(error) {

    }
    setFetching(false);
  }

  async function loadOrderSaleData() {
    setFetching(true);
    try {
      if (state !== null) {
        const { orderSaleId } = state;
        setDocRefOrderSaleId(orderSaleId);
        if (orderSaleId !== 0) {
          const orderSaleRes = await orderSalesServices.findById(orderSaleId);
          
          const orderSaleDetRes = await orderSalesServices.details.findByOrderSaleId(orderSaleId);
          
          const headData = orderSaleRes.data;
          const detData = orderSaleDetRes.data;

          setCustomerSelected(headData[0].customerId);
          setDocumentTypeSelected(headData[0].documentTypeId);
          setPaymentTypeSelected(headData[0].paymentTypeId);

          setCustomerCreditLimit(customersData.find((x) => x.id === headData[0].customerId)?.creditLimit || null);
          setCustomerPendingToPay(customersData.find((x) => x.id === headData[0].customerId)?.pendingToPay || null);
          setCustomerSearchFilter('');
          // setTimeout(() => {
          //   // document.getElementById('newsale-product-search-input').focus();
          // }, 500);

          loadDocumentInformation(headData[0].documentTypeId);

          const newDetails = []
          for (let i = 0; i < detData.length; i++) {
            newDetails.push(new SaleDetailModel(
              detData[i]?.productId,
              detData[i]?.productName,
              detData[i]?.productIsTaxable,
              +detData[i]?.quantity,
              +detData[i]?.unitPrice,
              detData[i]?.productTaxesData,
              detData[i]?.productIsService
            ))
          }
          
          setDocDetails(newDetails);
        } else {
          setFetching(false);
        }
      } else {
        setFetching(false);
      }
    } catch(error) {

    }
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
    loadData().then(() => {
      loadDocumentInformation(2).then(() => {
        // loadOrderSaleData();
        document.getElementById('newsale-product-search-input').focus();
        document.getElementById('newsale-product-search-input').select();
      })
    });
  }, []);

  function defaultDate() {
    return moment();
  };

  function isValidDetail(element) {
    return (element.detailQuantity > 0) && (element.detailUnitPrice >= 0);
    // return (element.detailQuantity > 0) && (element.detailUnitPrice >= 0) && (element.detailIsAvailable);
  }

  async function checkDetailStockAvailability() {
    setFetching(true);
    let allStockAvailable = true;
    try {
      // const checkedDetails = [];

      // for await (const x of docDetails) {
      //   const quantityToCheck = getQuantitySumProductDetail(x.detailId);
      //   const availabilityRes = await productsServices.checkAvailability(getUserLocation(), x.detailId, quantityToCheck);
      //   const currentStock = availabilityRes.data[0].currentStock;

      //   if (availabilityRes.data[0].isAvailable === 1) {
      //     checkedDetails.push(new SaleDetailModel(
      //       x.detailId,
      //       x.detailName,
      //       x.detailIsTaxable,
      //       x.detailQuantity,
      //       x.detailUnitPrice,
      //       x.detailTaxesData,
      //       x.detailIsService,
      //       true
      //     ));
      //   } else {
      //     allStockAvailable = false;
      //     customNot('warning', `No hay suficientes existencias para despachar ${x.detailName}`, `Solamente hay ${currentStock} y usted está intentando añadir ${x.detailQuantity}`);

      //     checkedDetails.push(new SaleDetailModel(
      //       x.detailId,
      //       x.detailName,
      //       x.detailIsTaxable,
      //       x.detailQuantity,
      //       x.detailUnitPrice,
      //       x.detailTaxesData,
      //       x.detailIsService,
      //       false
      //     ));
      //   }
      // }

      // setDocDetails(checkedDetails);

      // Si todos los datos de venta están correctos pasa a lo siguiente
      if (validateData(docDetails)) {
        // Si el monto total de la venta mas lo adeudado por el cliente excede el limite otorgado pide autorizacion
        if (customerReachCreditLimit()) {
          setOpenAuthCreditLimitReached(true);
        } else {
          // setOpenAuthUserPINCode(true);
          createNewSale('28351');
        }
      } else {
        setFetching(false);
      };
    } catch(error) {
      allStockAvailable = false;
      setFetching(false);
      console.log(error);
    }

    return allStockAvailable;
  }

  function validateData(detailsToValidate) {
    const validDocDatetime = docDatetime !== null && docDatetime.isValid();
    const validDocNumber = !isEmpty(docNumber);
    const validCustomerSelected = customerSelected !== 0 && customerSelected !== null;
    const validDocumentType = documentTypeSelected !== 0 && !!documentTypeSelected;

    // const validDetailQuantityLimit = (detailsToValidate.length <= 14);

    // if (!validDetailQuantityLimit) {
    //   customNot('warning', 'Limite de detalles de venta alcanzado', 'Actualmente el sistema solo permite catorce o menos detalles por venta');
    //   return;
    // }

    // if (documentTypeSelected === 3 && getDetailTotal() < 5) {
    //   customNot('warning', 'Créditos Fiscales deben ser facturados con más de $5.00', 'Debe añadir más venta');
    //   return;
    // }

    if (paymentTypeSelected === 2 && (docExpirationDays <= 0 || docExpirationDays === null)) {
      customNot('warning', 'Sus ventas al crédito deben tener definidos los días de vencimiento', 'Coloque un valor a días de vencimiento');
      return;
    }

    if (paymentTypeSelected === 3 && (docExpirationDays <= 0 || docExpirationDays === null)) {
      customNot('warning', 'Sus ventas en ruta deben tener definidos los días de vencimiento', 'Coloque un valor a días de vencimiento');
      return;
    }

    if (paymentTypeSelected === 1 && (paymentMethodSelected === 0 || paymentMethodSelected === null)) {
      customNot('warning', 'Sus ventas de contado deben tener definido un método de pago', 'Seleccione un método de pago');
      return;
    }

    const validPaymentType = paymentTypeSelected !== 0 && !!paymentTypeSelected;
    const validDocDetails = !isEmpty(detailsToValidate);
    const validDocDetailsIntegrity = detailsToValidate.every(isValidDetail);

    if (!validDocDatetime) customNot('warning', 'Debe seleccionar una fecha válida', 'Dato no válido');
    if (!validDocNumber) customNot('warning', 'Debe colocar un número de documento', 'Dato no válido');
    if (!validCustomerSelected) customNot('warning', 'Debe seleccionar un cliente', 'Dato no válido');
    if (!validDocumentType) customNot('warning', 'Seleccione un tipo de documento', 'Dato no válido');
    if (!validPaymentType) customNot('warning', 'Seleccione un tipo de pago', 'Dato no válido');
    if (!validDocDetails) customNot('warning', 'Debe añadir por lo menos un detalle a la compra', 'Dato no válido');
    if (!validDocNumberAndSerie) customNot('warning', 'Correlativo ya registrado', 'El correlativo especificado ya pertenece a un documento de la serie actual');
    if (!validDocDetailsIntegrity) customNot('warning', 'Los datos en el detalle no son admitidos', 'Dato no válido');
    return (
      validDocNumber
      && validDocDatetime && validCustomerSelected 
      && validDocumentType && validPaymentType 
      && validDocDetails && validDocDetailsIntegrity 
      && validDocNumberAndSerie
    );
  }

  async function createNewSale(userPINCode) {
    setFetching(true);
    try {
      // START THE PROCESS OF SAVE THE SALE
      const saleResponse = await salesServices.add(
        getUserLocation() || 1,
        customerSelected,
        documentTypeSelected,
        paymentTypeSelected,
        paymentMethodSelected,
        docType || 1,
        docDatetime.format('YYYY-MM-DD HH:mm:ss'),
        isEmpty(docNumber) ? null : docNumber, // docNumber,
        Number(getDetailTotal().toFixed(2)) || 0.00, // TOTAL
        getUserMyCashier(),
        docIVAretention || 0,
        docIVAperception || 0,
        docExpirationDays || null,
        bankSelected || null,
        paymentReferenceNumber || '',
        paymentAccountNumber || '',
        userPINCode,
        numberToLetters(Number((getDetailTotal() - (isNoTaxableOperation ? getDetailTotalTaxesById(1) : 0)).toFixed(2)) || 0.00),
        isNoTaxableOperation ? 1 : 0,
        saleNotes || null,
        customerComplementaryName || null
      );
      
      const { insertId } = saleResponse.data[0];
    
      const bulkData = docDetails.map((element) => ([ insertId, element.detailId, element.detailUnitPrice, element.detailQuantity ]));

      await salesServices.details.add(bulkData);
      // const saleResultResponse = await salesServices.findById(insertId);
      // const saleDetailResultResponse = await salesServices.details.findBySaleId(insertId);

      // setPrintData(saleResultResponse.data);
      // setPrintDataDetails(saleDetailResultResponse.data);

      if (paymentTypeSelected === 1 && paymentMethodSelected === 1) {
        setCashAmountToExchange(Number(getDetailTotal().toFixed(2)) || 0.00);
        setOpenCashExchangeForm(true);
        if (
          !!document.getElementById('input-form-quantity-to-exchange')
        ) {
          document.getElementById('input-form-quantity-to-exchange').focus();
          document.getElementById('input-form-quantity-to-exchange').select();
        }
      } else {
        if (
          !!document.getElementById('newsale-product-search-input')
        ) {
          document.getElementById('newsale-product-search-input').focus();
          document.getElementById('newsale-product-search-input').select();
        }
      }

      if (paymentTypeSelected === 3) {
        confirm({
          centered: true,
          title: 'Recuerde hacer el cobro de $2.50',
          icon: <InfoCircleTwoTone />,
          content: 'Esta venta fue marcada como En Ruta',
          okType: 'danger',
          okText: 'Entendido',
          onOk() {}
        });
      }
      
      let printingResponse;
      let dteEmisionRes;
      let dteMailRes;

      if (documentTypeSelected === 2) {
        // try {
        //   customNot('info', '', 'Imprimiendo Comprobante');
        //   printingResponse = await printerServices.printDteVoucher(
        //     {
        //       customerFullname: `${saleResultResponse.data[0].customerFullname || '-'}`,
        //       locationName: `${saleResultResponse.data[0].locationName || '-'}`,
        //       documentTypeName: `${saleResultResponse.data[0].documentTypeName || '-'}`,
        //       docNumber: `${saleResultResponse.data[0].docNumber || '-'}`,
        //       documentDatetime: `${moment(isEmpty(saleResultResponse.data[0]) ? '1999-01-01' : saleResultResponse.data[0].docDatetime).format('L') || '-'}`,
        //       customerAddress: `${saleResultResponse.data[0].customerAddress || '-'}`,
        //       customerDui: `${saleResultResponse.data[0].customerDui || null}`,
        //       customerNit: `${saleResultResponse.data[0].customerNit || null}`,
        //       customerPhone: `${saleResultResponse.data[0].customerPhone || null}`,
        //       paymentTypeName: `${saleResultResponse.data[0].paymentTypeName || '-'}`,
        //       totalSale: saleResultResponse.data[0].total || 0,
        //       totalToLetters: `${numberToLetters(saleResultResponse.data[0].total)}`,
        //       generationCode: `${saleResultResponse.data[0].generationCode || '-'}`,
        //       receptionStamp: `${saleResultResponse.data[0].receptionStamp || '-'}`,
        //       controlNumber: `${saleResultResponse.data[0].controlNumber || '-'}`
        //     },
        //     saleDetailResultResponse.data
        //   );
        // } catch(error) {

        // }

        try {
          customNot('info', '', 'Iniciando transmisión de DTE...');
          dteEmisionRes = await dteServices.signCF(insertId);

          customNot('info', '', 'Enviando DTE al email del cliente');
          dteMailRes = await dteServices.sendEmailCF(insertId);
        } catch(dteErr) {
          console.log(dteErr);
        }

        // try {
        //   customNot('info', '', 'Enviando DTE al email del cliente');
        //   dteMailRes = await dteServices.sendEmailCF(insertId);
        // } catch(dteErr) {
        //   console.log(dteErr);
        // }
      }

      if (documentTypeSelected === 3) {
        // try {
        //   customNot('info', '', 'Imprimiendo Comprobante');
        //   printingResponse = await printerServices.printDteVoucher(
        //     {
        //       customerFullname: `${saleResultResponse.data[0].customerFullname || '-'}`,
        //       locationName: `${saleResultResponse.data[0].locationName || '-'}`,
        //       documentTypeName: `${saleResultResponse.data[0].documentTypeName || '-'}`,
        //       docNumber: `${saleResultResponse.data[0].docNumber || '-'}`,
        //       documentDatetime: `${moment(isEmpty(saleResultResponse.data[0]) ? '1999-01-01' : saleResultResponse.data[0].docDatetime).format('L') || '-'}`,
        //       customerAddress: `${saleResultResponse.data[0].customerAddress || '-'}`,
        //       customerDui: `${saleResultResponse.data[0].customerDui || null}`,
        //       customerNit: `${saleResultResponse.data[0].customerNit || null}`,
        //       customerPhone: `${saleResultResponse.data[0].customerPhone || null}`,
        //       paymentTypeName: `${saleResultResponse.data[0].paymentTypeName || '-'}`,
        //       totalSale: saleResultResponse.data[0].total || 0,
        //       totalToLetters: `${numberToLetters(saleResultResponse.data[0].total)}`,
        //       generationCode: `${saleResultResponse.data[0].generationCode || '-'}`,
        //       receptionStamp: `${saleResultResponse.data[0].receptionStamp || '-'}`,
        //       controlNumber: `${saleResultResponse.data[0].controlNumber || '-'}`
        //     },
        //     saleDetailResultResponse.data
        //   );
        // } catch(error) {

        // }

        try {
          customNot('info', '', 'Iniciando transmisión de DTE...');
          dteEmisionRes = await dteServices.signCCF(insertId);

          customNot('info', '', 'Enviando DTE al email del cliente');
          dteMailRes = await dteServices.sendEmailCCF(insertId);
        } catch(dteErr) {
          console.log(dteErr);
        }

        // try {
        //   customNot('info', '', 'Enviando DTE al email del cliente');
        //   dteMailRes = await dteServices.sendEmailCCF(insertId);
        // } catch(dteErr) {
        //   console.log(dteErr);
        // }
      }

      if (docRefOrderSaleId !== null && docRefOrderSaleId !== 0) {
        try {
          const consolidateRes = await orderSalesServices.consolidate(insertId, docRefOrderSaleId);
        } catch(conErr) {
          console.log(conErr);
        }
      }

      restoreState();

      // loadData();
      loadDocumentInformation(documentTypeSelected);

      window.scrollTo(0, 0);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  async function formAction() {
    let cType = customersData.find(x => x.id === customerSelected)?.customerTypeId;
    let cName = customersData.find(x => x.id === customerSelected)?.fullName;

    if ((documentTypeSelected === 1 || documentTypeSelected === 2) && cType !== 1) {
      confirm({
        centered: true,
        title: '¡Está a punto de emitir CONSUMIDOR FINAL (FACTURA) a un cliente marcado como CONTRIBUYENTE u OTROS!',
        icon: <WarningOutlined />,
        content: `Sí ${cName} lo ha solicitado en lugar de un CRÉDITO FISCAL presione Continuar para seguir con el proceso de la venta. En caso contrario presione CANCELAR y cambie el tipo de Documento.`,
        okType: 'danger',
        okButtonProps: {type: 'primary', icon: <CloseOutlined />},
        cancelButtonProps: {icon: <LikeOutlined />},
        cancelText: 'Continuar',
        okText: 'CANCELAR',
        onOk() {
        },
        onCancel() {
          checkDetailStockAvailability();
        },
      });
    } else {
      checkDetailStockAvailability();
    }
  }

  async function validateDocNumber() {
    setFetching(true);
    if (isEmpty(docNumber)) {
      setFetching(false);
    } else {
      const response = await salesServices.validateDocNumber(
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

    setTimeout(() => {
      try {
        document.getElementById(`input-number-${data?.uuid}`).focus();
        // console.log(document.getElementById(`input-number-${data?.uuid}`).focus());
      } catch(err) {
      }
    }, 250);
  }

  function getDetailTaxableTotal() {
    let total = 0;

    forEach(docDetails, (value) => {
      total += +(value.detailTaxableTotal);
    });

    return total || 0;
  }

  function getDetailNoTaxableTotal() {
    let total = 0;

    forEach(docDetails, (value) => {
      total += +(value.detailNoTaxableTotal);
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
        totalTaxes += +(docdetail?.detailTotalTaxes);
      }
    });

    return totalTaxes || 0;
  }

  function getDetailTotalTaxesById(targetTaxId) {
    let totalTaxes = 0;

    forEach(docDetails, (docdetail) => {
      if (docdetail instanceof SaleDetailModel && docdetail.detailIsTaxable === 1) {
        totalTaxes += +docdetail?.getTotalTaxesByTaxId(targetTaxId);
      }
    });

    return +totalTaxes || 0;
  }

  function getDetailTotal() {
    let total = 0;

    forEach(docDetails, (value) => {
      total += +(value.detailSubTotal)
    });

    total = total + docIVAperception;
    total = total - docIVAretention;
    
    return total || 0;
  }

  const columns = [
    // columnDef({title: 'Cantidad', dataKey: 'detailQuantity'}),
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Cantidad'}</p>,
      dataIndex: 'uuid',
      key: 'uuid',
      align: 'left',
      render: (text, record, index) => {
        return (
          (
            <Space direction='vertical'>
              <InputNumber
                key={`input-number-${record.uuid}`}
                id={`input-number-${record.uuid}`}
                size='small'
                value={docDetails[index]?.detailQuantity}
                precision={4}
                // readOnly
                style={{ borderTop: 0, borderLeft: 0, borderRight: 0, width: '75px' }}
                onFocus={() => {
                  document.getElementById(`input-number-${record.uuid}`).select();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (+e.target.value > 0 && +e.target.value <= 10000) {
                      let newDet = new SaleDetailModel(
                        record.detailId,
                        record.detailName,
                        record.detailIsTaxable,
                        +e.target.value,
                        record.detailUnitPrice,
                        record.detailTaxesData,
                        record.detailIsService
                      )
    
                      // Hacer una copia del array y actualizar solo el valor necesario
                      const newDocDetails = [...docDetails];
                      newDocDetails[index] = newDet;
    
                      setDocDetails(newDocDetails);
  
                      document.getElementById('newsale-product-search-input').focus();
                      document.getElementById('newsale-product-search-input').select();
                    } else {
                      customNot('warning', 'Introduzca una cantidad válida');
                      setTimeout(() => {
                        document.getElementById(`input-number-${record?.uuid}`).focus();
                        document.getElementById(`input-number-${record?.uuid}`).select();
                      }, 250);
                    }
                  }
                }}
              />
            </Space>
          )
        )
      }
    },
    columnDef({title: 'Detalle', dataKey: 'detailName'}),
    // columnMoneyDef({title: 'Precio Unitario', dataKey: (documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailUnitPrice' : 'detailUnitPriceWithoutTax', precision: 4 }),
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Precio Unitario'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
        {`$${Number(((documentTypeSelected === 1 || documentTypeSelected === 2) ? (+record?.detailUnitPrice - (isNoTaxableOperation ? record?.detailUnitPriceIva : 0) - record?.detailUnitPriceFovial - record?.detailUnitPriceCotrans) : record.detailUnitPriceWithoutTax)).toFixed(4)}` || ''}
      </p>,
    },
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Exento'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
        {`$${Number(isNoTaxableOperation ? ((documentTypeSelected === 1 || documentTypeSelected === 2) ? (+record?.detailTaxableTotal - +record?.detailSubTotalIva - +record?.detailSubTotalFovial - +record?.detailSubTotalCotrans) : +record?.detailTaxableWithoutTaxesTotal) : +record?.detailNoTaxableTotal).toFixed(4)}`}
      </p>,
    },
    {
      title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Gravado'}</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
        {`$${Number(isNoTaxableOperation ? +record?.detailNoTaxableTotal : (documentTypeSelected === 1 || documentTypeSelected === 2) ? (+record?.detailTaxableTotal - +record?.detailSubTotalFovial - +record?.detailSubTotalCotrans) : +record?.detailTaxableWithoutTaxesTotal).toFixed(4)}`}
      </p>,
    },
    // columnMoneyDef({title: 'IVA', dataKey: 'detailSubTotalIva', showDefaultString: true, precision: 4 }),
    // columnMoneyDef({title: 'Fovial', dataKey: 'detailSubTotalFovial', showDefaultString: true, precision: 4 }),
    // columnMoneyDef({title: 'Cotrans', dataKey: 'detailSubTotalCotrans', showDefaultString: true, precision: 4 }),
    // columnMoneyDef({title: 'IVATax', dataKey: 'detailUnitPriceIva', showDefaultString: true, precision: 4 }),
    // columnMoneyDef({title: 'FovialTax', dataKey: 'detailUnitPriceFovial', showDefaultString: true, precision: 4 }),
    // columnMoneyDef({title: 'CotransTax', dataKey: 'detailUnitPriceCotrans', showDefaultString: true, precision: 4 }),
    // {
    //   title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Exento'}</p>,
    //   dataIndex: 'id',
    //   key: 'id',
    //   align: 'right',
    //   render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
    //     {`$${Number(((documentTypeSelected === 1 || documentTypeSelected === 2) ? (+record?.detailUnitPrice - record?.detailUnitPriceIva) : record.detailUnitPriceNoTaxes)).toFixed(4)}` || ''}
    //   </p>,
    // },
    // columnMoneyDef({title: 'Exento', dataKey: isNoTaxableOperation ? ((documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailTaxableTotal' : 'detailTaxableWithoutTaxesTotal') : 'detailNoTaxableTotal', showDefaultString: true, precision: 4}),
    // columnMoneyDef({title: 'Gravado', dataKey: isNoTaxableOperation ? 'detailNoTaxableTotal' : (documentTypeSelected === 1 || documentTypeSelected === 2) ? 'detailTaxableTotal' : 'detailTaxableWithoutTaxesTotal', showDefaultString: true, precision: 4 }),
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

  function getPaymentMethodIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GCashMethodIcon width={size} />;
      case 2: return <GTransferMethodIcon width={size} />;
      case 3: return <GPaymentCheckMethodIcon width={size} />;
      case 4: return <GCardMethodIcon width={size} />;
      default: return <GAddFileIcon width={size} />;
    }
  }

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

  function customerReachCreditLimit() {
    return paymentTypeSelected === 2 && (
      (customerSelected !== 0 || customerSelected !== null)
      && (+customerPendingToPay !== null && +customerCreditLimit !== null)
      && ((+customerPendingToPay + +getDetailTotal()) >= +customerCreditLimit)
    );
  }

  return (
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
            paddingTop: '0px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundColor: '#e6f4ff',
            borderRadius: '5px'
          }}
        >
          {cashierInfoContainer}
          <Space wrap align='center'>
            <Button
              // type='primary'
              // disabled
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
                setCustomerComplementaryName('');
                setCustomerCreditLimit(null);
                setCustomerPendingToPay(null);
                loadDocumentInformation(e.target.value);
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
            <Button
              icon={<GRefreshIcon width={'16px'} />}
              onClick={(e) => {
                loadDocumentInformation(documentTypeSelected);
              }}
            />
          </Space>
          <p style={{ margin: '0px', fontSize: 9, color: 'gray' }}>{`Serie: ${docSerie || ''}`}</p>
          <Checkbox
            checked={isNoTaxableOperation}
            onChange={(e) => {
              setIsNoTaxableOperation(e.target.checked);
            }}
            // style={{ color: '#434343' }}
          >
            Operacion exenta
          </Checkbox>
        </Col>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          xl={{ span: 12 }}
          xxl={{ span: 12 }}
          style={{ display: (documentTypeSelected !== 0 && documentTypeSelected !== 1 && documentTypeSelected !== null) ? 'inline' : 'none'}}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Pago:'}</p>
          <Space wrap>
            <Radio.Group
              buttonStyle="solid"
              value={paymentTypeSelected}
              onChange={(e) => {
                setPaymentTypeSelected(e.target.value);
                setCustomerSelected(0);
                setCustomerComplementaryName('');
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
        <Col
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
              // setCustomerSelected(1);              
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
        </Col>
        <Col span={24} />
        <Col
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
        </Col>
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 6 }} xl={{ span: 6 }} xxl={{ span: 6 }}>
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
          style={{ display: (documentTypeSelected !== 0 && documentTypeSelected !== 1 && documentTypeSelected !== null) ? 'inline' : 'none'}}
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
            optionFilterProp='children'
            showSearch
            filterOption={false}
            onSearch={(value) => {
              setCustomerSearchFilter(value);
            }}
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (filterData(getCustomerByFilters(), customerSearchFilter, ['id', 'fullName', 'phone', 'dui', 'nit', 'nrc', 'address', 'businessName']) || []).map(
                (element, index) => (
                  <Option
                    key={element.id}
                    value={element.id}
                    style={{
                      border: '2px solid #d9d9d9',
                      borderRadius: 5,
                      margin: 5,
                      backgroundColor: index % 2 === 0 ? '#f0f5ff' : '#ffffff',
                      boxShadow: '3px 3px 5px 0px #d9d9d9'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: 0, fontSize: 16 }}>{element.fullName}</p>
                      <p style={{ margin: 0, fontSize: 12, fontStyle: 'italic' }}>{element.businessName}</p>
                      <p style={{ margin: 0, fontSize: 12 }}>{element.address}</p>
                      <p style={{ margin: 0, fontSize: 12 }}>{element.phone}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: '3px' }}>
                      <Tag icon={<ContactsOutlined />} color='#2f54eb'>{`DUI: ${element.dui || '-'}`}</Tag>
                      <Tag icon={<ContactsOutlined />} color='#1677ff'>{`NIT: ${element.nit || '-'}`}</Tag>
                      <Tag icon={<ContactsOutlined />} color='#722ed1'>{`NRC: ${element.nrc || '-'}`}</Tag>
                    </div>
                    {
                      paymentTypeSelected === 2 && element.applyForCredit === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: '3px' }}>
                          <p style={{ margin: 0, marginRight: 5 }}>{'Limite de crédito: '}</p>
                          
                          <Tag icon={<DollarCircleOutlined />} color={'red'}>{`${element.creditLimit || '-'}`}</Tag>
                          <p style={{ margin: 0, marginRight: 5 }}>{'Deuda actual: '}</p>
                          
                          <Tag icon={<DollarCircleOutlined />} color={'volcano'}>{`${element.pendingToPay || '-'}`}</Tag>
                        </div>
                      ) : <></>
                    }
                  </Option>
                )
              )
            }
          </Select>
          {
            customerSelected === 1 ? (<>
              <p style={{ margin: '3px 0px', fontSize: 12 }}>{'Nombre cliente:'}</p>
              <Input 
                id='g-new-sale-customer-complementary-name'
                style={{ width: '100%' }} 
                placeholder={'Juan Perez'}
                min={0}
                value={customerComplementaryName} 
                onChange={(e) => setCustomerComplementaryName(e.target.value)}
              />
            </>
            ) : <></>
          }
          {
            paymentTypeSelected === 2 ? (
              <Space wrap style={{ marginTop: '5px' }}>
                <p style={{ margin: 0, marginRight: 5 }}>{'Limite de crédito: '}</p>
                <Tag icon={<DollarCircleOutlined />} color={'red'}>{`${customerCreditLimit || ''}`}</Tag>
                <p style={{ margin: 0, marginRight: 5 }}>{'Deuda actual: '}</p>
                <Tag icon={<DollarCircleOutlined />} color={'volcano'}>{`${customerPendingToPay || ''}`}</Tag>
              </Space>
            ) : <></>
          }
        </Col>
        <Col
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
        </Col>
        <Col span={24} />
        <Col span={6} style={{ display: customerSelected !== 0 && customerSelected !== null ? 'inline' : 'none' }}>
          <p style={{ margin: '0px', fontSize: 12 }}>{'Buscar producto:'}</p>
          {
            (docDetails.length <= 18) ? <Search
              id={'newsale-product-search-input'}
              name={'filter'} 
              value={productSearchFilter} 
              placeholder="Código, Nombre, Cód. Barra"
              allowClear
              disabled={!(docDetails.length < 18)}
              style={{ width: '100%', marginBottom: 5 }}
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
        <Col span={6} />
        <Col span={12}>
          <p style={{ margin: '0px', fontSize: 12 }}>Notas:</p>
          <TextArea style={{ resize: 'none' }} rows={3} value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)}/>
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
            onRow={(record, index) => ({
              style: {
                background: record.detailIsAvailable ? 'inherit' : '#ffccc7',
                // color: record.isHeader === 1 && record.isFooter === 0 ? '#ffffff' : '#000000'
              }
            })}
            footer={() => {
              return(
                <Row gutter={[8, 4]}>
                  <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 16 }} lg={{ span: 18 }} xl={{ span: 18 }} xxl={{ span: 18 }}>
                    <div style={styleSheet.tableFooter.footerCotainer}>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`SON:`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`${numberToLetters(getDetailTotal() - (isNoTaxableOperation ? getDetailTotalTaxesById(1) : 0))}`}</p>
                      </div>
                      {
                        customerReachCreditLimit() ? (
                          <Alert
                            message="Requiere autorizacion superior cerrar esta venta"
                            description="La venta actual excede el limite de crédito disponible para este cliente"
                            type="warning"
                            showIcon
                          />
                        ) : <></>
                      }
                    </div>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 8 }} lg={{ span: 6 }} xl={{ span: 6 }} xxl={{ span: 6 }}>
                    <div style={styleSheet.tableFooter.footerCotainer}>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`GRAVADO`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>
                          {`$${isNoTaxableOperation ? `${getDetailNoTaxableTotal().toFixed(2)}` : ((documentTypeSelected === 1 || documentTypeSelected === 2) ? (getDetailTaxableTotal() - (getDetailTotalTaxesById(2) + getDetailTotalTaxesById(3))) : (getDetailTaxableTotal() - getDetailTotalTaxes())).toFixed(2)}`}
                        </p>
                      </div>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`EXENTO`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${isNoTaxableOperation ? ((documentTypeSelected === 1 || documentTypeSelected === 2) ? (getDetailTaxableTotal() - (getDetailTotalTaxesById(1) + getDetailTotalTaxesById(2) + getDetailTotalTaxesById(3))) : (getDetailTaxableTotal() - getDetailTotalTaxes())).toFixed(2) : getDetailNoTaxableTotal().toFixed(2)}`}</p>
                      </div>
                      {
                        isEmpty(taxesData) ? <></> : (
                          taxesData.map((element, index) => {
                            let dataValue = getDetailTotalTaxesById(element.id).toFixed(2);
                            return (
                              <div
                                key={index}
                                style={{
                                  ...styleSheet.tableFooter.detailContainer,
                                  display: includes([2, 3], element.id) ? 'flex' : !(documentTypeSelected === 1 || documentTypeSelected === 2) ? (isNoTaxableOperation) ? 'none' : 'flex' : 'none'
                                }}
                              >
                                <p style={styleSheet.tableFooter.detailLabels.normal}>{`${element.name}`}</p>
                                <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${dataValue}`}</p>
                              </div>
                            );
                          })
                        )
                      }
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`SUBTOTAL`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${(getDetailTaxableTotal() - (isNoTaxableOperation ? getDetailTotalTaxesById(1) : 0)).toFixed(2)}`}</p>
                      </div>
                      <div style={styleSheet.tableFooter.detailContainer}>
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
                      </div>
                      <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`VENTA TOTAL`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`$${(getDetailTotal() - (isNoTaxableOperation ? getDetailTotalTaxesById(1) : 0)).toFixed(2)}`}</p>
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
        distributionType={productDistributionType}
        priceScale={customersData.filter(x => x.id === customerSelected)[0]?.defPriceIndex || 1}
        productFilterSearch={productSearchFilter}
        allowOutOfStock={true}
        isNoTaxableOperation={isNoTaxableOperation}
        onClose={(saleDetailToPush, executePush, currentStock) => { 
          setOpenProductSearchForSale(false);
          // const { detailId, detailName, detailQuantity, detailIsService } = saleDetailToPush;
          // const currentDetailQuantity = getQuantitySumProductDetail(detailId);
          if (executePush) {
            // if (!(currentStock < (currentDetailQuantity + detailQuantity)) || detailIsService) {
              pushDetail(saleDetailToPush);
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
            createNewSale(userPINCode);
          }
          setOpenAuthUserPINCode(false);
        }}
      />
      <AuthorizeAction
        open={openAuthCreditLimitReached}
        allowedRoles={[1, 2]}
        title={`Autorizar crédito`}
        confirmButtonText={'Confirmar'}
        actionType={`Autorizar credito con limite excedido para nueva Venta`}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId, roleId } = userAuthorizer;
            // setOpenAuthUserPINCode(true);
            createNewSale('28351');
          } else {
            setFetching(false);
          }
          setOpenAuthCreditLimitReached(false);
        }}
      />
      <NewSaleCashExchange
        open={openCashExchangeForm}
        amountToExchange={cashAmountToExchange}
        onClose={() => {
          setOpenCashExchangeForm(false);
          if (
            !!document.getElementById('newsale-product-search-input')
          ) {
            document.getElementById('newsale-product-search-input').focus();
            document.getElementById('newsale-product-search-input').select();
          }
        }}
      />
      <Drawer
        title={
          paymentMethodSelected === 2 ? 'Informacion de transferencia' :
            paymentMethodSelected === 3 ? 'Informacion de cheque' : ''
        }
        placement="right"
        onClose={() => {
          setOpenPaymentAdditionalInfoDrawer(false);
          setPaymentMethodSelected(1);
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
      </Drawer>
    </Wrapper>
  );
}

export default StoreModule;
