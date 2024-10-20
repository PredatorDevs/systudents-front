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

import rawMaterialsServices from '../../services/RawMaterialsServices.js';
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

function RawMaterialForm(props) {
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const [rawMaterialDistributionData, setRawMaterialDistributionData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [unitMesData, setUnitMesData] = useState([]);
  const [ubicationsData, setUbicationsData] = useState([]);
  const [rawMaterialTypesData, setRawMaterialTypesData] = useState([]);
  const [packageTypesData, setPackageTypesData] = useState([]);

  // FIRST STAGE FORM VALUES
  const [formId, setId] = useState(0);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formRawMaterialTypeId, setFormRawMaterialTypeId] = useState(0);
  const [formBrandId, setFormBrandId] = useState(0);
  const [formCategoryId, setFormCategoryId] = useState(0);
  const [formRawMaterialDistributionId, setFormRawMaterialDistributionId] = useState(null);
  const [formUbicationId, setFormUbicationId] = useState(0);
  const [formBarcode, setFormBarcode] = useState('');
  const [formCost, setFormCost] = useState(0);
  const [formUnitMeasurementId, setFormUnitMeasurementId] = useState(0);
  const [formIsService, setFormIsService] = useState(false);
  const [formEnabledForProduction, setFormEnabledForProduction] = useState(false);
  const [formIsTaxable, setFormIsTaxable] = useState(true);
  const [formPackageContent, setFormPackageContent] = useState(1);

  const [formRawMaterialTaxes, setFormRawMaterialTaxes] = useState([]);
  
  // SECOND STAGE FORM VALUES
  const [formStocks, setFormStocks] = useState([]);

  const { open, updateMode, dataToUpdate, onClose } = props;

  async function loadData() {
    setFetching(true);
    try {
      const rawMaterialDistributionsRes = await generalsServices.findRawMaterialDistributions();
      const brandsResponse = await brandsServices.find();
      const categoriesResponse = await categoriesServices.find();
      const ubicationsResponse = await ubicationsServices.find();
      const mesUnitRes = await measurementUnitsServices.find();
      const packTypeUnitRes = await generalsServices.findPackageTypes();
      const rawMatTypeUnitRes = await generalsServices.findRawMaterialTypes();
      
      setRawMaterialDistributionData(rawMaterialDistributionsRes.data);
      setBrandsData(brandsResponse.data);
      setCategoriesData(categoriesResponse.data);
      setUbicationsData(ubicationsResponse.data);
      setUnitMesData(mesUnitRes.data);
      setPackageTypesData(packTypeUnitRes.data);
      setRawMaterialTypesData(rawMatTypeUnitRes.data);
    } catch(err) {
      console.log(err);
    }
    setFetching(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadDataToUpdate() {
    if (!isEmpty(dataToUpdate)) {
      const {
        rawMaterialId,
        rawMaterialCode,
        rawMaterialName,
        rawMaterialBrandId,
        rawMaterialCategoryId,
        rawMaterialUbicationId,
        rawMaterialDistributionsId,
        rawMaterialMeasurementUnitId,
        rawMaterialBarcode,
        rawMaterialCost,
        rawMaterialIsService,
        rawMaterialEnabledForProduction,
        isTaxable,
        packageContent,
        rawMaterialTypeId
      } = dataToUpdate;
  
      setId(rawMaterialId || 0);
      setFormCode(rawMaterialCode || '');
      setFormName(rawMaterialName || '');
      setFormRawMaterialTypeId(rawMaterialTypeId || 0);
      setFormBrandId(rawMaterialBrandId || 0);
      setFormCategoryId(rawMaterialCategoryId || 0);
      setFormRawMaterialDistributionId(rawMaterialDistributionsId || null);
      setFormUbicationId(rawMaterialUbicationId || 0);
      setFormUnitMeasurementId(rawMaterialMeasurementUnitId || 0);
      setFormBarcode(rawMaterialBarcode || '');
      setFormCost(rawMaterialCost || 0);
      setFormIsService(!!rawMaterialIsService || false);
      setFormEnabledForProduction(!!rawMaterialEnabledForProduction || false);
      setFormIsTaxable(!!isTaxable || false);
      setFormPackageContent(packageContent);
  
      if (rawMaterialId !== undefined) {
        const rawMaterialTaxesResponse = await rawMaterialsServices.findTaxesByRawMaterialId(rawMaterialId);

        setFormRawMaterialTaxes(rawMaterialTaxesResponse.data[0].taxesData);

        const stocksResponse = await rawMaterialsServices.stocks.findByRawMaterialId(rawMaterialId);

        setFormStocks(stocksResponse.data);
      } else {
        setActiveTab('1');
        setFormStocks([]);
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
    setFormRawMaterialTypeId(0);
    setFormBrandId(0);
    setFormCategoryId(0);
    setFormUbicationId(0);
    setFormRawMaterialDistributionId(0);
    setFormUnitMeasurementId(0);
    setFormBarcode('');
    setFormCost(0);
    setFormIsService(false);
    setFormEnabledForProduction(false);
    setFormIsTaxable(true);
    setFormPackageContent(1);
    setFormStocks([]);
    setFormRawMaterialTaxes([]);
  }

  async function firstStageAction() {
    if (
      !validateSelectedData(formRawMaterialTypeId, 'Seleccione una tipo de Materia Prima')
      || !validateSelectedData(formCategoryId, 'Seleccione una categoría')
      || !validateSelectedData(formBrandId, 'Seleccione una marca')
      || !validateSelectedData(formUbicationId, 'Seleccione una ubicación')
      || !validateStringData(formName, 'Ingrese un nombre para el Materia Prima')
      // || (!validateStringData(formBarcode, `${formIsService ? '' : 'Ingrese un código de barras'}`) && !formIsService)
      // || !validateSelectedData(formUnitMeasurementId, 'Seleccione una unidad de medida')
    ) return;

    setFetching(true);

    try {
      const rawMaterialAddResponse = await rawMaterialsServices.add(
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
        formRawMaterialTypeId
      );
  
      const { insertId } = rawMaterialAddResponse.data;
  
      setId(insertId);
  
      const rawMaterialStockResponse = await rawMaterialsServices.stocks.findByRawMaterialId(insertId);
      const rawMaterialTaxesResponse = await rawMaterialsServices.findTaxesByRawMaterialId(insertId);
      
      setFetching(false);
      setActiveTab('2');
      setFormStocks(rawMaterialStockResponse.data);
      setFormRawMaterialTaxes(rawMaterialTaxesResponse.data[0].taxesData);
    } catch(error) {
      setFetching(false);
    }
  }

  async function secondStageAction() {
    setFetching(true);

    try {
      forEach(formStocks, async (x) => {
        const { initialStock, stock, minStockAlert, rawMaterialStockId } = x;
        await rawMaterialsServices.stocks.updateById(initialStock || 0, stock || 0, minStockAlert || 0, rawMaterialStockId);
      });
    } catch(error) {

    }

    restoreState();
    setFetching(false);
    onClose(true);
  }

  function validateData() {
    return (
      updateMode ? validateSelectedData(formId, 'Seleccione una categoría') : true
      && validateSelectedData(formRawMaterialTypeId, 'Seleccione una tipo de Materia Prima')
      && validateStringData(formName, 'Verifique nombre del Materia Prima')
      && validateSelectedData(formBrandId, 'Seleccione una marca')
      && validateSelectedData(formCategoryId, 'Seleccione una categoria')
      && validateSelectedData(formUbicationId, 'Seleccione una ubicación')
    );
  }

  async function updateAction() {
    if (validateData()) {
      setFetching(true);

      try {
        await rawMaterialsServices.update(
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
          formRawMaterialTypeId,
          formRawMaterialDistributionId || 1,
          formId
        );
  
        forEach(formStocks, async (x) => {
          const { initialStock, stock, minStockAlert, rawMaterialStockId } = x;
  
          await rawMaterialsServices.stocks.updateById(initialStock || 0, stock || 0, minStockAlert || 1, rawMaterialStockId);
        });
  
        restoreState();
        setFetching(false);
        onClose(true);
      } catch(error) {
        setFetching(false);
      }
    }
  }

  function getRawMaterialCostTotalTaxes() {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    // let amountToTax = +formCost;
    
    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formRawMaterialTaxes, (tax) => {
      // BUSCA EL TAX ENTRE LA INFORMACIÓN DE LOS TAXES
      if (tax.isPercentage === 1) {
        totalTaxes += (+formCost * +tax.taxRate);
      } else {
        totalTaxes += (+tax.taxRate);
      }
    })

    return totalTaxes || 0;
  }

  function getRawMaterialCostTotalTaxesByTax(taxId) {
    let totalTaxes = 0; // DECLARA UNA VARIABLE RESULTADO
    // let amountToTax = +formCost;
    
    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formRawMaterialTaxes, (tax) => {
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
    forEach(formRawMaterialTaxes, (tax) => {
      if (tax.isPercentage === 0) {
        amountToTax -= (+tax.taxRate);
      }
    });

    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formRawMaterialTaxes, (tax) => {
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
    forEach(formRawMaterialTaxes, (tax) => {
      if (tax.isPercentage === 0) {
        amountToTax -= (+tax.taxRate);
      }
    });

    // UN FOREACH PARA RECORRER LOS DETALLES DE LA VENTA
    forEach(formRawMaterialTaxes, (tax) => {
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
        {`${!updateMode ? 'Nuevo' : 'Actualizar'} Materia Prima`}
      </p>
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
                placeholder={'Materia Prima 1'}
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
                value={formRawMaterialDistributionId}
                onChange={(value) => {
                  setFormRawMaterialDistributionId(value);
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
                  (rawMaterialDistributionData || []).map((element, index) => (
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
                value={formRawMaterialTypeId} 
                onChange={(value) => {
                  if (value === 2) setFormIsService(true);
                  else setFormIsService(false);
                  setFormRawMaterialTypeId(value);
                }}
                optionFilterProp='children'
                showSearch
                filterOption={(input, option) =>
                  (option.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                {
                  (rawMaterialTypesData || []).map(
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
                </Row>
              )
            })
          }
        </Tabs.TabPane>
      </Tabs>
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
                      null
            }
            style={{ width: '100%' }} 
            loading={fetching}
            disabled={fetching}
          >
            {
              updateMode ?
                'Guardar' : 
                activeTab === '1' ? 
                  'Siguiente' : 'Guardar'
            }
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default RawMaterialForm;
