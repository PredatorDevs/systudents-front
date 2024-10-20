import React, { useState, useEffect } from 'react';
import {
  Input,
  Col,
  Row,
  Divider,
  Button,
  Select,
  PageHeader,
  Modal,
  DatePicker,
  Drawer,
  Space,
  Tag,
  Checkbox,
  InputNumber,
  Radio,
  Spin,
  Tooltip,
} from 'antd';
import {
  BuildOutlined,
  DeleteFilled,
  DeleteOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  InboxOutlined,
  ManOutlined,
  PhoneOutlined,
  SaveOutlined,
  SyncOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WarningOutlined,
  WomanOutlined
} from '@ant-design/icons';
import { includes, isEmpty, isString, toUpper } from 'lodash';

import { customNot } from '../../utils/Notifications';

import customersServices from '../../services/CustomersServices';
import { getUserLocation, getUserRole } from '../../utils/LocalData';
import moment from 'moment';
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import DepartmentSelector from '../selectors/DepartmentSelector';
import DeliveryRouteSelector from '../selectors/DeliveryRouteSelector';
import CustomerPhones from '../CustomerPhones';
import CustomerRelatives from '../CustomerRelatives';
import { validateArrayData, validateDui, validateEmail, validateNit, validateNrc, validateSelectedData, validateStringData } from '../../utils/ValidateData';
import { onKeyDownFocusTo } from '../../utils/OnEvents';
import locationsService from '../../services/LocationsServices';
import { RequiredQuestionMark } from '../RequiredQuestionMark';
import generalsServices from '../../services/GeneralsServices';

const { Option } = Select;

function CustomerForm(props) {
  function defaultDate() {
    return moment();
  };

  const [fetching, setFetching] = useState(false);

  const [formId, setFormId] = useState(0);
  const [formLocationId, setFormLocationId] = useState(null);
  const [formCode, setFormCode] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formBirthdate, setFormBirthdate] = useState(defaultDate());
  const [formBirthplace, setFormBirthplace] = useState('');
  const [formGender, setFormGender] = useState('M');
  const [formDui, setFormDui] = useState('');
  const [formNit, setFormNit] = useState('');
  const [formNrc, setFormNrc] = useState('');
  const [formBusinessLine, setFormBusinessLine] = useState('');
  const [formOccupation, setFormOccupation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formJobAddress, setFormJobAddress] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formApplyForCredit, setFormApplyForCredit] = useState(false);
  const [formCreditLimit, setFormCreditLimit] = useState(0);
  const [formDefPriceIndex, setFormDefPriceIndex] = useState(1);

  const [formCustomerTypeId, setFormCustomerTypeId] = useState(0);
  const [formDepartmentId, setFormDepartmentId] = useState(13);
  const [formCityId, setFormCityId] = useState(0);
  const [formDeliveryRouteId, setFormDeliveryRouteId] = useState(0);
  const [formEconomicActivityId, setFormEconomicActivityId] = useState(0);

  const [formCustomerPhones, setFormCustomerPhones] = useState([]);
  const [formExistingCustomerPhones, setFormExistingCustomerPhones] = useState([]);

  const [formCustomerRelatives, setFormCustomerRelatives] = useState([]);
  const [formExistingCustomerRelatives, setFormExistingCustomerRelatives] = useState([]);

  const [customerTypesData, setCustomerTypesData] = useState([]);
  const [economicActivitiesData, setEconomicActivitiesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);

  const [resetComponentStates, setResetComponentStates] = useState(0)

  const { open, updateMode, dataToUpdate, showDeleteButton, onClose } = props;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setFetching(true);
    try {
      const response = await customersServices.findTypes();
      const locRes = await locationsService.find();
      const ecoActRes = await generalsServices.findEconomicActivities();
  
      setCustomerTypesData(response.data);
      setLocationsData(locRes.data);
      setEconomicActivitiesData(ecoActRes.data);
    } catch(error) {
      console.log(error);
    }
    setFetching(false);
  }

  useEffect(() => {
    if (!isEmpty(dataToUpdate)) {
      const {
        id,
        locationId,
        economicActivityId,
        code,
        fullName,
        businessName,
        birthdate,
        birthplace,
        gender,
        customerTypeId,
        dui,
        nit,
        nrc,
        businessLine,
        occupation,
        address,
        jobAddress,
        departmentId,
        cityId,
        deliveryRouteId,
        email,
        applyForCredit,
        creditLimit,
        defPriceIndex
      } = dataToUpdate[0][0];

      setFormId(id || 0);
      setFormEconomicActivityId(economicActivityId || 0);
      setFormLocationId(locationId || null);
      setFormCode(code || 0);
      setFormFullName(fullName);
      setFormBusinessName(businessName);
      setFormBirthdate(moment(birthdate));
      setFormBirthplace(birthplace);
      setFormGender(gender);
      setFormCustomerTypeId(customerTypeId);
      setFormDui(dui);
      setFormNit(nit);
      setFormNrc(nrc);
      setFormBusinessLine(businessLine);
      setFormOccupation(occupation);
      setFormAddress(address);
      setFormJobAddress(jobAddress);
      setFormDepartmentId(departmentId);
      setFormCityId(cityId);
      setFormDeliveryRouteId(deliveryRouteId);
      setFormEmail(email);
      setFormApplyForCredit(applyForCredit);
      setFormCreditLimit(creditLimit);
      setFormDefPriceIndex(defPriceIndex);
      setFormExistingCustomerPhones(dataToUpdate[1]);
      setFormExistingCustomerRelatives(dataToUpdate[2]);
    }
  }, [ dataToUpdate ]);


  function restoreState() {
    setFormId(0);
    setFormEconomicActivityId(0);
    setFormLocationId(null);
    setFormCode('');
    setFormFullName('');
    setFormBusinessName('');
    setFormBirthdate(defaultDate());
    setFormBirthplace(null);
    setFormGender('M');
    setFormCustomerTypeId(0);
    setFormDui('');
    setFormNit('');
    setFormNrc('');
    setFormBusinessLine('');
    setFormOccupation('');
    setFormAddress('');
    setFormJobAddress('');
    setFormDepartmentId(13);
    setFormCityId(0);
    setFormDeliveryRouteId(0);
    setFormEmail('');
    setFormApplyForCredit(false);
    setFormCreditLimit(0);
    setFormDefPriceIndex(1);
    setFormCustomerPhones([]);
    setFormCustomerRelatives([]);
    setFormExistingCustomerPhones([]);
    setFormExistingCustomerRelatives([]);

    setResetComponentStates(resetComponentStates + 1);
  }

  function renderPhoneTag(type) {
    switch(type) {
      case 1: return (<Tag icon={<PhoneOutlined />} color="magenta">Celular</Tag>);
      case 2: return (<Tag icon={<HomeOutlined />} color="volcano">Casa</Tag>);
      case 3: return (<Tag icon={<BuildOutlined />} color="green">Trabajo</Tag>);
      case 4: return (<Tag icon={<InboxOutlined />} color="cyan">Fax</Tag>);
      default: return (<Tag icon={<PhoneOutlined />} color="magenta">Celular</Tag>);
    }
  }

  // function relativeTypeName(type) {
  //   switch(type) {
  //     case 1: return "Padre";
  //     case 2: return "Madre";
  //     case 3: return "Cónyuge";
  //     case 4: return "Hijo/a";
  //     case 5: return "Hermano/a";
  //     case 6: return "Tio/a";
  //     case 7: return "Primo/a";
  //     case 8: return "Abuelo/a";
  //     case 9: return "Sobrino/a";
  //     case 10: return "Cuñado/a";
  //     case 99: return "Otro/a";
  //     default: return "Otro";
  //   }
  // }

  function validateData() {
    // if (!(formBirthdate !== null ? formBirthdate.isValid() : false))
    //   customNot('warning', 'Debe seleccionar una fecha válida', '');

    return (
      validateStringData(formFullName, 'Introduzca nombre completo de cliente')
      // && (formBirthdate !== null ? formBirthdate.isValid() : false)
      && validateSelectedData(formCustomerTypeId, 'Seleccione un tipo de cliente')
      && (formCustomerTypeId !== 1 ? validateSelectedData(formEconomicActivityId, 'Seleccione una Actividad Económica') : true)
      && ((isString(formDui) && !isEmpty(formDui)) ? validateDui(formDui, 'Introduzca un número de DUI válido') : true)
      // && (formCustomerTypeId !== 1 ? validateDui(formDui, 'Introduzca un número de DUI válido') : true)
      && (formCustomerTypeId !== 1 ? validateNit(formNit, 'Introduzca un número de NIT o DUI homologado válido') : true)
      && (formCustomerTypeId !== 1 ? validateNrc(formNrc, 'Introduzca un número NRC válido') : true)
      && (formCustomerTypeId !== 1 ? validateStringData(formBusinessLine, 'Introduzca el giro del cliente') : true)
      && validateStringData(formAddress, 'Introduzca dirección del cliente')
      && validateSelectedData(formDepartmentId, 'Seleccione un departamento')
      && validateSelectedData(formCityId, 'Seleccione un municipio')
      // && validateSelectedData(formDeliveryRouteId, 'Seleccione una zona de cobro')
      && ((formExistingCustomerPhones.length >= 1) || validateArrayData(formCustomerPhones, 1, 'Debe añadir por lo menos un número de teléfono'))
      && validateEmail(formEmail, 'Introduzca una dirección de correo electrónico válida')
      // && (!updateMode ? validateArrayData(formCustomerPhones, 1, 'Debe añadir por lo menos un número de teléfono') : true)
    );
  }

  async function formAction() {
    if (validateData()) {
      if (!updateMode) {
        setFetching(true);
        try {
          const response = await customersServices.addv2(
            formCustomerTypeId,
            formLocationId,
            formDepartmentId,
            formCityId,
            formDeliveryRouteId || null,
            formFullName,
            formBusinessName || null,
            formAddress,
            formJobAddress,
            null,
            formEmail || null,
            formDui || null,
            formNit,
            formNrc || null,
            formBusinessLine || null,
            formOccupation || null,
            formBirthdate.format('YYYY-MM-DD'),
            formBirthplace || null,
            formGender || 'M',
            formApplyForCredit || false,
            formCreditLimit || 0,
            formDefPriceIndex || 1,
            formEconomicActivityId || 0,
            formCustomerPhones,
            formCustomerRelatives
          );

          setFetching(false);

          if (response.status === 200) {
            restoreState();
            onClose(true);
          }
        } catch(error) {
          console.log(error);
          setFetching(false);
        }
      } else {
        setFetching(true);
        try {
          const response1 = await customersServices.update(
            formCustomerTypeId,
            formLocationId,
            formDepartmentId,
            formCityId,
            formDeliveryRouteId || null,
            formFullName,
            formBusinessName || null,
            formAddress,
            formJobAddress,
            null,
            formEmail,
            formDui || null,
            formNit,
            formNrc,
            formBusinessLine,
            formOccupation,
            formBirthdate.format('YYYY-MM-DD'),
            formBirthplace || null,
            formGender || 'M',
            formApplyForCredit || 0,
            formCreditLimit || 0,
            formDefPriceIndex || 1,
            formEconomicActivityId || 0,
            formId
          );
          
          setFetching(false);
          
          if (response1.status === 200) {
            if (!isEmpty(formCustomerPhones)) {
              const customerPhonesToInsert = formCustomerPhones.map((element) => [formId, formCode, element.phoneNumber, element.phoneType]);
              setFetching(true);
              await customersServices.addPhones(customerPhonesToInsert);
              setFetching(false);
            }
  
            if (!isEmpty(formCustomerRelatives)) {
              const customerRelativesToInsert = formCustomerRelatives.map((element) => [formId, formCode, element.relativeFullname, element.relativeType, element.relativeAddress]);
              setFetching(true);            
              await customersServices.addRelatives(customerRelativesToInsert);
              setFetching(false);
            }
            restoreState();
            onClose(true, formId);
          }
        } catch(error) {
          console.log(error);
          setFetching(false);
        }
      }
    }
  }

  function onDeletePhone(customerPhoneId) {
    Modal.confirm({
      title: '¿Desea eliminar este número de teléfono?',
      centered: true,
      icon: <WarningOutlined />,
      content: `Esta acción no puede revertirse`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {
        setFetching(true);
        await customersServices.removePhone(customerPhoneId);
        setFetching(false);
        setFormExistingCustomerPhones(prev => prev.filter(x => x.id !== customerPhoneId));
      },
      onCancel() {},
    });
  }

  // function onDeleteRelative(customerRelativeId) {
  //   Modal.confirm({
  //     title: '¿Desea eliminar esta referencia?',
  //     centered: true,
  //     icon: <WarningOutlined />,
  //     content: `Esta acción no puede revertirse`,
  //     okText: 'Confirmar',
  //     okType: 'danger',
  //     cancelText: 'Cancelar',
  //     async onOk() {
  //       setFetching(true);
  //       await customersServices.removeRelative(customerRelativeId);
  //       setFetching(false);
  //       setFormExistingCustomerRelatives(prev => prev.filter(x => x.id !== customerRelativeId));
  //     },
  //     onCancel() {},
  //   });
  // }

  function deleteAction() {
    const { fullName } = dataToUpdate[0][0];
    Modal.confirm({
      title: '¿Desea deshabilitar este cliente?',
      centered: true,
      icon: <WarningOutlined />,
      content: `${fullName || 'Not defined'} será eliminado de la lista de clientes`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        setFetching(true);
        customersServices.remove(formId)
        .then((response) => {
          restoreState();
          setFetching(false);
          onClose(true);
        })
        .catch((error) => {
          setFetching(false);
          customNot('info', 'Algo salió mal', 'El cliente no pudo ser eliminado');
        });
      },
      onCancel() {},
    });
  }

  return (
    <Drawer
      title={
        <PageHeader
          onBack={() => null}
          backIcon={<UserOutlined />}
          title={`${!updateMode ? 'Nuevo' : `${formCode} Actualizar`} cliente`}
          subTitle={`${updateMode ? `Internal Code: ${formId}` : ''}`}
          extra={!updateMode ? [
            <Button
              key="3"
              size={'small'}
              icon={<SyncOutlined />}
              onClick={(e) => loadData()}
              loading={fetching}
              // disabled={!showDeleteButton}
            />
          ] : [
            <Button
              key="1"
              type="danger"
              size={'small'}
              icon={<DeleteOutlined />}
              onClick={(e) => deleteAction()}
              disabled={!showDeleteButton}
              loading={fetching}
            >
              Deshabilitar
            </Button>,
            <Button
              key="2"
              type="primary"
              size={'small'}
              icon={<SaveOutlined />}
              onClick={(e) => formAction()}
              loading={fetching}
              // disabled={!showDeleteButton}
            >
              Guardar cambios
            </Button>,
            <Button
              key="3"
              size={'small'}
              icon={<SyncOutlined />}
              onClick={(e) => loadData()}
              loading={fetching}
              // disabled={!showDeleteButton}
            />
          ]}
        />
      }
      width={800}
      placement="right"
      onClose={(e) => {
        restoreState();
        onClose(false)
      }}
      open={open}
      maskClosable={false}
    >
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Sucursal:`}</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={formLocationId} 
            onChange={(value) => {
              setFormLocationId(value);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={null}>{'TODAS'}</Option>
            {
              (locationsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={18}>
          <p style={{ margin: '0px' }}>Nombre completo: <RequiredQuestionMark /></p>
          <Input
            required
            id={'customer-form-fullname-input'}
            onChange={(e) => setFormFullName(toUpper(e.target.value))}
            name={'formFullName'}
            value={formFullName}
            placeholder={'José Pérez'}
            onFocus={() => document.getElementById('customer-form-fullname-input').select()}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-birthday-picker')}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px', color: '#FFF' }}>-</p>
          <Button
            disabled={updateMode}
            onClick={(e) => {
              if (formFullName !== '') {
                // setFormId(0);
                setFormEconomicActivityId(773);
                setFormLocationId(null);
                // setFormCode('');
                // setFormFullName('');
                setFormBusinessName('');
                setFormBirthdate(defaultDate());
                setFormBirthplace(null);
                setFormGender('M');
                setFormCustomerTypeId(1);
                setFormDui('');
                setFormNit('');
                setFormNrc('');
                setFormBusinessLine(economicActivitiesData.find((x) => x.id === 773)?.name || '');
                setFormOccupation('');
                setFormAddress('SANTA ROSA DE LIMA');
                setFormJobAddress('');
                setFormDepartmentId(14);
                setFormCityId(255);
                setFormDeliveryRouteId(0);
                setFormEmail('ventas.pumasantarosa@gmail.com');
                setFormApplyForCredit(false);
                setFormCreditLimit(0);
                setFormDefPriceIndex(1);
                setFormCustomerPhones([{ phoneNumber: '79406386', phoneType: 1 }]);
              } else {
                customNot('warning', 'Para utilizar el llenado rápido debe colocar el nombre del cliente', '')
              }
            }}
          >
            Llenado rápido
          </Button>
        </Col>
        {/* <Col span={6}>
          <p style={{ margin: '0px' }}>Género:</p>
          <Radio.Group
            value={formGender}
            optionType="button"
            onChange={(e) => {
              setFormGender(e.target.value);
            }}
            size={'small'}
          >
            <Radio.Button
              value="M"
              style={{
                backgroundColor: formGender === 'M' ? '#1677ff' : 'transparent',
                color: formGender === 'M' ? '#FFF' : '#000'
              }}
            >
              <Space><ManOutlined />Hombre</Space>
            </Radio.Button>
            <Radio.Button
              value="F"
              style={{
                backgroundColor: formGender === 'F' ? '#eb2f96' : 'transparent',
                color: formGender === 'F' ? '#FFF' : '#000'
              }}
            >
              <Space><WomanOutlined />Mujer</Space>
            </Radio.Button>
          </Radio.Group>
        </Col> */}
        {/* <Col span={12}>
          <p style={{ margin: '0px' }}>Lugar de nacimiento:</p>  
          <Input
            id={'customer-form-birthplace'}
            onChange={(e) => setFormBirthplace(toUpper(e.target.value))}
            name={'formBirthplace'}
            value={formBirthplace}
            placeholder={'Calle Flores Avenida Trebol'}
            onFocus={() => document.getElementById('customer-form-birthplace').select()}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-birthday-picker')}
          />
        </Col> */}
        {/* <Col span={6}>
          <p style={{ margin: '0px' }}>Fecha nacimiento:</p>  
          <DatePicker
            id={'customer-form-birthday-picker'}
            locale={locale}
            onChange={(date) => {
              setFormBirthdate(date);
              document.getElementById('customer-form-businessname-input').focus();
            }}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-type-selector')}
            format={'DD-MM-YYYY'}
            onFocus={() => document.getElementById('customer-form-birthday-picker').select()}
            value={formBirthdate}
          />
        </Col> */}
        <Col span={24}>
          <p style={{ margin: '0px' }}>Nombre de negocio:</p>  
          <Input
            id={'customer-form-businessname-input'}
            onChange={(e) => setFormBusinessName(toUpper(e.target.value))}
            name={'formBusinessName'}
            value={formBusinessName}
            onFocus={() => document.getElementById('customer-form-businessname-input').select()}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-type-selector')}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px' }}>Tipo: <RequiredQuestionMark /></p>
          <Select 
            id={'customer-form-customer-type-selector'}
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={formCustomerTypeId} 
            onChange={(value) => {
              setFormCustomerTypeId(value);
              document.getElementById('customer-form-customer-dui-input').focus();
            }}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-dui-input')}
            optionFilterProp='children'
            showSearch
            showAction={'focus'}
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (customerTypesData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px' }}>
            DUI:
          </p>
          <Input
            id={'customer-form-customer-dui-input'}
            onChange={(e) => setFormDui(e.target.value)}
            name={'formDui'}
            value={formDui}
            placeholder={'01234567-8'}
            suffix={fetching ? <Spin size='small' /> : <></>}
            onBlur={async (e) => {
              e.stopPropagation();
              if (formDui !== "" && validateDui(formDui, 'Introduzca un número de DUI válido')) {
                setFetching(true);
                try {
                  const checkingRes = await generalsServices.checkUniquenessValue('customers', 'dui', formDui, updateMode ? formId : null);
                  if (checkingRes.data[0]?.totalFound > 0) {
                    customNot('warning', 'DUI ya registrado para una ficha de cliente', 'Sí no encuentra un cliente en la lista de clientes con este DUI consulte con el administrador del sistema para ver los deshabilitados', 9);
                  };
                } catch(error) {
  
                }
                setFetching(false);
              }
            }}
            onFocus={() => document.getElementById('customer-form-customer-dui-input').select()}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-nit-input')}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px' }}>NIT: {(formCustomerTypeId !== 0 && formCustomerTypeId !== 1) ? <RequiredQuestionMark title={'Requerido - Formato NIT o DUI homologado (No guiones)'} /> : <></>}</p>
          <Input
            id={'customer-form-customer-nit-input'}
            onChange={(e) => setFormNit(e.target.value)}
            name={'formNit'}
            value={formNit}
            placeholder={'01234567890123 | 012345678'}
            suffix={fetching ? <Spin size='small' /> : <></>}
            onBlur={async (e) => {
              e.stopPropagation();
              if (formNit !== "") {
                setFetching(true);
                try {
                  const checkingRes = await generalsServices.checkUniquenessValue('customers', 'nit', formNit, updateMode ? formId : null);
                  if (checkingRes.data[0]?.totalFound > 0) {
                    customNot('warning', 'NIT ya registrado para una ficha de cliente', 'Sí no encuentra un cliente en la lista de clientes con este NIT consulte con el administrador del sistema para ver los deshabilitados', 9);
                  };
                } catch(error) {
  
                }
                setFetching(false);
              }
            }}
            onFocus={() => document.getElementById('customer-form-customer-nit-input').select()}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-nrc-input')}
          />
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px' }}>NRC: {(formCustomerTypeId !== 0 && formCustomerTypeId !== 1) ? <RequiredQuestionMark title={'Requerido - Formato NRC (No guiones)'} /> : <></>}</p>  
          <Input
            id={'customer-form-customer-nrc-input'}
            onChange={(e) => setFormNrc(e.target.value)}
            name={'formNrc'}
            onFocus={() => document.getElementById('customer-form-customer-nrc-input').select()}
            value={formNrc}
            placeholder={'012345678'}
            suffix={fetching ? <Spin size='small' /> : <></>}
            onBlur={async (e) => {
              e.stopPropagation();
              if (formNrc !== "") {
                setFetching(true);
                try {
                  const checkingRes = await generalsServices.checkUniquenessValue('customers', 'nrc', formNrc, updateMode ? formId : null);
                  if (checkingRes.data[0]?.totalFound > 0) {
                    customNot('warning', 'NRC ya registrado para una ficha de cliente', 'Sí no encuentra un cliente en la lista de clientes con este NRC consulte con el administrador del sistema para ver los deshabilitados', 9);
                  };
                } catch(error) {
  
                }
                setFetching(false);
              }
            }}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-businessline-input')}
          />
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}> {`Actividad Economica (MH):`}</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={formEconomicActivityId} 
            onChange={(value) => {
              setFormEconomicActivityId(value);
              setFormBusinessLine(economicActivitiesData.find((x) => x.id === value)?.name || '');
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={null}>{'TODAS'}</Option>
            {
              (economicActivitiesData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>Giro: {(formCustomerTypeId !== 0 && formCustomerTypeId !== 1) ? <RequiredQuestionMark /> : <></>}</p>  
          <Input
            id={'customer-form-customer-businessline-input'}
            onChange={(e) => setFormBusinessLine(toUpper(e.target.value))}
            onFocus={() => document.getElementById('customer-form-customer-businessline-input').select()}
            name={'formBusinessLine'}
            value={formBusinessLine}
            placeholder={''}
            disabled
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-customer-occupation-input')}
          />
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>Ocupación:</p>
          <Input
            id={'customer-form-customer-occupation-input'}
            onChange={(e) => setFormOccupation(toUpper(e.target.value))}
            onFocus={() => document.getElementById('customer-form-customer-occupation-input').select()}
            name={'formOccupation'}
            value={formOccupation}
            placeholder={'Comerciante'}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-applyforcredit-checked')}
          />
        </Col>
        <Col
          span={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <Checkbox
            id={'customer-form-applyforcredit-checked'}
            checked={formApplyForCredit}
            onKeyDown={(e) => {
              setTimeout(() => {
                if (formApplyForCredit) {
                  document.getElementById('customer-form-creditlimit-input').focus();
                }
                else {
                  document.getElementById('customer-form-price-scale-input').focus();
                }
              }, 250);
            }}
            onChange={(e) => {
              setFormApplyForCredit(e.target.checked);
              setTimeout(() => {
                if (e.target.checked) {
                  document.getElementById('customer-form-creditlimit-input').focus();
                }
                else {
                  document.getElementById('customer-form-price-scale-input').focus();
                }
              }, 250);
            }}
            disabled={!(includes([1, 2, 6, 7], getUserRole()))}
          >
            Aplica para Créditos
          </Checkbox>
        </Col>
        <Col span={12} style={{ display: formApplyForCredit ? 'inline' : 'none' }}>
          <p style={{ margin: '0px' }}>Límite de crédito:</p>  
          <InputNumber
            size={300}
            addonBefore={<DollarOutlined />}
            id={'customer-form-creditlimit-input'}
            onChange={(value) => setFormCreditLimit(value)}
            onFocus={() => document.getElementById('customer-form-creditlimit-input').select()}
            name={'formCreditLimit'}
            value={formCreditLimit}
            disabled={!(includes([1, 2], getUserRole()))}
            placeholder={'0.00'}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-price-scale-input')}
          />
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>Escala precio:</p>  
          <InputNumber
            size={300}
            addonBefore={<UnorderedListOutlined />}
            id={'customer-form-price-scale-input'}
            onChange={(value) => setFormDefPriceIndex(value)}
            onFocus={() => document.getElementById('customer-form-price-scale-input').select()}
            name={'formDefPriceIndex'}
            value={formDefPriceIndex}
            disabled={!(includes([1, 2], getUserRole()))}
            placeholder={'0.00'}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-address-input')}
          />
        </Col>
        <Divider style={{ fontSize: 11, color: 'gray' }}>Contacto</Divider>
        <Col span={24}>
          <p style={{ margin: '0px' }}>Lugar de trabajo:</p>  
          <Input
            id={'customer-form-jobaddress-input'}
            onChange={(e) => setFormJobAddress(toUpper(e.target.value))}
            onFocus={() => document.getElementById('customer-form-jobaddress-input').select()}
            name={'formJobAddress'}
            value={formJobAddress}
            placeholder={'Industrias Beta'}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'customer-form-address-input')}
          />
        </Col>
        <Col span={24}>
          <p style={{ margin: '0px' }}>Dirección: <RequiredQuestionMark /></p>
          <Input
            id={'customer-form-address-input'}
            onChange={(e) => setFormAddress(toUpper(e.target.value))}
            onFocus={() => document.getElementById('customer-form-address-input').select()}
            name={'formAddress'}
            value={formAddress}
            placeholder={'Av. Testa Ca. Edison 101'}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'g-department-selector-select')}
          />
        </Col>
        <Col span={12}>
          <DepartmentSelector
            onSelect={(dataSelected) => {
              const { departmentSelected, citySelected } = dataSelected;
              setFormDepartmentId(departmentSelected);
              setFormCityId(citySelected);
            }}
            focusToId={'g-delivery-route-selector'}
            defDepartmentId={updateMode ? formDepartmentId : null}
            defCityId={updateMode ? formCityId : null}
            setResetState={resetComponentStates}
            requiredDepartment={true}
            requiredCity={true}
          />
        </Col>
        <Col span={12}>
        </Col>
        <Col span={12} style={{ display: 'none' }}>
          <DeliveryRouteSelector
            onSelect={(value) => setFormDeliveryRouteId(value)} 
            label={'Zona de Cobro:'}
            focusToId={'g-customer-phone-input'}
            defRouteId={updateMode ? formDeliveryRouteId : null}
            setResetState={resetComponentStates}
            requiredField={true}
          />
        </Col>
        <Col span={24}>
          {
            updateMode ?
              <>
                <p style={{ margin: '0px' }}>Teléfonos registrados:</p>
                {
                  formExistingCustomerPhones.map((element, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#e6f4ff',
                        borderRadius: 5,
                        border: '1px solid #69b1ff',
                        padding: '5px 10px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0px 0px 10px 0px'
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        {element.phoneNumber}
                      </p>
                      <Space>
                        {
                          renderPhoneTag(element.phoneType)
                        }
                        <Button 
                          // type={'primary'}
                          // size={'small'}
                          disabled={formExistingCustomerPhones.length < 2}
                          size={'middle'}
                          danger
                          icon={<DeleteFilled />} 
                          onClick={(e) => {
                            onDeletePhone(element.id);
                          }}
                        />
                      </Space>
                    </div>
                  ))
                }
              </>
            : <></>
          }
          <CustomerPhones
            label={updateMode ? 'Añadir teléfonos:' : 'Teléfonos:'}
            onDataChange={(data) => setFormCustomerPhones(data)}
            setResetState={resetComponentStates}
            focusToId={'customer-form-customer-email-input'}
            requiredField={true}
          />
        </Col>
        <Col span={12}>
          <p style={{ margin: '0px' }}>Correo:</p>  
          <Input
            id={'customer-form-customer-email-input'}
            onChange={(e) => setFormEmail(e.target.value)}
            onFocus={() => document.getElementById('customer-form-customer-email-input').select()}
            name={'formEmail'}
            value={formEmail}
            placeholder={'ejemplo@mail.com'}
            onKeyDown={(e) => onKeyDownFocusTo(e, 'g-customer-relative-fullname-input')}
          />
        </Col>
        {/* <Divider style={{ fontSize: 11, color: 'gray' }}>Referencias familiares</Divider>
        <Col span={24}>
          {
            updateMode ?
              <>
                <p style={{ margin: '0px' }}>Familiares registrados:</p>
                {
                  formExistingCustomerRelatives.map((element, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#e6f4ff',
                        borderRadius: 5,
                        border: '1px solid #69b1ff',
                        padding: '5px 10px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0px 0px 10px 0px'
                      }}
                    >
                      <Space direction='vertical'>
                        <p style={{ margin: 0 }}>
                          {element.relativeFullname}
                        </p>
                        <p style={{ margin: 0, fontSize: 11 }}>
                          <EnvironmentOutlined /> {`${element.relativeAddress}`}
                        </p>
                      </Space>
                      <Space>
                        <Tag icon={<UserOutlined />} color="blue">{relativeTypeName(element.relativeType)}</Tag>    
                        <Button 
                          // type={'primary'}
                          size={'middle'}
                          danger
                          icon={<DeleteFilled />} 
                          onClick={(e) => {
                            onDeleteRelative(element.id);
                          }}
                        />
                      </Space>
                    </div>
                  ))
                }
              </>
            : <></>
          }
          <CustomerRelatives 
            onDataChange={(data) => setFormCustomerRelatives(data)}
            setResetState={resetComponentStates}
            focusToId={'customer-form-save-button'}
          />
        </Col> */}
        <Divider />
        <Col span={12}>
          <Button 
            type={'default'} 
            onClick={(e) => {
              restoreState();
              onClose(false);
            }}
            style={{ width: '100%' }} 
          >
            Cancelar
          </Button>
        </Col>
        <Col span={12}>
          <Button 
            id={'customer-form-save-button'}
            type={'primary'} 
            icon={<SaveOutlined />} 
            onClick={(e) => formAction()} 
            style={{ width: '100%' }} 
            loading={fetching}
            disabled={fetching}
          >
            {updateMode ? 'Guardar cambios' : 'Guardar'}
          </Button>
        </Col>
      </Row>
    </Drawer>
  )
}

export default CustomerForm;
