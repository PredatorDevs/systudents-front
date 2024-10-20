import React, { useState, useEffect } from 'react';
import {
  Input,
  Col,
  Row,
  Divider,
  Button,
  PageHeader,
  Modal,
  List,
  Avatar,
  Space,
  Tag,
  Tabs,
  InputNumber,
  Result
} from 'antd';
import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  InfoCircleTwoTone,
  InfoOutlined,
  SaveOutlined,
  TagsOutlined,
  UnlockOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { functionsIn, isEmpty } from 'lodash';

import productIcon from '../img/icons/product.png';

import { customNot } from '../utils/Notifications.js';

import productsServices from '../services/ProductsServices.js';
import { TabsContainer } from '../styled-components/TabsContainer.js';
import { validateNumberData, validateSelectedData, validateStringData } from '../utils/ValidateData.js';
import ProductPricePicker from './pickers/ProductPricePicker.js';
import SaleDetailModel from '../models/SaleDetail.js';
import { getUserLocation } from '../utils/LocalData.js';
import AuthorizeAction from './confirmations/AuthorizeAction.js';

const styleSheet = {
  labelStyle: {
    margin: '0px',
    color: '#434343'
  },
  titleStyle: {
    margin: '5px 5px 10px 0px',
    fontSize: '20px',
    color: '#434343'
  }
};

function ProductGasSearchForSale(props) {
  const [openPricesPreviewConfirmation, setOpenPricesPreviewConfirmation] = useState(false);

  const [fetching, setFetching] = useState(false);

  const [activeTab, setActiveTab] = useState('1');

  const [formProductFilterSearch, setFormProductFilterSearch] = useState('');

  const [disabledPriceEditInput, setDisabledPriceEditInput] = useState(true);
  const [openPricePicker, setOpenPricePicker] = useState(false);
  const [openUnlockManualPrice, setOpenUnlockManualPrice] = useState(false);

  const [productsData, setProductsData] = useState([]);

  const [selectedProductData, setSelectedProductData] = useState({});

  const [detailQuantity, setDetailQuantity] = useState(null);
  const [detailUnitPrice, setDetailUnitPrice] = useState(null);
  const [detailTotalToSale, setDetailTotalToSale] = useState(null);

  const { open, productFilterSearch, priceScale, allowOutOfStock, distributionType, onClose } = props;

  useEffect(() => {
    if (open) {
      console.log(productFilterSearch);
      loadProductData(productFilterSearch);
    }
  }, [ productFilterSearch, open ]);

  function loadProductData(filter) {
    if (validateStringData(filter)) {
      setFetching(true);
      productsServices.findByMultipleParams(getUserLocation(), filter, 0, distributionType)
      .then((response) => {
        setProductsData(response.data);
        if (response.data.length === 0) {
          document.getElementById('product-not-found-return-button').focus();
        }

        if (response.data.length === 1) {
          
          setSelectedProductData(response.data[0]);
  
          if (response.data[0]?.pricesData?.length !== undefined) {
            if (response.data[0]?.pricesData?.length >= priceScale) {
              setDetailUnitPrice(response.data[0]?.pricesData[priceScale - 1]?.price || 0);
            } else {
              setDetailUnitPrice(response.data[0]?.pricesData[response.data[0]?.pricesData?.length - 1]?.price || 0);
            }
          }
          setActiveTab('2');

          // document.getElementById('newsale-detail-quantity-input').focus();
        }

        setFetching(false);
      })
      .catch((error) => {
        // setProductsData(response.data);
        customNot('error', 'No se pudo obtener información de productos', '')
        setFetching(false);
      })
    }
  }

  function validateDetail() {
    const validSelectedDetail = !isEmpty(selectedProductData) && selectedProductData !== null;
    const validDetailQuantity = detailQuantity !== null && detailQuantity > 0;
    const validUnitPrice = isFinite(detailUnitPrice) && detailUnitPrice >= 0;
    const validPriceOverCost = (+detailUnitPrice >= +selectedProductData.productTotalCost);

    console.log("COSTO: ", +selectedProductData.productTotalCost);

    // const validDetailQuantityLimit = (docDetails.length <= 10);

    if (!validSelectedDetail) customNot('warning', 'Debe seleccionar un producto', 'Dato no válido');
    if (!validDetailQuantity) customNot('warning', 'Debe definir una cantidad válida', 'Dato no válido');
    if (!validUnitPrice) customNot('warning', 'Debe definir un precio válido', 'Dato no válido');
    if (!validPriceOverCost) customNot('warning', 'El precio de venta no debe ser menor al costo de compra', 'Dato no válido');

    // if (!validDetailQuantityLimit) customNot('warning', 'Límite de detalles de venta alcanzado', 'Actualmente el sistema solo permite diez o menos detalles por venta');

    return (
      validSelectedDetail
      && validDetailQuantity
      && validUnitPrice
      && validPriceOverCost
    );
  }

  function restoreState() {
    setActiveTab('1');
    setFormProductFilterSearch('');
    setProductsData([]);
    setSelectedProductData({});
    setDetailQuantity(null);
    setDetailUnitPrice(null);
    setDetailTotalToSale(null);
    setDisabledPriceEditInput(true);
  }

  return (
    <Modal
      centered
      width={700}
      closable={false}
      maskClosable={false}
      open={open}
      // bodyStyle={{ backgroundColor: '#353941', border: '1px solid #787B80' }}
      footer={null}
    >
      {
        isEmpty(productsData) ? (
          <Result
            status={fetching ? 'info' : "warning"}
            title={<p>{fetching ? 'Buscando coincidencias...' : 'No se encontró ningún producto'}</p>}
            extra={
              <Button
                id={'product-not-found-return-button'}
                type="primary"
                key="console"
                onClick={() => {
                  restoreState();
                  onClose({}, false);
                }}
              >
                Cerrar
              </Button>
            }
          />
        ) : (
          <>
            {/* <TabsContainer> */}
              <Tabs 
                tabPosition={'left'}
                tabBarStyle={{ backgroundColor: 'transparent' }}
                activeKey={activeTab}
              >
                <Tabs.TabPane tab="Buscar" key={'1'}>
                  <Row gutter={[12, 12]}>
                    <Col span={24} style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={styleSheet.titleStyle}>{'Búsqueda de producto'}</p>
                    </Col>
                    <Col span={24} style={{ display: 'flex', flexDirection: 'column' }}>
                      <List
                        style={{ backgroundColor: '#f5f5f5', borderRadius: 10, padding: 10 }}
                        size='small'
                        itemLayout="horizontal"
                        rowKey={'productId'}
                        dataSource={productsData || []}
                        renderItem={(item, index) => (
                          <List.Item
                            key={index}
                            // onClick={() => loadDetailData(item.customerId)}
                            style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#f5f5f5', borderRadius: 0 }}
                            onClick={() => {
                              setSelectedProductData(item);
                              if (item?.pricesData?.length !== undefined) {
                                if (item?.pricesData?.length >= priceScale) {
                                  setDetailUnitPrice(item?.pricesData[priceScale - 1]?.price || 0);
                                } else {
                                  setDetailUnitPrice(item?.pricesData[item?.pricesData?.length - 1]?.price || 0);
                                }
                              } else {
                                setDetailUnitPrice(item.defaultPrice || 0);
                              }
                              setActiveTab('2');
                              setTimeout(() => {
                                document.getElementById('newsale-detail-quantity-input').focus();
                              }, "500");
                            }}
                            extra={[
                              <Button
                                type={'primary'}
                                onClick={() => {
                                  setSelectedProductData(item);
                                  setDetailUnitPrice(item.defaultPrice || 0);
                                  setActiveTab('2');
                                  setTimeout(() => {
                                    document.getElementById('newsale-detail-quantity-input').focus();
                                  }, "500");
                                }}
                              >
                                Seleccionar
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar 
                                  src={productIcon} 
                                />
                              }
                              title={
                                <p 
                                  style={{ margin: 0, color: '#434343' }}
                                >
                                  {`${item.productName}`}
                                </p>
                              }
                              description={
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <Space wrap>
                                    <Tag color='blue' icon={<BarcodeOutlined />}>{`${item.productBarcode}`}</Tag>
                                    <Tag color='green' icon={<DollarOutlined />}>{`${item.defaultPrice}`}</Tag>
                                    {/* <Tag color='geekblue' icon={<DollarOutlined />}>{`${item.productTotalCost}`}</Tag> */}
                                    {
                                      item.productIsService ? <Tag color='geekblue' icon={<InfoCircleTwoTone />}>{`Servicio`}</Tag> : <></>
                                    }
                                  </Space>
                                  <p style={{ margin: 0, fontSize: 12 }}>{`${item.currentStock} existencias`}</p>
                                  {/* <p style={{ margin: 0, fontSize: 12 }}>{`Cód Barr. ${item.productBarcode}`}</p> */}
                                </div>
                                
                              }
                            />
                          </List.Item>
                        )}
                        pagination
                      />
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Detalle" key={'2'}>
                  <Row gutter={[12, 12]}>
                    <Col span={24} style={{ display: 'flex', flexDirection: 'column' }}>
                      <Space>
                      <p
                        style={{
                          color: '#434343',
                          backgroundColor: '#f5f5f5',
                          textAlign: 'left',
                          padding: '5px',
                          margin: 0,
                          borderRadius: 10,
                          fontSize: 16
                        }}
                      >
                        {selectedProductData.productName}
                      </p>
                      {
                        selectedProductData.productIsService ? <Tag color='blue'>{`Servicio`}</Tag> : <></>
                      }
                      <p style={{ margin: 0, fontSize: 12 }}>{`${selectedProductData.currentStock} existencias`}</p>
                      </Space>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={styleSheet.labelStyle}>Total a vender:</p>
                      <InputNumber
                        id={'newsale-detail-quantity-input'}
                        style={{ width: '100%' }}
                        size={'large'}
                        placeholder={'123'} 
                        value={detailTotalToSale}
                        onChange={(value) => {
                          setDetailTotalToSale(value);

                          setDetailQuantity(Number(value / detailUnitPrice).toFixed(4));
                        }}
                        type={'number'}
                        onKeyDown={
                          (e) => {
                            if (e.key === 'Enter')
                            document.getElementById('newsale-detail-unit-price-input').select();
                            // document.getElementById('newsale-detail-unit-price-input').focus();
                          }
                        }
                      />
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={styleSheet.labelStyle}>Cantidad:</p>
                      <InputNumber
                        id={'newsale-detail-quantity-input'}
                        style={{ width: '100%' }}
                        size={'large'}
                        placeholder={'123'} 
                        value={detailQuantity}
                        // disabled
                        precision={4}
                        onChange={(value) => {
                          setDetailQuantity(value);

                          setDetailTotalToSale(Number(value * detailUnitPrice).toFixed(4))
                        }}
                        type={'number'}
                        onKeyDown={
                          (e) => {
                            if (e.key === 'Enter')
                            document.getElementById('newsale-detail-unit-price-input').select();
                            // document.getElementById('newsale-detail-unit-price-input').focus();
                          }
                        }
                      />
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={styleSheet.labelStyle}>Precio:</p>
                      <InputNumber 
                        id={'newsale-detail-unit-price-input'}
                        style={{ width: '100%' }} 
                        size={'large'}
                        addonBefore='$'
                        placeholder={'1.25'}
                        disabled
                        // disabled={disabledPriceEditInput}
                        value={detailUnitPrice} 
                        onChange={(value) => setDetailUnitPrice(value)}
                        type={'number'}
                        onKeyDown={
                          (e) => {
                            if (e.key === 'Enter')
                            document.getElementById('new-sale-add-detail-button').click();
                          }
                        }
                      />
                      <p style={{ margin: 0, fontSize: 11, color: '#10239e' }}>
                        {`Precio aplicado automáticamente según escala: ${priceScale}`}
                      </p>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      <Button
                        style={{ width: '100%' }}
                        // type={'primary'}
                        onClick={() => {
                          // setOpenPricesPreviewConfirmation(true);
                          setOpenPricePicker(true);
                        }}
                        icon={<DollarOutlined />}
                      >
                        Ver precios disponibles
                      </Button>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                      <Button
                        style={{ width: '100%' }}
                        // type={'primary'}
                        onClick={() => {
                          // setOpenPricesPreviewConfirmation(true);
                          setOpenUnlockManualPrice(true);
                        }}
                        disabled={true}
                        icon={<UnlockOutlined />}
                      >
                        Habilitar precio manual
                      </Button>
                    </Col>
                    <Col span={24}>
                      <Button
                        style={{ width: '100%' }}
                        onClick={() => {
                          setActiveTab('1');
                          setSelectedProductData({});
                          setDetailQuantity(null);
                          setDetailUnitPrice(null);
                        }}
                        icon={<ArrowLeftOutlined />}
                      >
                        Seleccionar otro producto
                      </Button>
                    </Col>
                  </Row>
                </Tabs.TabPane>
              </Tabs>
            {/* </TabsContainer> */}
            <Divider />
            <div 
              style={{
                width: '100%',
                backgroundColor: '#f5f5f5',
                borderRadius: 5,
                padding: 10
              }}
            >
              <Row gutter={[12, 12]}>
                <Col span={24}>
                  <p style={styleSheet.labelStyle}>Resumen</p>
                </Col>
                <Col span={12}>
                  {/* <p style={styleSheet.labelStyle}>{`Id: ${selectedProductData.productId}`}</p> */}
                  <p style={styleSheet.labelStyle}>{selectedProductData.productName}</p>
                  <p style={styleSheet.labelStyle}>{`${detailQuantity || 0} x $${detailUnitPrice || 0}`}</p>
                </Col>
                <Col span={12}>
                  <p style={styleSheet.labelStyle}>{`$${((detailQuantity || 0) * (detailUnitPrice || 0)).toFixed(2)}`}</p>
                </Col>
              </Row>
            </div>
            <Divider />
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Button 
                  danger
                  type={'primary'}
                  size={'large'}
                  icon={<CloseOutlined />}
                  onClick={(e) => {
                    restoreState();
                    onClose({}, false);
                  }}
                  style={{ width: '100%' }} 
                >
                  Cancelar
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  id={'new-sale-add-detail-button'}
                  type={'primary'} 
                  size={'large'}
                  icon={<SaveOutlined />} 
                  onClick={(e) => {
                    // formAction();
                    if (!!!selectedProductData.productIsService) {
                      if (!allowOutOfStock) {
                        if (selectedProductData.currentStock < detailQuantity || selectedProductData.productIsService) {
                          customNot('error', `No hay suficientes existencias para añadir ${selectedProductData.productName}`, 'Consulte con su administrador')
                          return;
                        }
                      }
                    }
                    
                    if (validateDetail()) {
                      const detailToAdd = new SaleDetailModel(
                        selectedProductData.productId,
                        selectedProductData.productName,
                        selectedProductData.isTaxable,
                        +detailQuantity || 0,
                        +detailUnitPrice || 0,
                        selectedProductData.taxesData,
                        selectedProductData.productIsService
                      );

                      restoreState();

                      onClose(detailToAdd, true, selectedProductData.currentStock);
                    }
                  }}
                  style={{ width: '100%' }} 
                  loading={fetching}
                  disabled={fetching}
                >
                  Añadir
                </Button>
              </Col>
            </Row>
          </>
        )
      }
      <ProductPricePicker
        open={openPricePicker}
        productId={selectedProductData.productId || 0}
        onClose={() => setOpenPricePicker(false)}
        onSelect={(value) => setDetailUnitPrice(+value)}
      />
      <AuthorizeAction
        open={openPricesPreviewConfirmation}
        allowedRoles={[1, 2]}
        title={`Mostrar otros precios`}
        confirmButtonText={'Confirmar ver ventana de precios'}
        actionType={'Mostrar selector de precios de un producto para Venta'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId } = userAuthorizer;
            setOpenPricePicker(true);
          }
          setOpenPricesPreviewConfirmation(false);
        }}
      />
      <AuthorizeAction
        open={openUnlockManualPrice}
        allowedRoles={[1, 2]}
        title={`Autorizar precio manual`}
        confirmButtonText={'Confirmar'}
        actionType={'Habilitar campo de precio y activar edicion manual'}
        onClose={(authorized, userAuthorizer) => {
          const { successAuth } = userAuthorizer;
          if (authorized, successAuth) {
            const { userId, roleId } = userAuthorizer;
            setDisabledPriceEditInput(false);
            // setOpenAuthUserPINCode(true);
          }
          setOpenUnlockManualPrice(false);
        }}
      />
    </Modal>
  )
}

export default ProductGasSearchForSale;
