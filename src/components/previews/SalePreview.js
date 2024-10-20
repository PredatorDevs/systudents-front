import React, { useState, useEffect, useRef } from 'react';
import {
  Col,
  Row,
  Button,
  PageHeader,
  Modal,
  Descriptions,
  Table,
  Tag,
  Result,
  Dropdown,
  Space,
  Spin
} from 'antd';
import {
  CloseOutlined,
  DeleteTwoTone,
  FilePdfTwoTone,
  MailTwoTone,
  FireTwoTone,
  SettingOutlined,
  UpSquareTwoTone,
  BulbTwoTone,
  PrinterTwoTone
} from '@ant-design/icons';
import { isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';
import ReactToPrint from 'react-to-print';

import salesServices from '../../services/SalesServices.js';
import { columnDef } from '../../utils/ColumnsDefinitions.js';
import AuthorizeAction from '../confirmations/AuthorizeAction.js';
import generalsServices from '../../services/GeneralsServices.js';
import { customNot } from '../../utils/Notifications.js';
import dteServices from '../../services/DteServices.js';
import QRCode from 'qrcode.react';
import download from 'downloadjs';
import { printerServices } from '../../services/PrintersServices.js';
import { numberToLetters } from '../../utils/NumberToLetters.js';
import { dteSettings } from '../../settings/dtesettings.js';

function SalePreview(props) {
  const [fetching, setFetching] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [wasVoided, setWasVoided] = useState(false);
  const [openVoidConfirmation, setOpenVoidConfirmation] = useState(false);

  const [taxesData, setTaxesData] = useState([]);

  const { open, saleId, allowActions = true, onClose } = props;

  const ticketComponentRef = useRef();
  const cfComponentRef = useRef();
  const ccfComponentRef = useRef();

  async function loadData() {
    setFetching(true);
    try {
      const saleRes = await salesServices.findById(saleId);
      setEntityData(saleRes.data);
      const saleDetRes = await salesServices.details.findBySaleId(saleId);
      setEntityDetailData(saleDetRes.data);
      const taxesResponse = await generalsServices.findTaxes();
      setTaxesData(taxesResponse.data);
    } catch (error) {

    }
    setFetching(false);
  }

  function paymentStatusColor(status) {
    switch(status) {
      case 1: return 'green';
      case 2: return 'orange';
      case 3: return 'red';
      default: return 'gray';
    }
  }

  useEffect(() => {
    loadData();
  }, [ saleId ]);
  
  const {
    cashierId,
    controlNumber,
    cotransTaxAmount,
    createdBy,
    createdByFullname,
    currencyType,
    customerAddress,
    customerBusinessLine,
    customerCityMhCode,
    customerCityName,
    customerCode,
    customerDefPhoneNumber,
    customerDepartmentMhCode,
    customerDepartmentName,
    customerDui,
    customerEconomicActivityCode,
    customerEconomicActivityName,
    customerEmail,
    customerFullname,
    customerId,
    customerNit,
    customerNrc,
    customerOccupation,
    docDate,
    docDatetime,
    docDatetimeFormatted,
    docDatetimeLabel,
    docNumber,
    docTime,
    documentTypeId,
    documentTypeName,
    dteTransmitionStatus,
    dteTransmitionStatusName,
    dteType,
    establishmentType,
    estCodeInternal,
    estCodeMH,
    expirationDays,
    expirationInformation,
    expired,
    expiresIn,
    fovialTaxAmount,
    generationCode,
    id: currentSaleId,
    isNoTaxableOperation,
    isVoided,
    IVAperception,
    IVAretention,
    ivaTaxAmount,
    locationAddress,
    locationCityMhCode,
    locationCityName,
    locationDepartmentMhCode,
    locationDepartmentName,
    locationEmail,
    locationId,
    locationName,
    locationPhone,
    noTaxableSubTotal,
    ownerActivityCode,
    ownerActivityDescription,
    ownerName,
    ownerNit,
    ownerNrc,
    ownerTradename,
    paymentStatus,
    paymentStatusName,
    paymentTypeId,
    paymentTypeName,
    posCodeInternal,
    posCodeMH,
    receptionStamp,
    saleTotalPaid,
    serie,
    shiftcutId,
    taxableSubTotal,
    taxableSubTotalWithoutTaxes,
    total,
    totalInLetters,
    totalTaxes,
    transmissionModel,
    transmissionModelName,
    transmissionType,
    transmissionTypeName,
    userPINCodeFullName,
    voidedByFullname,
    notes
  } = entityData[0] || [];

  async function voidSale(userId) {
    setFetching(true);
    try {
      // await salesServices.voidSale(userId, saleId);
      if (documentTypeId === 2) {
        customNot('info', '', 'Iniciando anulación de Factura');
        await dteServices.voidCF(saleId, userId);
      }

      if (documentTypeId === 3) {
        customNot('info', '', 'Iniciando anulación de Comprobante de Crédito Fiscal');
        await dteServices.voidCCF(saleId, userId);
      }
      setWasVoided(true);
    } catch(error) {
      console.log(error);
    }
    customNot('info', 'Actualizando información de venta...', '');
    const saleRes = await salesServices.findById(saleId);
    setEntityData(saleRes.data);
    const saleDetRes = await salesServices.details.findBySaleId(saleId);
    setEntityDetailData(saleDetRes.data);
    setFetching(false);
  }

  // async function rePrintSale() {
  //   setFetching(true);
  //   try {
  //     if (documentTypeId === 2) {
  //       customNot('info', '', 'Reimprimiendo Factura');
  //       await printerServices.printCF(
  //         {
  //           customerFullname: `${customerFullname || '-'}`,
  //           documentDatetime: `${moment(isEmpty(entityData[0]) ? '1999-01-01' : docDatetime).format('L') || '-'}`,
  //           customerAddress: `${customerAddress || '-'}`,
  //           customerDui: `${customerDui || '-'}`,
  //           customerNit: `${customerNit || '-'}`,
  //           customerPhone: `${customerDefPhoneNumber || '-'}`,
  //           totalSale: total || 0,
  //           totalToLetters: `${numberToLetters(total)}`
  //         },
  //         entityDetailData
  //       );
  //     }

  //     if (documentTypeId === 3) {
  //       customNot('info', '', 'Reimprimiendo Comprobante de Crédito Fiscal');
  //       await printerServices.printCCF(
  //         {
  //           customerFullname: `${customerFullname || '-'}`,
  //           documentDatetime: `${moment(isEmpty(entityData[0]) ? '1999-01-01' : docDatetime).format('L') || '-'}`,
  //           customerAddress: `${customerAddress || '-'}`,
  //           customerState: `${'' || '-'}`,
  //           customerNit: `${customerNit || '-'}`,
  //           customerNrc: `${customerNrc || '-'}`,
  //           customerBusinessType: `${customerBusinessLine || '-'}`,
  //           customerOccupation: `${customerOccupation || '-'}`,
  //           customerDepartmentName: `${customerDepartmentName || '-'}`,
  //           customerCityName: `${customerCityName || '-'}`,
  //           paymentTypeName: `${paymentTypeName || '-'}`,
  //           taxableSale: taxableSubTotal || 0,
  //           taxableSaleWithoutTaxes: taxableSubTotalWithoutTaxes || 0,
  //           noTaxableSale: noTaxableSubTotal || 0,
  //           totalTaxes: totalTaxes || 0,
  //           totalSale: total || 0,
  //           totalToLetters: `${numberToLetters(total)}`
  //         },
  //         entityDetailData
  //       );
  //     }
  //   } catch(error) {

  //   }

  //   setFetching(false);
  // }

  async function reprintDteInvoice() {
    setFetching(true);
    try {
      await printerServices.printDteVoucher(entityData[0], entityDetailData);
    } catch(error) {

    }
    setFetching(false);
  }

  // function getDetailTotalTaxesById(taxId) {
  //   let totalTaxes = 0;
  //   let amountToTax = 0;

  //   forEach(entityDetailData, (saleDetail) => {
  //     amountToTax = (saleDetail.quantity * saleDetail.unitPrice);

  //     forEach(saleDetail.taxesData, (taxDetail) => {
  //       if (taxDetail.isPercentage === 0) {
  //         amountToTax -= (saleDetail.quantity * +taxDetail.taxRate);
  //       }
  //     });

  //     forEach(saleDetail.taxesData, (taxDetail) => {
  //       if (taxId === taxDetail.taxId) {
  //         if (taxDetail.isPercentage === 1) {
  //           totalTaxes += ((amountToTax / (1 + +taxDetail.taxRate)) * +taxDetail.taxRate);
  //         } else {
  //           totalTaxes += (saleDetail.quantity * +taxDetail.taxRate);
  //         }
  //       }
  //     });
  //   });

  //   return totalTaxes || 0;
  // }

  return (
    <Modal
      title={
        <PageHeader
          onBack={() => null}
          backIcon={null}
          title={`${`${documentTypeName || '-'} #${docNumber || ''}`}`}
          subTitle={`${serie || '-'}`}
          style={{ padding: 0 }}
          extra={[
            <Dropdown
              menu={{
                items: [
                  {
                    label: 'Refrescar',
                    key: '1',
                    disabled: !allowActions || fetching,
                    icon: <FireTwoTone twoToneColor={'#722ed1'} />,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      loadData();
                    }
                  },
                  {
                    label: 'Imprimir Ticket DTE',
                    key: '2',
                    disabled: !allowActions || dteTransmitionStatus === 1 || dteTransmitionStatus === 3 || dteTransmitionStatus === 5 || fetching,
                    icon: <PrinterTwoTone twoToneColor={'#13c2c2'} />,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      reprintDteInvoice();
                    }
                  },
                  {
                    label: 'Consultar DTE',
                    key: '7',
                    disabled: !allowActions || dteTransmitionStatus !== 1 || fetching,
                    icon: <BulbTwoTone twoToneColor={'#fadb14'} />,
                    onClick: async (e) => {
                      e.domEvent.stopPropagation();
                      setWasVoided(true);
                      setFetching(true);
                      try {
                        customNot('info', 'Consultado estado de DTE...', '');
                        await dteServices.check(currentSaleId);
                        customNot('info', 'Actualizando información de venta...', '');
                        const saleRes = await salesServices.findById(saleId);
                        setEntityData(saleRes.data);
                        const saleDetRes = await salesServices.details.findBySaleId(saleId);
                        setEntityDetailData(saleDetRes.data);
                      } catch(error) {
                        console.log(error);
                      }
                      setFetching(false);
                    }
                  },
                  {
                    label: 'Retransmitir DTE',
                    key: '3',
                    disabled: !allowActions || dteTransmitionStatus !== 1 || fetching,
                    icon: <UpSquareTwoTone />,
                    onClick: async (e) => {
                      e.domEvent.stopPropagation();
                      setWasVoided(true);
                      setFetching(true);
                      // try {
                        // customNot('info', 'Consultado estado de DTE...', '');
                        // await dteServices.check(currentSaleId);
                      // } catch(error) {
                        try {
                          if (documentTypeId === 2) {
                            customNot('info', 'Iniciando retransmisión de DTE...', '');
                            await dteServices.signCF(currentSaleId);
                            customNot('info', '', 'Enviando DTE CF al email del cliente');
                            await dteServices.sendEmailCF(currentSaleId);
                          } else if (documentTypeId === 3) {
                            customNot('info', 'Iniciando retransmisión de DTE...', '');
                            await dteServices.signCCF(currentSaleId);
                            customNot('info', '', 'Enviando DTE CCF al email del cliente');
                            await dteServices.sendEmailCCF(currentSaleId);
                          } else {
                            customNot('warning', 'No es posible determinar tipo DTE a retransmitir', '');
                          }
                        } catch (error2) {
                          console.log(error2);
                        }
                        // console.log(error);
                      // }
                      customNot('info', 'Actualizando información de venta...', '');
                      const saleRes = await salesServices.findById(saleId);
                      setEntityData(saleRes.data);
                      const saleDetRes = await salesServices.details.findBySaleId(saleId);
                      setEntityDetailData(saleDetRes.data);
                      setFetching(false);
                    }
                  },
                  {
                    label: 'Descargar PDF',
                    key: '4',
                    disabled: !allowActions,
                    icon: <FilePdfTwoTone twoToneColor={'#f5222d'} />,
                    onClick: async (e) => {
                      e.domEvent.stopPropagation();
                      setFetching(true);
                      try {
                        if (documentTypeId === 2) {
                          customNot('info', 'Descargando PDF del DTE...', '');
                          const downloadPDFRes = await dteServices.getCFPDF(currentSaleId);
                          download(downloadPDFRes.data, `${controlNumber || 'DTE'}.pdf`);
                          customNot('success', 'PDF del DTE descargado', 'Acción terminada');
                        } else if (documentTypeId === 3) {
                          customNot('info', 'Descargando PDF del DTE...', '');
                          const downloadPDFRes = await dteServices.getCCFPDF(currentSaleId);
                          download(downloadPDFRes.data, `${controlNumber || 'DTE'}.pdf`);
                          customNot('success', 'PDF del DTE descargado', 'Acción terminada');
                        } else {
                          customNot('warning', 'No es posible determinar tipo DTE para generar PDF', '');
                        }
                      } catch(error) {
                        console.log(error);
                      }
                      setFetching(false);
                    }
                  },
                  {
                    label: 'Reenviar Email',
                    key: '5',
                    disabled: !allowActions || dteTransmitionStatus === 1 || dteTransmitionStatus === 3 || dteTransmitionStatus === 5 || fetching,
                    icon: <MailTwoTone twoToneColor={'#13c2c2'} />,
                    onClick: async (e) => {
                      e.domEvent.stopPropagation();
                      setFetching(true);
                      try {
                        // console.log(documentTypeId);
                        if (documentTypeId === 2) {
                          customNot('info', '', 'Enviando DTE CF al email del cliente');
                          await dteServices.sendEmailCF(currentSaleId);
                        } if (documentTypeId === 3) {
                          customNot('info', '', 'Enviando DTE CCF al email del cliente');
                          await dteServices.sendEmailCCF(currentSaleId);
                        }
                      } catch(error) {
                        console.log(error);
                      }
                      setFetching(false);
                    }
                  },
                  {
                    label: 'Anular',
                    key: '6',
                    disabled: !allowActions || !!isVoided || dteTransmitionStatus === 1 || dteTransmitionStatus === 3 || fetching,
                    icon: <DeleteTwoTone twoToneColor={'#f5222d'} />,
                    onClick: async (e) => {
                      e.domEvent.stopPropagation();
                      setOpenVoidConfirmation(true);
                    }
                  },
                ]
              }}
              placement="bottomRight"
            >
              <Button loading={fetching} icon={<SettingOutlined />} onClick={(e) => {e.stopPropagation()}}>Opciones</Button>
            </Dropdown>,
            <Button
              type="primary"
              danger
              icon={<CloseOutlined />}
              loading={fetching}
              onClick={() => {
                onClose(wasVoided);
              }}
            />
          ]}
        />
      }
      centered
      bodyStyle={{ padding: 15 }}
      width={700}
      closeIcon={<></>}
      onCancel={() => onClose(wasVoided)}
      maskClosable={false}
      open={open}
      footer={null}
    >
      {
        isEmpty(entityData) || isEmpty(entityDetailData) || fetching ? 
          <Result
            status={fetching ? "info" : "warning"}
            title={<p style={{ color: fetching ? '#1677ff' : '#faad14' }}>{fetching ? 'Obteniendo informacion de venta...' : 'No se pudo obtener información de esta venta'}</p>}
            extra={[
              <Space direction='vertical' >
                {fetching ? <Spin /> : <></>},
                <Button
                  type="primary"
                  key="console"
                  onClick={() => {
                    onClose(wasVoided);
                  }}
                >
                  Cerrar
                </Button>
              </Space>
            ]}
          /> : <Row gutter={[8, 16]}>
          <Col span={24}>
            {
              isNoTaxableOperation === 1 ? (
                <>
                  <Tag color={'blue'}>
                    {`OPERACIÓN EXENTA`}
                  </Tag>
                </>
              ) : <></>
            }
          </Col>
          <Col span={24}>
            <Descriptions
              bordered
              labelStyle={{ fontSize: 10, padding: '0px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 12, padding: '0px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              style={{ width: '100%' }}
              size={'small'}
            >
              <Descriptions.Item label="Cod. Interno" span={2}>{currentSaleId || ''}</Descriptions.Item>
              <Descriptions.Item label="Cod. Cliente" span={1}>{`${customerId}`}</Descriptions.Item>
              <Descriptions.Item label="Fecha" span={3}>{moment(docDatetime).format('LL') || ''}</Descriptions.Item>
              <Descriptions.Item label="Cliente" span={3}>{`${customerFullname}` || ''}</Descriptions.Item>
              <Descriptions.Item label="Dirección" span={3}>{customerAddress || ''}</Descriptions.Item>
              {!(documentTypeId === 1 || documentTypeId === 2) ? <Descriptions.Item label="Departamento" span={1}>{customerDepartmentName || ''}</Descriptions.Item> : <></>}
              {!(documentTypeId === 1 || documentTypeId === 2) ? <Descriptions.Item label="Municipio" span={1}>{customerCityName || ''}</Descriptions.Item> : <></>}
              {!(documentTypeId === 1 || documentTypeId === 2) ? <Descriptions.Item label="Giro" span={1}>{customerBusinessLine || ''}</Descriptions.Item> : <></>}
              <Descriptions.Item label="DUI" span={1}>{customerDui || ''}</Descriptions.Item>
              <Descriptions.Item label="NIT" span={1}>{customerNit || ''}</Descriptions.Item>
              <Descriptions.Item label="Correo" span={3}>{customerEmail || ''}</Descriptions.Item>
              {!(documentTypeId === 1 || documentTypeId === 2) ? <Descriptions.Item label="NRC" span={1}>{customerNrc || ''}</Descriptions.Item> : <></>}
              <Descriptions.Item label="Pago" span={2}>{paymentTypeName || ''}</Descriptions.Item>
              <Descriptions.Item label="Estado" span={1}>
                <Tag color={paymentStatusColor(paymentStatus)}>{paymentStatusName || ''}</Tag>
              </Descriptions.Item>
              {
                paymentStatus !== 1 && paymentTypeId === 2 ? (
                  <>
                    <Descriptions.Item label="Plazo" span={1}>
                      {`${expirationDays} días` || ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vencimiento" span={1}>
                      {`${expirationInformation}` || ''}
                    </Descriptions.Item>
                  </>
                ) : <></>
              }
              <Descriptions.Item label="Notas" span={3}>{notes || 'Sin notas'}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={24}>
            <Table
              bordered
              size='small'
              columns={[
                columnDef({ title: 'Cantidad', dataKey: 'quantity', fSize: 11 }),
                columnDef({title: 'Descripcion', dataKey: 'productName', fSize: 11}),
                // columnMoneyDef({
                //   title: 'Precio Unitario',
                //   dataKey: 'unitPriceNoTaxes',
                //   showDefaultString: true,
                //   fSize: 11
                // }),
                {
                  title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Precio Unitario'}</p>,
                  dataIndex: 'saleDetailId',
                  key: 'saleDetailId',
                  align: 'right',
                  render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
                    {`$${Number((+record?.unitPrice - (+record?.unitPriceFovial + +record?.unitPriceCotrans + (isNoTaxableOperation ? +record?.unitPriceIva : 0)))).toFixed(4)}`}
                  </p>,
                },
                // columnMoneyDef({title: 'Exento', dataKey: 'noTaxableSubTotal', showDefaultString: true, fSize: 11}),
                // columnMoneyDef({
                //   title: 'Gravado',
                //   fSize: 11,
                //   dataKey: (documentTypeId === 1 || documentTypeId === 2) ? 'taxableSubTotal' : 'taxableSubTotalWithoutTaxes', showDefaultString: true
                // }),
                {
                  title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Exento'}</p>,
                  dataIndex: 'saleDetailId',
                  key: 'saleDetailId',
                  align: 'right',
                  render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
                    {`$${Number(isNoTaxableOperation === 1 ? (+record?.noTaxableSubTotal - +record?.ivaTaxAmount - +record?.fovialTaxAmount - +record?.cotransTaxAmount) : (0)).toFixed(4)}` || ''}
                  </p>,
                },
                {
                  title: <p style={{ margin: '0px', fontSize: 11, fontWeight: 600 }}>{'Gravado'}</p>,
                  dataIndex: 'saleDetailId',
                  key: 'saleDetailId',
                  align: 'right',
                  render: (text, record, index) => <p style={{ margin: '0px', fontSize: 11 }}>
                    {`$${Number(isNoTaxableOperation === 0 ? (+record?.taxableSubTotal - ((documentTypeId === 1 || documentTypeId === 2) ? 0 : +record?.ivaTaxAmount) - +record?.fovialTaxAmount - +record?.cotransTaxAmount) : (0)).toFixed(4)}` || ''}
                  </p>,
                },
              ]}
              rowKey={'saleDetailId'}
              dataSource={[
                ...entityDetailData,
              ] || []}
              pagination={false}
              loading={fetching}
            />
          </Col>
          <Col span={12}>
            <Descriptions
              bordered
              style={{ width: '100%' }}
              labelStyle={{ fontSize: 10, padding: '0px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 12, padding: '0px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              size={'small'}
            >
              <Descriptions.Item label="SON" span={3}>
                {`${totalInLetters}`}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              bordered
              style={{ width: '100%' }}
              labelStyle={{ fontSize: 10, padding: '0px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf', textAlign: 'right' }}
              contentStyle={{ fontSize: 12, padding: '0px 5px', margin: 0, border: '1px solid #bfbfbf', textAlign: 'right' }}
              size={'small'}
            >
              <Descriptions.Item label="GRAVADO" span={3}>
                {`$${
                  Number(isNoTaxableOperation ? 0 : taxableSubTotal - ((+fovialTaxAmount + +cotransTaxAmount + ((documentTypeId === 1 || documentTypeId === 2) ? 0 : +ivaTaxAmount)) || 0)).toFixed(2)
                }`}
              </Descriptions.Item>
              <Descriptions.Item label="EXENTO" span={3}>
                {`$${Number(isNoTaxableOperation ? taxableSubTotalWithoutTaxes : 0).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="SUMA TOTAL DE OPERACIONES" span={3}>
                {`$${Number(isNoTaxableOperation ? taxableSubTotalWithoutTaxes : taxableSubTotal - ((+fovialTaxAmount + +cotransTaxAmount + ((documentTypeId === 1 || documentTypeId === 2) ? 0 : +ivaTaxAmount)))).toFixed(2)}`}
              </Descriptions.Item>
              {
                !(documentTypeId === 1 || documentTypeId === 2) ?
                  <Descriptions.Item label="IVA" span={3}>
                    {`$${Number(isNoTaxableOperation ? 0 : ivaTaxAmount).toFixed(2)}`}
                  </Descriptions.Item>
                : <></>
              }
              <Descriptions.Item label="SUBTOTAL" span={3}>
                {`$${Number(isNoTaxableOperation ? taxableSubTotalWithoutTaxes : taxableSubTotal - ((+fovialTaxAmount + +cotransTaxAmount))).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="IVA PERCIBIDO (1%)" span={3}>
                {`$${Number(IVAperception).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="IVA RETENIDO (1%)" span={3}>
                {`$${Number(IVAretention).toFixed(2)}`}
              </Descriptions.Item>
              {
                (+fovialTaxAmount !== null && +fovialTaxAmount > 0) ?
                  <Descriptions.Item label="FOVIAL ($0.20/gal)" span={3}>
                    {`$${Number(fovialTaxAmount).toFixed(2)}`}
                  </Descriptions.Item>
                : <></>
              }
              {
                (+cotransTaxAmount !== null && +cotransTaxAmount > 0) ?
                  <Descriptions.Item label="COTRANS ($0.10/gal)" span={3}>
                    {`$${Number(cotransTaxAmount).toFixed(2)}`}
                  </Descriptions.Item>
                : <></>
              }
              <Descriptions.Item label="RETE. RENTA" span={3}>
                {`$${Number(0).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="MONTO TOTAL OPERACION" span={3}>
                {`$${Number(+total - (isNoTaxableOperation ? +ivaTaxAmount : 0) - +IVAretention + +IVAperception).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="OTROS MONTOS NO AFECTOS" span={3}>
                {`$${Number(0).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="TOTAL A PAGAR" span={3}>
                {`$${Number(+total - (isNoTaxableOperation ? +ivaTaxAmount : 0) - +IVAretention + +IVAperception).toFixed(2)}`}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={16}>
            <Descriptions
              bordered
              style={{ width: '100%' }}
              labelStyle={{ fontSize: 10, padding: '0px 5px', margin: 0, backgroundColor: '#f0f0f0', border: '1px solid #bfbfbf' }}
              contentStyle={{ fontSize: 12, padding: '0px 5px', margin: 0, border: '1px solid #bfbfbf' }}
              size={'small'}
            >
              <Descriptions.Item label="Vendedor:" span={3}>{userPINCodeFullName || ''}</Descriptions.Item>
              <Descriptions.Item label="Registrada por:" span={3}>{createdByFullname || ''}</Descriptions.Item>
              <Descriptions.Item label="Cod. Generacion:" span={3}>{generationCode || ''}</Descriptions.Item>
              <Descriptions.Item label="Num. Control" span={3}>{controlNumber || ''}</Descriptions.Item>
              <Descriptions.Item label="Estado Transmision" span={3}>{dteTransmitionStatusName || ''}</Descriptions.Item>
              <Descriptions.Item label="Tipo Transmision" span={3}>{transmissionTypeName || ''}</Descriptions.Item>
              <Descriptions.Item label="Modelo Transmision" span={3}>{transmissionModelName || ''}</Descriptions.Item>
              <Descriptions.Item label="Sello Recepcion" span={3}>{receptionStamp || ''}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={8} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <QRCode
              value={`https://admin.factura.gob.sv/consultaPublica?ambiente=${dteSettings.ambient}&codGen=${generationCode || ''}&fechaEmi=${moment(docDatetime).format('YYYY-MM-DD') || ''}`}
              size={128}
              level="H"
            />
            <a
              href={`https://admin.factura.gob.sv/consultaPublica?ambiente=${dteSettings.ambient}&codGen=${generationCode || ''}&fechaEmi=${moment(docDatetime).format('YYYY-MM-DD') || ''}`}
              target='_blank'
              rel="noreferrer"
              style={{
                color: '#1677ff', // Color del texto
                textDecoration: 'underline', // Subrayado
                fontWeight: 'bold', // Negrita
                fontSize: '16px', // Tamaño de fuente
              }}
            >
              Consultar DTE
            </a>
          </Col>
        </Row>
      }
      <AuthorizeAction
        open={openVoidConfirmation}
        allowedRoles={[1, 2]}
        title={`Anular Venta Cod Int #${saleId}`}
        confirmButtonText={'Confirmar anulación'}
        actionType={`Anular Venta - Cod Interno: ${saleId}`}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized && successAuth) {
            const { userId } = userAuthorizer;
            voidSale(userId);
            loadData();
          }
          setOpenVoidConfirmation(false);
        }}
      />
    </Modal>
  )
}

export default SalePreview;
