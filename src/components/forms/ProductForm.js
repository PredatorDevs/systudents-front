import React, { useState, useEffect } from 'react';
import {
  Input,
  Col,
  Row,
  Button,
  Modal,
  InputNumber,
  Space,
  Tabs,
  Divider,
  Select,
  Checkbox,
  Switch,
  Tag,
  Table,
  Descriptions,
  Alert,
  Avatar
} from 'antd';
import {
  ArrowRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LockTwoTone,
  PercentageOutlined,
  PlusOutlined,
  SaveOutlined,
  UnlockTwoTone,
  WarningOutlined
} from '@ant-design/icons';
import { forEach, isEmpty } from 'lodash';

import { customNot } from '../../utils/Notifications.js';

import productsServices from '../../services/ProductsServices.js';
import brandsServices from '../../services/BrandsServices.js';
import categoriesServices from '../../services/CategoriesServices.js';
import { validateNumberData, validateSelectedData, validateStringData } from '../../utils/ValidateData.js';
import ubicationsServices from '../../services/UbicationsServices.js';
import measurementUnitsServices from '../../services/MeasurementUnitsServices.js';
import generalsServices from '../../services/GeneralsServices.js';

const { Option } = Select;
const { confirm } = Modal;

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

function ProductForm(props) {
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const [productDistributionData, setProductDistributionData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [unitMesData, setUnitMesData] = useState([]);
  const [ubicationsData, setUbicationsData] = useState([]);
  const [productTypesData, setProductTypesData] = useState([]);
  const [packageTypesData, setPackageTypesData] = useState([]);

  // FIRST STAGE FORM VALUES
  const [formId, setId] = useState(0);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formProductTypeId, setFormProductTypeId] = useState(0);
  const [formBrandId, setFormBrandId] = useState(0);
  const [formCategoryId, setFormCategoryId] = useState(0);
  const [formProductDistributionId, setFormProductDistributionId] = useState(null);
  const [formUbicationId, setFormUbicationId] = useState(0);
  const [formBarcode, setFormBarcode] = useState('');
  const [formCost, setFormCost] = useState(0);
  const [formUnitMeasurementId, setFormUnitMeasurementId] = useState(0);
  const [formIsService, setFormIsService] = useState(false);
  const [formEnabledForProduction, setFormEnabledForProduction] = useState(false);
  const [formIsTaxable, setFormIsTaxable] = useState(true);
  const [formPackageContent, setFormPackageContent] = useState(1);

  const [formProductTaxes, setFormProductTaxes] = useState([]);
  const [formProductPackageConfigs, setFormProductPackageConfigs] = useState([]);

  const [formPackageConfigPackageTypeId, setFormPackageConfigPackageTypeId] = useState(0);
  const [formPackageConfigQuantity, setFormPackageConfigQuantity] = useState(0);
  
  // SECOND STAGE FORM VALUES
  const [formStocks, setFormStocks] = useState([]);

  // THIRD STAGE FORM VALUES
  // [productId, price, profitRate, profitRateFixed]
  const [formPrices, setFormPrices] = useState([[null, null, null, null, null]]);
  const [formPriceIndexSelected, setFormPriceIndexSelected] = useState(null);

  const { open, updateMode, dataToUpdate, onClose } = props;

  async function loadData() {
    setFetching(true);
    try {
      const productDistributionsRes = await generalsServices.findProductDistributions();
      const brandsResponse = await brandsServices.find();
      const categoriesResponse = await categoriesServices.find();
      const ubicationsResponse = await ubicationsServices.find();
      const mesUnitRes = await measurementUnitsServices.find();
      const packTypeUnitRes = await generalsServices.findPackageTypes();
      const prodTypeUnitRes = await generalsServices.findProductTypes();
      
      setProductDistributionData(productDistributionsRes.data);
      setBrandsData(brandsResponse.data);
      setCategoriesData(categoriesResponse.data);
      setUbicationsData(ubicationsResponse.data);
      setUnitMesData(mesUnitRes.data);
      setPackageTypesData(packTypeUnitRes.data);
      setProductTypesData(prodTypeUnitRes.data);
    } catch(err) {
      console.log(err);
    }
    setFetching(false);
  }

  async function loadPackageConfig(idToLoad) {
    if (idToLoad !== undefined && idToLoad !== 0) {
      try {
        const productPackageConfigResponse = await productsServices.packageConfigs.findByProductId(idToLoad);
  
        setFormProductPackageConfigs(productPackageConfigResponse.data);
      } catch(error) {
        console.log(error);
      }
    } else {

    }
  }
  
  useEffect(() => {
    loadData();
  }, []);

  async function loadDataToUpdate() {
    if (!isEmpty(dataToUpdate)) {
      const {
        productId,
        productCode,
        productName,
        productBrandId,
        productCategoryId,
        productUbicationId,
        productDistributionsId,
        productMeasurementUnitId,
        productBarcode,
        productCost,
        productIsService,
        productEnabledForProduction,
        isTaxable,
        packageContent,
        productTypeId
      } = dataToUpdate;
  
      setId(productId || 0);
      setFormCode(productCode || '');
      setFormName(productName || '');
      setFormProductTypeId(productTypeId || 0);
      setFormBrandId(productBrandId || 0);
      setFormCategoryId(productCategoryId || 0);
      setFormProductDistributionId(productDistributionsId || null);
      setFormUbicationId(productUbicationId || 0);
      setFormUnitMeasurementId(productMeasurementUnitId || 0);
      setFormBarcode(productBarcode || '');
      setFormCost(productCost || 0);
      setFormIsService(!!productIsService || false);
      setFormEnabledForProduction(!!productEnabledForProduction || false);
      setFormIsTaxable(!!isTaxable || false);
      setFormPackageContent(packageContent);
  
      if (productId !== undefined) {
        const productTaxesResponse = await productsServices.findTaxesByProductId(productId);

        setFormProductTaxes(productTaxesResponse.data[0].taxesData);

        const pricesResponse = await productsServices.prices.findByProductId(productId);
        
        if (isEmpty(pricesResponse.data)) {
          // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
          setFormPrices([[null, null, null, null, null, null]]);
        } else {
          const newArr = [];
          forEach(pricesResponse.data, (x) => {
            newArr.push([
              x.productId,
              +x.price,
              +x.profitRate,
              +x.profitRateFixed,
              +x.requireAuthToApply,
              x.id
            ]);
          })
          setFormPrices(newArr);
        };

        const stocksResponse = await productsServices.stocks.findByProductId(productId);

        setFormStocks(stocksResponse.data);

        loadPackageConfig(productId);
      } else {
        setActiveTab('1');
        setFormStocks([]);
        // // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
        setFormPrices([[null, null, null, null, null]]);
        setFormPriceIndexSelected(null);
      }
    }
  }

  useEffect(() => {
    loadDataToUpdate();
  }, [ dataToUpdate ]);

  function restoreState() {
    setActiveTab('1');
    setId(0);
    setFormCode('');
    setFormName('');
    setFormProductTypeId(0);
    setFormBrandId(0);
    setFormCategoryId(0);
    setFormUbicationId(0);
    setFormProductDistributionId(0);
    setFormUnitMeasurementId(0);
    setFormBarcode('');
    setFormCost(0);
    setFormIsService(false);
    setFormEnabledForProduction(false);
    setFormIsTaxable(true);
    setFormPackageContent(1);
    setFormStocks([]);
    setFormProductTaxes([]);
    // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
    setFormPrices([[null, null, null, null, null, null]]);
    setFormPriceIndexSelected(null);
  }

  async function firstStageAction() {
    if (
      !validateSelectedData(formProductTypeId, 'Seleccione una tipo de producto')
      || !validateSelectedData(formCategoryId, 'Seleccione una categoría')
      || !validateSelectedData(formBrandId, 'Seleccione una marca')
      || !validateSelectedData(formUbicationId, 'Seleccione una ubicación')
      || !validateStringData(formName, 'Ingrese un nombre para el producto')
      // || (!validateStringData(formBarcode, `${formIsService ? '' : 'Ingrese un código de barras'}`) && !formIsService)
      // || !validateSelectedData(formUnitMeasurementId, 'Seleccione una unidad de medida')
    ) return;

    setFetching(true);

    try {
      const productAddResponse = await productsServices.add(
        formCode,
        formName,
        formBrandId,
        formCategoryId,
        formUbicationId || null,
        formUnitMeasurementId || 3,
        formBarcode || null,
        formCost,
        formIsService,
        formIsTaxable,
        formEnabledForProduction,
        formPackageContent,
        formProductTypeId
      );
  
      const { insertId } = productAddResponse.data;
  
      setId(insertId);
  
      const productStockResponse = await productsServices.stocks.findByProductId(insertId);
      const productTaxesResponse = await productsServices.findTaxesByProductId(insertId);
      
      setFetching(false);
      setActiveTab('2');
      setFormStocks(productStockResponse.data);
      setFormProductTaxes(productTaxesResponse.data[0].taxesData);
    } catch(error) {
      setFetching(false);
    }
  }

  async function secondStageAction() {
    setFetching(true);

    try {
      forEach(formStocks, async (x) => {
        const { initialStock, stock, minStockAlert, productStockId } = x;
        await productsServices.stocks.updateById(initialStock || 0, stock || 0, minStockAlert || 0, productStockId);
      });
    } catch(error) {

    }

    setFetching(false);
    setActiveTab('3');
    setFetching(true);

    try {
      const productPricesResponse = await productsServices.prices.findByProductId(formId);

      if (isEmpty(productPricesResponse.data)) {
        setFormPrices([[null, null, null, null, null, null]]);
      } else {
        const newArr = [];
        forEach(productPricesResponse.data, (x) => {
          newArr.push([
            x.productId,
            +x.price,
            +x.profitRate,
            +x.profitRateFixed,
            +x.requireAuthToApply,
            x.id
          ]);
        })
        setFormPrices(newArr);
      }

      setFetching(false);
    } catch(error) {
      setFetching(false);
    }
  }

  async function thirdStageAction() {
    const validPrices = updateMode ? true : !(formPrices[formPrices.length - 1][1] === null);
    
    if (!validPrices) {
      customNot('warning', 'Debe tener al menos un precio o un valor correcto', 'Dato no válido');
      return;
    }

    setFetching(true);
    
    const bulkDataPrices = [];
    
    forEach(formPrices, (x) => bulkDataPrices.push(
      // [productId, price, profitRate, profitRateFixed, requireAuthToApply]
      [ formId, x[1], x[2], x[3], x[4] ]
    ));

    try {
      await productsServices.prices.add(bulkDataPrices);
      restoreState();
      setFetching(false);
      onClose(true);
    } catch(error) {
      console.log(error);
      setFetching(false);
      onClose(false);
    }
  }

  function validateData() {
    if (!(updateMode ? true : !(formPrices[formPrices.length - 1][1] === null)))
      customNot('warning', 'Debe tener al menos un precio o un valor correcto', 'Dato no válido');

    return (
      updateMode ? validateSelectedData(formId, 'Seleccione una categoría') : true
      && validateSelectedData(formProductTypeId, 'Seleccione una tipo de producto')
      && validateStringData(formName, 'Verifique nombre del producto')
      && validateSelectedData(formBrandId, 'Seleccione una marca')
      && validateSelectedData(formCategoryId, 'Seleccione una categoria')
      && validateSelectedData(formUbicationId, 'Seleccione una ubicación')
      && updateMode ? true : !(formPrices[formPrices.length - 1][1] === null)
    );
  }

  async function updateAction() {
    if (validateData()) {
      setFetching(true);

      try {
        await productsServices.update(
          formCode || null,
          formName,
          formBrandId,
          formCategoryId,
          formUbicationId || null,
          formUnitMeasurementId || 3,
          formBarcode || null,
          formCost,
          formIsService,
          formIsTaxable,
          formEnabledForProduction,
          formPackageContent,
          formProductTypeId,
          formProductDistributionId || 1,
          formId
        );
  
        forEach(formStocks, async (x) => {
          const { initialStock, stock, minStockAlert, productStockId } = x;
  
          await productsServices.stocks.updateById(initialStock || 0, stock || 0, minStockAlert || 1, productStockId);
        });
  
        restoreState();
        setFetching(false);
        onClose(true);
      } catch(error) {
        setFetching(false);
      }
    }
  }

  // async function addProductPackageConfig() {
  //   if (formId !== undefined && formId !== 0) {
  //     if (
  //       validateSelectedData(formPackageConfigPackageTypeId, 'Seleccione un tipo de paquete')
  //       && validateNumberData(formPackageConfigQuantity, 'Coloque una cantidad válida', false)
  //     ) {
  //       setFetching(true);
  //       try {
  //         await productsServices.packageConfigs.add(
  //           formPackageConfigPackageTypeId,
  //           formId,
  //           formUnitMeasurementId,
  //           formPackageConfigQuantity
  //         );
          
  //         setFormPackageConfigPackageTypeId(0);
  //         setFormPackageConfigQuantity(0);
  
  //         loadPackageConfig(formId);
  //       } catch(error) {
  //         console.log(error);
  //       }
  //       setFetching(false);
  //     }
  //   }
  // }

  // function deletePackageConfig(idToDelete) {
  //   const { name } = dataToUpdate;
  //   Modal.confirm({
  //     title: '¿Desea remover esta información de contenido?',
  //     centered: true,
  //     icon: <WarningOutlined />,
  //     content: `Será removido de la lista de contenidos`,
  //     okText: 'Confirmar',
  //     okType: 'danger',
  //     cancelText: 'Cancelar',
  //     async onOk() {
  //       setFetching(true);
  //       await productsServices.packageConfigs.remove(idToDelete);
  //       loadPackageConfig(formId);
  //       setFetching(false);
  //     },
  //     onCancel() {},
  //   });
  // }

  function getProductCostTotalTaxes() {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    // let amountToTax = +formCost;
    
    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formProductTaxes, (tax) => {
      // BUSCA EL TAX ENTRE LA INFORMACIÓN DE LOS TAXES
      if (tax.isPercentage === 1) {
        totalTaxes += (+formCost * +tax.taxRate);
      } else {
        totalTaxes += (+tax.taxRate);
      }
    })

    return totalTaxes || 0;
  }

  function getProductCostTotalTaxesByTax(taxId) {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    // let amountToTax = +formCost;
    
    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formProductTaxes, (tax) => {
      // BUSCA EL TAX ENTRE LA INFORMACIÓN DE LOS TAXES
      if (tax.taxId === taxId) {
        if (tax.isPercentage === 1) {
          totalTaxes += (+formCost * +tax.taxRate);
        } else {
          totalTaxes += (+tax.taxRate);
        }
      }
    })

    return totalTaxes || 0;
  }

  function getFinalPriceTotalTaxesByTax(taxId, price) {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    let amountToTax = +price;

    // UN FOREACH PARA DESCONTAR LOS TAX FIJOS DEL AMOUNT TO TAX
    forEach(formProductTaxes, (tax) => {
      if (tax.isPercentage === 0) {
        amountToTax -= (+tax.taxRate);
      }
    });

    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formProductTaxes, (tax) => {
      // BUSCA EL TAX ENTRE LA INFORMACIÓN DE LOS TAXES
      if (tax.taxId === taxId) {
        if (tax.isPercentage === 1) {
          totalTaxes += (amountToTax - (amountToTax / (1 + +tax.taxRate)));
        } else {
          totalTaxes += (+tax.taxRate);
        }
      }
    });

    return totalTaxes || 0;
  }

  function getFinalPriceTotalTax(price) {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    let amountToTax = +price;

    // UN FOREACH PARA DESCONTAR LOS TAX FIJOS DEL AMOUNT TO TAX
    forEach(formProductTaxes, (tax) => {
      if (tax.isPercentage === 0) {
        amountToTax -= (+tax.taxRate);
      }
    });

    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formProductTaxes, (tax) => {
      // BUSCA EL TAX ENTRE LA INFORMACIÓN DE LOS TAXES
      if (tax.isPercentage === 1) {
        totalTaxes += (amountToTax - (amountToTax / (1 + +tax.taxRate)));
      } else {
        totalTaxes += (+tax.taxRate);
      }
    })

    return totalTaxes || 0;
  }

  return (
    <Modal
      centered
      width={650}
      closable={false}
      maskClosable={false}
      open={open}
      footer={null}
    >
      <p
        style={{
          margin: '5px 5px 10px 5px',
          textAlign: 'center',
          fontSize: '20px',
          color: '#434343'
        }}
      >
        {`${!updateMode ? 'Nuevo' : 'Actualizar'} Producto`}
      </p>
      {/* <TabsContainer> */}
        <Tabs 
          activeKey={activeTab}
          onChange={(activeKey) => { setActiveTab(activeKey); }}
          tabPosition={'left'}
        >
          <Tabs.TabPane tab="Información" key={'1'} disabled={!updateMode}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Categoria:</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formCategoryId} 
                  onChange={(value) => setFormCategoryId(value)}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (categoriesData || []).map(
                      (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Marca:</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formBrandId} 
                  onChange={(value) => setFormBrandId(value)}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (brandsData || []).map(
                      (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Codigo:</p>  
                <Input
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  name={'formCode'}
                  value={formCode}
                  placeholder={'XYZ'}
                />
              </Col>
              <Col span={24}>
                <p style={styleSheet.labelStyle}>Nombre:</p>  
                <Input
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  name={'formName'}
                  value={formName}
                  placeholder={'Producto 1'}
                />
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Código de barras:</p>  
                <Input
                  onChange={(e) => setFormBarcode(e.target.value)}
                  name={'formBarcode'}
                  value={formBarcode}
                  placeholder={'0123456789'}
                />
              </Col>
              <Col span={12}>
                <p style={{ margin: 0, color: '#434343' }}>{'Unidad de medida:'}</p>
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formUnitMeasurementId} 
                  onChange={(value) => {
                    setFormUnitMeasurementId(value);
                  }}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (unitMesData || []).map(
                      (element) => <Option key={element.measurementUnitId} value={element.measurementUnitId}>{element.measurementUnitName}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Costo:</p>  
                <InputNumber
                  addonBefore={'$'}
                  onChange={(value) => setFormCost(value)}
                  name={'formCost'}
                  value={formCost}
                  precision={4}
                />
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Localidad:</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }}
                  value={formProductDistributionId}
                  onChange={(value) => {
                    setFormProductDistributionId(value);
                  }}
                  optionFilterProp='children'
                  showSearch
                  filterOption={false}
                >
                  <Option key={0} value={null}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Avatar 
                        src={''}
                        size={'small'}
                        style={{ margin: '0px 0px 0px 3px' }}
                      />
                      <p style={{ margin: '0px 5px' }}>{'Todo'}</p>
                    </div>
                  </Option>
                  {
                    (productDistributionData || []).map((element, index) => (
                      <Option
                        key={element.id}
                        value={element.id}
                        style={{ borderBottom: '1px solid #E5E5E5' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <Avatar 
                            src={element.iconUrl}
                            size={'small'}
                            style={{ margin: '0px 0px 0px 3px' }}
                          />
                          <p style={{ margin: '0px 5px' }}>{element.name}</p>
                        </div>
                      </Option>
                    ))
                  }
                </Select>
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Ubicación:</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formUbicationId} 
                  onChange={(value) => setFormUbicationId(value)}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (ubicationsData || []).map(
                      (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Contenido:</p>  
                <InputNumber
                  onChange={(value) => setFormPackageContent(value)}
                  name={'formPackageContent'}
                  value={formPackageContent}
                  min={1}
                />
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>{`Tipo (MH):`}</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formProductTypeId} 
                  onChange={(value) => {
                    if (value === 2) setFormIsService(true);
                    else setFormIsService(false);
                    setFormProductTypeId(value)
                  }}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (productTypesData || []).map(
                      (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12}>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={formEnabledForProduction}
                  onChange={(e) => setFormEnabledForProduction(e.target.checked)}
                  style={{ color: '#434343' }}
                >
                  Para producción
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={formIsService}
                  disabled
                  onChange={(e) => setFormIsService(e.target.checked)}
                  style={{ color: '#434343' }}
                >
                  Es un servicio
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  disabled
                  checked={formIsTaxable}
                  onChange={(e) => setFormIsTaxable(e.target.checked)}
                  style={{ color: '#434343' }}
                >
                  Gravado
                </Checkbox>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Existencias" key={'2'} disabled={!updateMode}>
            {
              (formStocks || []).map((element, index) => {
                return (
                  <Row gutter={8} key={index}>
                    <Col span={24}>
                      <p style={{ ...styleSheet.labelStyle, fontWeight: 600 }}>{`${(element.locationName)}`}</p>
                    </Col>
                    <Col span={8}>
                      <p style={{ ...styleSheet.labelStyle, fontSize: 11 }}>{`Inicial:`}</p>
                      <Space>
                        <InputNumber
                          type={'number'}
                          disabled={updateMode}
                          // min={0}
                          precision={2} 
                          value={element.initialStock}
                          onChange={(value) => {
                            let newArr = [...formStocks];
                            newArr[index] = { ...newArr[index], initialStock: value };
                            setFormStocks(newArr);
                          }}
                        />
                      </Space>
                    </Col>
                    <Col span={8}>
                      <p style={{ ...styleSheet.labelStyle, fontSize: 11, color: 'blue' }}>{`Actual:`}</p>
                      <Space>
                        <InputNumber
                          type={'number'}
                          precision={2} 
                          // min={0}
                          disabled={updateMode}
                          value={element.stock}
                          onChange={(value) => {
                            let newArr = [...formStocks];
                            newArr[index] = { ...newArr[index], stock: value };
                            setFormStocks(newArr);
                          }}
                        />
                      </Space>
                    </Col>
                    <Col span={8}>
                      <p style={{ ...styleSheet.labelStyle, fontSize: 11, color: 'red' }}>{`Alerta Mínimo:`}</p>
                      <Space>
                        <InputNumber
                          type={'number'}
                          precision={2} 
                          // disabled={updateMode}
                          min={0}
                          value={element.minStockAlert}
                          onChange={(value) => {
                            let newArr = [...formStocks];
                            newArr[index] = { ...newArr[index], minStockAlert: value };
                            setFormStocks(newArr);
                          }}
                        />
                      </Space>
                    </Col>
                    {
                      formProductPackageConfigs.map((x) => (
                        <Col span={24} style={{ margin: '10px 0px' }}>
                          <Tag color={'blue'}>{`${Number(element.stock / x.quantity).toFixed(2)} ${x.packageTypeName} de ${x.quantity} ${x.measurementUnitName}`}</Tag>
                        </Col>
                      ))
                    }
                  </Row>
                )
              })
            }
          </Tabs.TabPane>
          <Tabs.TabPane tab="Precios" key={'3'} disabled={!updateMode}>
            <Row gutter={8}>
              <Col span={24}>
                <Descriptions
                  size='small'
                  bordered
                  labelStyle={{ padding: '3px 5px', fontSize: 11, fontWeight: 600 }}
                  contentStyle={{ padding: '3px 5px', textAlign: 'right' }}
                >
                  <Descriptions.Item
                    label={'Costo'}
                    span={3}
                  >
                    {Number(formCost || 0).toFixed(4)}
                  </Descriptions.Item>
                  {
                    (formProductTaxes || [])
                    .map((x, index) => {
                      return (
                        // <Tag
                        //   key={index}
                        //   icon={<ExclamationCircleOutlined />}
                        //   color={'#1677ff'}
                        //   style={{ margin: 3 }}
                        // >
                        //   {`${x.taxName}: $${getFinalPriceTotalTaxesByTax(x.taxId, element[1]).toFixed(2)}`}
                        // </Tag>
                        <Descriptions.Item
                          label={x.taxName}
                          span={3}
                        >
                          {getProductCostTotalTaxesByTax(x.taxId).toFixed(4)}
                        </Descriptions.Item>
                      )
                    })
                  }
                  {/* <Descriptions.Item
                    label={'IVA'}
                    span={3}
                  >
                    {getProductCostTotalTaxes().toFixed(2)}
                  </Descriptions.Item> */}
                  <Descriptions.Item
                    label={'Costo Final'}
                    span={3}
                  >
                    {(+formCost + +getProductCostTotalTaxes()).toFixed(4)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              {/* <Col span={24}>
                {
                  (formProductTaxes || [])
                  .map((element, index) => {
                    return (
                      <Space key={index}>
                        <Tag>{element.taxName}</Tag>
                        <Tag icon={element.isPercentage ? <PercentageOutlined/> : <DollarOutlined />}>{element.isPercentage ? (element.taxRate * 100) : element.isPercentage}</Tag>
                      </Space>
                    )
                  })
                }
              </Col> */}
              <Col span={24}>
                <div style={{ height: 10 }} />
              </Col>
              {
                (formPrices || []).map((element, index) => {
                  return (
                    <Col
                      span={24}
                      key={index}
                      style={{
                        border: `${formPriceIndexSelected === index ? '2px solid #1890ff' : '1px solid #d9d9d9'}`,
                        borderRadius: 5,
                        marginBottom: 10,
                        boxShadow: '3px 3px 5px 0px #d9d9d9',
                      }}
                    >                      
                      <Row
                        gutter={[8, 8]}
                        style={{ width: '100%' }}
                      >
                        <Col
                          span={24}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: 5,
                            paddingLeft: 5,
                            paddingRight: 5,
                            paddingBottom: 5,
                            borderRadius: 5,
                            backgroundColor: '#bae7ff'
                          }}
                        >
                          <p style={{ ...styleSheet.labelStyle }}>{`Precio ${(index + 1)}`}</p>
                          <Space>
                            <Button
                              icon={(formPriceIndexSelected !== index) ? <EditOutlined /> : <SaveOutlined />}
                              onClick={async (e) => {
                                if (!(formPriceIndexSelected !== index)) {
                                  if (element[0] === null) {
                                    try {
                                      await productsServices.prices.add([[formId, Number(+element[1]).toFixed(2), element[2] || 0, element[3] || 0, element[4] || 0]]);
                                      setFormPriceIndexSelected(null);
                                    } catch(error) {
                                    }
                                  } else {
                                    await productsServices.prices.update(Number(+element[1]).toFixed(2), +element[2] || 0, +element[3] || 0, +element[4] || 0, +element[5]);
                                    setFormPriceIndexSelected(null);
                                  }
                                } else {
                                  setFormPriceIndexSelected(index);
                                }
                              }}
                              size='small'
                              type={(formPriceIndexSelected !== index) ? 'default' : 'primary'}
                              disabled={!updateMode}
                            >
                              {(formPriceIndexSelected !== index) ? '' : 'Guardar cambios'}
                            </Button>
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                confirm({
                                  title: '¿Desea remover este precio?',
                                  icon: <DeleteOutlined />,
                                  content: 'Acción irreversible',
                                  okType: 'danger',
                                  async onOk() { 
                                    setFetching(true);
                                    
                                    const removedPriceRes = await productsServices.prices.remove(element[5] || 0);
                                    const { productId } = dataToUpdate;
                                    const pricesRes = await productsServices.prices.findByProductId(productId);

                                    if (isEmpty(pricesRes.data)) {
                                      setFormPrices([[null, null, null, false, false, null]]); // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
                                    } else {
                                      let newArr = (pricesRes.data || []).map((element) => ([
                                        element.productId,
                                        +element.price,
                                        +element.profitRate,
                                        +element.profitRateFixed,
                                        +element.requireAuthToApply,
                                        element.id
                                      ]));
                                      setFormPrices(newArr);
                                    }

                                    setFetching(false);
                                  },
                                  onCancel() {},
                                });
                              }}
                              size='small'
                              disabled={!updateMode && (index === 0)}
                              type={'primary'}
                              danger
                            />
                          </Space>
                        </Col>
                        <Col span={8}>
                          <p style={styleSheet.labelStyle}>{`Tipo`}</p>
                          <Space wrap>
                            <p style={{...styleSheet.labelStyle, color: element[3] ? '#000000' : '#1677ff' }}>{`%`}</p>
                            <Switch
                              checked={element[3]}
                              disabled={updateMode && (formPriceIndexSelected !== index)}
                              onChange={(checked) => {
                                let newArr = [...formPrices];
                                // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
                                newArr[index] = [
                                  element[0] || null,
                                  // SÍ ES PORCENTUAL SE CALCULA EL COSTO BRUTO X (1 + (PORCENTAJE DE GANANCIA))
                                  ((checked ? ((+formCost  + getProductCostTotalTaxes()) + +element[2]) : ((+formCost  + getProductCostTotalTaxes()) * (1 + (+element[2] / 100))))) || 0,
                                  element[2] || 0,
                                  checked,
                                  element[4] || false,
                                  element[5] || null
                                ];
                                
                                setFormPrices(newArr);
                              }}
                              size='small'
                            />
                            
                            <p style={{...styleSheet.labelStyle, color: element[3] ? '#1677ff' : '#000000' }}>{`$`}</p>
                          </Space>
                        </Col>
                        <Col span={8}>
                          <p style={styleSheet.labelStyle}>{`Margen Ganancia`}</p>
                          <InputNumber
                            size='small'
                            type={'number'}
                            prefix={element[3] ? <DollarOutlined /> : <PercentageOutlined />}
                            precision={2}
                            style={{ width: '125px' }}
                            value={element[2]}
                            disabled={updateMode && (formPriceIndexSelected !== index)}
                            onChange={(value) => {
                              let newArr = [...formPrices];

                              // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
                              newArr[index] = [
                                element[0] || null,
                                // SÍ ES PORCENTUAL SE CALCULA EL COSTO BRUTO X (1 + (PORCENTAJE DE GANANCIA))
                                ((!!element[3] ? ((+formCost  + getProductCostTotalTaxes()) + +value) : ((+formCost  + getProductCostTotalTaxes()) * (1 + (+value / 100))))) || 0,
                                +value,
                                element[3] || false,
                                element[4] || false,
                                element[5] || null
                              ];
                              
                              setFormPrices(newArr);
                            }}
                          />
                        </Col>
                        <Col span={8}>
                          <p style={styleSheet.labelStyle}>{`Precio Final`}</p>
                          <InputNumber
                            type={'number'}
                            size='small'
                            precision={2}
                            value={element[1]}
                            disabled={updateMode && (formPriceIndexSelected !== index)}
                            onChange={(value) => {
                              let newArr = [...formPrices];

                              // [productId, price, profitRate, profitRateFixed, productPriceId]
                              newArr[index] = [
                                updateMode ? element[0] : null,
                                Number(+value).toFixed(2),
                                updateMode ? element[2] : 0,
                                updateMode ? element[3] : false,
                                updateMode ? element[4] : false,
                                updateMode ? element[5] : null
                              ];
                              
                              setFormPrices(newArr);
                            }}
                          />
                        </Col>
                        <Col span={8}>
                          <p style={styleSheet.labelStyle}>{`Req. Autorizacion`}</p>
                          <Space wrap>
                            {/* <p style={{...styleSheet.labelStyle, color: element[3] ? '#000000' : '#1677ff' }}>{`%`}</p> */}
                            <UnlockTwoTone twoToneColor={'#52c41a'} />
                            <Switch
                              checked={element[4]}
                              disabled={(updateMode && (formPriceIndexSelected !== index))}
                              onChange={(checked) => {
                                let newArr = [...formPrices];
                                // [productId, price, profitRate, profitRateFixed, productPriceId]
                                newArr[index] = [
                                  element[0] || null,
                                  element[1] || 0,
                                  element[2] || 0,
                                  element[3] || false,
                                  checked,
                                  element[5] || null
                                ];
                                
                                setFormPrices(newArr);
                              }}
                              size='small'
                            />
                            <LockTwoTone twoToneColor={'#f5222d'} />
                            {/* <p style={{...styleSheet.labelStyle, color: element[3] ? '#1677ff' : '#000000' }}>{`$`}</p> */}
                          </Space>
                        </Col>
                        <Col span={24}>
                          {
                            element[4] ? (
                              <>
                                <p style={{ margin: 0, fontSize: 10, color: '#262626' }}>
                                  Este precio va a requerir una clave de autorización para ser usado
                                </p>
                                <p style={{ margin: 0, fontSize: 10, color: '#8c8c8c' }}>
                                  Se omitirá esta verificación en caso de coincidir con escala de cliente 
                                </p>
                              </>
                            ) : (<></>)
                          }
                        </Col>
                        <Col span={12}>

                        </Col>
                        <Col span={12}>
                          
                        </Col>
                      </Row>
                      <Space align='start' size={'large'}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {
                            (formProductTaxes || [])
                            .map((x, index) => {
                              return (
                                  <Tag
                                    key={index}
                                    icon={<ExclamationCircleOutlined />}
                                    color={'#1677ff'}
                                    style={{ margin: 3 }}
                                  >
                                    {`${x.taxName}: $${getFinalPriceTotalTaxesByTax(x.taxId, element[1]).toFixed(2)}`}
                                  </Tag>
                              )
                            })
                          }
                          <Tag
                            icon={<ExclamationCircleOutlined />}
                            color={'#003eb3'}
                            style={{ margin: 3 }}
                          >
                            {`TOTAL IMPUESTOS: $${getFinalPriceTotalTax(element[1]).toFixed(2)}`}
                          </Tag>
                          {/* <Tag
                            icon={<DollarOutlined />}
                            color={'#1677ff'}
                          >
                            {`Pago a cuenta: $${((element[1] - +getFinalPriceTotalTax(element[1])) * 0.0175).toFixed(2)}`}
                          </Tag>
                          <Tag
                            icon={<DollarOutlined />}
                            color={'#003eb3'}
                          >
                            {`Margen Utilidad: $${(element[1] - +getFinalPriceTotalTax(element[1]) - +formCost - +((element[1] - +getFinalPriceTotalTax(element[1])) * 0.0175)).toFixed(2)}`}
                          </Tag> */}
                        </div>
                      </Space>
                      <div style={{ height: 10 }} />
                      
                    </Col>
                  )
                })
              }
              <Col span={24}>
                <Button
                  type={'default'} 
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    let newArr = [...formPrices];
                    // [productId, price, profitRate, profitRateFixed, requireAuthToApply, productPriceId]
                    newArr.push([null, null, null, false, false, null]);
                    setFormPrices(newArr);
                    if (updateMode) setFormPriceIndexSelected(newArr.length - 1);
                  }} 
                  style={{ width: '50%', marginTop: 20 }}
                  loading={fetching}
                  disabled={fetching || (formPrices[formPrices.length - 1][1] === null) || !(formPriceIndexSelected === null)}
                >
                  Añadir otro precio
                </Button>
              </Col>
            </Row>
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab="Contenidos" key={'4'} disabled={!updateMode}>
            <Row gutter={8}>
              <Col span={24}>
                <Table 
                  columns={[
                    columnDef({title: 'Paquete', dataKey: 'packageTypeName'}),
                    columnDef({title: 'Cantidad', dataKey: 'quantity'}),
                    columnDef({title: 'Medida', dataKey: 'measurementUnitName', ifNull: '-'}),
                    columnActionsDef(
                      {
                        title: 'Acciones',
                        dataKey: 'productPackageConfigId',
                        detail: false,
                        edit: false,
                        del: true,
                        delAction: (value) => {
                          deletePackageConfig(value);
                          // setEntitySelectedId(value);
                          // setOpenPreview(true);
                        },
                      }
                    ),
                  ]}
                  rowKey={'productPackageConfigId'}
                  size={'small'}
                  dataSource={formProductPackageConfigs || []}
                  loading={fetching}
                />
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Paquete:</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formPackageConfigPackageTypeId} 
                  onChange={(value) => setFormPackageConfigPackageTypeId(value)}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (packageTypesData || []).map(
                      (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Cantidad:</p>  
                <InputNumber
                  type={'number'}
                  precision={2} 
                  disabled={!updateMode}
                  value={formPackageConfigQuantity}
                  onChange={(value) => {
                    setFormPackageConfigQuantity(value);
                  }}
                />
              </Col>
              <Col span={12}>
                <p style={styleSheet.labelStyle}>Medida:</p>  
                <Select
                  dropdownStyle={{ width: '100%' }} 
                  style={{ width: '100%' }} 
                  value={formUnitMeasurementId} 
                  // onChange={(value) => setFormPackageConfigPackageTypeId(value)}
                  disabled={true}
                  optionFilterProp='children'
                  showSearch
                  filterOption={(input, option) =>
                    (option.children).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                  {
                    (unitMesData || []).map(
                      (element) => <Option key={element.measurementUnitId} value={element.measurementUnitId}>{element.measurementUnitName}</Option>
                    )
                  }
                </Select>
              </Col>
              <Col span={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    addProductPackageConfig();
                  }}
                  loading={fetching}
                  disabled={fetching}
                >
                  Añadir contenido
                </Button>
              </Col>
            </Row>
          </Tabs.TabPane> */}
        </Tabs>
      {/* </TabsContainer> */}
      <Divider />
      <Row gutter={8}>
        <Col span={12}>
          <Button 
            type={'primary'}
            danger
            icon={<CloseOutlined />} 
            onClick={(e) => {
              restoreState();
              onClose(false)
            }}
            style={{ width: '100%' }} 
          >
            Cancelar
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type={'primary'} 
            icon={
              updateMode ?
                <SaveOutlined /> : 
                activeTab === '1' || activeTab === '2' ? 
                  <ArrowRightOutlined /> : <SaveOutlined />
            }
            onClick={
              updateMode ?
                (e) => updateAction() : 
                activeTab === '1' ? 
                  (e) => firstStageAction() : 
                  activeTab === '2' ? 
                    (e) => secondStageAction() : 
                    activeTab === '3' ? 
                      (e) => thirdStageAction() : 
                      null
            }
            style={{ width: '100%' }} 
            loading={fetching}
            disabled={fetching}
          >
            {
              updateMode ?
                'Guardar' : 
                activeTab === '1' || activeTab === '2' ? 
                  'Siguiente' : 'Guardar'
            }
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default ProductForm;
